"use client";

import { useEffect, useState } from "react";
import { 
  Calendar, Video, Hospital, Search, Filter, Clock, FileText, 
  CheckCircle2, X, Shield, ArrowUpRight, ChevronRight 
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface TherapySession {
  _id: string;
  name: string;
  price: number;
  date?: string;
  time?: string;
  status: string;
  selectedMode?: string;
  recommendedMode?: string;
  doctorNotes?: string;
  therapistNotes?: string;
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
    name: string;
    city: string;
  };
  createdAt?: string;
}

export default function TherapistSessionsPage() {
  const [sessions, setSessions] = useState<TherapySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Notes Modal
  const [activeSession, setActiveSession] = useState<TherapySession | null>(null);
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  const fetchSessions = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meJson = await meRes.json();
      if (!meJson.success || meJson.user.role !== "THERAPIST") {
        window.location.href = "/staff-login";
        return;
      }
      const tId = meJson.user.therapistId;
      if (tId) {
        const res = await fetch(`/api/therapy-sessions?therapistId=${tId}&_t=${Date.now()}`);
        const data = await res.json();
        if (data.success) {
          setSessions(data.data);
        }
      }
    } catch (err) {
      console.error("Error loading sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = 
      (s.patientId?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.doctorId?.name || "").toLowerCase().includes(search.toLowerCase());

    const matchesMode = 
      modeFilter === "all" || s.selectedMode === modeFilter;

    const matchesStatus = 
      statusFilter === "all" || s.status === statusFilter;

    return matchesSearch && matchesMode && matchesStatus;
  });

  const handleSaveNotes = async (markComplete: boolean = false) => {
    if (!activeSession) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/therapy-sessions/${activeSession._id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistNotes: notes,
          status: markComplete ? "Completed" : activeSession.status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(markComplete ? "Session completed & archived." : "Notes saved.");
        setActiveSession(null);
        setNotes("");
        fetchSessions();
      } else {
        alert(data.message || "Failed to update notes.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating notes.");
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Therapy Sessions</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review, document, and conduct all patient sessions assigned to your clinical care.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-card rounded-2xl border border-border flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search patient, service, doctor..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Mode Filter */}
          <select
            className="px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-medium"
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
          >
            <option value="all">All Modes</option>
            <option value="Online">Online Video</option>
            <option value="Offline">In-Person Clinic</option>
          </select>

          {/* Status Filter */}
          <select
            className="px-3 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:border-primary font-medium"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Paid">Paid / Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Reassignment_Requested">Reassignment Requested</option>
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      {loading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Loading sessions...</div>
      ) : filteredSessions.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-3xl border border-border">
          <Calendar className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
          <h3 className="font-bold text-sm text-foreground">No sessions match your search</h3>
          <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredSessions.map((session) => (
            <div
              key={session._id}
              className="p-4 bg-card rounded-2xl border border-border/80 hover:border-primary/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  session.selectedMode === "Online"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                }`}>
                  {session.selectedMode === "Online" ? <Video className="w-5 h-5" /> : <Hospital className="w-5 h-5" />}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-sm text-foreground">{session.patientId?.name || "Patient"}</h4>
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/30 text-primary">
                      {session.selectedMode || "Online"}
                    </Badge>
                    <Badge variant={
                      session.status === "Completed" ? "default" :
                      session.status === "Scheduled" || session.status === "Paid" ? "secondary" : "outline"
                    } className="text-[9px] px-1.5 py-0">
                      {session.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {session.name} • {session.date ? `${session.date} at ${session.time}` : "Awaiting booking"}
                  </p>
                  {session.doctorId && (
                    <p className="text-[11px] text-muted-foreground">
                      Referral: <strong>{session.doctorId.name}</strong> ({session.doctorId.specialization})
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                {session.selectedMode === "Online" && session.status !== "Completed" && (
                  <Link href={`/therapist/session/${session._id}`}>
                    <Button size="sm" className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white gap-1.5 h-8">
                      <Video className="w-3.5 h-3.5" /> Video Call
                    </Button>
                  </Link>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setActiveSession(session);
                    setNotes(session.therapistNotes || "");
                  }}
                  className="rounded-xl text-xs font-semibold gap-1.5 h-8"
                >
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  {session.therapistNotes ? "View/Edit Notes" : "Add Notes"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Clinical Notes Modal */}
      {activeSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-border">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Clinical Session Notes
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Patient: <strong className="text-foreground">{activeSession.patientId?.name}</strong> • {activeSession.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveSession(null);
                  setNotes("");
                }}
                className="w-7 h-7 rounded-full bg-muted/40 hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {activeSession.doctorNotes && (
              <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 text-xs mb-4">
                <span className="font-bold text-primary block mb-0.5">Doctor Referral Notes:</span>
                <p className="text-muted-foreground italic">"{activeSession.doctorNotes}"</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Clinical Observations & Interventions
                </label>
                <textarea
                  rows={6}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record session observations, interventions applied, homework given, and follow-up guidance..."
                  className="w-full rounded-2xl border border-border bg-background p-3 text-xs focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-border">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl text-xs"
                  onClick={() => {
                    setActiveSession(null);
                    setNotes("");
                  }}
                  disabled={savingNotes}
                >
                  Cancel
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 rounded-xl text-xs font-bold"
                  onClick={() => handleSaveNotes(false)}
                  disabled={savingNotes || !notes.trim()}
                >
                  Save Draft
                </Button>
                <Button
                  className="flex-1 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white"
                  onClick={() => handleSaveNotes(true)}
                  disabled={savingNotes || !notes.trim()}
                >
                  {savingNotes ? "Saving..." : "Mark Completed"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
