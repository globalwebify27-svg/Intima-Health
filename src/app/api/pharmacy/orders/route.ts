import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { connectDB } from "@/db/connect";
import { OrderModel, ProductModel } from "@/modules/pharmacy/schema";
import { PharmacyConfigModel, DEFAULT_AKOLA_PINCODES } from "@/modules/pharmacy/settings-schema";
import { PatientModel } from "@/modules/patients/schema";
import { ConsultationModel } from "@/modules/consultations/schema";
import { ClinicModel } from "@/modules/clinics/schema";
import { AuditLogModel } from "@/modules/system/schema";
import { sendOrderCustomerEmail, sendMedicineOrderRequestNotifications } from "@/lib/mail/service";
import { verifyJwt } from "@/lib/jwt";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const requestedClinicId = searchParams.get("clinicId");
    const patientId = searchParams.get("patientId");
    const status = searchParams.get("status");

    // Check user authentication & role
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    let userRole: string | undefined;
    let userClinicId: string | undefined;

    if (token) {
      const payload = verifyJwt(token);
      if (payload) {
        userRole = payload.role;
        userClinicId = payload.clinicId;
      }
    }

    const query: Record<string, unknown> = { deletedAt: null };

    // Pharmacy staff scoping: strictly restricted to their assigned clinic
    if (userRole === "PHARMACY_STAFF" || userRole === "PHARMACY") {
      if (userClinicId) {
        query.clinicId = userClinicId;
      }
    } else if (requestedClinicId && requestedClinicId !== "All") {
      query.clinicId = requestedClinicId;
    }

    if (patientId) query.patientId = patientId;
    if (status && status !== "All") query.status = status;

    const orders = await OrderModel.find(query)
      .populate("patientId")
      .populate("clinicId")
      .populate({
        path: "consultationId",
        populate: { path: "doctorId" }
      })
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .exec();

    return NextResponse.json({
      success: true,
      message: "Orders retrieved successfully.",
      data: orders,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to retrieve orders.";
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const {
      patientId,
      clinicId: rawClinicId,
      items,
      totalAmount,
      status,
      shippingDetails,
      shippingAddress,
      prescriptionSource = "DIGITAL_CONSULTATION",
      consultationId,
      uploadedPrescriptionUrl,
      paymentMethod = "COD",
      isRefillOrder = false,
      parentOrderId,
      remainingRefills,
    } = body;

    // --- CASE A: MEDICINE ORDER REQUEST (CONSULTATION DIRECT ROUTING BY PATIENT) ---
    // If an order request is coming from a patient requesting medicine fulfillment
    if (consultationId && status !== "Delivered" && status !== "Dispensed") {
      const consultation = await ConsultationModel.findById(consultationId)
        .populate("doctorId")
        .populate("appointmentId")
        .populate("patientId")
        .exec();

      if (!consultation) {
        return NextResponse.json({ success: false, message: "Consultation prescription not found." }, { status: 404 });
      }

      // Check if an order request was already placed for this consultation
      const existingOrder = await OrderModel.findOne({
        consultationId,
        status: { $nin: ["Cancelled", "CANCELLED"] },
        deletedAt: null
      }).exec();

      if (existingOrder) {
        return NextResponse.json({
          success: true,
          message: "Your order request has already been submitted to the clinic pharmacy. You will receive a confirmation call shortly.",
          data: existingOrder,
          alreadySubmitted: true
        });
      }

      // 1. Resolve Patient
      let finalPatientId = patientId || (consultation.patientId as any)?._id || consultation.patientId;
      const patientDoc = await PatientModel.findById(finalPatientId).exec();
      const patientName = body.patientDetails?.name || patientDoc?.name || "Patient";
      const patientPhone = body.patientDetails?.phone || patientDoc?.phone || "";

      // 2. Resolve Clinic
      let assignedClinicId = rawClinicId;
      if (!assignedClinicId) {
        // Resolve from doctor or appointment
        const doctorObj = consultation.doctorId as any;
        const aptObj = consultation.appointmentId as any;
        
        assignedClinicId = 
          doctorObj?.clinicId?._id || doctorObj?.clinicId ||
          aptObj?.clinicId?._id || aptObj?.clinicId;
      }

      // Fallback to first active clinic if unassigned
      if (!assignedClinicId) {
        const defaultClinic = await ClinicModel.findOne({ status: "Active" }).exec();
        if (defaultClinic) assignedClinicId = defaultClinic._id;
      }

      // 3. Resolve Medicines from Prescription
      let orderItems: Array<{
        productId?: mongoose.Types.ObjectId;
        name: string;
        dosage?: string;
        packaging?: string;
        form?: string;
        quantity: number;
        priceAtPurchase: number;
        isPrescription: boolean;
        status: "Pending" | "Approved";
      }> = [];

      if (items && Array.isArray(items) && items.length > 0) {
        orderItems = items.map((i: { 
          name?: string; 
          drug?: string; 
          dosage?: string; 
          quantity?: number;
          form?: string;
          packaging?: string;
        }) => {
          const medName = i.name || i.drug || "Medication";
          const formStr = i.form ? `${i.form}` : "";
          const packStr = i.packaging || "";
          let combinedDosage = i.dosage || "";

          if (packStr) {
            combinedDosage = formStr 
              ? `${formStr}: ${packStr}${i.dosage ? ` • Rx: ${i.dosage}` : ""}`
              : `${packStr}${i.dosage ? ` • Rx: ${i.dosage}` : ""}`;
          }

          return {
            name: medName,
            dosage: combinedDosage,
            packaging: packStr,
            form: formStr,
            quantity: i.quantity || 1,
            priceAtPurchase: 0,
            isPrescription: true,
            status: "Pending",
          };
        });
      } else if (consultation.prescriptionSummary) {
        try {
          const parsedMeds = JSON.parse(consultation.prescriptionSummary);
          if (Array.isArray(parsedMeds)) {
            orderItems = parsedMeds.map((m: { drug?: string; name?: string; dosage?: string; frequency?: string; duration?: string }) => ({
              name: m.drug || m.name || "Prescribed Medicine",
              dosage: `${m.dosage || ""} ${m.frequency ? `• ${m.frequency}` : ""} ${m.duration ? `(${m.duration})` : ""}`.trim(),
              quantity: 1,
              priceAtPurchase: 0,
              isPrescription: true,
              status: "Pending",
            }));
          }
        } catch {
          // fallback
        }
      }

      if (orderItems.length === 0) {
        orderItems.push({
          name: "Doctor Prescribed Medicines",
          dosage: "As Prescribed by Doctor",
          quantity: 1,
          priceAtPurchase: 0,
          isPrescription: true,
          status: "Pending",
        });
      }

      // 4. Generate Order Reference
      const timestampStr = Date.now().toString().slice(-4);
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `KMH-REQ-${timestampStr}-${randomNum}`;

      // 5. Create Order Request
      const newOrderRequest = new OrderModel({
        orderNumber,
        patientId: finalPatientId,
        clinicId: assignedClinicId,
        items: orderItems,
        totalAmount: 0,
        pricing: {
          itemsTotal: 0,
          taxAmount: 0,
          deliveryCharge: 0,
          totalPayable: 0,
        },
        status: "REQUEST_RECEIVED",
        shippingAddress: "Clinic Pharmacy Call Verification & Dispensation",
        shippingDetails: {
          fullName: patientName,
          phone: patientPhone,
          street: "Direct Clinic Prescription Order Request",
          city: "Pune",
          state: "Maharashtra",
          pinCode: "411045",
        },
        paymentMethod: "COD",
        paymentStatus: "Pending",
        prescriptionSource: "DIGITAL_CONSULTATION",
        consultationId,
        prescriptionVerification: {
          status: "Pending",
          notes: "Awaiting phone verification call by clinic pharmacy",
        },
        statusHistory: [
          {
            status: "REQUEST_RECEIVED",
            timestamp: new Date(),
            comment: "Medicine order request submitted by patient. Awaiting pharmacy verification call.",
            updatedBy: "Patient",
          }
        ],
      });

      await newOrderRequest.save();

      // 6. Trigger Dual Email Notifications (Clinic Pharmacy & Admin)
      sendMedicineOrderRequestNotifications(newOrderRequest._id.toString()).catch((err) => {
        console.error("[Orders] Notification email error:", err);
      });

      // 7. Audit Log
      await AuditLogModel.create({
        userId: finalPatientId.toString(),
        action: "MEDICINE_ORDER_REQUEST_SUBMITTED",
        details: `Request ${orderNumber} submitted for consultation ${consultationId} to clinic ${assignedClinicId}`,
      }).catch((e: unknown) => console.error("Audit log error:", e));

      return NextResponse.json({
        success: true,
        message: "Your order request has been sent to the clinic pharmacy. You will receive a confirmation call from the clinic pharmacy.",
        data: newOrderRequest,
      });
    }

    // --- CASE B: LEGACY DIRECT STORE CHECKOUT (FALLBACK IF CALLED DIRECTLY) ---
    let finalPatientId = patientId;
    if (!finalPatientId && shippingDetails?.phone) {
      const cleanPhone = shippingDetails.phone.replace(/\D/g, "").slice(-10);
      let patient = await PatientModel.findOne({ phone: new RegExp(cleanPhone + '$') });
      if (!patient) {
        patient = await PatientModel.create({
          name: shippingDetails.fullName || `Patient ${cleanPhone.slice(-4)}`,
          email: `${cleanPhone}@intima.app`,
          phone: cleanPhone,
          gender: "Prefer not to say",
          status: "Active"
        });
      }
      finalPatientId = patient._id;
    }

    if (!finalPatientId) {
      return NextResponse.json({ success: false, message: "Patient profile is required. Please verify your mobile phone number." }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: "Order must contain at least one item." }, { status: 400 });
    }

    // Check if this is an in-clinic / over-the-counter dispense or direct pharmacy pickup
    const isCounterDispense = 
      status === "Delivered" || 
      status === "Dispensed" ||
      (typeof shippingAddress === "string" && (
        shippingAddress.toLowerCase().includes("counter") || 
        shippingAddress.toLowerCase().includes("clinic") ||
        shippingAddress.toLowerCase().includes("pickup")
      ));

    // Postal delivery PIN code (only required for home courier delivery, not for in-person clinic counter dispense)
    const pinCode = shippingDetails?.pinCode || 
      (typeof shippingAddress === "string" ? shippingAddress.match(/\b\d{6}\b/)?.[0] : null) ||
      (isCounterDispense ? "444001" : null);

    if (!pinCode && !isCounterDispense) {
      return NextResponse.json({ success: false, message: "A valid 6-digit postal delivery PIN code is required for home courier delivery." }, { status: 400 });
    }

    let config = await PharmacyConfigModel.findOne().exec();
    if (!config) {
      config = await PharmacyConfigModel.create({});
    }

    let matchedPin: any = null;
    if (!isCounterDispense && pinCode) {
      const pincodesList = (config.serviceablePincodes && config.serviceablePincodes.length > 0)
        ? config.serviceablePincodes
        : DEFAULT_AKOLA_PINCODES;

      matchedPin = pincodesList.find(
        (p: { pinCode: string; isActive?: boolean }) => p.pinCode === pinCode && p.isActive !== false
      );
      if (!matchedPin) {
        return NextResponse.json({
          success: false,
          message: `Delivery is currently not available for postal PIN code ${pinCode}. Medicine delivery is currently active in Akola, Maharashtra.`,
        }, { status: 400 });
      }
    }

    let requiresPrescription = false;
    let itemsTotal = 0;
    const validatedItems: Array<{
      productId: string;
      name?: string;
      dosage?: string;
      quantity: number;
      priceAtPurchase: number;
      isPrescription?: boolean;
      status?: string;
    }> = [];

    for (const item of items) {
      let product = null;
      if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
        product = await ProductModel.findById(item.productId).exec();
      }
      if (!product && item.name) {
        const safeName = item.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        product = await ProductModel.findOne({ name: new RegExp(`^${safeName}$`, "i") }).exec();
      }
      if (!product && item.name) {
        product = await ProductModel.create({
          name: item.name,
          price: item.priceAtPurchase || 120,
          stock: 100,
          isPrescription: true,
          category: "Prescriptions",
          scheduleClass: "Schedule H",
          status: "In Stock",
        });
      }
      if (!product) {
        throw new Error(`Product not found: ${item.productId || item.name}`);
      }
      if (product.stock < item.quantity) {
        product.stock = Math.max(product.stock, item.quantity + 50);
        await product.save();
      }

      const itemPrice = product.price;
      const lineTotal = itemPrice * item.quantity;
      itemsTotal += lineTotal;

      const isRx = product.isPrescription || product.scheduleClass === "Schedule H" || product.scheduleClass === "Schedule H1" || product.scheduleClass === "Schedule X";
      if (isRx) {
        requiresPrescription = true;
      }

      validatedItems.push({
        productId: product._id,
        name: product.name,
        dosage: product.composition || product.dosageForm || "",
        quantity: item.quantity,
        priceAtPurchase: itemPrice,
        isPrescription: isRx,
        status: isRx ? "Pending" : "Approved",
      });
    }

    const taxRate = config.taxRatePercent || 12;
    const taxAmount = isCounterDispense ? 0 : Math.round((itemsTotal * taxRate) / 100);
    const freeThreshold = config.freeDeliveryThreshold || 500;
    const deliveryCharge = isCounterDispense ? 0 : (itemsTotal >= freeThreshold ? 0 : (matchedPin?.deliveryCharge ?? config.defaultDeliveryFee ?? 50));
    const totalPayable = isCounterDispense ? (totalAmount || itemsTotal) : (itemsTotal + taxAmount + deliveryCharge);

    const timestampStr = Date.now().toString().slice(-4);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `KMH-MED-${timestampStr}-${randomNum}`;

    for (const item of validatedItems) {
      const product = await ProductModel.findById(item.productId).exec();
      if (product) {
        const newStock = Math.max(0, product.stock - item.quantity);
        let newStatus = product.status;
        if (newStock === 0) newStatus = "Out of Stock";
        else if (newStock <= 15) newStatus = "Low Stock";

        await ProductModel.findByIdAndUpdate(item.productId, {
          $set: { stock: newStock, status: newStatus }
        }).exec();
      }
    }

    let initialStatus = isCounterDispense ? (status || "Delivered") : "Placed";
    if (!isCounterDispense && requiresPrescription) {
      initialStatus = "Prescription_Verification";
    }

    // If this is an in-clinic dispense and an order request for this consultation already existed, update it
    if (consultationId && isCounterDispense) {
      const existingOrder = await OrderModel.findOne({
        consultationId,
        status: { $nin: ["Cancelled", "CANCELLED"] },
        deletedAt: null
      }).exec();

      if (existingOrder) {
        existingOrder.status = "Delivered";
        existingOrder.paymentStatus = (paymentMethod === "Send Link in WhatsApp") ? "Pending" : "Paid";
        existingOrder.paymentMethod = paymentMethod;
        if (validatedItems.length > 0) existingOrder.items = validatedItems as any;
        existingOrder.totalAmount = totalPayable;
        existingOrder.pricing = {
          itemsTotal,
          taxAmount,
          deliveryCharge: 0,
          discountAmount: 0,
          totalPayable,
        };
        existingOrder.shippingAddress = "Clinic Counter Dispense";
        existingOrder.prescriptionVerification = {
          status: "Verified",
          notes: "Dispensed and verified in-person by clinic pharmacy staff",
          verifiedAt: new Date(),
          verifiedBy: "Clinic Pharmacist",
        };
        existingOrder.statusHistory.push({
          status: "Delivered",
          timestamp: new Date(),
          comment: `Order dispensed and settled in clinic pharmacy counter. Total: ₹${totalPayable.toLocaleString()} (${paymentMethod}).`,
          updatedBy: "Pharmacy Staff",
        });
        await existingOrder.save();

        return NextResponse.json({
          success: true,
          message: "Medicines dispensed and billing settled successfully.",
          data: existingOrder,
        });
      }
    }

    const order = new OrderModel({
      orderNumber,
      patientId: finalPatientId,
      clinicId: rawClinicId || undefined,
      items: validatedItems,
      totalAmount: totalPayable,
      pricing: {
        itemsTotal,
        taxAmount,
        deliveryCharge,
        discountAmount: 0,
        totalPayable,
      },
      status: initialStatus,
      shippingAddress: typeof shippingAddress === "string" ? shippingAddress : `${shippingDetails?.street || "Clinic Counter"}, ${shippingDetails?.city || "Akola"}, ${shippingDetails?.state || "Maharashtra"} - ${shippingDetails?.pinCode || "444001"}`,
      shippingDetails: shippingDetails || {
        fullName: "In-Clinic Patient",
        phone: "9999999999",
        street: "Clinic Counter Dispense",
        city: "Akola",
        state: "Maharashtra",
        pinCode: "444001"
      },
      paymentMethod,
      paymentStatus: isCounterDispense ? (paymentMethod === "Send Link in WhatsApp" ? "Pending" : "Paid") : "Pending",
      prescriptionSource: requiresPrescription ? prescriptionSource : "OTC_NO_RX",
      consultationId: consultationId || undefined,
      uploadedPrescriptionUrl: uploadedPrescriptionUrl || undefined,
      prescriptionVerification: {
        status: isCounterDispense ? "Verified" : (requiresPrescription ? "Pending" : "Verified"),
        notes: isCounterDispense 
          ? "Dispensed and verified in-person by clinic pharmacy staff"
          : (requiresPrescription ? "Awaiting verification by licensed pharmacist" : "No prescription required for OTC items"),
        verifiedAt: isCounterDispense ? new Date() : undefined,
        verifiedBy: isCounterDispense ? "Clinic Pharmacist" : undefined,
      },
      delivery: {
        courierPartner: isCounterDispense ? "Over-the-Counter Dispense" : "Kelkar Manas Akola Delivery Partner",
        estimatedDeliveryDate: isCounterDispense ? new Date() : new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      statusHistory: [
        {
          status: initialStatus,
          timestamp: new Date(),
          comment: isCounterDispense
            ? `Order dispensed and settled in clinic pharmacy counter. Total: ₹${totalPayable.toLocaleString()} (${paymentMethod}).`
            : `Order placed by patient. Total: ₹${totalPayable.toLocaleString()}${matchedPin ? ` (${matchedPin.areaName}, Akola)` : ""}.`,
          updatedBy: isCounterDispense ? "Pharmacy Staff" : "Patient",
        },
      ],
      isRefillOrder: !!isRefillOrder,
      parentOrderId: parentOrderId || undefined,
      remainingRefills: remainingRefills || 0,
    });

    await order.save();

    sendOrderCustomerEmail(order._id.toString()).catch((e: unknown) => {
      console.error("[Orders] Customer receipt email error:", e);
    });

    if (!isCounterDispense) {
      sendMedicineOrderRequestNotifications(order._id.toString()).catch((e: unknown) => {
        console.error("[Orders] Pharmacy & Admin notification email error:", e);
      });
    }

    return NextResponse.json({
      success: true,
      message: "Order placed successfully.",
      data: order,
    });
  } catch (error: unknown) {
    console.error("Order creation failed:", error);
    const message = error instanceof Error ? error.message : "Failed to create order.";
    return NextResponse.json(
      { success: false, message },
      { status: 400 }
    );
  }
}
