"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Package, Truck, ShieldCheck, Clock, CheckCircle2, 
  XCircle, AlertCircle, MapPin, 
  Phone, MessageSquare, Ban, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface OrderItem {
  productId?: {
    name: string;
    dosageForm?: string;
    composition?: string;
  };
  name?: string;
  dosage?: string;
  quantity: number;
  priceAtPurchase: number;
  isPrescription?: boolean;
  status?: string;
  substitutedWithName?: string;
}

interface OrderData {
  _id: string;
  orderNumber?: string;
  totalAmount: number;
  pricing?: {
    itemsTotal: number;
    taxAmount: number;
    deliveryCharge: number;
    discountAmount?: number;
    totalPayable: number;
  };
  status: string;
  shippingAddress: string;
  shippingDetails?: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pinCode: string;
    landmark?: string;
  };
  paymentStatus?: string;
  paymentMethod?: string;
  prescriptionSource?: string;
  uploadedPrescriptionUrl?: string;
  prescriptionVerification?: {
    status: string;
    notes?: string;
    rejectionReason?: string;
  };
  delivery?: {
    courierPartner?: string;
    trackingNumber?: string;
    dispatchedAt?: string;
    deliveredAt?: string;
    estimatedDeliveryDate?: string;
  };
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    comment?: string;
    updatedBy?: string;
  }>;
  cancellationReason?: string;
  refundStatus?: string;
  refundAmount?: number;
  complaintNotes?: string;
  complaintStatus?: string;
  items: OrderItem[];
  createdAt: string;
}

const LIFECYCLE_STEPS = [
  { key: "Placed", label: "Order Placed" },
  { key: "Payment_Confirmed", label: "Payment Confirmed" },
  { key: "Prescription_Verification", label: "Prescription Under Verification" },
  { key: "Prescription_Approved", label: "Prescription Approved" },
  { key: "Pharmacy_Processing", label: "Packing by Pharmacy" },
  { key: "Packed_Dispatched", label: "Dispatched" },
  { key: "Out_For_Delivery", label: "Out for Delivery" },
  { key: "Delivered", label: "Delivered" },
];

export default function PatientOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cancel Order Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Complaint Modal
  const [complaintModalOpen, setComplaintModalOpen] = useState(false);
  const [complaintText, setComplaintText] = useState("");
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  const refetchOrder = () => {
    setLoading(true);
    fetch(`/api/pharmacy/orders/${resolvedParams.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setOrder(data.data);
        } else {
          setError(data.message || "Order not found.");
        }
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load order details.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let ignore = false;
    fetch(`/api/pharmacy/orders/${resolvedParams.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) {
          if (data.success && data.data) {
            setOrder(data.data);
          } else {
            setError(data.message || "Order not found.");
          }
        }
      })
      .catch((err) => {
        console.error(err);
        if (!ignore) setError("Failed to load order details.");
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [resolvedParams.id]);

  // Determine active step index
  const getActiveStepIndex = (currentStatus: string) => {
    if (currentStatus === "Cancelled" || currentStatus === "Prescription_Rejected") return -1;
    const idx = LIFECYCLE_STEPS.findIndex((s) => s.key === currentStatus);
    if (idx !== -1) return idx;
    if (currentStatus === "Shipped") return 5;
    if (currentStatus === "Processing") return 4;
    return 0;
  };

  // Handle Cancellation
  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelling(true);

    try {
      const res = await fetch(`/api/pharmacy/orders/${order._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Cancelled",
          cancellationReason: cancelReason || "Cancelled by patient before dispatch",
          cancelledBy: "Patient",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setCancelModalOpen(false);
        refetchOrder();
      } else {
        alert(json.message || "Failed to cancel order.");
      }
    } catch (err) {
      console.error(err);
      alert("Error cancelling order.");
    } finally {
      setCancelling(false);
    }
  };

  // Handle Complaint
  const handleReportComplaint = async () => {
    if (!order || !complaintText.trim()) return;
    setSubmittingComplaint(true);

    try {
      const res = await fetch(`/api/pharmacy/orders/${order._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complaintNotes: complaintText.trim(),
          complaintStatus: "Open",
          comment: `Customer complaint reported: ${complaintText.trim()}`,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setComplaintModalOpen(false);
        refetchOrder();
      } else {
        alert(json.message || "Failed to submit complaint.");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting complaint.");
    } finally {
      setSubmittingComplaint(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground font-medium">
        Loading order tracking details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">{error || "Order not found"}</h2>
        <Link href="/patient/orders">
          <Button variant="outline" className="rounded-full">Back to My Orders</Button>
        </Link>
      </div>
    );
  }

  const activeIndex = getActiveStepIndex(order.status);
  const isCancellable = !["Packed_Dispatched", "Shipped", "Out_For_Delivery", "Delivered", "Cancelled"].includes(order.status);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/patient/orders">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Order {order.orderNumber || `#${order._id.substring(18)}`}
              </h1>
              <Badge className="font-semibold text-xs">
                {order.status.replace(/_/g, " ")}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isCancellable && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCancelModalOpen(true)}
              className="rounded-xl text-destructive hover:bg-destructive/10 border-destructive/20 text-xs font-semibold"
            >
              <Ban className="w-3.5 h-3.5 mr-1.5" /> Cancel Order
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setComplaintModalOpen(true)}
            className="rounded-xl text-xs font-semibold gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" /> Report Issue
          </Button>
        </div>
      </div>

      {/* CANCELLATION OR REJECTION BANNER */}
      {order.status === "Cancelled" && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl flex items-start gap-3 text-xs leading-relaxed">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">This order was cancelled</p>
            <p className="mt-0.5">Reason: {order.cancellationReason || "Cancelled upon request"}</p>
            {order.refundStatus === "Pending" && (
              <p className="mt-1 font-semibold text-amber-700">
                Refund of ₹{order.totalAmount} has been initiated and will credit to your original payment method in 3–5 working days.
              </p>
            )}
          </div>
        </div>
      )}

      {order.status === "Prescription_Rejected" && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl flex items-start gap-3 text-xs leading-relaxed">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">Prescription Verification Rejected by Pharmacist</p>
            <p className="mt-0.5">Reason: {order.prescriptionVerification?.rejectionReason || "Prescription does not match required clinical criteria."}</p>
            <p className="mt-2 text-foreground">
              Please <Link href="/booking" className="underline font-bold text-primary">book an online doctor consultation</Link> or upload a valid revised prescription.
            </p>
          </div>
        </div>
      )}

      {/* 9-STAGE VISUAL TRACKING STEPPER */}
      {order.status !== "Cancelled" && order.status !== "Prescription_Rejected" && (
        <div className="bg-background rounded-3xl p-6 sm:p-8 border border-border shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" /> Delivery Progress
            </h2>
            <span className="text-xs text-muted-foreground font-medium">
              Akola Local Delivery Service
            </span>
          </div>

          {/* Stepper Bar */}
          <div className="relative pt-4 pb-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
              {LIFECYCLE_STEPS.map((step, idx) => {
                const isCompleted = activeIndex >= idx;
                const isCurrent = activeIndex === idx;

                return (
                  <div key={step.key} className="flex flex-col items-center text-center space-y-2">
                    <div 
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
                        isCompleted 
                          ? "bg-primary text-white ring-4 ring-primary/10" 
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span className={`text-[11px] leading-tight font-medium ${isCurrent ? "font-bold text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Estimate Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/60 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground uppercase font-bold text-[10px]">Courier Tracking</span>
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-primary" />
                {order.delivery?.courierPartner || "Kelkar Manas Local Express"} • Ref: <span className="font-mono text-primary font-bold">{order.delivery?.trackingNumber || "Pending Dispatch"}</span>
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground uppercase font-bold text-[10px]">Estimated Delivery</span>
              <p className="font-semibold text-foreground">
                {order.delivery?.deliveredAt 
                  ? `Delivered on ${new Date(order.delivery.deliveredAt).toLocaleDateString("en-IN")}`
                  : "Within 24 to 48 Hours in Akola"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ORDER DETAILS & SUMMARY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Items & Prescription Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Medications Card */}
          <div className="bg-background rounded-3xl p-6 border border-border shadow-sm space-y-4">
            <h3 className="font-serif font-bold text-base flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" /> Prescribed Medications & Health Products
            </h3>

            <div className="divide-y divide-border/60">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-start justify-between text-xs sm:text-sm">
                  <div className="space-y-1">
                    <p className="font-bold text-foreground">{item.name || item.productId?.name}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span>Qty: {item.quantity}</span>
                      <span>•</span>
                      <span>₹{item.priceAtPurchase} per item</span>
                      {item.isPrescription && (
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-amber-500/40 text-amber-600">
                          Prescription-Only
                        </Badge>
                      )}
                    </div>
                    {item.status === "Substituted" && item.substitutedWithName && (
                      <p className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded px-2 py-0.5 w-fit">
                        Permissible Alternative: {item.substitutedWithName}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-sm text-foreground">
                    ₹{(item.priceAtPurchase * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Prescription & Pharmacy Verification Card */}
          <div className="bg-background rounded-3xl p-6 border border-border shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" /> Prescription & Dispensing Record
              </h3>
              <Badge variant="secondary">
                {order.prescriptionVerification?.status || "Pending Verification"}
              </Badge>
            </div>

            <div className="space-y-2 text-muted-foreground">
              <p>
                <span className="font-bold text-foreground">Prescription Source: </span>
                {order.prescriptionSource === "DIGITAL_CONSULTATION" ? "Digital Prescription from Kelkar Manas Doctor" : order.prescriptionSource === "UPLOADED_DOCUMENT" ? "Uploaded Doctor's Prescription" : "OTC (No Prescription Required)"}
              </p>
              {order.uploadedPrescriptionUrl && (
                <div className="pt-1">
                  <a 
                    href={order.uploadedPrescriptionUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="font-bold text-primary underline flex items-center gap-1"
                  >
                    View Uploaded Prescription Document <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
              {order.prescriptionVerification?.notes && (
                <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-foreground">
                  <span className="font-bold">Pharmacist Remarks: </span>
                  {order.prescriptionVerification.notes}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-border/60 text-muted-foreground text-[11px] leading-relaxed">
              Dispensary License: MH-AKL-2026-20B-10842 • Partnered Pharmacy: Kelkar Manas Health Care Partner Pharmacy, Civil Lines, Akola.
            </div>
          </div>

          {/* Status Timeline History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-background rounded-3xl p-6 border border-border shadow-sm space-y-4 text-xs">
              <h3 className="font-serif font-bold text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" /> Order Activity History
              </h3>
              <div className="space-y-3">
                {order.statusHistory.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 border-l-2 border-primary/40 pl-3">
                    <div className="space-y-0.5">
                      <span className="font-bold text-foreground">{h.status.replace(/_/g, " ")}</span>
                      <p className="text-muted-foreground">{h.comment}</p>
                      <span className="text-[10px] text-muted-foreground/80">
                        {new Date(h.timestamp).toLocaleString("en-IN")} • by {h.updatedBy || "System"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Shipping & Payment Summary */}
        <div className="space-y-6">
          
          {/* Shipping Destination */}
          <div className="bg-background rounded-3xl p-6 border border-border shadow-sm space-y-3 text-xs">
            <h3 className="font-serif font-bold text-sm flex items-center gap-2 text-foreground">
              <MapPin className="w-4 h-4 text-primary" /> Delivery Destination
            </h3>
            <p className="font-bold text-foreground">
              {order.shippingDetails?.fullName || "Recipient"}
            </p>
            <p className="text-muted-foreground flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-primary" /> {order.shippingDetails?.phone || "Phone on file"}
            </p>
            <p className="text-muted-foreground leading-relaxed">
              {order.shippingAddress}
            </p>
            <div className="p-2.5 bg-muted/40 rounded-xl border border-border/60">
              <span className="font-bold text-foreground">City: </span> Akola, Maharashtra
            </div>
          </div>

          {/* Payment & Invoice Breakdown */}
          <div className="bg-background rounded-3xl p-6 border border-border shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-sm text-foreground">Payment Summary</h3>
              <Badge variant={order.paymentStatus === "Paid" ? "secondary" : "destructive"}>
                {order.paymentStatus || "Pending"}
              </Badge>
            </div>

            <div className="space-y-2 border-b border-border/60 pb-3 text-muted-foreground">
              <div className="flex justify-between">
                <span>Medicines Subtotal</span>
                <span>₹{(order.pricing?.itemsTotal ?? order.totalAmount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (12%)</span>
                <span>₹{(order.pricing?.taxAmount ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery (Akola)</span>
                <span>{order.pricing?.deliveryCharge === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `₹${order.pricing?.deliveryCharge || 0}`}</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-sm text-foreground">
              <span>Total Amount</span>
              <span className="text-primary text-base">₹{order.totalAmount.toLocaleString()}</span>
            </div>

            <div className="text-[11px] text-muted-foreground">
              Payment Method: <span className="font-semibold text-foreground">{order.paymentMethod || "Online (Razorpay)"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CANCELLATION MODAL */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Cancel Medicine Order</DialogTitle>
            <DialogDescription className="text-xs">
              Orders can only be cancelled before they are packed and dispatched by the pharmacy.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <label className="font-bold">Reason for cancellation *</label>
            <textarea
              placeholder="e.g. Ordered by mistake, or physician changed recommendation."
              value={cancelReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCancelReason(e.target.value)}
              className="w-full h-24 p-3 rounded-xl border border-border bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setCancelModalOpen(false)}>
              Keep Order
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleCancelOrder} 
              disabled={cancelling}
              className="rounded-xl font-bold"
            >
              Confirm Cancellation
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* COMPLAINT MODAL */}
      <Dialog open={complaintModalOpen} onOpenChange={setComplaintModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Report an Issue or Complaint</DialogTitle>
            <DialogDescription className="text-xs">
              Report damaged, missing, or incorrect medicines. Our clinical support team will resolve it promptly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <label className="font-bold">Describe your complaint or package issue *</label>
            <textarea
              placeholder="e.g. Package seal was broken, or medicine strip received was different from invoice."
              value={complaintText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComplaintText(e.target.value)}
              className="w-full h-24 p-3 rounded-xl border border-border bg-transparent text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setComplaintModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleReportComplaint} 
              disabled={submittingComplaint || !complaintText.trim()}
              className="rounded-xl font-bold"
            >
              Submit Complaint
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
