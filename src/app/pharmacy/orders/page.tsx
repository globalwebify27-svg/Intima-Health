"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Search, ShieldCheck, FileText, 
  Truck, CheckCircle2, XCircle, ExternalLink, RefreshCcw, 
  MapPin, Eye, Send
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface OrderItem {
  productId?: {
    name: string;
    price: number;
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

interface Order {
  _id: string;
  orderNumber?: string;
  patientId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: string;
  shippingAddress: string;
  shippingDetails?: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    pinCode: string;
    landmark?: string;
  };
  prescriptionSource?: string;
  uploadedPrescriptionUrl?: string;
  consultationId?: {
    _id: string;
    prescriptionSummary?: string;
  } | null;
  prescriptionVerification?: {
    status: string;
    notes?: string;
    rejectionReason?: string;
    verifiedBy?: string;
  };
  delivery?: {
    courierPartner?: string;
    trackingNumber?: string;
    dispatchedAt?: string;
    deliveredAt?: string;
  };
  paymentStatus?: string;
  createdAt: string;
}

export default function PharmacyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Order Details / Verification Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [verifyNotes, setVerifyNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierPartner, setCourierPartner] = useState("Akola Local Express Delivery");
  const [substituteItemIdx, setSubstituteItemIdx] = useState<number | null>(null);
  const [substituteName, setSubstituteName] = useState("");

  const fetchOrders = () => {
    setLoading(true);
    fetch(`/api/pharmacy/orders`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setOrders(resData.data);
        }
      })
      .catch((err) => console.error("Error loading pharmacy orders:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let ignore = false;
    fetch(`/api/pharmacy/orders`)
      .then((res) => res.json())
      .then((resData) => {
        if (!ignore && resData.success && resData.data) {
          setOrders(resData.data);
        }
      })
      .catch((err) => console.error("Error loading pharmacy orders:", err))
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setVerifyNotes(order.prescriptionVerification?.notes || "");
    setRejectionReason(order.prescriptionVerification?.rejectionReason || "");
    setTrackingNumber(order.delivery?.trackingNumber || "");
    setCourierPartner(order.delivery?.courierPartner || "Akola Local Express Delivery");
    setModalOpen(true);
  };

  // 1. Verify Prescription
  const handleVerifyPrescription = async (approved: boolean) => {
    if (!selectedOrder) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/pharmacy/orders/${selectedOrder._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prescriptionVerification: {
            status: approved ? "Verified" : "Rejected",
            notes: verifyNotes || (approved ? "Prescription verified by pharmacist." : "Prescription verification failed."),
            rejectionReason: !approved ? (rejectionReason || "Invalid or expired prescription.") : undefined,
          },
          status: approved ? "Pharmacy_Processing" : "Prescription_Rejected",
        }),
      });

      const json = await res.json();
      if (json.success) {
        fetchOrders();
        setModalOpen(false);
      } else {
        alert(json.message || "Failed to update prescription status.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating prescription status.");
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Dispatch Order
  const handleDispatchOrder = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/pharmacy/orders/${selectedOrder._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Packed_Dispatched",
          delivery: {
            courierPartner,
            trackingNumber: trackingNumber || `AKL-EXP-${Math.floor(10000 + Math.random() * 90000)}`,
            dispatchedAt: new Date(),
          },
          comment: `Medicines packed in tamper-evident packaging and dispatched via ${courierPartner}.`,
        }),
      });

      const json = await res.json();
      if (json.success) {
        fetchOrders();
        setModalOpen(false);
      } else {
        alert(json.message || "Failed to update dispatch status.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating dispatch status.");
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Mark Delivered
  const handleMarkDelivered = async () => {
    if (!selectedOrder) return;
    setActionLoading(true);

    try {
      const res = await fetch(`/api/pharmacy/orders/${selectedOrder._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Delivered",
          comment: "Package delivered to customer in Akola.",
        }),
      });

      const json = await res.json();
      if (json.success) {
        fetchOrders();
        setModalOpen(false);
      } else {
        alert(json.message || "Failed to mark order as delivered.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating order.");
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Handle Unavailable Item & Propose Substitute
  const handleSaveSubstitute = async () => {
    if (!selectedOrder || substituteItemIdx === null || !substituteName.trim()) return;

    const updatedItems = [...selectedOrder.items];
    updatedItems[substituteItemIdx] = {
      ...updatedItems[substituteItemIdx],
      status: "Substituted",
      substitutedWithName: substituteName.trim(),
    };

    setActionLoading(true);
    try {
      const res = await fetch(`/api/pharmacy/orders/${selectedOrder._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updatedItems,
          comment: `Pharmacist proposed alternative: ${substituteName.trim()} for ${updatedItems[substituteItemIdx].name}`,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setSelectedOrder(json.data);
        fetchOrders();
        setSubstituteItemIdx(null);
        setSubstituteName("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order Reference",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="space-y-0.5">
            <span className="font-mono font-bold text-xs text-primary">
              {order.orderNumber || `#${order._id.substring(18)}`}
            </span>
            <div className="text-[10px] text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        );
      },
    },
    {
      id: "patientName",
      header: "Patient / Address",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="space-y-0.5 text-xs">
            <p className="font-bold text-foreground">{order.shippingDetails?.fullName || order.patientId?.name || "Patient"}</p>
            <p className="text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary" />
              PIN: {order.shippingDetails?.pinCode || "Akola"}
            </p>
          </div>
        );
      },
    },
    {
      id: "prescriptionStatus",
      header: "Prescription",
      cell: ({ row }) => {
        const order = row.original;
        const source = order.prescriptionSource;
        const verStatus = order.prescriptionVerification?.status || "Pending";

        if (source === "OTC_NO_RX") {
          return <Badge variant="outline" className="text-[10px] bg-muted/40">OTC (No Rx)</Badge>;
        }

        if (verStatus === "Verified") {
          return <Badge className="bg-emerald-600 text-white text-[10px]">Rx Verified</Badge>;
        }
        if (verStatus === "Rejected") {
          return <Badge variant="destructive" className="text-[10px]">Rx Rejected</Badge>;
        }
        return <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-700 border-amber-500/20">Pending Rx Check</Badge>;
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.getValue("totalAmount") as number;
        const isPaid = row.original.paymentStatus === "Paid";
        return (
          <div className="text-xs">
            <span className="font-bold text-foreground">₹{amount.toLocaleString()}</span>
            <div className="text-[10px]">
              {isPaid ? <span className="text-emerald-600 font-semibold">● Paid</span> : <span className="text-amber-600 font-semibold">● Pending</span>}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Order Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let variant: "default" | "secondary" | "destructive" | "outline" = "default";
        if (status === "Delivered") variant = "secondary";
        if (status === "Cancelled" || status === "Prescription_Rejected") variant = "destructive";
        if (status.includes("Pending") || status.includes("Verification")) variant = "outline";

        return (
          <Badge variant={variant} className="text-xs font-semibold">
            {status.replace(/_/g, " ")}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "Fulfillment",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => openOrderModal(order)}
            className="rounded-xl text-xs gap-1.5 h-8 font-semibold hover:bg-primary hover:text-white transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Review & Fulfill
          </Button>
        );
      },
    },
  ];

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      (order.patientId?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.orderNumber || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      order._id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pharmacy Orders & Dispensing</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Verify prescriptions, dispense authentic medications, and coordinate local delivery in Akola, Maharashtra.
          </p>
        </div>
        <Button onClick={fetchOrders} variant="outline" size="sm" className="rounded-xl gap-2 h-9 self-start">
          <RefreshCcw className="w-3.5 h-3.5" /> Refresh Orders
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="w-full sm:max-w-xs relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input 
            placeholder="Search by order ID, customer name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl border-border bg-muted/20 pl-9 pr-4 focus:ring-primary/20 text-xs sm:text-sm"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {["All", "Prescription_Verification", "Pharmacy_Processing", "Packed_Dispatched", "Delivered", "Cancelled"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              className="rounded-xl text-xs py-1.5 h-8 shrink-0 font-medium"
            >
              {status.replace(/_/g, " ")}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-muted-foreground font-medium">Loading pharmacy orders...</div>
      ) : (
        <DataTable columns={columns} data={filteredOrders} />
      )}

      {/* REVIEW & FULFILL DIALOG */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8">
          {selectedOrder && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl font-bold font-serif">
                    Order {selectedOrder.orderNumber || `#${selectedOrder._id.slice(-6)}`}
                  </DialogTitle>
                  <Badge variant="secondary" className="font-bold">
                    {selectedOrder.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <DialogDescription className="text-xs">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-IN")} • Recipient: {selectedOrder.shippingDetails?.fullName || selectedOrder.patientId?.name}
                </DialogDescription>
              </DialogHeader>

              {/* 1. PRESCRIPTION VERIFICATION PANEL */}
              {selectedOrder.prescriptionSource !== "OTC_NO_RX" && (
                <div className="p-4 bg-muted/40 rounded-2xl border border-border/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      Doctor&apos;s Prescription Verification
                    </span>
                    <Badge variant={selectedOrder.prescriptionVerification?.status === "Verified" ? "default" : "outline"}>
                      {selectedOrder.prescriptionVerification?.status || "Pending Verification"}
                    </Badge>
                  </div>

                  {/* Prescription Document Preview Link */}
                  {selectedOrder.uploadedPrescriptionUrl ? (
                    <div className="p-3 bg-background rounded-xl border border-border flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" /> Uploaded Prescription Document
                      </span>
                      <a 
                        href={selectedOrder.uploadedPrescriptionUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary font-bold underline flex items-center gap-1"
                      >
                        View / Open Rx Document <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : selectedOrder.consultationId ? (
                    <div className="p-3 bg-background rounded-xl border border-border flex items-center justify-between text-xs">
                      <span className="font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" /> Digital Prescription Issued by Doctor
                      </span>
                      <span className="font-semibold text-emerald-600">Linked to Consultation</span>
                    </div>
                  ) : null}

                  {/* Pharmacist Actions: Approve or Reject */}
                  {selectedOrder.status === "Prescription_Verification" && (
                    <div className="space-y-3 pt-2 border-t border-border/60">
                      <div className="space-y-1">
                        <Label className="text-xs">Pharmacist Clinical Verification Notes</Label>
                        <Input
                          placeholder="e.g. Verified dosage and registered medical practitioner stamp."
                          value={verifyNotes}
                          onChange={(e) => setVerifyNotes(e.target.value)}
                          className="h-9 text-xs rounded-xl"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleVerifyPrescription(true)} 
                          disabled={actionLoading}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 flex-1"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve Prescription
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => handleVerifyPrescription(false)} 
                          disabled={actionLoading}
                          className="rounded-xl gap-1.5 flex-1"
                        >
                          <XCircle className="w-4 h-4" /> Reject Prescription
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. ORDERED MEDICATIONS & SUBSTITUTION */}
              <div className="space-y-3">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Medications in this Order</Label>
                <div className="divide-y divide-border/60 border border-border rounded-2xl overflow-hidden bg-background">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <p className="font-bold text-foreground">
                          {item.name || item.productId?.name} (x{item.quantity})
                        </p>
                        <p className="text-muted-foreground">
                          {item.productId?.composition || item.dosage || "Standard Dose"} • ₹{item.priceAtPurchase} each
                        </p>
                        {item.status === "Substituted" && (
                          <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[10px]">
                            Alternative Proposed: {item.substitutedWithName}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedOrder.status === "Pharmacy_Processing" && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => { setSubstituteItemIdx(idx); setSubstituteName(""); }}
                            className="text-[11px] h-7 px-2 font-semibold text-primary"
                          >
                            Suggest Alt
                          </Button>
                        )}
                        <span className="font-bold text-sm">₹{(item.priceAtPurchase * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Inline Substitute Input */}
                {substituteItemIdx !== null && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs">
                    <Label className="font-bold text-blue-900">
                      Propose Permissible Alternative for {selectedOrder.items[substituteItemIdx].name}:
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. Paracetamol 500mg IP (Cipla / Generic)"
                        value={substituteName}
                        onChange={(e) => setSubstituteName(e.target.value)}
                        className="h-8 text-xs bg-white rounded-lg"
                      />
                      <Button size="sm" onClick={handleSaveSubstitute} className="h-8 rounded-lg px-3 text-xs">
                        Save Alt
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setSubstituteItemIdx(null)} className="h-8 rounded-lg px-2 text-xs">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. DELIVERY DETAILS */}
              <div className="p-4 bg-muted/30 rounded-2xl border border-border/80 space-y-2 text-xs">
                <span className="font-bold text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> Delivery Destination (Akola, Maharashtra)
                </span>
                <p className="text-foreground font-medium">
                  {selectedOrder.shippingDetails?.fullName || selectedOrder.patientId?.name} • Phone: {selectedOrder.shippingDetails?.phone || selectedOrder.patientId?.phone}
                </p>
                <p className="text-muted-foreground">
                  {selectedOrder.shippingAddress}
                </p>
              </div>

              {/* 4. DISPATCH CONTROLS */}
              {selectedOrder.status === "Pharmacy_Processing" && (
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20 space-y-3">
                  <span className="font-bold text-sm flex items-center gap-2 text-foreground">
                    <Truck className="w-4 h-4 text-primary" /> Dispatch & Local Delivery
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <Label className="text-[11px]">Courier / Runner Partner</Label>
                      <Input
                        value={courierPartner}
                        onChange={(e) => setCourierPartner(e.target.value)}
                        className="h-9 text-xs rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[11px]">Tracking Reference Number</Label>
                      <Input
                        placeholder="e.g. AKL-DEL-4012"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="h-9 text-xs rounded-xl"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleDispatchOrder} 
                    disabled={actionLoading}
                    className="w-full rounded-xl gap-2 font-bold h-10 shadow-sm"
                  >
                    <Send className="w-4 h-4" /> Mark as Packed & Dispatched
                  </Button>
                </div>
              )}

              {selectedOrder.status === "Packed_Dispatched" && (
                <div className="p-4 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-200 flex items-center justify-between">
                  <div className="space-y-0.5 text-xs">
                    <p className="font-bold">Package Out for Delivery in Akola</p>
                    <p className="text-muted-foreground text-[11px]">Tracking: {selectedOrder.delivery?.trackingNumber}</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={handleMarkDelivered} 
                    disabled={actionLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-1.5 font-bold"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Confirm Delivered
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
