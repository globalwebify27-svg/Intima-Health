"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Video, MapPin } from "lucide-react";
import { formatTime12Hour } from "@/lib/utils";

const columns: ColumnDef<any>[] = [
  {
    id: "patientName",
    header: "Patient",
    accessorFn: (row) => row.patientId?.name || "N/A",
    cell: ({ row }) => <span className="font-bold">{row.getValue("patientName")}</span>,
  },
  {
    id: "doctorName",
    header: "Doctor",
    accessorFn: (row) => row.doctorId?.name || "N/A",
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ row }) => <span>{formatTime12Hour(row.getValue("time") as string)}</span>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const serviceName = row.original?.serviceName;
      const display = serviceName || type;
      return (
        <div className="flex items-center gap-2">
          <span>{display}</span>
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
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const aptsRes = await fetch("/api/appointments");
        const aptsJson = await aptsRes.json();
        if (aptsJson.success) {
          setAppointments(aptsJson.data || []);
        }
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

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
      
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground">
          Loading appointments...
        </div>
      ) : (
        <DataTable columns={columns} data={appointments} />
      )}
    </div>
  );
}
