"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Order {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const columns: ColumnDef<Order>[] = [
  {
    id: "id",
    header: "Order ID",
    accessorFn: (row) => row._id ? `#${row._id.substring(18)}` : "N/A",
    cell: ({ row }) => <span className="font-mono text-muted-foreground">{row.getValue("id")}</span>,
  },
  {
    accessorKey: "totalAmount",
    header: "Total",
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount") as number;
      return <span>₹{amount.toLocaleString()}</span>;
    }
  },
  {
    id: "date",
    header: "Date",
    accessorFn: (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A",
    cell: ({ row }) => <span>{row.getValue("date")}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      let variant = "default";
      if (status === "Pending") variant = "secondary";
      if (status === "Delivered") variant = "outline";
      if (status === "Processing") variant = "default";
      
      return <Badge variant={variant as any}>{status}</Badge>;
    },
  },
  {
    id: "actions",
    cell: () => {
      return (
        <Button variant="ghost" size="sm">
          Track Order
        </Button>
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
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading pharmacy orders...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground mt-2">
            Track your pharmacy orders and view purchase history.
          </p>
        </div>
      </div>
      <DataTable columns={columns} data={orders} />
    </div>
  );
}
