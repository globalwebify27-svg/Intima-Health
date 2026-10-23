import mongoose, { Schema, Query } from "mongoose";

// --- UNIFIED MEDICINE / PRODUCT ---
export interface IProduct {
  clinicId?: Schema.Types.ObjectId;
  name: string;
  slug?: string;
  category?: string;
  price: number;
  mrp?: number;
  image?: string;
  type?: "medication" | "diagnostic" | "supplement";
  description?: string;
  isPrescription: boolean; // Mandatory prescription requirement flag
  scheduleClass?: "Schedule H" | "Schedule H1" | "Schedule X" | "OTC" | "Ayurvedic" | "Supplement";
  dosageForm?: "Tablet" | "Capsule" | "Syrup" | "Ointment" | "Injection" | "Drops" | "Gel" | "Powder";
  packSize?: string;
  composition?: string;
  manufacturer?: string;
  isRestrictedDelivery?: boolean; // Cannot be delivered legally
  stock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}

const ProductSchema = new Schema<IProduct>({
  clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: false },
  name: { type: String, required: true },
  slug: { type: String },
  category: { type: String, default: "Medication" },
  price: { type: Number, required: true },
  mrp: { type: Number },
  image: { type: String },
  type: { type: String, enum: ["medication", "diagnostic", "supplement"], default: "medication" },
  description: { type: String },
  isPrescription: { type: Boolean, default: false },
  scheduleClass: { 
    type: String, 
    enum: ["Schedule H", "Schedule H1", "Schedule X", "OTC", "Ayurvedic", "Supplement"], 
    default: "OTC" 
  },
  dosageForm: { type: String, default: "Tablet" },
  packSize: { type: String, default: "1 Strip" },
  composition: { type: String, default: "" },
  manufacturer: { type: String, default: "Kelkar Manas Health Care" },
  isRestrictedDelivery: { type: Boolean, default: false },
  stock: { type: Number, required: true, default: 0 },
  status: { type: String, enum: ["In Stock", "Low Stock", "Out of Stock"], default: "In Stock" },
  createdBy: { type: String },
  updatedBy: { type: String },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
  collection: "products"
});

ProductSchema.pre("save", function () {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  }
});

// --- ORDER ITEM ---
export interface IOrderItem {
  productId: Schema.Types.ObjectId;
  name?: string;
  dosage?: string;
  quantity: number;
  priceAtPurchase: number;
  isPrescription?: boolean;
  status?: "Pending" | "Approved" | "Substituted" | "Unavailable" | "Rejected";
  substitutedWithName?: string;
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  name: { type: String },
  dosage: { type: String },
  quantity: { type: Number, required: true, default: 1 },
  priceAtPurchase: { type: Number, required: true },
  isPrescription: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ["Pending", "Approved", "Substituted", "Unavailable", "Rejected"], 
    default: "Pending" 
  },
  substitutedWithName: { type: String },
}, { _id: false });

// --- PRESCRIPTION VERIFICATION ---
export interface IPrescriptionVerification {
  status: "Pending" | "Verified" | "Rejected" | "Clarification_Required";
  verifiedBy?: string;
  verifiedAt?: Date;
  notes?: string;
  rejectionReason?: string;
}

const PrescriptionVerificationSchema = new Schema<IPrescriptionVerification>({
  status: { 
    type: String, 
    enum: ["Pending", "Verified", "Rejected", "Clarification_Required"], 
    default: "Pending" 
  },
  verifiedBy: { type: String },
  verifiedAt: { type: Date },
  notes: { type: String },
  rejectionReason: { type: String },
}, { _id: false });

// --- PRICING BREAKDOWN ---
export interface IOrderPricing {
  itemsTotal: number;
  taxAmount: number; // GST
  deliveryCharge: number;
  discountAmount?: number;
  totalPayable: number;
}

const OrderPricingSchema = new Schema<IOrderPricing>({
  itemsTotal: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  deliveryCharge: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalPayable: { type: Number, required: true },
}, { _id: false });

// --- STRUCTURED SHIPPING ADDRESS ---
export interface IShippingDetails {
  fullName: string;
  phone: string;
  street: string;
  city: string; // e.g. "Akola"
  state: string; // "Maharashtra"
  pinCode: string; // e.g. "444001"
  landmark?: string;
}

const ShippingDetailsSchema = new Schema<IShippingDetails>({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true, default: "Akola" },
  state: { type: String, required: true, default: "Maharashtra" },
  pinCode: { type: String, required: true },
  landmark: { type: String },
}, { _id: false });

// --- DELIVERY TRACKING ---
export interface IOrderDelivery {
  courierPartner?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: Date;
  dispatchedAt?: Date;
  deliveredAt?: Date;
}

const OrderDeliverySchema = new Schema<IOrderDelivery>({
  courierPartner: { type: String, default: "Local Express Delivery (Akola)" },
  trackingNumber: { type: String },
  estimatedDeliveryDate: { type: Date },
  dispatchedAt: { type: Date },
  deliveredAt: { type: Date },
}, { _id: false });

// --- STATUS HISTORY ---
export interface IOrderStatusHistory {
  status: string;
  timestamp: Date;
  comment?: string;
  updatedBy?: string;
}

const OrderStatusHistorySchema = new Schema<IOrderStatusHistory>({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  comment: { type: String },
  updatedBy: { type: String },
}, { _id: false });

// --- ORDER ---
export type OrderLifecycleStatus = 
  | "Placed"
  | "Payment_Confirmed"
  | "Prescription_Verification"
  | "Prescription_Approved"
  | "Prescription_Rejected"
  | "Pharmacy_Processing"
  | "Packed_Dispatched"
  | "Out_For_Delivery"
  | "Delivered"
  | "Cancelled"
  | "Refund_Initiated"
  | "Refund_Completed";

export interface IOrder {
  orderNumber?: string;
  patientId: Schema.Types.ObjectId;
  clinicId?: Schema.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  pricing?: IOrderPricing;
  status: OrderLifecycleStatus | "Pending" | "Processing" | "Shipped"; // Compatible with old strings
  shippingAddress: string;
  shippingDetails?: IShippingDetails;
  paymentId?: Schema.Types.ObjectId;
  paymentMethod?: "Online" | "COD";
  paymentStatus?: "Pending" | "Paid" | "Failed" | "Refunded";
  prescriptionSource?: "DIGITAL_CONSULTATION" | "UPLOADED_DOCUMENT" | "OTC_NO_RX";
  consultationId?: Schema.Types.ObjectId;
  uploadedPrescriptionUrl?: string;
  prescriptionVerification?: IPrescriptionVerification;
  delivery?: IOrderDelivery;
  statusHistory?: IOrderStatusHistory[];
  isRefillOrder?: boolean;
  parentOrderId?: Schema.Types.ObjectId;
  remainingRefills?: number;
  cancellationReason?: string;
  cancelledAt?: Date;
  cancelledBy?: string;
  refundStatus?: "Not_Applicable" | "Pending" | "Processed";
  refundAmount?: number;
  complaintNotes?: string;
  complaintStatus?: "None" | "Open" | "Resolved";
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}

const OrderSchema = new Schema<IOrder>({
  orderNumber: { type: String, index: true },
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: false },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  pricing: { type: OrderPricingSchema },
  status: { 
    type: String, 
    default: "Placed" 
  },
  shippingAddress: { type: String, required: true },
  shippingDetails: { type: ShippingDetailsSchema },
  paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
  paymentMethod: { type: String, enum: ["Online", "COD"], default: "Online" },
  paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed", "Refunded"], default: "Pending" },
  prescriptionSource: { 
    type: String, 
    enum: ["DIGITAL_CONSULTATION", "UPLOADED_DOCUMENT", "OTC_NO_RX"],
    default: "OTC_NO_RX"
  },
  consultationId: { type: Schema.Types.ObjectId, ref: "Consultation" },
  uploadedPrescriptionUrl: { type: String },
  prescriptionVerification: { type: PrescriptionVerificationSchema },
  delivery: { type: OrderDeliverySchema },
  statusHistory: { type: [OrderStatusHistorySchema], default: [] },
  isRefillOrder: { type: Boolean, default: false },
  parentOrderId: { type: Schema.Types.ObjectId, ref: "Order" },
  remainingRefills: { type: Number, default: 0 },
  cancellationReason: { type: String },
  cancelledAt: { type: Date },
  cancelledBy: { type: String },
  refundStatus: { type: String, enum: ["Not_Applicable", "Pending", "Processed"], default: "Not_Applicable" },
  refundAmount: { type: Number, default: 0 },
  complaintNotes: { type: String },
  complaintStatus: { type: String, enum: ["None", "Open", "Resolved"], default: "None" },
  createdBy: { type: String },
  updatedBy: { type: String },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
  collection: "orders"
});

// --- PAYMENT ---
export interface IPayment {
  orderId?: Schema.Types.ObjectId;
  appointmentId?: Schema.Types.ObjectId;
  patientId: Schema.Types.ObjectId;
  gatewayProvider: string; // e.g. "Razorpay"
  gatewayTransactionId: string;
  amount: number;
  currency: string; // e.g. "INR"
  status: "Success" | "Failed" | "Pending";
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}

const PaymentSchema = new Schema<IPayment>({
  orderId: { type: Schema.Types.ObjectId, ref: "Order" },
  appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment" },
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  gatewayProvider: { type: String, required: true, default: "Razorpay" },
  gatewayTransactionId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "INR" },
  status: { type: String, enum: ["Success", "Failed", "Pending"], default: "Pending" },
  createdBy: { type: String },
  updatedBy: { type: String },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

// --- THERAPY SESSION ---
export interface ITherapySession {
  patientId: Schema.Types.ObjectId;
  clinicId: Schema.Types.ObjectId;
  name: string;
  price: number;
  status: "Recommended" | "Booked" | "Paid";
  date?: string;
  time?: string;
  consultationId: Schema.Types.ObjectId;
  deletedAt?: Date | null;
}

const TherapySessionSchema = new Schema<ITherapySession>({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ["Recommended", "Booked", "Paid"], default: "Recommended" },
  date: { type: String },
  time: { type: String },
  consultationId: { type: Schema.Types.ObjectId, ref: "Consultation", required: true },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

ProductSchema.pre("find", function(this: Query<unknown, unknown>) { this.where({ deletedAt: null }); });
ProductSchema.pre("findOne", function(this: Query<unknown, unknown>) { this.where({ deletedAt: null }); });

OrderSchema.pre("find", function(this: Query<unknown, unknown>) { this.where({ deletedAt: null }); });
OrderSchema.pre("findOne", function(this: Query<unknown, unknown>) { this.where({ deletedAt: null }); });

PaymentSchema.pre("find", function(this: Query<unknown, unknown>) { this.where({ deletedAt: null }); });
PaymentSchema.pre("findOne", function(this: Query<unknown, unknown>) { this.where({ deletedAt: null }); });

TherapySessionSchema.pre("find", function(this: Query<unknown, unknown>) { this.where({ deletedAt: null }); });
TherapySessionSchema.pre("findOne", function(this: Query<unknown, unknown>) { this.where({ deletedAt: null }); });

// Unify Product model across the app
export const ProductModel = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
// Also alias PharmacyProduct for backward compatibility if ever queried
if (!mongoose.models.PharmacyProduct) {
  mongoose.model<IProduct>("PharmacyProduct", ProductSchema);
}

export const OrderModel = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
export const PaymentModel = mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
export const TherapySessionModel = mongoose.models.TherapySession || mongoose.model<ITherapySession>("TherapySession", TherapySessionSchema);
