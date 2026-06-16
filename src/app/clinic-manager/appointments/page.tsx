"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  Search, 
  Trash2, 
  AlertCircle, 
  CheckCircle2,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AppointmentData {
  _id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  patientId?: {
    name: string;
    phone: string;
  };
  doctorId?: {
    name: string;
  };
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchAppointments = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meJson = await meRes.json();
      if (!meJson.success || meJson.user.role !== "CLINIC_MANAGER") {
        router.push("/staff-login");
        return;
      }
      
      const cId = meJson.user.clinicId;
      setClinicId(cId);

      if (cId) {
        const res = await fetch(`/api/appointments?clinicId=${cId}`);
        const json = await res.json();
        if (json.success) {
          setAppointments(json.data);
        }
      }
    } catch (err) {
      console.error("Failed to load appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    
    setActionLoading(id);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "DELETE"
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Failed to cancel appointment.");
      }
      setSuccessMsg("Appointment cancelled successfully.");
      await fetchAppointments();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const filtered = appointments.filter((apt) => {
    const nameMatch = apt.patientId?.name.toLowerCase().includes(searchQuery.toLowerCase()) || false;
    const phoneMatch = apt.patientId?.phone.includes(searchQuery) || false;
    const matchesSearch = nameMatch || phoneMatch;

    if (!matchesSearch) return false;

    const isUpcoming = apt.status === "Scheduled" && apt.date >= todayStr;
    if (activeTab === "upcoming") {
      return isUpcoming;
    } else {
      return !isUpcoming;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading clinic appointments...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments Management</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Manage upcoming bookings and cancellation workflows for patients.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-sm font-medium rounded-xl border border-emerald-200/50 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 text-sm font-medium rounded-xl border border-rose-200/50 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" /> {errorMsg}
        </div>
      )}

      {/* Filters & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === "upcoming"
                ? "bg-primary text-white"
                : "bg-muted/50 hover:bg-muted text-muted-foreground"
            }`}
          >
            Upcoming Scheduled
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === "past"
                ? "bg-primary text-white"
                : "bg-muted/50 hover:bg-muted text-muted-foreground"
            }`}
          >
            Past & Cancelled
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by patient name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Appointment Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center text-muted-foreground">
          No appointments found matching the filters.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((apt) => (
            <div
              key={apt._id}
              className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{apt.patientId?.name || "Patient"}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1 font-medium">
                      <Phone className="w-4 h-4" /> {apt.patientId?.phone || "No phone"}
                    </p>
                  </div>
                  <Badge variant={apt.status === "Scheduled" ? "default" : "secondary"}>
                    {apt.status}
                  </Badge>
                </div>

                <div className="border-t border-border pt-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Date: {apt.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Time slot: {apt.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {apt.type === "Video" ? (
                      <Video className="w-4 h-4 text-blue-500" />
                    ) : (
                      <MapPin className="w-4 h-4 text-green-500" />
                    )}
                    <span>Type: {apt.type}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 font-bold">
                    Doctor: Dr. {apt.doctorId?.name || "Unassigned"}
                  </div>
                </div>
              </div>

              {apt.status === "Scheduled" && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full mt-2 h-10 rounded-xl font-bold flex items-center justify-center gap-2"
                  disabled={actionLoading === apt._id}
                  onClick={() => handleCancel(apt._id)}
                >
                  <Trash2 className="w-4 h-4" />
                  {actionLoading === apt._id ? "Cancelling..." : "Cancel Appointment"}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
