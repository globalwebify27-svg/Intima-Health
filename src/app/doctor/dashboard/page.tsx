"use client";

import { useEffect, useState } from "react";
import { Users, Calendar, Video, ArrowUpRight, Clock, FileSignature, AlertCircle, RefreshCw, Sparkles, X } from "lucide-react";
import { formatTime12Hour } from "@/lib/utils";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DoctorData {
  _id: string;
  name: string;
  specialization: string;
  experience: number;
  slotDuration?: number;
}

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Therapist Reassignment States
  const [reassignmentRequests, setReassignmentRequests] = useState<any[]>([]);
  const [therapistsList, setTherapistsList] = useState<any[]>([]);
  const [sessionToReassign, setSessionToReassign] = useState<any | null>(null);
  const [selectedNewTherapist, setSelectedNewTherapist] = useState("");
  const [reassignReason, setReassignReason] = useState("");
  const [reassignDoctorNotes, setReassignDoctorNotes] = useState("");
  const [isReassigning, setIsReassigning] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meJson = await meRes.json();
      if (!meJson.success || meJson.user.role !== "DOCTOR") {
        window.location.href = "/staff-login";
        return;
      }

      const dId = meJson.user.doctorId;
      if (dId) {
        // Fetch specific doctor profile
        const docRes = await fetch(`/api/doctors/${dId}`);
        const docJson = await docRes.json();
        if (docJson.success) {
          setDoctor(docJson.data);
        }

        // Fetch appointments for this doctor
        const aptsRes = await fetch(`/api/appointments?doctorId=${dId}`);
        const aptsJson = await aptsRes.json();
        if (aptsJson.success) {
          setAppointments(aptsJson.data);
        }

        // Fetch therapist reassignment requests for this doctor
        const reassignRes = await fetch(`/api/therapy-sessions?doctorId=${dId}&status=Reassignment_Requested&_t=${Date.now()}`);
        const reassignJson = await reassignRes.json();
        if (reassignJson.success && Array.isArray(reassignJson.data)) {
          setReassignmentRequests(reassignJson.data);
        }

        // Fetch active therapists for allotment
        const therapistsRes = await fetch("/api/therapists");
        const therapistsJson = await therapistsRes.json();
        if (therapistsJson.success && Array.isArray(therapistsJson.data)) {
          setTherapistsList(therapistsJson.data);
        }
      }
    } catch (err) {
      console.error("Error loading doctor dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchDashboardData();
    }, 30000);
    const onFocus = () => fetchDashboardData();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(interval); window.removeEventListener("focus", onFocus); };
  }, []);

  const handleConfirmReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionToReassign || !selectedNewTherapist || !doctor) return;
    setIsReassigning(true);
    try {
      const res = await fetch("/api/therapy-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reassign",
          sessionId: sessionToReassign._id,
          newTherapistId: selectedNewTherapist,
          doctorId: doctor._id,
          reason: reassignReason || "Reassigned by doctor upon patient schedule request",
          doctorNotes: reassignDoctorNotes || sessionToReassign.doctorNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("New therapist successfully allotted! The patient can now book slots with the new therapist.");
        setSessionToReassign(null);
        setSelectedNewTherapist("");
        setReassignReason("");
        setReassignDoctorNotes("");
        fetchDashboardData();
      } else {
        alert(data.message || "Failed to reassign therapist.");
      }
    } catch (err) {
      console.error(err);
      alert("Error reassigning therapist.");
    } finally {
      setIsReassigning(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Loading Dashboard...</h1>
          <p className="text-muted-foreground mt-2">Please wait while we fetch your schedule.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-card rounded-2xl border border-border shadow-sm animate-pulse">
              <div className="h-4 w-24 bg-muted rounded mb-4" />
              <div className="h-8 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 p-6 bg-card rounded-2xl border border-border shadow-sm min-h-[400px] animate-pulse" />
          <div className="p-6 bg-card rounded-2xl border border-border shadow-sm min-h-[400px] animate-pulse" />
        </div>
      </div>
    );
  }

  const handleStartSession = (appointmentId: string) => {
    window.location.href = `/doctor/consultations?appointmentId=${appointmentId}`;
  };

  const todayStr = typeof window !== "undefined" ? new Date().toLocaleDateString("en-CA") : "";
  const currentMonth = todayStr.substring(0, 7); // e.g. "2026-06"
  // Only show today's appointments where patient has paid
  const todayApts = appointments.filter(
    (a) => a.date === todayStr && a.paymentStatus === "Paid"
  );
  const completedApts = appointments.filter((a) => a.status === "Completed" && a.paymentStatus === "Paid");
  const pendingToday = todayApts.filter((a) => a.status === "Scheduled").length;

  // Only count unique patients from completed appointments in the current month
  const thisMonthCompleted = completedApts.filter((a) => a.date && a.date.startsWith(currentMonth));
  const uniquePatientsCount = new Set(
    thisMonthCompleted.map((a) => (a.patientId?._id || a.patientId || "").toString())
  ).size;

  const totalHours = (completedApts.length * (doctor?.slotDuration || 30)) / 60;

  const stats = [
    {
      title: "Patients Seen (Month)",
      value: String(uniquePatientsCount),
      change: "+10%",
      icon: Users,
    },
    {
      title: "Today's Appointments",
      value: String(todayApts.length),
      change: `${pendingToday} pending`,
      icon: Calendar,
    },
    {
      title: "Total Consult Hours",
      value: `${totalHours}h`,
      change: `+${totalHours}h`,
      icon: Video,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {loading ? "Loading..." : doctor ? doctor.name : "Dr. Smith"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {doctor ? `${doctor.specialization} Specialist • ${doctor.experience} years experience` : "Here is your clinical schedule and overview for today."}
        </p>
      </div>

      {/* Therapist Reassignment Alert Banner */}
      {reassignmentRequests.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Action Required: {reassignmentRequests.length} Therapist Reassignment Request(s)
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                A patient under your care has flagged scheduling unavailability with their allotted therapist. Please reassign a licensed therapist.
              </p>
            </div>
          </div>

          <div className="grid gap-2.5 pt-1">
            {reassignmentRequests.map((req) => (
              <div 
                key={req._id}
                className="p-3 bg-card/90 rounded-xl border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{req.patientId?.name || "Patient"}</span>
                    <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-700 dark:text-amber-300">
                      {req.name}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-[11px] mt-0.5">
                    Current: <strong>{req.therapistId?.name || "Therapist"}</strong> • Reason: <span className="italic">"{req.assignmentHistory?.slice(-1)[0]?.reason || "Schedule conflict"}"</span>
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setSessionToReassign(req);
                    setSelectedNewTherapist("");
                    setReassignReason("");
                    setReassignDoctorNotes(req.doctorNotes || "");
                  }}
                  className="rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shrink-0 h-8 gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reassign Therapist
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-card rounded-2xl border border-border shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center text-sm font-medium text-green-600">
                  {stat.change}
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 p-6 bg-card rounded-2xl border border-border shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Today's Schedule</h3>
            <Link href="/doctor/appointments">
              <Button variant="outline" size="sm">View Calendar</Button>
            </Link>
          </div>
          <div className="space-y-4">
            {todayApts.length > 0 ? (
              todayApts.map((apt) => (
                <div key={apt._id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center px-3 h-12 rounded-xl bg-primary/10 text-primary font-bold text-sm">
                      {formatTime12Hour(apt.time)}
                    </div>
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        {apt.patientId?.name || "Patient"}
                        {apt.status === "Checked In" && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            Patient Waiting
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground">{apt.serviceName || `${apt.type} Consult`} • {apt.notes || "Routine checkup"}</p>
                    </div>
                  </div>
                  {apt.status === "Completed" ? (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20">
                      Completed
                    </span>
                  ) : apt.status === "Cancelled" ? (
                    <span className="text-xs font-bold text-red-600 bg-red-500/10 px-3.5 py-1.5 rounded-xl border border-red-500/20">
                      Cancelled
                    </span>
                  ) : (apt.status === "Checked In" || apt.status === "Engaged" || (apt.type === "Video" && apt.status === "Scheduled") || (apt.serviceName && apt.serviceName.toLowerCase().includes("online") && apt.status === "Scheduled")) ? (
                    <Button 
                      size="sm"
                      onClick={() => handleStartSession(apt._id)}
                    >
                      {apt.status === "Engaged" ? "Rejoin Session" : "Start Session"}
                    </Button>
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground bg-muted px-3.5 py-1.5 rounded-xl border border-border">
                      {apt.status}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Calendar className="w-10 h-10 mb-2 text-muted-foreground/50" />
                <p className="font-medium text-sm">No appointments scheduled for today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm min-h-[400px]">
          <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/doctor/prescriptions" className="block">
              <Button variant="outline" className="w-full justify-start h-12" size="lg">
                <FileSignature className="w-4 h-4 mr-2" /> Write Prescription
              </Button>
            </Link>
            <Link href="/doctor/availability" className="block">
              <Button variant="outline" className="w-full justify-start h-12" size="lg">
                <Clock className="w-4 h-4 mr-2" /> Update Availability
              </Button>
            </Link>
            <Link href="/doctor/patients" className="block">
              <Button variant="outline" className="w-full justify-start h-12" size="lg">
                <Users className="w-4 h-4 mr-2" /> View Patient Directory
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Doctor Therapist Reassignment Modal */}
      {sessionToReassign && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-primary" /> Allot New Therapist
              </h3>
              <button
                onClick={() => setSessionToReassign(null)}
                className="w-7 h-7 rounded-full bg-muted/40 hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 text-xs space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Patient:</span>
                <span className="font-semibold text-foreground">{sessionToReassign.patientId?.name || "Patient"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Therapy:</span>
                <span className="font-semibold text-foreground">{sessionToReassign.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Previous Therapist:</span>
                <span className="font-semibold text-amber-700 dark:text-amber-300">
                  {sessionToReassign.therapistId?.name || "Therapist"}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmReassign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Select New Licensed Therapist <span className="text-rose-500">*</span>
                </label>
                <select
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:outline-none focus:border-primary font-medium"
                  value={selectedNewTherapist}
                  onChange={(e) => setSelectedNewTherapist(e.target.value)}
                  required
                >
                  <option value="">Choose a therapist...</option>
                  {therapistsList
                    .filter((t) => t._id !== sessionToReassign.therapistId?._id)
                    .map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} — {t.specialization} (Fee: ₹{t.fees || 1500})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Reassignment Reason / Note for Audit Log
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:outline-none focus:border-primary font-medium"
                  placeholder="e.g., Reassigned due to patient schedule conflict"
                  value={reassignReason}
                  onChange={(e) => setReassignReason(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Clinical Guidance Notes for New Therapist
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:outline-none focus:border-primary font-medium"
                  placeholder="Add any specific clinical observations for the newly allotted therapist..."
                  value={reassignDoctorNotes}
                  onChange={(e) => setReassignDoctorNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl text-xs"
                  onClick={() => setSessionToReassign(null)}
                  disabled={isReassigning}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isReassigning || !selectedNewTherapist}
                  className="flex-1 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-sm"
                >
                  {isReassigning ? "Allotting..." : "Allot Therapist"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
