"use client";

import { mockPatients, Patient } from "@/lib/mock-data";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileText } from "lucide-react";

const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "name",
    header: "Patient Name",
    cell: ({ row }) => <span className="font-bold">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    id: "actions",
    cell: () => {
      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-lg">
            <FileText className="w-4 h-4 mr-2" /> Records
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export default function DoctorPatientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Patients</h1>
          <p className="text-muted-foreground mt-2">
            View profiles and clinical records of patients assigned to you.
          </p>
        </div>
      </div>
      <DataTable columns={columns} data={mockPatients} />
    </div>
  );
}
