"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, ShieldCheck, MapPin, Eye, RefreshCcw, 
  ExternalLink 
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface Order {
  _id: string;
  orderNumber?: string;
  patientId: {
    name: string;
    email: string;
    phone: string;
  };
  totalAmount: number;
  status: string;
  shippingAddress: string;
  shippingDetails?: {
    fullName: string;
    phone: string;
    pinCode: string;
    city: string;
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
  items: Array<{
    name?: string;
    quantity: number;
    priceAtPurchase: number;
    isPrescription?: boolean;
  }>;
  createdAt: string;
}

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchOrders = () => {
    setLoading(true);
    fetch("/api/pharmacy/orders")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setOrders(data.data);
        }
      })
      .catch((err) => console.error("Error loading orders:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let ignore = false;
    fetch("/api/pharmacy/orders")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.success && data.data) {
          setOrders(data.data);
        }
      })
      .catch((err) => console.error("Error loading orders:", err))
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "orderNumber",
      header: "Order Ref",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <div className="space-y-0.5">
            <span className="font-mono font-bold text-xs text-primary">
              {order.orderNumber || `#${order._id.substring(18)}`}
            </span>
            <div className="text-[10px] text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
            </div>
          </div>
        );
      },
    },
    {
      id: "patientName",
      header: "Customer",
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
      accessorKey: "totalAmount",
      header: "Amount",
      cell: ({ row }) => {
        const amount = row.getValue("totalAmount") as number;
        const isPaid = row.original.paymentStatus === "Paid";
        return (
          <div className="text-xs">
            <span className="font-bold">₹{amount.toLocaleString()}</span>
            <div className="text-[10px]">
              {isPaid ? <span className="text-emerald-600 font-semibold">● Paid</span> : <span className="text-amber-600 font-semibold">● Pending</span>}
            </div>
          </div>
        );
      },
    },
    {
      id: "itemsCount",
      header: "Medications",
      cell: ({ row }) => {
        const items = row.original.items || [];
        return (
          <span className="text-xs text-muted-foreground">
            {items.length} item{items.length === 1 ? "" : "s"}
          </span>
        );
      },
    },
    {
      id: "rxStatus",
      header: "Prescription",
      cell: ({ row }) => {
        const order = row.original;
        if (order.prescriptionSource === "OTC_NO_RX") {
          return <Badge variant="outline" className="text-[10px]">OTC</Badge>;
        }
        const st = order.prescriptionVerification?.status || "Pending";
        if (st === "Verified") return <Badge className="bg-emerald-600 text-white text-[10px]">Rx Verified</Badge>;
        if (st === "Rejected") return <Badge variant="destructive" className="text-[10px]">Rx Rejected</Badge>;
        return <Badge variant="secondary" className="text-[10px]">Pending Check</Badge>;
      },
    },
    {
      accessorKey: "status",
      header: "Order Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        let variant: "default" | "secondary" | "destructive" | "outline" = "default";
        if (status === "Delivered") variant = "secondary";
        if (status === "Cancelled" || status.includes("Rejected")) variant = "destructive";
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
      header: "Actions",
      cell: ({ row }) => {
        const order = row.original;
        return (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => { setSelectedOrder(order); setDetailModalOpen(true); }}
            className="rounded-xl text-xs gap-1 h-8 font-semibold"
          >
            <Eye className="w-3.5 h-3.5" /> Details
          </Button>
        );
      },
    },
  ];

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
          <h1 className="text-3xl font-bold tracking-tight">Medicine Delivery Orders</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Centralized administration of all prescription orders, verification records, and delivery fulfillment in Akola.
          </p>
        </div>
        <Button onClick={fetchOrders} variant="outline" size="sm" className="rounded-xl gap-2 h-9 self-start">
          <RefreshCcw className="w-3.5 h-3.5" /> Refresh Orders
        </Button>
      </div>

      {/* Control bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border shadow-sm">
        <div className="w-full sm:max-w-xs relative">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input 
            placeholder="Search by ID, customer name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-xl border-border bg-muted/20 pl-9 pr-4 text-xs sm:text-sm"
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
        <div className="p-12 text-center text-muted-foreground font-medium">Loading orders directory...</div>
      ) : (
        <DataTable columns={columns} data={filteredOrders} />
      )}

      {/* Order Details Dialog */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-8">
          {selectedOrder && (
            <div className="space-y-5 text-xs">
              <DialogHeader>
                <div className="flex justify-between items-center">
                  <DialogTitle className="text-xl font-bold font-serif">
                    {selectedOrder.orderNumber || `#${selectedOrder._id.slice(-6)}`}
                  </DialogTitle>
                  <Badge variant="secondary">
                    {selectedOrder.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <DialogDescription className="text-xs">
                  Customer: {selectedOrder.shippingDetails?.fullName || selectedOrder.patientId?.name} • Phone: {selectedOrder.shippingDetails?.phone || selectedOrder.patientId?.phone}
                </DialogDescription>
              </DialogHeader>

              {/* Prescription Info */}
              <div className="p-3.5 bg-muted/40 rounded-2xl border border-border space-y-2">
                <span className="font-bold flex items-center gap-1.5 text-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" /> Prescription Status: {selectedOrder.prescriptionVerification?.status || "Pending"}
                </span>
                {selectedOrder.uploadedPrescriptionUrl && (
                  <a 
                    href={selectedOrder.uploadedPrescriptionUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary font-bold underline flex items-center gap-1"
                  >
                    View Uploaded Rx Document <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {selectedOrder.prescriptionVerification?.notes && (
                  <p className="text-muted-foreground">Notes: {selectedOrder.prescriptionVerification.notes}</p>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="font-bold uppercase text-[10px] text-muted-foreground">Ordered Items</span>
                <div className="divide-y divide-border/60 border border-border rounded-xl bg-background overflow-hidden">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center">
                      <span>{item.name} (x{item.quantity})</span>
                      <span className="font-bold">₹{(item.priceAtPurchase * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="p-3 bg-muted/20 rounded-xl border border-border space-y-1">
                <span className="font-bold text-[10px] uppercase text-muted-foreground">Destination Address</span>
                <p className="text-foreground">{selectedOrder.shippingAddress}</p>
              </div>

              <div className="flex justify-between items-center pt-2 font-bold text-sm">
                <span>Total Amount:</span>
                <span className="text-primary text-base">₹{selectedOrder.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
