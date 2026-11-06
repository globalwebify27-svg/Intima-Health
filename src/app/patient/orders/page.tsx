"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Package, Building2, Pill, PhoneCall, Clock, CheckCircle2, XCircle } from "lucide-react";

interface Order {
  _id: string;
  orderNumber?: string;
  totalAmount: number;
  status: string;
  cancellationReason?: string;
  cancelledBy?: string;
  clinicId?: {
    _id: string;
    name?: string;
    city?: string;
  } | string;
  items?: Array<{ name?: string; quantity: number; dosage?: string }>;
  createdAt: string;
}

const formatStatusBadge = (status: string, cancellationReason?: string) => {
  const normalized = status.toUpperCase();
  if (normalized === "REQUEST_RECEIVED" || normalized === "PLACED" || normalized === "PRESCRIPTION_VERIFICATION") {
    return (
      <Badge className="bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 text-[11px] font-semibold gap-1">
        <Clock className="w-3 h-3" /> Request Sent (Awaiting Call)
      </Badge>
    );
  }
  if (normalized === "CALL_COMPLETED" || normalized === "PRESCRIPTION_APPROVED") {
    return (
      <Badge className="bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 text-[11px] font-semibold gap-1">
        <PhoneCall className="w-3 h-3" /> Call Verified
      </Badge>
    );
  }
  if (normalized === "FULFILLED" || normalized === "DELIVERED") {
    return (
      <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 text-[11px] font-semibold gap-1">
        <CheckCircle2 className="w-3 h-3" /> Fulfilled / Dispensed
      </Badge>
    );
  }
  if (normalized === "CANCELLED") {
    return (
      <div className="space-y-0.5">
        <Badge variant="destructive" className="text-[11px] font-semibold gap-1">
          <XCircle className="w-3 h-3" /> Cancelled
        </Badge>
        {cancellationReason && (
          <p className="text-[10px] text-destructive max-w-[180px] truncate" title={cancellationReason}>
            Reason: {cancellationReason}
          </p>
        )}
      </div>
    );
  }

  return (
    <Badge variant="outline" className="text-[11px] font-semibold">
      {status.replace(/_/g, " ")}
    </Badge>
  );
};

const columns: ColumnDef<Order>[] = [
  {
    id: "id",
    header: "Request Reference",
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
    id: "clinic",
    header: "Assigned Clinic",
    cell: ({ row }) => {
      const order = row.original;
      const clinicName = typeof order.clinicId === "object" ? order.clinicId?.name : "Kelkar Manas Clinic";
      return (
        <span className="text-xs flex items-center gap-1.5 font-medium text-foreground">
          <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
          {clinicName || "Clinic Pharmacy"}
        </span>
      );
    }
  },
  {
    id: "medicines",
    header: "Prescribed Medicines",
    cell: ({ row }) => {
      const items = row.original.items || [];
      if (items.length === 0) return <span className="text-xs text-muted-foreground">Prescription Items</span>;
      return (
        <div className="text-xs">
          <span className="font-semibold text-foreground">
            {items[0].name}
          </span>
          {items.length > 1 && (
            <span className="text-[10px] text-muted-foreground ml-1.5 font-normal">
              +{items.length - 1} more
            </span>
          )}
        </div>
      );
    }
  },
  {
    accessorKey: "status",
    header: "Order Status",
    cell: ({ row }) => {
      return formatStatusBadge(row.original.status, row.original.cancellationReason);
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <Link href={`/patient/orders/${order._id}`}>
          <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1.5 h-8 font-semibold">
            <Eye className="w-3.5 h-3.5" />
            View Request
          </Button>
        </Link>
      );
    },
  },
];

export default function PatientOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meJson = await meRes.json();
        if (meJson.success && meJson.user && meJson.user.patientId) {
          const res = await fetch(`/api/pharmacy/orders?patientId=${meJson.user.patientId}`);
          const json = await res.json();
          if (json.success) {
            setOrders(json.data || []);
          }
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground font-medium">
        Loading medicine order requests...
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full min-w-0 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Medicine Order Requests</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            View your prescription medicine requests submitted to the clinic pharmacy.
          </p>
        </div>
        <Link href="/patient/prescriptions">
          <Button className="rounded-full shadow-sm gap-2">
            <Pill className="w-4 h-4" /> Order from Prescriptions
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-background rounded-3xl p-12 border border-border text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold">No Medicine Order Requests Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
              Submit an order request directly from your doctor prescription to have the clinic pharmacy contact and assist you.
            </p>
          </div>
          <Link href="/patient/prescriptions">
            <Button size="sm" className="rounded-full px-6">View My Prescriptions</Button>
          </Link>
        </div>
      ) : (
        <DataTable columns={columns} data={orders} />
      )}
    </div>
  );
}
