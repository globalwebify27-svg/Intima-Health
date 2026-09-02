"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTime12Hour } from "@/lib/utils";
import { useBookingModal } from "@/store/useBookingModal";
import { Video, MapPin, ExternalLink, Download } from "lucide-react";
import { printReceipt } from "@/lib/print-receipt";

interface Appointment {
  _id: string;
  doctorId?: {
    name: string;
    specialization: string;
    salary?: number;
  };
  date: string;
  time: string;
  type: string;
  status: string;
  paymentStatus?: string;
  serviceName?: string;
}

const columns: ColumnDef<Appointment>[] = [
  {
    id: "doctorName",
    header: "Doctor",
    accessorFn: (row) => row.doctorId?.name ? row.doctorId.name : "N/A",
    cell: ({ row }) => <span className="font-bold">{row.getValue("doctorName")}</span>,
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ row }) => {
      return <span>{formatTime12Hour(row.getValue("time") as string)}</span>;
    }
  },
  {
    accessorKey: "serviceName",
    header: "Service",
    cell: ({ row }) => {
      const type = row.original.type as string;
      const serviceName = row.getValue("serviceName") as string || type;
      return <span>{serviceName}</span>;
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
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => {
      const pStatus = row.original.paymentStatus || "Pending";
      const price = 500; // Will be dynamically mapped from service later
      const type = row.original.type as string;
      const appointmentId = row.original._id;

      const handleDownloadReceipt = (e: React.MouseEvent) => {
        e.stopPropagation();
        printReceipt(row.original, "Payment Receipt");
      };

      if (pStatus === "Paid") {
        return (
          <Badge 
            variant="secondary" 
            className="cursor-pointer hover:bg-secondary/80 flex w-fit items-center gap-1.5 transition-colors" 
            onClick={handleDownloadReceipt} 
            title="Download Receipt"
          >
            Paid <Download className="w-3 h-3 opacity-70" />
          </Badge>
        );
      }
      return (
        <Badge variant="destructive">
          Pending (₹{price})
        </Badge>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const type = row.original.type as string;
      const status = row.getValue("status") as string;
      const paymentStatus = row.original.paymentStatus || "Pending";
      const appointmentId = row.original._id;
      
      let actionNode = null;

      if (type === "Video" && status === "Scheduled") {
        const appointmentTime = new Date(`${row.original.date}T${row.original.time}`).getTime();
        const now = new Date().getTime();
        const isTimeOver = now > appointmentTime + 60 * 60 * 1000; // 1 hour buffer
        const isTooEarly = now < appointmentTime - 15 * 60 * 1000; // before 15 mins

        if (isTimeOver) {
          actionNode = <span className="text-muted-foreground text-[10px] font-semibold italic opacity-50">Expired</span>;
        } else if (paymentStatus === "Paid") {
          if (isTooEarly) {
            actionNode = (
              <div className="flex flex-col items-center gap-1">
                <div className="cursor-not-allowed inline-block">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="rounded-lg opacity-50 pointer-events-none"
                    tabIndex={-1}
                  >
                    Join Call <ExternalLink className="w-3 h-3 ml-2" />
                  </Button>
                </div>
                <span className="text-[9px] text-muted-foreground/80 font-medium whitespace-nowrap">Active 15 mins before</span>
              </div>
            );
          } else {
            actionNode = (
              <Button 
                size="sm" 
                className="rounded-lg"
                onClick={() => window.location.href = "/patient/consultations"}
              >
                Join Call <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
            );
          }
        } else {
          actionNode = (
            <Button 
              size="sm" 
              className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white"
              onClick={async () => {
                try {
                  const res = await fetch(`/api/appointments/${appointmentId}/pay`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                  });
                  const data = await res.json();
                  if (data.success) {
                    alert("Consultation fee paid successfully! You can now join the call.");
                    window.location.reload();
                  } else {
                    alert(data.message || "Payment failed.");
                  }
                } catch (e) {
                  console.error(e);
                }
              }}
            >
              Pay Now
            </Button>
          );
        }
      }

      return (
        <div className="flex items-center gap-2">
          {actionNode}
        </div>
      );
    },
  },
];

export default function PatientAppointmentsPage() {
  const { openBooking } = useBookingModal();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meJson = await meRes.json();
        if (meJson.success && meJson.user && meJson.user.patientId) {
          const res = await fetch(`/api/appointments?patientId=${meJson.user.patientId}`);
          const json = await res.json();
          if (json.success) {
            const sortedApts = (json.data || []).sort((a: Appointment, b: Appointment) => {
              return new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime();
            });
            setAppointments(sortedApts);
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

  const todayStr = new Date().toISOString().split("T")[0];

  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === "cancelled") {
      return apt.status === "Cancelled";
    }

    if (activeTab === "upcoming") {
      return (
        ["Scheduled", "Checked In", "Engaged", "Rescheduled"].includes(apt.status) &&
        apt.date >= todayStr
      );
    }

    if (activeTab === "past") {
      return (
        ["Completed", "Checked Out"].includes(apt.status) ||
        (["Scheduled", "Checked In", "Engaged", "Rescheduled"].includes(apt.status) && apt.date < todayStr)
      );
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
          <p className="text-muted-foreground mt-2">
            View your scheduled consultations and past visits.
          </p>
        </div>
        <Button className="rounded-xl" onClick={() => openBooking()}>Book New</Button>
      </div>

      <div className="flex items-center gap-6 border-b border-border">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`pb-3 border-b-2 font-bold text-sm transition-colors ${activeTab === "upcoming" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`pb-3 border-b-2 font-bold text-sm transition-colors ${activeTab === "past" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Past
        </button>
        <button
          onClick={() => setActiveTab("cancelled")}
          className={`pb-3 border-b-2 font-bold text-sm transition-colors ${activeTab === "cancelled" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
        >
          Cancelled
        </button>
      </div>

      <DataTable columns={columns} data={filteredAppointments} />
    </div>
  );
}
