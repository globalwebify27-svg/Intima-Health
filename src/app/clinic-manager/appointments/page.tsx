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
  Phone,
  Download,
  X,
  CalendarDays
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface AppointmentData {
  _id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  paymentStatus?: string;
  patientId?: {
    name: string;
    phone: string;
  };
  doctorId?: {
    _id: string;
    name: string;
  };
}

export default function AppointmentsPage() {
  const router = useRouter();
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  
  // Reschedule state
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleApt, setRescheduleApt] = useState<AppointmentData | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<{ start: string; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  
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
    const interval = setInterval(() => {
      fetchAppointments();
    }, 15000);
    return () => clearInterval(interval);
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

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Failed to update status.");
      }
      setSuccessMsg(`Status updated to ${newStatus}.`);
      await fetchAppointments();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  // Fetch available slots when a date is selected for rescheduling
  useEffect(() => {
    if (rescheduleDate && rescheduleApt && rescheduleApt.doctorId) {
      const getSlots = async () => {
        setLoadingSlots(true);
        try {
          const res = await fetch(`/api/doctors/${rescheduleApt.doctorId?._id}/slots?date=${rescheduleDate}`);
          const json = await res.json();
          if (json.success) {
            setAvailableSlots(json.data);
          }
        } catch (err) {
          console.error("Failed to fetch slots", err);
        } finally {
          setLoadingSlots(false);
        }
      };
      getSlots();
    }
  }, [rescheduleDate, rescheduleApt]);

  const handleRescheduleSubmit = async () => {
    if (!rescheduleApt || !rescheduleDate || !rescheduleTime) return;
    setActionLoading("reschedule");
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      const res = await fetch(`/api/appointments/${rescheduleApt._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: rescheduleDate, time: rescheduleTime })
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Failed to reschedule.");
      }
      setSuccessMsg("Appointment rescheduled successfully!");
      setShowRescheduleModal(false);
      setRescheduleApt(null);
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

    const isUpcoming = ["Scheduled", "Checked In", "Engaged", "Rescheduled"].includes(apt.status) && apt.date >= todayStr;
    if (activeTab === "upcoming") {
      return isUpcoming;
    } else {
      if (isUpcoming) return false;
      if (filterDate && apt.date !== filterDate) return false;
      return true;
    }
  });

  // Sort by date and time
  filtered.sort((a, b) => {
    if (activeTab === "upcoming") {
      return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
    } else {
      return b.date.localeCompare(a.date) || b.time.localeCompare(a.time);
    }
  });

  // Group by date
  const groupedByDate: Record<string, AppointmentData[]> = {};
  filtered.forEach((apt) => {
    if (!groupedByDate[apt.date]) {
      groupedByDate[apt.date] = [];
    }
    groupedByDate[apt.date].push(apt);
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

        <div className="flex items-center gap-3 w-full md:w-auto">
          {activeTab === "past" && (
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="h-10 px-3 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          )}
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
      </div>

      {/* Appointment Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-3xl p-12 text-center text-muted-foreground">
          No appointments found matching the filters.
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedByDate).map(([date, apts]) => (
            <div key={date} className="space-y-4">
              <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                <Calendar className="w-5 h-5 text-primary" />
                {date === todayStr ? "Today, " + date : date}
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {apts.map((apt) => (
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
                        <div className="flex flex-col items-end gap-1.5">
                          <Badge 
                            variant={
                              apt.status === "Cancelled" ? "destructive" :
                              apt.status === "Rescheduled" ? "outline" : // Use custom class for orange below
                              apt.status === "Scheduled" ? "default" : 
                              ["Checked In", "Engaged"].includes(apt.status) ? "outline" :
                              "secondary"
                            }
                            className={apt.status === "Completed" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : apt.status === "Rescheduled" ? "border-orange-500 text-orange-600 bg-orange-50" : ""}
                          >
                            {apt.status}
                          </Badge>
                          {apt.paymentStatus && (
                            <Badge
                              variant={apt.paymentStatus === "Paid" ? "default" : apt.paymentStatus === "Failed" ? "destructive" : "secondary"}
                              className={apt.paymentStatus === "Paid" ? "bg-blue-500 hover:bg-blue-600 text-white" : apt.paymentStatus === "Pending" ? "border-amber-500 text-amber-600 bg-amber-50" : ""}
                            >
                              {apt.paymentStatus}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-border pt-3 space-y-2">
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
                        <div className="text-xs text-muted-foreground mt-1 font-bold flex justify-between items-center">
                          <span>Doctor: Dr. {apt.doctorId?.name || "Unassigned"}</span>
                          {apt.paymentStatus === "Paid" && (
                            <div className="flex gap-1">
                              <button className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-muted" onClick={() => alert("Invoice downloaded!")} title="Download PDF Invoice">
                                <Download className="w-4 h-4"/>
                              </button>
                              <button className="text-[#25D366] hover:text-[#20bd5a] transition-colors p-1.5 rounded-full hover:bg-[#25D366]/10" onClick={() => alert("Invoice sent via WhatsApp!")} title="Send Invoice via WhatsApp">
                                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {["Scheduled", "Checked In", "Engaged"].includes(apt.status) && (
                      <div className="mt-4 pt-4 border-t border-border space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground w-16">Status:</span>
                          <select
                            className="flex-1 h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={apt.status}
                            disabled={actionLoading === apt._id}
                            onChange={(e) => {
                              if (e.target.value === "Rescheduled") {
                                setRescheduleApt(apt);
                                setShowRescheduleModal(true);
                              } else {
                                handleUpdateStatus(apt._id, e.target.value);
                              }
                            }}
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Checked In">Checked In</option>
                            <option value="Engaged">Engaged</option>
                            <option value="Checked Out">Checked Out</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Rescheduled">Rescheduled</option>
                          </select>
                        </div>
                        {apt.status === "Scheduled" && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 h-9 rounded-xl font-bold flex items-center justify-center gap-1.5 border-orange-200 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                              onClick={() => {
                                setRescheduleApt(apt);
                                setShowRescheduleModal(true);
                              }}
                            >
                              <CalendarDays className="w-4 h-4" />
                              Reschedule
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="flex-1 h-9 rounded-xl font-bold flex items-center justify-center gap-1.5"
                              disabled={actionLoading === apt._id}
                              onClick={() => handleCancel(apt._id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              {actionLoading === apt._id ? "..." : "Cancel"}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- RESCHEDULE MODAL --- */}
      {showRescheduleModal && rescheduleApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl md:rounded-3xl w-[95vw] md:max-w-md p-4 md:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowRescheduleModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
              <CalendarDays className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-bold">Reschedule Appointment</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>Patient:</strong> {rescheduleApt.patientId?.name}</p>
                <p><strong>Current:</strong> {rescheduleApt.date} at {rescheduleApt.time}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select New Date *</label>
                <input
                  type="date"
                  required
                  min={todayStr}
                  value={rescheduleDate}
                  onChange={(e) => {
                    setRescheduleDate(e.target.value);
                    setRescheduleTime("");
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {rescheduleDate && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select New Time *</label>
                  {loadingSlots ? (
                    <div className="text-sm text-muted-foreground text-center py-4">Checking availability...</div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                      No slots available on this date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.start}
                          disabled={!slot.available}
                          onClick={() => setRescheduleTime(slot.start)}
                          className={`h-9 text-xs font-bold rounded-lg transition-all ${
                            !slot.available
                              ? "bg-muted/50 text-muted-foreground opacity-50 cursor-not-allowed"
                              : rescheduleTime === slot.start
                              ? "bg-primary text-white shadow-md ring-2 ring-primary/20"
                              : "bg-background border border-border hover:border-primary/50 text-foreground"
                          }`}
                        >
                          {slot.start}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button 
                disabled={actionLoading === "reschedule" || !rescheduleDate || !rescheduleTime} 
                onClick={handleRescheduleSubmit}
                className="w-full h-11 text-white font-bold rounded-xl bg-orange-500 hover:bg-orange-600 shadow-sm shadow-orange-500/20 mt-2"
              >
                {actionLoading === "reschedule" ? "Rescheduling..." : "Confirm Reschedule"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
