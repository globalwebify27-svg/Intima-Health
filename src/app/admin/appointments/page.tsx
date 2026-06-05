"use client";

import { mockAppointments, Appointment } from "@/lib/mock-data";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Video, MapPin } from "lucide-react";

const columns: ColumnDef<Appointment>[] = [
  {
    accessorKey: "patientName",
    header: "Patient",
    cell: ({ row }) => <span className="font-bold">{row.getValue("patientName")}</span>,
  },
  {
    accessorKey: "doctorName",
    header: "Doctor",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <div className="flex items-center gap-2">
          {type === "Video" ? <Video className="h-4 w-4 text-blue-500" /> : <MapPin className="h-4 w-4 text-green-500" />}
          <span>{type}</span>
        </div>
      );
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      let variant = "default";
      if (status === "Completed") variant = "secondary";
      if (status === "Cancelled") variant = "destructive";
      
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

export default function AppointmentsAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments Log</h1>
          <p className="text-muted-foreground mt-2">
            Monitor global appointments and consultation history.
          </p>
        </div>
      </div>
      <DataTable columns={columns} data={mockAppointments} />
    </div>
  );
}
