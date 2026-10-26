"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Shield, Video, Calendar, Clock, User, FileText, CheckCircle2, 
  Sparkles, Save, HeartHandshake, Eye, AlertCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ZegoVideoCall } from "@/components/consultations/ZegoVideoCall";

interface TherapySessionDetail {
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
    specialization?: string;
  };
  therapistId?: {
    _id: string;
    name: string;
    specialization?: string;
  };
}

export default function TherapistSessionRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [session, setSession] = useState<TherapySessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUserName, setCurrentUserName] = useState("Therapist");

  // Clinical notes state
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    // 1. Fetch current logged in therapist
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          if (data.user.role !== "THERAPIST") {
            router.push("/staff-login");
            return;
          }
          setCurrentUserId(data.user.id || data.user.therapistId || "therapist_user");
          setCurrentUserName(data.user.name || "Therapist");
        } else {
          router.push("/staff-login");
        }
      })
      .catch((err) => console.error("Error loading therapist session:", err));

    // 2. Fetch therapy session
    fetch(`/api/therapy-sessions/${id}?_t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSession(data.data);
          setNotes(data.data.therapistNotes || "");
        } else {
          setError(data.message || "Therapy session not found.");
        }
      })
      .catch((err) => setError(err.message || "Failed to load therapy session."))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSaveNotes = async (markComplete: boolean = false) => {
    if (!session) return;
    if (markComplete) setCompleting(true);
    else setSavingNotes(true);

    try {
      const res = await fetch(`/api/therapy-sessions/${session._id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistNotes: notes,
          status: markComplete ? "Completed" : session.status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (markComplete) {
          alert("Therapy session completed & clinical documentation archived.");
          router.push("/therapist/dashboard");
        } else {
          alert("Clinical notes saved successfully.");
        }
      } else {
        alert(data.message || "Failed to save notes.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save clinical notes.");
    } finally {
      setSavingNotes(false);
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium">Entering confidential therapy room...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <Shield className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold">Session Unavailable</h2>
        <p className="text-muted-foreground text-sm">{error || "Unable to load therapy room."}</p>
        <Button onClick={() => router.push("/therapist/dashboard")} variant="outline" className="rounded-xl">
          Return to Therapist Dashboard
        </Button>
      </div>
    );
  }

  const roomID = session.videoChannelName || `therapy_room_${session._id}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="h-16 px-4 sm:px-6 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/therapist/dashboard")}
            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-semibold gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Exit Room
          </Button>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">{session.name}</span>
              <Badge variant="outline" className="text-[10px] bg-primary/20 text-primary border-primary/40 font-mono">
                {session.selectedMode || "Online"}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Patient: <strong className="text-slate-200">{session.patientId?.name || "Patient"}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs gap-1 hidden md:flex">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Call Active
          </Badge>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleSaveNotes(false)}
            disabled={savingNotes}
            className="rounded-xl text-xs font-semibold gap-1.5 h-8 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
          >
            <Save className="w-3.5 h-3.5" /> {savingNotes ? "Saving..." : "Save Notes"}
          </Button>
          <Button
            size="sm"
            onClick={() => handleSaveNotes(true)}
            disabled={completing}
            className="rounded-xl text-xs font-bold gap-1.5 h-8 bg-primary hover:bg-primary/90 text-white shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> {completing ? "Concluding..." : "Complete Session"}
          </Button>
        </div>
      </header>

      {/* Main Split Layout: Left Video, Right Clinical Notes Panel */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left: Video Call Room */}
        <div className="lg:col-span-8 bg-black relative flex flex-col min-h-[450px] lg:min-h-0">
          <ZegoVideoCall
            roomID={roomID}
            userID={currentUserId}
            userName={currentUserName}
            onLeaveRoom={() => router.push("/therapist/dashboard")}
          />
        </div>

        {/* Right: Clinical Consultation & Notes Panel */}
        <div className="lg:col-span-4 bg-slate-900 border-l border-slate-800 flex flex-col h-full overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Patient Card */}
          <div className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Patient Details</span>
              <span className="text-[10px] text-slate-400 font-mono">ID: {session.patientId?._id?.substring(18)}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                {session.patientId?.name?.substring(0, 2).toUpperCase() || "PT"}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{session.patientId?.name}</h4>
                <p className="text-xs text-slate-400">
                  {session.patientId?.gender || "Not specified"} • {session.patientId?.age ? `${session.patientId.age} yrs` : "Adult"}
                </p>
              </div>
            </div>
          </div>

          {/* Prescribing Doctor's Referral Notes */}
          {session.doctorId && (
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-purple-400 tracking-wider uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Referring Doctor Guidance
                </span>
                <span className="text-[10px] text-slate-400">{session.doctorId.name}</span>
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
                "{session.doctorNotes || "General therapy referral for psychosexual counseling and patient support."}"
              </p>
            </div>
          )}

          {/* Live Clinical Notes Form */}
          <div className="flex-1 flex flex-col space-y-2 min-h-[250px]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" /> Session Documentation
              </label>
              <span className="text-[10px] text-slate-400">Auto-saved on Conclude</span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record clinical observations, therapeutic dialogue, techniques applied (CBT, sensate focus, cognitive reframing), patient response, and follow-up plan..."
              className="flex-1 w-full rounded-2xl border border-slate-700 bg-slate-950/80 p-3 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-primary font-medium leading-relaxed resize-none min-h-[200px]"
            />
          </div>

          {/* Conclude Session Action */}
          <div className="pt-2">
            <Button
              onClick={() => handleSaveNotes(true)}
              disabled={completing}
              className="w-full rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-md h-10 gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> 
              {completing ? "Archiving Session..." : "Conclude & Complete Session"}
            </Button>
            <p className="text-[10px] text-center text-slate-500 mt-2">
              Completing will notify patient, archive clinical notes, and close session room.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
