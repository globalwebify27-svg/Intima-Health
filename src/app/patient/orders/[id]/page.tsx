"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Package, Clock, 
  XCircle, AlertCircle, Phone,
  Ban, PhoneCall, CheckCircle2, Headphones, PhoneOff
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
  priceAtPurchase?: number;
  isPrescription?: boolean;
  status?: string;
  substitutedWithName?: string;
}

interface OrderData {
  _id: string;
  orderNumber?: string;
  totalAmount?: number;
  status: string;
  clinicId?: {
    _id?: string;
    name?: string;
    phone?: string;
    email?: string;
    city?: string;
  } | string;
  prescriptionVerification?: {
    status?: string;
    notes?: string;
    rejectionReason?: string;
  };
  cancellationReason?: string;
  cancelledBy?: string;
  items: OrderItem[];
  createdAt: string;
}

export default function PatientOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Cancel Order Modal
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground font-medium">
        Loading order details...
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

  // 1. Order Status: Show Pending, Delivered or Cancelled
  const getOrderStatus = (status: string): "Pending" | "Delivered" | "Cancelled" => {
    const s = (status || "").toUpperCase();
    if (s === "CANCELLED" || s === "CANCEL") return "Cancelled";
    if (s === "DELIVERED" || s === "FULFILLED" || s === "COMPLETED") return "Delivered";
    return "Pending";
  };

  // 2. Call Verification Status: Show Verified, Unverified or Pending Verification
  const getCallVerificationStatus = (
    orderStatus: string,
    pvStatus?: string
  ): "Verified" | "Unverified" | "Pending Verification" => {
    const s = (orderStatus || "").toUpperCase();
    const pv = (pvStatus || "").toUpperCase();

    if (
      s === "CALL_COMPLETED" ||
      s === "PRESCRIPTION_APPROVED" ||
      s === "FULFILLED" ||
      s === "DELIVERED" ||
      pv === "VERIFIED" ||
      pv === "APPROVED"
    ) {
      return "Verified";
    }

    if (s === "CANCELLED" || s === "PRESCRIPTION_REJECTED" || pv === "REJECTED") {
      return "Unverified";
    }

    return "Pending Verification";
  };

  const orderStatus = getOrderStatus(order.status);
  const callVerificationStatus = getCallVerificationStatus(
    order.status,
    order.prescriptionVerification?.status
  );

  const nonCancellableStatuses = [
    "Packed_Dispatched", "Shipped", "Out_For_Delivery", "Delivered", 
    "Cancelled", "CANCELLED", "Fulfilled", "FULFILLED", "Completed", "COMPLETED"
  ];
  const isCancellable = !nonCancellableStatuses.includes(order.status);

  // Clinic & Support contact
  const clinic = typeof order.clinicId === "object" && order.clinicId ? order.clinicId : null;
  const supportPhone = clinic?.phone || "+91 7030414140";
  const cleanPhone = supportPhone.replace(/[^0-9+]/g, "");

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div className="flex items-center gap-3">
          <Link href="/patient/orders">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Order {order.orderNumber || `#${order._id.substring(18)}`}
              </h1>

              {/* Order Status Badge */}
              {orderStatus === "Delivered" && (
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-xs gap-1 py-0.5 px-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivered
                </Badge>
              )}
              {orderStatus === "Cancelled" && (
                <Badge variant="destructive" className="font-bold text-xs gap-1 py-0.5 px-2.5">
                  <XCircle className="w-3.5 h-3.5" /> Cancelled
                </Badge>
              )}
              {orderStatus === "Pending" && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 font-bold text-xs gap-1 py-0.5 px-2.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending
                </Badge>
              )}

              {/* Call Verification Badge */}
              {callVerificationStatus === "Verified" && (
                <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 font-bold text-xs gap-1 py-0.5 px-2.5">
                  <PhoneCall className="w-3.5 h-3.5 text-blue-600" /> Verified
                </Badge>
              )}
              {callVerificationStatus === "Unverified" && (
                <Badge className="bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 font-bold text-xs gap-1 py-0.5 px-2.5">
                  <PhoneOff className="w-3.5 h-3.5 text-slate-500" /> Unverified
                </Badge>
              )}
              {callVerificationStatus === "Pending Verification" && (
                <Badge className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 font-semibold text-xs gap-1 py-0.5 px-2.5">
                  <Clock className="w-3.5 h-3.5 text-amber-500" /> Pending Verification
                </Badge>
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-1">
              Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        {/* Top Header Actions: Support Phone with Call Now & Cancel Option */}
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <a 
            href={`tel:${cleanPhone}`}
            className="inline-flex items-center gap-2 rounded-xl font-bold text-xs h-9 px-3.5 border border-primary/30 text-primary hover:bg-primary/10 transition-colors shadow-2xs bg-background"
          >
            <PhoneCall className="w-3.5 h-3.5 text-primary" />
            <span>Support: {supportPhone}</span>
            <span className="bg-primary text-white text-[10px] px-1.5 py-0.5 rounded font-semibold ml-0.5">Call Now</span>
          </a>

          {isCancellable && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setCancelModalOpen(true)}
              className="rounded-xl text-destructive hover:bg-destructive/10 border-destructive/20 text-xs font-semibold h-9"
            >
              <Ban className="w-3.5 h-3.5 mr-1.5" /> Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* CANCELLATION BANNER */}
      {orderStatus === "Cancelled" && (
        <div className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl flex items-start gap-3 text-xs leading-relaxed">
          <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">This order request was cancelled</p>
            <p className="mt-0.5">Reason: {order.cancellationReason || "Cancelled upon request"}</p>
          </div>
        </div>
      )}

      {/* STATUS OVERVIEW CARDS: Order Status & Call Verification */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Card 1: Order Status */}
        <div className="bg-card rounded-3xl p-5 border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-primary" /> Order Status
            </span>
            {orderStatus === "Delivered" && (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-xs gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Delivered
              </Badge>
            )}
            {orderStatus === "Cancelled" && (
              <Badge variant="destructive" className="font-bold text-xs gap-1">
                <XCircle className="w-3 h-3" /> Cancelled
              </Badge>
            )}
            {orderStatus === "Pending" && (
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 font-bold text-xs gap-1">
                <Clock className="w-3 h-3 text-amber-600" /> Pending
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed pt-1">
            {orderStatus === "Delivered"
              ? "Your medications have been fulfilled and dispensed successfully."
              : orderStatus === "Cancelled"
              ? "This order request has been cancelled."
              : "Your order is being reviewed and processed by our clinic pharmacy team."}
          </p>
        </div>

        {/* Card 2: Call Verification Status */}
        <div className="bg-card rounded-3xl p-5 border border-border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-primary" /> Call Verification
            </span>
            {callVerificationStatus === "Verified" && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 font-bold text-xs gap-1">
                <PhoneCall className="w-3 h-3 text-blue-600" /> Verified
              </Badge>
            )}
            {callVerificationStatus === "Unverified" && (
              <Badge className="bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 font-bold text-xs gap-1">
                <PhoneOff className="w-3 h-3 text-slate-500" /> Unverified
              </Badge>
            )}
            {callVerificationStatus === "Pending Verification" && (
              <Badge className="bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 font-semibold text-xs gap-1">
                <Clock className="w-3 h-3 text-amber-500" /> Pending Verification
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed pt-1">
            {callVerificationStatus === "Verified"
              ? "Phone call verification with the patient has been completed."
              : callVerificationStatus === "Unverified"
              ? "Phone call verification could not be completed or was cancelled."
              : "Awaiting phone verification call from our clinic pharmacist before dispatch."}
          </p>
        </div>
      </div>

      {/* ORDERED ITEMS LIST: Medicine Name, Quantity and Prescription Details (NO PRICES) */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="font-serif font-bold text-base flex items-center gap-2 text-foreground">
            <Package className="w-4 h-4 text-primary" /> Ordered Medications ({order.items.length})
          </h3>
          <span className="text-xs text-muted-foreground font-medium">Prescription Items</span>
        </div>

        <div className="divide-y divide-border/60">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-base text-foreground">
                    {item.name || item.productId?.name}
                  </p>
                  {item.isPrescription && (
                    <Badge variant="outline" className="text-[10px] py-0 px-2 border-amber-500/40 text-amber-600 bg-amber-500/5 font-semibold">
                      Prescription-Only
                    </Badge>
                  )}
                </div>

                {item.dosage && (
                  <p className="text-xs text-muted-foreground font-medium bg-muted/40 px-2.5 py-1 rounded-lg w-fit">
                    {item.dosage}
                  </p>
                )}

                {item.status === "Substituted" && item.substitutedWithName && (
                  <p className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-2.5 py-1 w-fit">
                    Permissible Alternative: {item.substitutedWithName}
                  </p>
                )}
              </div>

              {/* Quantity (NO PRICES) */}
              <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                <span className="text-xs text-muted-foreground font-medium">Quantity:</span>
                <span className="font-bold text-xs px-3 py-1 bg-muted/50 rounded-xl text-foreground border border-border/50">
                  {item.quantity} {item.quantity === 1 ? "unit" : "units"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CUSTOMER SUPPORT CARD: Support Phone with Clickable Call Now */}
      <div className="bg-card rounded-3xl p-6 border border-border shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Headphones className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-base text-foreground">Customer Support & Pharmacy Helpline</h3>
              <p className="text-xs text-muted-foreground">
                Need help with your order or have questions for the pharmacist? We are available to assist you.
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs">
                <Phone className="w-3.5 h-3.5 text-primary" />
                <span className="text-muted-foreground">Support Number:</span>
                <span className="font-bold text-foreground">{supportPhone}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 sm:self-center">
            <a 
              href={`tel:${cleanPhone}`}
              className="inline-flex items-center justify-center w-full sm:w-auto rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-md gap-2 h-10 px-5 text-sm transition-all"
            >
              <PhoneCall className="w-4 h-4" /> Call Now
            </a>
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
    </div>
  );
}
