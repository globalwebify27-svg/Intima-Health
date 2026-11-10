"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Phone, MessageSquare, CheckCircle2, XCircle, Clock, 
  Search, RefreshCcw, Building2, User, Pill, AlertTriangle, 
  PhoneCall, ShieldCheck
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface OrderItem {
  productId?: {
    name?: string;
  };
  name?: string;
  dosage?: string;
  quantity: number;
}

interface Order {
  _id: string;
  orderNumber?: string;
  clinicId?: {
    _id: string;
    name?: string;
    city?: string;
  };
  consultationId?: {
    _id: string;
    doctorId?: {
      name?: string;
      specialization?: string;
    };
    prescriptionSummary?: string;
  };
  patientId: {
    _id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  shippingDetails?: {
    fullName?: string;
    phone?: string;
  };
  items: OrderItem[];
  status: string;
  cancellationReason?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  createdAt: string;
}

export default function PharmacyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Pending");
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Status Change State
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    fetch("/api/pharmacy/orders")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setOrders(resData.data);
        }
      })
      .catch((err) => console.error("Error fetching pharmacy orders:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string, comment?: string) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await fetch(`/api/pharmacy/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          comment: comment || `Status updated to ${newStatus} by Pharmacy Staff`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (newStatus === "FULFILLED") {
          setSuccessBanner("Order fulfilled successfully. It has been moved to the Fulfilled archive.");
          setTimeout(() => setSuccessBanner(null), 5000);
        } else if (newStatus === "CALL_COMPLETED") {
          setSuccessBanner("Phone call verification recorded for this order.");
          setTimeout(() => setSuccessBanner(null), 4000);
        }
        fetchOrders();
      } else {
        alert(data.message || "Failed to update order status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const openCancelModal = (order: Order) => {
    const s = (order.status || "").toUpperCase();
    if (s === "FULFILLED" || s === "DELIVERED") {
      alert("Fulfilled orders cannot be cancelled.");
      return;
    }
    if (s === "CANCELLED") {
      alert("This order is already cancelled.");
      return;
    }
    setCancellingOrder(order);
    setCancellationReason("");
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/pharmacy/orders/${cancellingOrder._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "CANCELLED",
          cancelledBy: "Pharmacy Staff",
          cancellationReason: cancellationReason || "Order cancelled by pharmacy following patient phone verification.",
          comment: cancellationReason || "Order cancelled by pharmacy staff.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCancelModalOpen(false);
        setCancellingOrder(null);
        setSuccessBanner("Order has been cancelled and retained in history for audit purposes.");
        setTimeout(() => setSuccessBanner(null), 5000);
        fetchOrders();
      } else {
        alert(data.message || "Failed to cancel order");
      }
    } catch (err) {
      console.error(err);
      alert("Error cancelling order");
    } finally {
      setActionLoading(false);
    }
  };

  // Tab counts
  const counts = {
    Pending: orders.filter((o) => {
      const s = o.status.toUpperCase();
      return !["FULFILLED", "DELIVERED", "CANCELLED"].includes(s);
    }).length,
    Verified: orders.filter((o) => {
      const s = o.status.toUpperCase();
      return s === "CALL_COMPLETED" || s === "PRESCRIPTION_APPROVED";
    }).length,
    Fulfilled: orders.filter((o) => {
      const s = o.status.toUpperCase();
      return s === "FULFILLED" || s === "DELIVERED";
    }).length,
    Cancelled: orders.filter((o) => o.status.toUpperCase() === "CANCELLED").length,
    All: orders.length,
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const patientName = order.shippingDetails?.fullName || order.patientId?.name || "";
    const patientPhone = order.shippingDetails?.phone || order.patientId?.phone || "";
    const orderNum = order.orderNumber || order._id;

    const matchesSearch =
      patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patientPhone.includes(searchQuery) ||
      orderNum.toLowerCase().includes(searchQuery.toLowerCase());

    const normStatus = order.status.toUpperCase();
    const isCancelled = normStatus === "CANCELLED";
    const isFulfilled = normStatus === "FULFILLED" || normStatus === "DELIVERED";
    const isVerified = normStatus === "CALL_COMPLETED" || normStatus === "PRESCRIPTION_APPROVED";
    const isPending = !isFulfilled && !isCancelled;

    if (statusFilter === "Pending") {
      return matchesSearch && isPending;
    }
    if (statusFilter === "Verified") {
      return matchesSearch && isVerified;
    }
    if (statusFilter === "Fulfilled") {
      return matchesSearch && isFulfilled;
    }
    if (statusFilter === "Cancelled") {
      return matchesSearch && isCancelled;
    }
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === "REQUEST_RECEIVED" || s === "PLACED" || s === "PRESCRIPTION_VERIFICATION") {
      return (
        <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 text-xs font-bold gap-1">
          <Clock className="w-3 h-3" /> Pending Verification
        </Badge>
      );
    }
    if (s === "CALL_COMPLETED" || s === "PRESCRIPTION_APPROVED") {
      return (
        <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-bold gap-1">
          <PhoneCall className="w-3 h-3" /> Call Completed
        </Badge>
      );
    }
    if (s === "FULFILLED" || s === "DELIVERED") {
      return (
        <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-bold gap-1">
          <CheckCircle2 className="w-3 h-3" /> Fulfilled
        </Badge>
      );
    }
    if (s === "CANCELLED") {
      return (
        <Badge variant="destructive" className="text-xs font-bold gap-1">
          <XCircle className="w-3 h-3" /> Cancelled
        </Badge>
      );
    }
    return <Badge variant="outline" className="text-xs font-bold">{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pharmacy Online Orders</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Call-based verification and fulfilment of prescription medicine requests assigned to this clinic pharmacy.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchOrders} 
          disabled={loading}
          className="rounded-xl gap-2 font-semibold h-10 shrink-0"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Requests
        </Button>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-semibold">{successBanner}</span>
        </div>
      )}

      {/* Verification Notice */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
        <PhoneCall className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1 text-amber-900 dark:text-amber-300">
          <p className="font-bold text-sm">Order Verification &amp; Fulfilment Protocol</p>
          <p className="leading-relaxed">
            Contact the patient over a phone call upon receiving the request. Verify medicines, dosage, and delivery/pickup preferences. Fulfilment or cancellation should only take place after telephone verification.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search here..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl"
          />
        </div>

        {/* Status Filter Tabs with Dynamic Counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {[
            { id: "Pending", label: "Pending" },
            { id: "Verified", label: "Verified" },
            { id: "Fulfilled", label: "Fulfilled" },
            { id: "Cancelled", label: "Cancelled" },
            { id: "All", label: "All" },
          ].map((tab) => {
            const count = counts[tab.id as keyof typeof counts];
            const isActive = statusFilter === tab.id;
            return (
              <Button
                key={tab.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(tab.id)}
                className="rounded-xl text-xs font-semibold h-9 shrink-0 gap-1.5"
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {count}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Orders Card Grid */}
      {loading ? (
        <div className="py-20 text-center text-muted-foreground font-medium text-sm">
          Loading online orders for this pharmacy...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border rounded-3xl space-y-3">
          <Pill className="w-12 h-12 text-muted-foreground/50 mx-auto" />
          <p className="font-bold text-base text-foreground">No Medicine Order Requests Found</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            When patients consult doctors at this clinic and click &ldquo;Medicine Order Request&rdquo;, their requests will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredOrders.map((order) => {
            const patientName = order.shippingDetails?.fullName || order.patientId?.name || "Patient";
            const patientPhone = order.shippingDetails?.phone || order.patientId?.phone || "";
            const cleanPhone = patientPhone.replace(/\D/g, "");
            const doctor = order.consultationId?.doctorId;
            const clinic = order.clinicId;
            const normStatus = order.status.toUpperCase();
            const isCancelled = normStatus === "CANCELLED";
            const isFulfilled = normStatus === "FULFILLED" || normStatus === "DELIVERED";
            const isCallDone = normStatus === "CALL_COMPLETED" || normStatus === "PRESCRIPTION_APPROVED";

            return (
              <div 
                key={order._id}
                className={`bg-card rounded-3xl border ${isCancelled ? "border-destructive/30 bg-destructive/5" : "border-border"} p-5 shadow-sm flex flex-col justify-between space-y-4 transition-all hover:shadow-md`}
              >
                {/* Card Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono font-bold text-xs text-primary">
                        {order.orderNumber || `#${order._id.slice(-6)}`}
                      </span>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(order.createdAt).toLocaleString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  {/* Clinic Tag */}
                  {clinic && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                      <span>{clinic.name || "Clinic Pharmacy"}</span>
                    </div>
                  )}

                  {/* Patient Contact Details Card */}
                  <div className="p-3 bg-muted/40 rounded-2xl text-xs space-y-2 border border-border/50">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-bold text-foreground text-sm">{patientName}</span>
                    </div>

                    {patientPhone ? (
                      <div className="flex items-center justify-between pt-1 border-t border-border/40 gap-2">
                        <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                          <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-mono">{patientPhone}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <a 
                            href={`tel:${patientPhone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700 transition-colors shadow-sm"
                          >
                            <Phone className="w-3 h-3" /> Call
                          </a>
                          <a 
                            href={`https://wa.me/91${cleanPhone.slice(-10)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-lg text-[11px] font-bold hover:bg-emerald-200 transition-colors"
                          >
                            <MessageSquare className="w-3 h-3" /> WhatsApp
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-muted-foreground italic">No contact phone provided</p>
                    )}

                    {doctor && (
                      <div className="pt-1 text-[11px] text-muted-foreground border-t border-border/40">
                        Prescribed by: <strong className="text-foreground">Dr. {doctor.name}</strong>
                      </div>
                    )}
                  </div>

                  {/* Ordered Medicines List */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5 text-primary" /> Ordered Medicines ({order.items?.length || 0})
                    </p>
                    <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                      {(order.items || []).map((item, idx) => (
                        <div 
                          key={idx}
                          className="p-2 bg-background border border-border/60 rounded-xl text-xs flex justify-between items-center"
                        >
                          <div>
                            <p className="font-semibold text-foreground">{item.name || item.productId?.name || "Medication"}</p>
                            {item.dosage && <p className="text-[10px] text-muted-foreground">{item.dosage}</p>}
                          </div>
                          <span className="text-[11px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                            Qty: {item.quantity || 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cancellation Reason Display if Cancelled */}
                  {isCancelled && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs space-y-1">
                      <p className="font-bold text-destructive flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Order Cancelled
                      </p>
                      {order.cancellationReason && (
                        <p className="text-[11px] text-destructive/90">{order.cancellationReason}</p>
                      )}
                      {order.cancelledBy && (
                        <p className="text-[10px] text-muted-foreground">Cancelled by: {order.cancelledBy}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions & Status Management */}
                {!isCancelled && (
                  <div className="pt-3 border-t border-border/50 space-y-2">
                    {/* Status Update Options */}
                    <div className="flex gap-2">
                      {!isCallDone && !isFulfilled && (
                        <Button 
                          size="sm"
                          disabled={updatingOrderId === order._id}
                          onClick={() => handleUpdateStatus(order._id, "CALL_COMPLETED", "Phone call verification completed with patient")}
                          className="flex-1 rounded-xl text-xs font-bold h-9 bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                        >
                          <PhoneCall className="w-3.5 h-3.5" /> Call Verified
                        </Button>
                      )}

                      {!isFulfilled && (
                        <Button 
                          size="sm"
                          disabled={updatingOrderId === order._id}
                          onClick={() => handleUpdateStatus(order._id, "FULFILLED", "Medicine verified and dispensed by clinic pharmacy")}
                          className="flex-1 rounded-xl text-xs font-bold h-9 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Fulfil / Dispense
                        </Button>
                      )}

                      {isFulfilled && (
                        <div className="flex-1 py-1.5 px-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Fulfilment Complete
                        </div>
                      )}
                    </div>

                    {/* Cancel Order Option with Confirmation Popup */}
                    {!isFulfilled && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openCancelModal(order)}
                        className="w-full text-destructive hover:bg-destructive/10 rounded-xl text-xs font-semibold h-8"
                      >
                        Cancel Request
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CANCELLATION CONFIRMATION POPUP */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 sm:p-7 space-y-4">
          <div className="w-12 h-12 bg-destructive/10 text-destructive rounded-2xl mx-auto flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <DialogHeader className="text-center space-y-1">
            <DialogTitle className="text-lg font-bold text-foreground">
              Confirm Order Cancellation
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to cancel this medicine order request? This status will automatically reflect in the patient&apos;s portal.
            </DialogDescription>
          </DialogHeader>

          {cancellingOrder && (
            <div className="p-3 bg-muted/40 rounded-2xl text-xs space-y-1">
              <p>Reference: <strong className="font-mono text-primary">{cancellingOrder.orderNumber || cancellingOrder._id}</strong></p>
              <p>Patient: <strong>{cancellingOrder.shippingDetails?.fullName || cancellingOrder.patientId?.name}</strong></p>
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-foreground">Cancellation Reason:</label>
            <textarea
              placeholder="e.g. Patient uncontactable / Patient requested cancellation / Medicine unavailable"
              value={cancellationReason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCancellationReason(e.target.value)}
              className="w-full rounded-xl text-xs min-h-[80px] p-3 border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => setCancelModalOpen(false)}
              disabled={actionLoading}
              className="rounded-xl font-semibold flex-1"
            >
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={actionLoading}
              className="rounded-xl font-bold flex-1"
            >
              {actionLoading ? "Cancelling..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
