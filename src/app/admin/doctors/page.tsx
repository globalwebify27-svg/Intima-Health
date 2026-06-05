"use client";

import { mockDoctors, Doctor } from "@/lib/mock-data";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

const columns: ColumnDef<Doctor>[] = [
  {
    accessorKey: "name",
    header: "Doctor Name",
    cell: ({ row }) => <span className="font-bold">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "specialty",
    header: "Specialty",
  },
  {
    accessorKey: "patientsSeen",
    header: "Patients Seen",
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.getValue("rating") as number;
      return <span className="font-medium text-amber-500">★ {rating > 0 ? rating.toFixed(1) : "N/A"}</span>;
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = status === "Active" ? "default" : status === "Pending" ? "secondary" : "destructive";
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

export default function DoctorsAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctors Management</h1>
          <p className="text-muted-foreground mt-2">
            View and manage doctor profiles across the platform.
          </p>
        </div>
        <Button className="rounded-xl">Add Doctor</Button>
      </div>
      <DataTable columns={columns} data={mockDoctors} />
    </div>
  );
}
