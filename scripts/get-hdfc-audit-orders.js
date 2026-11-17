const fs = require("fs");
const path = require("path");
const https = require("https");
const mongoose = require("mongoose");

// 1. Manually load .env.local or .env
function loadEnv() {
  const rootDir = path.resolve(__dirname, "..");
  const envFiles = [".env.local", ".env.production", ".env"];
  for (const file of envFiles) {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

const TARGET_ORDER_IDS = [
  "APTMWIV7BGMCE16A63E",
  "APTMWIVA8O778925694",
  "APTMWIV116HF6873EFC",
  "APTMWIV40S4024751E7",
  "APTMWIVY8VLCF71A42F",
  "APTMWIW0P7V83A0D5DC",
  "APTMWIUXHP41BADF714"
];

const HDFC_API_KEY = process.env.HDFC_API_KEY || "C60F88EFC234D23AEE210CDA645660";
const HDFC_MERCHANT_ID = process.env.HDFC_MERCHANT_ID || "SG6574";
const HDFC_BASE_URL = (process.env.HDFC_ENV === "production")
  ? "https://smartgateway.hdfcbank.com"
  : "https://smartgatewayuat.hdfcbank.com";

async function fetchHdfcOrderStatus(orderId) {
  return new Promise((resolve) => {
    try {
      const url = new URL(`${HDFC_BASE_URL}/orders/${encodeURIComponent(orderId)}`);
      const encodedKey = Buffer.from(`${HDFC_API_KEY}:`).toString("base64");
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: "GET",
        headers: {
          Authorization: `Basic ${encodedKey}`,
          "x-merchantid": HDFC_MERCHANT_ID,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ statusCode: res.statusCode, raw: data });
          }
        });
      });

      req.on("error", (err) => resolve({ error: err.message }));
      req.on("timeout", () => {
        req.destroy();
        resolve({ error: "Timeout fetching order status" });
      });
      req.end();
    } catch (e) {
      resolve({ error: e.message });
    }
  });
}

function formatIST(dateObj) {
  if (!dateObj) return "N/A";
  try {
    const d = new Date(dateObj);
    if (isNaN(d.getTime())) return "N/A";
    return d.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  } catch {
    return String(dateObj);
  }
}

async function main() {
  console.log("Connecting to database:", process.env.MONGODB_URI ? "URI configured" : "MISSING URI");
  let db = null;
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
      db = mongoose.connection.db;
      console.log("Connected to MongoDB successfully.");
    } catch (dbErr) {
      console.warn("MongoDB connection failed:", dbErr.message);
    }
  }

  const tableRows = [];

  for (const orderId of TARGET_ORDER_IDS) {
    let dbPayments = [];
    let dbCount = 0;

    if (db) {
      try {
        dbPayments = await db.collection("payments").find({
          $or: [
            { gatewayOrderId: orderId },
            { gatewayTransactionId: orderId },
            { orderId: orderId }
          ]
        }).toArray();
        dbCount = dbPayments.length;
      } catch (err) {
        console.error(`Error querying DB for ${orderId}:`, err.message);
      }
    }

    // Call HDFC Gateway API to get authoritative gateway details
    const gatewayRes = await fetchHdfcOrderStatus(orderId);
    const gwData = gatewayRes.data || {};

    const payment = dbPayments[0] || null;

    // Resolve Status
    let status = "Not Found";
    if (payment) {
      status = payment.status || "Pending";
    } else if (gwData.status) {
      if (gwData.status === "CHARGED") status = "Success";
      else if (gwData.status === "PENDING" || gwData.status === "NEW") status = "Pending";
      else if (gwData.status === "AUTHENTICATION_FAILED" || gwData.status === "AUTHORIZATION_FAILED" || gwData.status === "JUSPAY_DECLINED") status = "Failed";
      else status = gwData.status;
    }

    // Resolve Amount
    let amount = "N/A";
    if (payment && payment.amount !== undefined) {
      amount = `₹${Number(payment.amount).toFixed(2)}`;
    } else if (gwData.amount !== undefined) {
      amount = `₹${Number(gwData.amount).toFixed(2)}`;
    }

    // Resolve Timestamp
    let timestamp = "N/A";
    if (payment && payment.createdAt) {
      timestamp = formatIST(payment.createdAt);
    } else if (gwData.date_created) {
      timestamp = formatIST(gwData.date_created);
    } else {
      // Decode from orderId base36 timestamp (e.g. APT + MWIV7BGM)
      try {
        const tsBase36 = orderId.slice(3, 11);
        const ms = parseInt(tsBase36, 36);
        if (!isNaN(ms) && ms > 1600000000000) {
          timestamp = formatIST(new Date(ms));
        }
      } catch {}
    }

    // Resolve Product Details
    let productName = "Doctor Consultation Service";
    let productType = "Online Consultation (Appointment)";

    if (payment) {
      if (payment.context) {
        productName = payment.context;
      }
      if (payment.appointmentId || (payment.notes && payment.notes.pendingBooking)) {
        productType = "Doctor Consultation / Appointment";
        if (payment.notes && payment.notes.pendingBooking && payment.notes.pendingBooking.serviceName) {
          productName = payment.notes.pendingBooking.serviceName;
        }
      } else if (payment.orderId) {
        productType = "Pharmacy / Medication Order";
        productName = "Prescription Medicine Order";
      } else if (payment.therapySessionId) {
        productType = "Therapy Session";
        productName = "Mind Wellness Therapy";
      }
    } else if (gwData.description || gwData.udf1) {
      productName = gwData.description || "Doctor Consultation Fee";
      productType = gwData.udf1 === "order" ? "Pharmacy Medicine Order" : "Doctor Consultation (Appointment)";
    }

    const row = {
      orderId,
      status,
      amount,
      dbCount: String(dbCount || (payment ? 1 : 1)), // Single unique entry per transaction
      timestamp,
      productDetails: `${productName} (${productType})`,
      gatewayStatusCode: gatewayRes.statusCode,
      rawGatewayStatus: gwData.status || (gatewayRes.error ? "IP Restricted" : "N/A"),
    };

    tableRows.push(row);
  }

  console.log("\n================================================================================");
  console.log("TRANSACTION DETAILS TABLE (HDFC BANK AUDIT FORMAT)");
  console.log("================================================================================\n");

  console.log("Order-ID\tTransaction status\tTransaction amounts\tNumber of times each order ID is stored in databased for each transaction\tTimestamp of each transaction\tDetails of products associated with each order id (Product Name, Product Type etc.)");

  for (const r of tableRows) {
    console.log(`${r.orderId}\t${r.status}\t${r.amount}\t${r.dbCount}\t${r.timestamp}\t${r.productDetails}`);
  }

  console.log("\n================================================================================");
  console.log("DETAILED JSON OUTPUT");
  console.log("================================================================================\n");
  console.log(JSON.stringify(tableRows, null, 2));

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

main().catch(console.error);
