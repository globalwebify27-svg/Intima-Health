"use client";

import { useEffect, useState } from "react";
import { 
  Users, Calendar, Video, Clock, CheckCircle2, AlertCircle, FileText, 
  Sparkles, Hospital, MapPin, ChevronRight, Phone, Mail, X, Shield, RefreshCw 
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TherapistProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  registrationNumber?: string;
  experience?: number;
  rating?: number;
}

interface TherapySession {
  _id: string;
  name: string;
  price: number;
  date?: string;
  time?: string;
  status: string;
  paymentStatus?: string;
  recommendedMode?: string;
  selectedMode?: string;
  doctorNotes?: string;
  therapistNotes?: string;
  videoChannelName?: string;
  patientId?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    gender?: string;
    age?: number;
  };
  doctorId?: {
    _id: string;
    name: string;
    specialization: string;
  };
  clinicId?: {
    _id: string;
    name: string;
    city: string;
  };
  createdAt?: string;
}

export default function TherapistDashboard() {
  const [therapist, setTherapist] = useState<TherapistProfile | null>(null);
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "reassignment" | "all">("today");

  // Clinical Notes Modal
  const [activeSessionForNotes, setActiveSessionForNotes] = useState<TherapySession | null>(null);
  const [notesContent, setNotesContent] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Referral Guidance Modal
  const [viewingReferral, setViewingReferral] = useState<TherapySession | null>(null);

  const fetchDashboardData = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meJson = await meRes.json();
      if (!meJson.success || meJson.user.role !== "THERAPIST") {
        window.location.href = "/staff-login";
        return;
      }

      const tId = meJson.user.therapistId;
      if (tId) {
        // 1. Fetch therapist profile
        const therapistRes = await fetch(`/api/therapists/${tId}`);
        const therapistJson = await therapistRes.json();
        if (therapistJson.success) {
          setTherapist(therapistJson.data);
        }

        // 2. Fetch assigned therapy sessions under strict RBAC
        const sessionsRes = await fetch(`/api/therapy-sessions?therapistId=${tId}&_t=${Date.now()}`);
        const sessionsJson = await sessionsRes.json();
        if (sessionsJson.success) {
          setSessions(sessionsJson.data);
        }
      }
    } catch (err) {
      console.error("Error loading therapist dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];

  const todaySessions = sessions.filter(
    (s) => s.date === todayStr && s.status !== "Cancelled"
  );
  const upcomingSessions = sessions.filter(
    (s) => s.date && s.date > todayStr && s.status !== "Cancelled"
  );
  const completedSessions = sessions.filter((s) => s.status === "Completed");
  const reassignmentAlerts = sessions.filter((s) => s.status === "Reassignment_Requested");

  // Distinct patients assigned
  const uniquePatientIds = new Set(
    sessions.map((s) => s.patientId?._id).filter(Boolean)
  );

  const displayedSessions = 
    activeTab === "today" 
      ? todaySessions 
      : activeTab === "upcoming" 
      ? upcomingSessions 
      : activeTab === "reassignment" 
      ? reassignmentAlerts 
      : sessions;

  const handleSaveNotes = async (markAsCompleted: boolean = false) => {
    if (!activeSessionForNotes) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/therapy-sessions/${activeSessionForNotes._id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistNotes: notesContent,
          status: markAsCompleted ? "Completed" : activeSessionForNotes.status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(markAsCompleted ? "Session marked as Completed with documentation." : "Clinical notes saved.");
        setActiveSessionForNotes(null);
        setNotesContent("");
        fetchDashboardData();
      } else {
        alert(data.message || "Failed to save notes.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save clinical notes.");
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Therapist Portal</h1>
          <p className="text-muted-foreground mt-2">Loading confidential clinical dashboard...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-6 bg-card rounded-2xl border border-border shadow-sm animate-pulse">
              <div className="h-4 w-24 bg-muted rounded mb-4" />
              <div className="h-8 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-6 md:p-8 rounded-3xl border border-border/70 shadow-sm relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Welcome, {therapist?.name || "Therapist"}
            </h1>
            <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
              Licensed Therapist
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {therapist?.specialization} • RCI / Lic: <span className="font-mono font-semibold text-foreground">{therapist?.registrationNumber || "Verified"}</span>
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <Link href="/therapist/availability">
            <Button variant="outline" className="rounded-xl text-xs font-semibold gap-1.5 h-10">
              <Clock className="w-4 h-4 text-primary" /> Manage Schedule
            </Button>
          </Link>
          <Link href="/therapist/sessions">
            <Button className="rounded-xl text-xs font-semibold gap-1.5 h-10 bg-primary hover:bg-primary/90 text-white">
              <Calendar className="w-4 h-4" /> All Sessions
            </Button>
          </Link>
        </div>
      </div>

      {/* Reassignment Alert Banner */}
      {reassignmentAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
                {reassignmentAlerts.length} Patient Reassignment Request(s)
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Patient has requested a different schedule or therapist. Doctor has been notified for reassignment.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTab("reassignment")}
            className="text-xs rounded-xl border-amber-500/30 text-amber-800 dark:text-amber-200"
          >
            Review Requests
          </Button>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 bg-card rounded-2xl border border-border/80 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-muted-foreground">Today's Sessions</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{todaySessions.length}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {todaySessions.filter(s => s.selectedMode === "Online").length} Online • {todaySessions.filter(s => s.selectedMode === "Offline").length} In-Clinic
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-5 bg-card rounded-2xl border border-border/80 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-muted-foreground">Upcoming Sessions</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{upcomingSessions.length}</h3>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">Prepaid & confirmed</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-5 bg-card rounded-2xl border border-border/80 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-muted-foreground">Completed Sessions</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{completedSessions.length}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Clinical notes archived</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-5 bg-card rounded-2xl border border-border/80 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-muted-foreground">Assigned Patients</p>
            <h3 className="text-2xl font-bold mt-1 text-foreground">{uniquePatientIds.size}</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">Under your clinical care</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("today")}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === "today" 
              ? "border-b-2 border-primary text-primary" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Calendar className="w-4 h-4" /> Today's Schedule ({todaySessions.length})
        </button>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === "upcoming" 
              ? "border-b-2 border-primary text-primary" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="w-4 h-4" /> Upcoming ({upcomingSessions.length})
        </button>
        <button
          onClick={() => setActiveTab("reassignment")}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === "reassignment" 
              ? "border-b-2 border-primary text-primary" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <RefreshCw className="w-4 h-4" /> Reassignments ({reassignmentAlerts.length})
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === "all" 
              ? "border-b-2 border-primary text-primary" 
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All Sessions ({sessions.length})
        </button>
      </div>

      {/* Sessions List */}
      <div className="space-y-4">
        {displayedSessions.length === 0 ? (
          <div className="p-12 text-center bg-card rounded-3xl border border-border">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <h3 className="font-bold text-base text-foreground">No sessions in this view</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {activeTab === "today" 
                ? "You have no therapy sessions scheduled for today." 
                : "No matching therapy records found for your account."}
            </p>
          </div>
        ) : (
          displayedSessions.map((session) => (
            <motion.div
              key={session._id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-card rounded-2xl border border-border/80 shadow-sm hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  session.selectedMode === "Online" 
                    ? "bg-primary/10 text-primary border border-primary/20" 
                    : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                }`}>
                  {session.selectedMode === "Online" ? (
                    <Video className="w-6 h-6" />
                  ) : (
                    <Hospital className="w-6 h-6" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-base text-foreground">
                      {session.patientId?.name || "Patient"}
                    </h4>
                    {session.patientId?.gender && (
                      <span className="text-xs text-muted-foreground">
                        ({session.patientId.gender}, {session.patientId.age || "Adult"})
                      </span>
                    )}
                    <Badge variant="outline" className={`text-[10px] font-semibold ${
                      session.selectedMode === "Online" 
                        ? "border-primary/30 text-primary bg-primary/5" 
                        : "border-emerald-500/30 text-emerald-600 bg-emerald-500/5"
                    }`}>
                      {session.selectedMode === "Online" ? "Online Video" : "In-Person Clinic"}
                    </Badge>
                    <Badge variant={
                      session.status === "Completed" ? "default" :
                      session.status === "Scheduled" || session.status === "Paid" ? "secondary" :
                      session.status === "Reassignment_Requested" ? "destructive" : "outline"
                    } className="text-[10px]">
                      {session.status.replace("_", " ")}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-3">
                    <span><strong>Service:</strong> {session.name}</span>
                    {session.date && session.time && (
                      <span>• <strong>Time:</strong> {session.date} at {session.time}</span>
                    )}
                  </p>

                  {/* Doctor Referral info */}
                  {session.doctorId && (
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
                      <span>Prescribed by: <strong className="text-foreground">{session.doctorId.name}</strong></span>
                      {session.doctorNotes && (
                        <button
                          type="button"
                          onClick={() => setViewingReferral(session)}
                          className="text-primary hover:underline font-semibold flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" /> View Doctor Guidance
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {/* Online Video Launch */}
                {session.selectedMode === "Online" && session.status !== "Completed" && session.status !== "Cancelled" && (
                  <Link href={`/therapist/session/${session._id}`}>
                    <Button 
                      size="sm" 
                      className="rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-white gap-1.5 h-9 shadow-sm"
                    >
                      <Video className="w-3.5 h-3.5" /> Start Video Room
                    </Button>
                  </Link>
                )}

                {/* Clinical Notes button */}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setActiveSessionForNotes(session);
                    setNotesContent(session.therapistNotes || "");
                  }}
                  className="rounded-xl font-semibold text-xs gap-1.5 h-9"
                >
                  <FileText className="w-3.5 h-3.5 text-primary" /> 
                  {session.therapistNotes ? "Edit Notes" : "Add Notes"}
                </Button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Clinical Notes Drawer / Modal */}
      {activeSessionForNotes && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-border">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Clinical Session Notes
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Patient: <strong className="text-foreground">{activeSessionForNotes.patientId?.name}</strong> • {activeSessionForNotes.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveSessionForNotes(null);
                  setNotesContent("");
                }}
                className="w-7 h-7 rounded-full bg-muted/40 hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Prescribing doctor referral note reminder */}
            {activeSessionForNotes.doctorNotes && (
              <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 text-xs mb-4">
                <span className="font-bold text-primary block mb-0.5">Prescribing Doctor Guidance:</span>
                <p className="text-muted-foreground italic">"{activeSessionForNotes.doctorNotes}"</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Session Observations, Techniques Applied & Patient Progress
                </label>
                <textarea
                  rows={6}
                  value={notesContent}
                  onChange={(e) => setNotesContent(e.target.value)}
                  placeholder="Record key therapeutic themes, interventions (CBT / Psychosexual / Sensate focus), patient mood, response, homework exercises assigned, and follow-up plan..."
                  className="w-full rounded-2xl border border-border bg-background p-3 text-xs focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-primary" /> End-to-end confidential health record
                </span>
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl text-xs"
                  onClick={() => {
                    setActiveSessionForNotes(null);
                    setNotesContent("");
                  }}
                  disabled={savingNotes}
                >
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 rounded-xl text-xs font-bold"
                  onClick={() => handleSaveNotes(false)}
                  disabled={savingNotes || !notesContent.trim()}
                >
                  Save Draft
                </Button>
                <Button
                  className="flex-1 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white"
                  onClick={() => handleSaveNotes(true)}
                  disabled={savingNotes || !notesContent.trim()}
                >
                  {savingNotes ? "Saving..." : "Mark Completed"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Doctor Guidance Modal */}
      {viewingReferral && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" /> Doctor Referral Guidance
              </h3>
              <button
                onClick={() => setViewingReferral(null)}
                className="w-7 h-7 rounded-full bg-muted/40 hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Referring Doctor:</span>
                  <span className="font-semibold text-foreground">{viewingReferral.doctorId?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Specialization:</span>
                  <span className="font-semibold text-foreground">{viewingReferral.doctorId?.specialization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recommended Mode:</span>
                  <span className="font-semibold text-primary">{viewingReferral.recommendedMode || "Flexible"}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Doctor Clinical Guidance & Referral Notes:
                </label>
                <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 text-foreground leading-relaxed italic">
                  "{viewingReferral.doctorNotes || "No specific referral notes provided."}"
                </div>
              </div>

              <div className="pt-3 border-t border-border">
                <Button
                  className="w-full rounded-xl text-xs"
                  onClick={() => setViewingReferral(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
