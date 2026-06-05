"use client";

import { mockMedicines, Medicine } from "@/lib/mock-data";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus } from "lucide-react";

const columns: ColumnDef<Medicine>[] = [
  {
    accessorKey: "name",
    header: "Medicine Name",
    cell: ({ row }) => <span className="font-bold">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const amount = row.getValue("price") as number;
      return <span>₹{amount.toLocaleString()}</span>;
    }
  },
  {
    accessorKey: "stock",
    header: "Stock Level",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = status === "In Stock" ? "default" : status === "Low Stock" ? "secondary" : "destructive";
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

export default function PharmacyInventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground mt-2">
            Track stock levels and manage medication pricing.
          </p>
        </div>
        <Button className="rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>
      <DataTable columns={columns} data={mockMedicines} />
    </div>
  );
}
