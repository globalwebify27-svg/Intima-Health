"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, Phone, MessageSquare, CheckCircle2, XCircle, Clock, 
  RefreshCcw, Building2, User, Pill, AlertTriangle, PhoneCall, 
  Eye, Filter
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

interface Clinic {
  _id: string;
  name: string;
  city?: string;
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

export default function AdminMedicineOrderRequestsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClinicId, setSelectedClinicId] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Cancellation Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Detail Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Status Change State
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrdersAndClinics = async () => {
    setLoading(true);
    try {
      const [resOrders, resClinics] = await Promise.all([
        fetch("/api/pharmacy/orders"),
        fetch("/api/clinics"),
      ]);
      const dataOrders = await resOrders.json();
      const dataClinics = await resClinics.json();

      if (dataOrders.success && dataOrders.data) {
        setOrders(dataOrders.data);
      }
      if (dataClinics.success && dataClinics.data) {
        setClinics(dataClinics.data);
      }
    } catch (err) {
      console.error("Error loading orders or clinics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndClinics();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string, comment?: string) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await fetch(`/api/pharmacy/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          comment: comment || `Status updated to ${newStatus} by Administrator`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchOrdersAndClinics();
      } else {
        alert(data.message || "Failed to update order status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating order status");
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
          cancelledBy: "Clinic Admin",
          cancellationReason: cancellationReason || "Order cancelled by Admin from centralized management desk.",
          comment: cancellationReason || "Order cancelled by administrator.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCancelModalOpen(false);
        setCancellingOrder(null);
        fetchOrdersAndClinics();
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

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const patientName = order.shippingDetails?.fullName || order.patientId?.name || "";
    const patientPhone = order.shippingDetails?.phone || order.patientId?.phone || "";
    const orderNum = order.orderNumber || order._id;
    const clinicName = order.clinicId?.name || "";

    const matchesSearch =
      patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patientPhone.includes(searchQuery) ||
      orderNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clinicName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClinic =
      selectedClinicId === "All" ||
      order.clinicId?._id === selectedClinicId ||
      (typeof order.clinicId === "string" && order.clinicId === selectedClinicId);

    const normStatus = order.status.toUpperCase();
    let matchesStatus = true;
    if (statusFilter === "Pending") {
      matchesStatus = normStatus === "REQUEST_RECEIVED" || normStatus === "PLACED" || normStatus === "PRESCRIPTION_VERIFICATION";
    } else if (statusFilter === "Verified") {
      matchesStatus = normStatus === "CALL_COMPLETED" || normStatus === "PRESCRIPTION_APPROVED";
    } else if (statusFilter === "Fulfilled") {
      matchesStatus = normStatus === "FULFILLED" || normStatus === "DELIVERED";
    } else if (statusFilter === "Cancelled") {
      matchesStatus = normStatus === "CANCELLED";
    }

    return matchesSearch && matchesClinic && matchesStatus;
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
          <PhoneCall className="w-3 h-3" /> Call Verified
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
          <h1 className="text-3xl font-bold tracking-tight">Medicine Order Requests</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Centralized management of doctor prescription medicine requests routed across all clinic pharmacies.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchOrdersAndClinics} 
          disabled={loading}
          className="rounded-xl gap-2 font-semibold h-10 shrink-0"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Requests
        </Button>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search */}
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search here..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl"
          />
        </div>

        {/* Clinic & Status Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Clinic Selector */}
          <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-3 h-10">
            <Building2 className="w-4 h-4 text-primary shrink-0" />
            <select
              value={selectedClinicId}
              onChange={(e) => setSelectedClinicId(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All">All Clinic Pharmacies</option>
              {clinics.map((clinic) => (
                <option key={clinic._id} value={clinic._id}>
                  {clinic.name} {clinic.city ? `(${clinic.city})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {["All", "Pending", "Verified", "Fulfilled", "Cancelled"].map((tab) => (
              <Button
                key={tab}
                variant={statusFilter === tab ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(tab)}
                className="rounded-xl text-xs font-semibold h-10 shrink-0"
              >
                {tab}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests Card Grid */}
      {loading ? (
        <div className="py-20 text-center text-muted-foreground font-medium text-sm">
          Loading centralized order requests across all clinics...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border rounded-3xl space-y-3">
          <Pill className="w-12 h-12 text-muted-foreground/50 mx-auto" />
          <p className="font-bold text-base text-foreground">No Medicine Order Requests Found</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            There are no requests matching the selected clinic or search criteria.
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
                {/* Header */}
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

                  {/* Assigned Clinic Badge */}
                  <div className="p-2 bg-primary/5 border border-primary/15 rounded-xl flex items-center justify-between text-xs">
                    <span className="text-muted-foreground text-[11px]">Assigned Clinic:</span>
                    <span className="font-bold text-primary flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {clinic?.name || "Unassigned"}
                    </span>
                  </div>

                  {/* Patient Contact Details */}
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
                      <p className="text-[11px] text-muted-foreground italic">No contact phone</p>
                    )}

                    {doctor && (
                      <div className="pt-1 text-[11px] text-muted-foreground border-t border-border/40">
                        Doctor: <strong className="text-foreground">Dr. {doctor.name}</strong>
                      </div>
                    )}
                  </div>

                  {/* Ordered Medicines */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <p className="font-bold text-foreground flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-primary" /> Ordered Medicines ({order.items?.length || 0})
                      </p>
                      <button
                        onClick={() => { setSelectedOrder(order); setDetailModalOpen(true); }}
                        className="text-[11px] text-primary hover:underline font-semibold"
                      >
                        View Full Details
                      </button>
                    </div>

                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
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
                        <AlertTriangle className="w-3.5 h-3.5" /> Request Cancelled
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

                {/* Actions & Centralized Cancellation */}
                <div className="pt-3 border-t border-border/50 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setSelectedOrder(order); setDetailModalOpen(true); }}
                    className="flex-1 rounded-xl text-xs font-semibold h-9 gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Review Details
                  </Button>

                  {!isCancelled && !isFulfilled && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => openCancelModal(order)}
                      className="rounded-xl text-xs font-bold h-9 px-4"
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
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
              Are you sure you want to cancel this medicine order request as Administrator? The cancellation will immediately sync with the patient portal and assigned clinic pharmacy.
            </DialogDescription>
          </DialogHeader>

          {cancellingOrder && (
            <div className="p-3 bg-muted/40 rounded-2xl text-xs space-y-1">
              <p>Reference: <strong className="font-mono text-primary">{cancellingOrder.orderNumber || cancellingOrder._id}</strong></p>
              <p>Assigned Clinic: <strong>{cancellingOrder.clinicId?.name || "Clinic"}</strong></p>
              <p>Patient: <strong>{cancellingOrder.shippingDetails?.fullName || cancellingOrder.patientId?.name}</strong></p>
            </div>
          )}

          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-foreground">Cancellation Reason:</label>
            <textarea
              placeholder="e.g. Cancelled per patient request / Duplicate order / Clinical review needed"
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

      {/* ORDER DETAILS POPUP */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-8 space-y-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-serif">
              Order Request Details
            </DialogTitle>
            <DialogDescription className="text-xs">
              Complete metadata, medicine items, and consultation details.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-2xl">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Reference</span>
                  <span className="font-mono font-bold text-primary">{selectedOrder.orderNumber || selectedOrder._id}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Current Status</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Assigned Clinic</span>
                  <span className="font-bold text-foreground">{selectedOrder.clinicId?.name || "Unassigned"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Requested Date</span>
                  <span className="font-medium text-foreground">{new Date(selectedOrder.createdAt).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Medicines */}
              <div className="space-y-2">
                <p className="font-bold text-sm text-foreground">Ordered Medicines</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-background border border-border rounded-xl flex justify-between items-center">
                      <div>
                        <p className="font-bold text-foreground">{item.name || "Medication"}</p>
                        {item.dosage && <p className="text-[10px] text-muted-foreground">{item.dosage}</p>}
                      </div>
                      <span className="font-bold text-primary text-xs">Qty: {item.quantity || 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Patient */}
              <div className="p-3 bg-muted/30 rounded-2xl space-y-1">
                <p className="font-bold text-foreground text-xs">Patient Contact</p>
                <p className="text-muted-foreground">Name: <strong className="text-foreground">{selectedOrder.shippingDetails?.fullName || selectedOrder.patientId?.name}</strong></p>
                <p className="text-muted-foreground">Phone: <strong className="text-foreground">{selectedOrder.shippingDetails?.phone || selectedOrder.patientId?.phone || "N/A"}</strong></p>
                {selectedOrder.patientId?.email && (
                  <p className="text-muted-foreground">Email: <strong className="text-foreground">{selectedOrder.patientId.email}</strong></p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setDetailModalOpen(false)} className="rounded-xl">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
