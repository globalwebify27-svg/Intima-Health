"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, MapPin, ExternalLink, Calendar } from "lucide-react";

const columns: ColumnDef<any>[] = [
  {
    id: "patientName",
    header: "Patient",
    accessorFn: (row) => row.patientId?.name || "N/A",
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
      const status = row.getValue("status") as string;
      const id = row.original._id;
      
      if (status === "Checked In" || status === "Engaged") {
        return (
          <Button 
            size="sm" 
            className="rounded-lg"
            onClick={() => window.location.href = `/doctor/consultations?appointmentId=${id}`}
          >
            {status === "Engaged" ? "Rejoin Session" : "Start Session"} <ExternalLink className="w-3 h-3 ml-2" />
          </Button>
        );
      }
      return null;
    },
  },
];

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"Upcoming" | "Past" | "Cancelled" | "All">("Upcoming");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meJson = await meRes.json();
        if (!meJson.success || meJson.user.role !== "DOCTOR") {
          window.location.href = "/staff-login";
          return;
        }

        const dId = meJson.user.doctorId;
        if (dId) {
          const aptsRes = await fetch(`/api/appointments?doctorId=${dId}`);
          const aptsJson = await aptsRes.json();
          if (aptsJson.success) {
            setAppointments(aptsJson.data || []);
          }
        }
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchAppointments();
    }, 30000);
    const onFocus = () => fetchAppointments();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(interval); window.removeEventListener("focus", onFocus); };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading schedule...
      </div>
    );
  }

  const now = new Date();

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === "All") return true;
    if (activeTab === "Cancelled") return apt.status === "Cancelled";
    
    const aptDateTime = new Date(`${apt.date}T${apt.time}:00`);
    const isPast = aptDateTime < now;

    if (activeTab === "Upcoming") return !isPast && apt.status !== "Cancelled";
    if (activeTab === "Past") return isPast && apt.status !== "Cancelled";
    return true;
  });

  // Sort appointments
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}:00`);
    const dateB = new Date(`${b.date}T${b.time}:00`);
    
    // For Upcoming, sort closest to now first (Ascending)
    if (activeTab === "Upcoming") {
      return dateA.getTime() - dateB.getTime();
    }
    // For Past, Cancelled, and All, sort most recent past first (Descending)
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground mt-2">
            Manage your upcoming video consultations and in-person visits.
          </p>
        </div>
        <Button className="rounded-xl" onClick={() => window.location.href = "/doctor/availability"}>Manage Availability</Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-4 overflow-x-auto">
        {(["Upcoming", "Past", "Cancelled", "All"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab} Appointments
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={sortedAppointments} />
    </div>
  );
}

