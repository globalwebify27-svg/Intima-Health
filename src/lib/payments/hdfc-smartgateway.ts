import crypto from "crypto";
import https from "https";

const SANDBOX_BASE_URL = "https://smartgateway.hdfcuat.bank.in";
const PRODUCTION_BASE_URL = "https://smartgateway.hdfc.bank.in";

export interface HdfcConfig {
  env: "sandbox" | "production";
  baseUrl: string;
  apiKey: string;
  merchantId: string;
  paymentPageClientId: string;
  responseKey: string;
  resellerId?: string;
  webhookUsername?: string;
  webhookPassword?: string;
}

export interface CreateHdfcSessionInput {
  orderId: string;
  amount: number;
  currency?: string;
  customerId: string;
  customerEmail?: string;
  customerPhone?: string;
  firstName?: string;
  lastName?: string;
  description?: string;
  returnUrl: string;
  udf1?: string;
  udf3?: string;
}

export interface HdfcSessionResponse {
  id: string;
  order_id: string;
  status: string;
  payment_links?: {
    web?: string;
    mobile?: string;
    iframe?: string;
  };
  sdk_payload?: Record<string, unknown>;
}

export interface HdfcOrderStatusResponse {
  id?: string;
  order_id: string;
  status: string;
  status_id?: number;
  amount?: number;
  effective_amount?: number;
  currency?: string;
  txn_id?: string;
  txn_uuid?: string;
  payment_method?: string;
  payment_method_type?: string;
  auth_type?: string;
  bank_error_code?: string;
  bank_error_message?: string;
  error_code?: string;
  error_message?: string;
  refunded?: boolean;
  amount_refunded?: number;
  date_created?: string;
  customer_id?: string;
  customer_email?: string;
  customer_phone?: string;
  udf1?: string;
  udf2?: string;
  udf3?: string;
  payment_gateway_response?: Record<string, unknown>;
}

export function getHdfcConfig(): HdfcConfig {
  const rawEnv = (process.env.HDFC_ENV || "sandbox").toLowerCase();
  const env: "sandbox" | "production" = rawEnv === "production" ? "production" : "sandbox";
  const baseUrl = env === "production" ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL;

  const apiKey = (process.env.HDFC_API_KEY || "").trim();
  const merchantId = (process.env.HDFC_MERCHANT_ID || "").trim();
  const paymentPageClientId = (process.env.HDFC_PAYMENT_PAGE_CLIENT_ID || "").trim();
  const responseKey = (process.env.HDFC_RESPONSE_KEY || "").trim();
  const resellerId = (process.env.HDFC_RESELLER_ID || "").trim() || undefined;
  const webhookUsername = (process.env.HDFC_WEBHOOK_USERNAME || "").trim() || undefined;
  const webhookPassword = (process.env.HDFC_WEBHOOK_PASSWORD || "").trim() || undefined;

  return {
    env,
    baseUrl,
    apiKey,
    merchantId,
    paymentPageClientId,
    responseKey,
    resellerId,
    webhookUsername,
    webhookPassword,
  };
}

export function isHdfcConfigured(): boolean {
  const cfg = getHdfcConfig();
  return Boolean(cfg.apiKey && cfg.merchantId && cfg.paymentPageClientId);
}

export function buildHdfcHeaders(customerId?: string): Record<string, string> {
  const cfg = getHdfcConfig();
  if (!cfg.apiKey || !cfg.merchantId) {
    throw new Error("HDFC SmartGateway credentials (HDFC_API_KEY, HDFC_MERCHANT_ID) are not configured.");
  }

  // Basic Auth format required by HDFC SmartGateway: base64(apiKey + ":")
  const encodedKey = Buffer.from(`${cfg.apiKey}:`).toString("base64");
  const headers: Record<string, string> = {
    Authorization: `Basic ${encodedKey}`,
    "x-merchantid": cfg.merchantId,
    "Content-Type": "application/json",
  };

  if (customerId) {
    headers["x-customerid"] = customerId;
  }
  if (cfg.resellerId) {
    headers["x-resellerid"] = cfg.resellerId;
  }

  return headers;
}

/**
 * Generates an alphanumeric order ID strictly <= 20 characters as required by HDFC SmartGateway.
 */
export function generateHdfcOrderId(prefix = "KM"): string {
  const cleanPrefix = prefix.replace(/[^A-Za-z0-9]/g, "").slice(0, 3).toUpperCase() || "KM";
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${cleanPrefix}${ts}${rand}`.slice(0, 20);
}

interface HdfcErrorPayload {
  error_message?: string;
  message?: string;
  user_message?: string;
  error_info?: {
    developer_message?: string;
  };
}

function formatHdfcError(data: unknown, fallback: string): string {
  const err = (data && typeof data === "object" ? data : {}) as HdfcErrorPayload;
  const detail = err.error_info?.developer_message || err.user_message;
  const baseMsg = err.error_message || err.message || fallback;
  return detail && detail !== baseMsg ? `${baseMsg} (${detail})` : baseMsg;
}

/**
 * Executes an HTTPS request to HDFC SmartGateway pinned to IPv4 (family: 4) so
 * hosts with IPv6 enabled still send from their whitelisted IPv4 address.
 */
function hdfcRequestJson(
  urlStr: string,
  options: { method: "GET" | "POST"; headers: Record<string, string>; body?: string }
): Promise<{ ok: boolean; status: number; data: Record<string, unknown> | null }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlStr);
    const headers: Record<string, string | number> = { ...options.headers };
    if (options.body) {
      headers["Content-Length"] = Buffer.byteLength(options.body, "utf8");
    }

    const req = https.request(
      {
        protocol: parsed.protocol,
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: `${parsed.pathname}${parsed.search}`,
        method: options.method,
        headers,
        family: 4,
        timeout: 15000,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        res.on("end", () => {
          const raw = Buffer.concat(chunks).toString("utf8");
          let data: Record<string, unknown> | null = null;
          try {
            data = raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
          } catch {
            data = null;
          }
          const status = res.statusCode || 500;
          resolve({ ok: status >= 200 && status < 300, status, data });
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("HDFC SmartGateway request timed out."));
    });
    req.on("error", reject);

    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

/**
 * Creates a Hosted Payment Page session via HDFC SmartGateway POST /session.
 */
export async function createHdfcSession(input: CreateHdfcSessionInput): Promise<HdfcSessionResponse> {
  const cfg = getHdfcConfig();
  if (!cfg.paymentPageClientId) {
    throw new Error("HDFC_PAYMENT_PAGE_CLIENT_ID is not configured.");
  }

  const sanitizedOrderId = input.orderId.replace(/[^A-Za-z0-9]/g, "").slice(0, 20);
  if (!sanitizedOrderId) {
    throw new Error("Invalid HDFC order_id.");
  }

  const cleanPhone = (input.customerPhone || "").replace(/\D/g, "").slice(-10);
  const payload: Record<string, unknown> = {
    order_id: sanitizedOrderId,
    amount: Number(input.amount).toFixed(2),
    currency: input.currency || "INR",
    customer_id: input.customerId.slice(0, 64),
    payment_page_client_id: cfg.paymentPageClientId,
    action: "paymentPage",
    return_url: input.returnUrl,
  };

  if (input.customerEmail) payload.customer_email = input.customerEmail;
  if (cleanPhone) payload.customer_phone = cleanPhone;
  if (input.firstName) payload.first_name = input.firstName.slice(0, 64);
  if (input.lastName) payload.last_name = input.lastName.slice(0, 64);
  if (input.description) payload.description = input.description.slice(0, 128);
  if (input.udf1) payload.udf1 = input.udf1.slice(0, 128);
  if (input.udf3) payload.udf3 = input.udf3.slice(0, 128);

  const response = await hdfcRequestJson(`${cfg.baseUrl}/session`, {
    method: "POST",
    headers: buildHdfcHeaders(input.customerId),
    body: JSON.stringify(payload),
  });

  const data = response.data;
  if (!response.ok || !data) {
    console.error("[HDFC Session] Gateway error:", response.status, data);
    throw new Error(formatHdfcError(data, `HDFC SmartGateway session creation failed (HTTP ${response.status}).`));
  }

  const paymentLinks = data.payment_links as { web?: string } | undefined;
  if (!paymentLinks?.web) {
    throw new Error("HDFC SmartGateway did not return a payment link (payment_links.web).");
  }

  return data as unknown as HdfcSessionResponse;
}

/**
 * Authoritative server-to-server order verification via HDFC SmartGateway GET /orders/{order_id}.
 */
export async function fetchHdfcOrderStatus(orderId: string, customerId?: string): Promise<HdfcOrderStatusResponse> {
  const cfg = getHdfcConfig();
  const response = await hdfcRequestJson(`${cfg.baseUrl}/orders/${encodeURIComponent(orderId)}`, {
    method: "GET",
    headers: buildHdfcHeaders(customerId),
  });

  const data = response.data;
  if (!response.ok || !data) {
    console.error("[HDFC Status] Gateway error:", response.status, data);
    throw new Error(formatHdfcError(data, `Failed to fetch HDFC order status (HTTP ${response.status}).`));
  }

  return data as unknown as HdfcOrderStatusResponse;
}

function rfc3986Encode(str: string): string {
  return encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

/**
 * Verifies HDFC SmartGateway return_url HMAC-SHA256 signature using Response Key:
 * 1. Exclude signature and signature_algorithm.
 * 2. Percent-encode keys and values, sort ASCII alphabetically by encoded key.
 * 3. Join as key=value&... and percent-encode the resulting string.
 * 4. Compute HMAC-SHA256 with responseKey (base64 digest) and timing-safe compare.
 */
export function verifyHdfcSignature(
  params: Record<string, string | undefined | null>,
  responseKey?: string
): boolean {
  const key = (responseKey ?? getHdfcConfig().responseKey).trim();
  const incomingSig = params.signature;
  if (!key || !incomingSig) return false;

  try {
    const encodedPairs: Array<[string, string]> = [];
    for (const [k, v] of Object.entries(params)) {
      if (k === "signature" || k === "signature_algorithm" || v === undefined || v === null) {
        continue;
      }
      encodedPairs.push([rfc3986Encode(k), rfc3986Encode(String(v))]);
    }

    encodedPairs.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    const joined = encodedPairs.map(([k, v]) => `${k}=${v}`).join("&");
    const encodedPayload = rfc3986Encode(joined);

    const expectedBase64 = crypto
      .createHmac("sha256", key)
      .update(encodedPayload, "utf8")
      .digest("base64");

    const decodedIncoming = decodeURIComponent(String(incomingSig).replace(/\+/g, "%2B"));
    const expectedBuf = Buffer.from(expectedBase64, "base64");
    const receivedBuf = Buffer.from(decodedIncoming, "base64");

    if (expectedBuf.length === receivedBuf.length && crypto.timingSafeEqual(expectedBuf, receivedBuf)) {
      return true;
    }

    // Secondary check using standard encodeURIComponent (unencoded !'()*) in case gateway used encodeURIComponent
    const stdPairs = Object.entries(params)
      .filter(([k, v]) => k !== "signature" && k !== "signature_algorithm" && v !== undefined && v !== null)
      .map(([k, v]) => [encodeURIComponent(k), encodeURIComponent(String(v))] as [string, string])
      .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
    const stdJoined = encodeURIComponent(stdPairs.map(([k, v]) => `${k}=${v}`).join("&"));
    const stdExpected = crypto.createHmac("sha256", key).update(stdJoined, "utf8").digest();

    return stdExpected.length === receivedBuf.length && crypto.timingSafeEqual(stdExpected, receivedBuf);
  } catch {
    return false;
  }
}

export function mapHdfcOrderStatus(status?: string, statusId?: number): "Success" | "Failed" | "Pending" | "Refunded" {
  const s = (status || "").toUpperCase();
  if (s === "CHARGED" || statusId === 21) return "Success";
  if (s === "REFUNDED" || s === "PARTIAL_REFUNDED") return "Refunded";
  if (
    s === "AUTHORIZATION_FAILED" ||
    s === "AUTHENTICATION_FAILED" ||
    s === "JUSPAY_DECLINED" ||
    s === "FAILURE" ||
    s === "FAILED" ||
    s === "VOIDED" ||
    s === "CANCELLED"
  ) {
    return "Failed";
  }
  return "Pending";
}

