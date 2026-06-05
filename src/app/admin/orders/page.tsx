"use client";

import { mockOrders, Order } from "@/lib/mock-data";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: "Order ID",
    cell: ({ row }) => <span className="font-mono text-muted-foreground">{row.getValue("id")}</span>,
  },
  {
    accessorKey: "patientName",
    header: "Patient",
    cell: ({ row }) => <span className="font-bold">{row.getValue("patientName")}</span>,
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
    accessorKey: "date",
    header: "Date",
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
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      );
    },
  },
];

export default function OrdersAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pharmacy Orders</h1>
          <p className="text-muted-foreground mt-2">
            Global view of all E-commerce and prescription orders.
          </p>
        </div>
      </div>
      <DataTable columns={columns} data={mockOrders} />
    </div>
  );
}
