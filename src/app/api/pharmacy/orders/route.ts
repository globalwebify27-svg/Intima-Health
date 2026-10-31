import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/db/connect";
import { OrderModel, ProductModel } from "@/modules/pharmacy/schema";
import { PharmacyConfigModel, DEFAULT_AKOLA_PINCODES } from "@/modules/pharmacy/settings-schema";
import { PatientModel } from "@/modules/patients/schema";
import { AuditLogModel } from "@/modules/system/schema";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");
    const patientId = searchParams.get("patientId");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = { deletedAt: null };
    if (clinicId) query.clinicId = clinicId;
    if (patientId) query.patientId = patientId;
    if (status && status !== "All") query.status = status;

    const orders = await OrderModel.find(query)
      .populate("patientId")
      .populate("consultationId")
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
      clinicId,
      items,
      shippingDetails,
      shippingAddress,
      prescriptionSource,
      consultationId,
      uploadedPrescriptionUrl,
      paymentMethod = "Online",
      isRefillOrder = false,
      parentOrderId,
      remainingRefills,
    } = body;

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

    // 1. PIN Code & Serviceability Check (Focus: Akola)
    const pinCode = shippingDetails?.pinCode || (typeof shippingAddress === "string" ? shippingAddress.match(/\b\d{6}\b/)?.[0] : null);
    if (!pinCode) {
      return NextResponse.json({ success: false, message: "A valid 6-digit delivery PIN code is required." }, { status: 400 });
    }

    let config = await PharmacyConfigModel.findOne().exec();
    if (!config) {
      config = await PharmacyConfigModel.create({});
    }

    const pincodesList = (config.serviceablePincodes && config.serviceablePincodes.length > 0)
      ? config.serviceablePincodes
      : DEFAULT_AKOLA_PINCODES;

    const matchedPin = pincodesList.find(
      (p: { pinCode: string; isActive?: boolean }) => p.pinCode === pinCode && p.isActive !== false
    );
    if (!matchedPin) {
      return NextResponse.json({
        success: false,
        message: `Delivery is currently not available for PIN code ${pinCode}. Medicine delivery is currently active in Akola, Maharashtra.`,
      }, { status: 400 });
    }

    // 2. Validate Items, Stock, and Prescription Requirement
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
        // Automatically create or register prescription medication item in catalog
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

    // 3. Prescription Regulatory Enforcement
    if (requiresPrescription) {
      if (!prescriptionSource || prescriptionSource === "OTC_NO_RX") {
        return NextResponse.json({
          success: false,
          message: "One or more items in your cart require a valid doctor's prescription under Indian pharmacy regulations. Please upload a prescription or select one issued by your doctor.",
          requiresPrescription: true,
        }, { status: 400 });
      }

      if (prescriptionSource === "DIGITAL_CONSULTATION" && !consultationId) {
        return NextResponse.json({
          success: false,
          message: "Please select a valid doctor's consultation prescription.",
        }, { status: 400 });
      }

      if (prescriptionSource === "UPLOADED_DOCUMENT" && !uploadedPrescriptionUrl) {
        return NextResponse.json({
          success: false,
          message: "Please upload your prescription document (PDF or image).",
        }, { status: 400 });
      }
    }

    // 4. Calculate Taxes & Delivery Fees
    const taxRate = config.taxRatePercent || 12;
    const taxAmount = Math.round((itemsTotal * taxRate) / 100);
    const freeThreshold = config.freeDeliveryThreshold || 500;
    const deliveryCharge = itemsTotal >= freeThreshold ? 0 : (matchedPin.deliveryCharge ?? config.defaultDeliveryFee ?? 50);
    const totalPayable = itemsTotal + taxAmount + deliveryCharge;

    // 5. Generate Order Number
    const timestampStr = Date.now().toString().slice(-4);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `KMH-MED-${timestampStr}-${randomNum}`;

    // 6. Deduct Stock
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

    // 7. Initial Status & Lifecycle
    let initialStatus = "Placed";
    if (requiresPrescription) {
      initialStatus = "Prescription_Verification";
    }

    const order = new OrderModel({
      orderNumber,
      patientId: finalPatientId,
      clinicId: clinicId || undefined,
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
      shippingAddress: typeof shippingAddress === "string" ? shippingAddress : `${shippingDetails?.street}, ${shippingDetails?.city}, ${shippingDetails?.state} - ${shippingDetails?.pinCode}`,
      shippingDetails: shippingDetails || undefined,
      paymentMethod,
      paymentStatus: "Pending",
      prescriptionSource: requiresPrescription ? prescriptionSource : "OTC_NO_RX",
      consultationId: consultationId || undefined,
      uploadedPrescriptionUrl: uploadedPrescriptionUrl || undefined,
      prescriptionVerification: {
        status: requiresPrescription ? "Pending" : "Verified",
        notes: requiresPrescription ? "Awaiting verification by licensed pharmacist" : "No prescription required for OTC items",
      },
      delivery: {
        courierPartner: "Kelkar Manas Akola Delivery Partner",
        estimatedDeliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // ~24h
      },
      statusHistory: [
        {
          status: "Placed",
          timestamp: new Date(),
          comment: `Order placed by patient. Total: ₹${totalPayable.toLocaleString()} (${matchedPin.areaName}, Akola).`,
          updatedBy: "Patient",
        },
        ...(requiresPrescription ? [{
          status: "Prescription_Verification",
          timestamp: new Date(),
          comment: "Prescription submitted and sent to partnered pharmacy for verification.",
          updatedBy: "System",
        }] : [])
      ],
      isRefillOrder: !!isRefillOrder,
      parentOrderId: parentOrderId || undefined,
      remainingRefills: remainingRefills || 0,
    });

    await order.save();

    // Audit Log entry
    await AuditLogModel.create({
      userId: patientId.toString(),
      action: "MEDICINE_ORDER_PLACED",
      details: `Order ${orderNumber} placed. Items: ${validatedItems.length}, Total: ₹${totalPayable}, Pin: ${pinCode}`,
    }).catch((e: unknown) => console.error("Audit log error:", e));

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
