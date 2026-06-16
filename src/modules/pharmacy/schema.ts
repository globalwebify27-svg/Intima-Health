import mongoose, { Schema } from "mongoose";

// --- PRODUCT ---
export interface IProduct {
  clinicId?: Schema.Types.ObjectId;
  name: string;
  category: string;
  price: number;
  stock: number;
  description?: string;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}

const ProductSchema = new Schema<IProduct>({
  clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: false },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  description: { type: String },
  status: { type: String, enum: ["In Stock", "Low Stock", "Out of Stock"], default: "In Stock" },
  createdBy: { type: String },
  updatedBy: { type: String },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

// --- ORDER ---
export interface IOrderItem {
  productId: Schema.Types.ObjectId;
  quantity: number;
  priceAtPurchase: number;
}

export interface IOrder {
  patientId: Schema.Types.ObjectId;
  clinicId?: Schema.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered";
  shippingAddress: string;
  paymentId?: Schema.Types.ObjectId;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date | null;
}

const OrderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  priceAtPurchase: { type: Number, required: true },
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: false },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ["Pending", "Processing", "Shipped", "Delivered"], default: "Pending" },
  shippingAddress: { type: String, required: true },
  paymentId: { type: Schema.Types.ObjectId, ref: "Payment" },
  createdBy: { type: String },
  updatedBy: { type: String },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

// --- PAYMENT ---
export interface IPayment {
  orderId?: Schema.Types.ObjectId;
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

ProductSchema.pre("find", function(this: any) { this.where({ deletedAt: null }); });
ProductSchema.pre("findOne", function(this: any) { this.where({ deletedAt: null }); });

OrderSchema.pre("find", function(this: any) { this.where({ deletedAt: null }); });
OrderSchema.pre("findOne", function(this: any) { this.where({ deletedAt: null }); });

PaymentSchema.pre("find", function(this: any) { this.where({ deletedAt: null }); });
PaymentSchema.pre("findOne", function(this: any) { this.where({ deletedAt: null }); });

export const ProductModel = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
export const OrderModel = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
export const PaymentModel = mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

// --- THERAPY SESSION ---
export interface ITherapySession {
  patientId: Schema.Types.ObjectId;
  clinicId: Schema.Types.ObjectId;
  name: string;
  price: number;
  status: "Unpaid" | "Paid";
  consultationId: Schema.Types.ObjectId;
  deletedAt?: Date | null;
}

const TherapySessionSchema = new Schema<ITherapySession>({
  patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  clinicId: { type: Schema.Types.ObjectId, ref: "Clinic", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  status: { type: String, enum: ["Unpaid", "Paid"], default: "Unpaid" },
  consultationId: { type: Schema.Types.ObjectId, ref: "Consultation", required: true },
  deletedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

TherapySessionSchema.pre("find", function(this: any) { this.where({ deletedAt: null }); });
TherapySessionSchema.pre("findOne", function(this: any) { this.where({ deletedAt: null }); });

export const TherapySessionModel = mongoose.models.TherapySession || mongoose.model<ITherapySession>("TherapySession", TherapySessionSchema);
