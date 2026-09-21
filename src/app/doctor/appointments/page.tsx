"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, MapPin, ExternalLink, Calendar } from "lucide-react";
import { formatTime12Hour } from "@/lib/utils";

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
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const id = row.original._id;
      
      const type = row.original.type as string;
      const serviceName = row.original.serviceName as string | undefined;
      const isOnline = type === "Video" || (serviceName && serviceName.toLowerCase().includes("online"));

      if (isOnline && (status === "Scheduled" || status === "Engaged")) {
        const appointmentTime = new Date(`${row.original.date}T${row.original.time}`).getTime();
        const now = new Date().getTime();
        const isTimeOver = now > appointmentTime + 60 * 60 * 1000; // 1 hour buffer
        const isTooEarly = now < appointmentTime - 15 * 60 * 1000; // before 15 mins

        if (status === "Scheduled" && isTooEarly) {
            return (
              <div className="flex flex-col items-center gap-1">
                <div className="cursor-not-allowed inline-block">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="rounded-lg opacity-50 pointer-events-none"
                    tabIndex={-1}
                  >
                    Start Session <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                </div>
                <span className="text-[9px] text-muted-foreground/80 font-medium whitespace-nowrap">Active 15 mins before</span>
              </div>
            );
        } else if (isTimeOver && status !== "Engaged") {
             return <span className="text-muted-foreground text-[10px] font-semibold italic opacity-50">Expired</span>;
        } else {
          return (
            <Button 
              size="sm" 
              className="rounded-lg"
              onClick={async () => {
                window.location.href = `/doctor/consultations?appointmentId=${id}`;
              }}
            >
              {status === "Engaged" ? "Rejoin Session" : "Start Session"} <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
          );
        }
      }

      if (status === "Checked In") {
        return (
          <Button 
            size="sm" 
            className="rounded-lg"
            onClick={async () => {
              window.location.href = `/doctor/consultations?appointmentId=${id}`;
            }}
          >
            Start Session <ExternalLink className="w-3 h-3 ml-2" />
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
  const [activeTab, setActiveTab] = useState<"Upcoming/Active" | "Past" | "Cancelled" | "All">("Upcoming/Active");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const meRes = await fetch("/api/auth/me", { cache: "no-store" });
        const meJson = await meRes.json();
        if (!meJson.success || meJson.user.role !== "DOCTOR") {
          window.location.href = "/staff-login";
          return;
        }

        const dId = meJson.user.doctorId;
        if (dId) {
          const aptsRes = await fetch(`/api/appointments?doctorId=${dId}&_t=${Date.now()}`, { cache: "no-store" });
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

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === "All") return true;
    if (activeTab === "Cancelled") return apt.status === "Cancelled";
    
    const isPastState = ["Completed", "Expired", "No Show"].includes(apt.status);

    if (activeTab === "Upcoming/Active") return apt.status !== "Cancelled" && !isPastState;
    if (activeTab === "Past") return apt.status !== "Cancelled" && isPastState;
    return true;
  });

  // Sort appointments
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}:00`);
    const dateB = new Date(`${b.date}T${b.time}:00`);
    
    // For Upcoming/Active, sort closest to now first (Ascending)
    if (activeTab === "Upcoming/Active") {
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
            Manage your upcoming video consultations and walk-in visits.
          </p>
        </div>
        <Button className="rounded-xl" onClick={() => window.location.href = "/doctor/availability"}>Manage Availability</Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-4 overflow-x-auto">
        {(["Upcoming/Active", "Past", "Cancelled", "All"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "Upcoming/Active" ? "Upcoming/Active" : tab} Appointments
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={sortedAppointments} />
    </div>
  );
}

