"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, MapPin, ExternalLink } from "lucide-react";

interface Appointment {
  _id: string;
  doctorId?: {
    name: string;
    specialization: string;
  };
  date: string;
  time: string;
  type: string;
  status: string;
}

const columns: ColumnDef<Appointment>[] = [
  {
    id: "doctorName",
    header: "Doctor",
    accessorFn: (row) => row.doctorId?.name ? `Dr. ${row.doctorId.name}` : "N/A",
    cell: ({ row }) => <span className="font-bold">{row.getValue("doctorName")}</span>,
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
          <Button 
            size="sm" 
            className="rounded-lg"
            onClick={() => window.location.href = "/patient/consultations"}
          >
            Join Call <ExternalLink className="w-3 h-3 ml-2" />
          </Button>
        );
      }
      return null;
    },
  },
];

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meJson = await meRes.json();
        if (meJson.success && meJson.user && meJson.user.patientId) {
          const res = await fetch(`/api/appointments?patientId=${meJson.user.patientId}`);
          const json = await res.json();
          if (json.success) {
            setAppointments(json.data || []);
          }
        }
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading appointments...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
          <p className="text-muted-foreground mt-2">
            View your scheduled consultations and past visits.
          </p>
        </div>
        <Button className="rounded-xl" onClick={() => window.location.href = "/booking"}>Book New</Button>
      </div>
      <DataTable columns={columns} data={appointments} />
    </div>
  );
}
