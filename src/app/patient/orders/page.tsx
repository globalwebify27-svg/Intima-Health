"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Eye, Package, MapPin } from "lucide-react";

interface Order {
  _id: string;
  orderNumber?: string;
  totalAmount: number;
  status: string;
  shippingDetails?: {
    pinCode: string;
    city: string;
  };
  paymentStatus?: string;
  items?: Array<{ name?: string; quantity: number }>;
  createdAt: string;
}

const columns: ColumnDef<Order>[] = [
  {
    id: "id",
    header: "Order Reference",
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
    accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount") as number;
      const isPaid = row.original.paymentStatus === "Paid";
      return (
        <div className="text-xs">
          <span className="font-bold">₹{amount.toLocaleString()}</span>
          <div className="text-[10px] text-muted-foreground">
            {isPaid ? <span className="text-emerald-600 font-medium">Paid</span> : <span className="text-amber-600 font-medium">Pending</span>}
          </div>
        </div>
      );
    }
  },
  {
    id: "location",
    header: "Delivery City",
    cell: ({ row }) => {
      const order = row.original;
      return (
        <span className="text-xs flex items-center gap-1 text-muted-foreground">
          <MapPin className="w-3 h-3 text-primary" />
          Akola {order.shippingDetails?.pinCode ? `(${order.shippingDetails.pinCode})` : ""}
        </span>
      );
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      let variant: "default" | "secondary" | "destructive" | "outline" = "default";
      if (status === "Delivered") variant = "secondary";
      if (status === "Cancelled" || status.includes("Rejected")) variant = "destructive";
      if (status.includes("Pending") || status.includes("Verification")) variant = "outline";
      
      return (
        <Badge variant={variant} className="text-[11px] font-semibold">
          {status.replace(/_/g, " ")}
        </Badge>
      );
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
            Track Details
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
        Loading pharmacy delivery orders...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Medicine Orders</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Track your prescription medicines, delivery status, and purchase history.
          </p>
        </div>
        <Link href="/products">
          <Button className="rounded-full shadow-sm gap-2">
            <ShoppingBag className="w-4 h-4" /> Order Medicines
          </Button>
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-background rounded-3xl p-12 border border-border text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold">No Medicine Orders Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
              Once you order prescribed medicines or OTC healthcare products, you can track their status and delivery here.
            </p>
          </div>
          <Link href="/products">
            <Button size="sm" className="rounded-full px-6">Explore Pharmacy</Button>
          </Link>
        </div>
      ) : (
        <DataTable columns={columns} data={orders} />
      )}
    </div>
  );
}
