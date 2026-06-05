"use client";

import { mockAppointments, Appointment } from "@/lib/mock-data";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, MapPin, ExternalLink } from "lucide-react";

const columns: ColumnDef<Appointment>[] = [
  {
    accessorKey: "patientName",
    header: "Patient",
    cell: ({ row }) => <span className="font-bold">{row.getValue("patientName")}</span>,
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
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const status = row.getValue("status") as string;
      
      if (type === "Video" && status === "Scheduled") {
        return (
          <Button size="sm" className="rounded-lg">
            Start Call <ExternalLink className="w-3 h-3 ml-2" />
          </Button>
        );
      }
      return null;
    },
  },
];

export default function DoctorAppointmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground mt-2">
            Manage your upcoming video consultations and in-person visits.
          </p>
        </div>
        <Button className="rounded-xl">Manage Availability</Button>
      </div>
      <DataTable columns={columns} data={mockAppointments} />
    </div>
  );
}
