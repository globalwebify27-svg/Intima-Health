"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Shield, Video, Calendar, Clock, User, HeartHandshake } from "lucide-react";
import { ZegoVideoCall } from "@/components/consultations/ZegoVideoCall";

interface TherapySessionDetail {
  _id: string;
  name: string;
  price: number;
  date?: string;
  time?: string;
  status?: string;
  selectedMode?: string;
  videoChannelName?: string;
  therapistId?: {
    _id: string;
    name: string;
    specialization?: string;
    avatar?: string;
  };
  patientId?: {
    _id: string;
    name: string;
    email: string;
  };
}

const parseDateTimeToMs = (dateStr?: string, timeStr?: string): number => {
  if (!dateStr) return 0;

  let hours = 0;
  let minutes = 0;

  if (timeStr) {
    const cleanTime = timeStr.trim().toUpperCase();
    if (cleanTime.includes("AM") || cleanTime.includes("PM")) {
      const isPM = cleanTime.includes("PM");
      const parts = cleanTime.replace(/\s*(AM|PM)/, "").split(":");
      hours = parseInt(parts[0], 10) || 0;
      minutes = parseInt(parts[1], 10) || 0;
      if (isPM && hours < 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
    } else {
      const parts = cleanTime.split(":");
      hours = parseInt(parts[0], 10) || 0;
      minutes = parseInt(parts[1], 10) || 0;
    }
  }

  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return 0;
  return new Date(y, m - 1, d, hours, minutes, 0, 0).getTime() || 0;
};

export default function PatientTherapySessionPage({
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
  const [currentUserName, setCurrentUserName] = useState("Patient");

  useEffect(() => {
    let isCancelled = false;

    Promise.all([
      fetch("/api/auth/me").then((res) => res.json()).catch(() => null),
      fetch(`/api/therapy-sessions/${id}?_t=${Date.now()}`).then((res) => res.json())
    ])
      .then(([authData, sessionData]) => {
        if (isCancelled) return;

        if (sessionData && sessionData.success && sessionData.data) {
          const sess = sessionData.data;
          setSession(sess);

          // Resolve stable patient ID and Name
          const resolvedId = 
            authData?.user?.patientId || 
            authData?.user?.id || 
            (typeof sess.patientId === "object" ? sess.patientId?._id : sess.patientId) || 
            `patient_${sess._id}`;
          
          const resolvedName = 
            authData?.user?.name || 
            (typeof sess.patientId === "object" ? sess.patientId?.name : "Patient") || 
            "Patient";

          setCurrentUserId(String(resolvedId));
          setCurrentUserName(resolvedName);
        } else {
          setError(sessionData?.message || "Therapy session not found.");
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err.message || "Failed to load therapy session.");
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium">Entering confidential therapy room...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Session Unavailable</h2>
          <p className="text-muted-foreground text-sm">{error || "Unable to load session."}</p>
          <Button onClick={() => router.push("/patient/dashboard")} variant="outline" className="rounded-xl border-slate-700 text-slate-200">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (session.status === "Completed") {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Session Completed</h2>
          <p className="text-muted-foreground text-sm">
            This therapy session has concluded and was marked as completed by your therapist.
          </p>
          <Button onClick={() => router.push("/patient/dashboard")} className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isJoinable = (() => {
    if (!session.date || !session.time) return true;
    const sessionMs = parseDateTimeToMs(session.date, session.time);
    if (!sessionMs) return true;
    const now = new Date();
    const todayLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    if (session.date > todayLocal) return false;
    const diffMinutes = (sessionMs - Date.now()) / (1000 * 60);
    return diffMinutes <= 15 && diffMinutes >= -120;
  })();

  if (!isJoinable) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Session Not Started Yet</h2>
          <p className="text-muted-foreground text-sm">
            Your therapy session is scheduled for <span className="text-white font-semibold">{session.date}</span> at <span className="text-white font-semibold">{session.time}</span>. The video room opens 15 minutes before the session starts.
          </p>
          <Button onClick={() => router.push("/patient/dashboard")} className="rounded-xl bg-primary hover:bg-primary/90 text-white font-bold">
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const roomID = session.videoChannelName || `therapy_room_${session._id}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="h-16 px-4 sm:px-6 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/patient/dashboard")}
            className="text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-xs font-semibold gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Exit Room
          </Button>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-rose-400" />
            <h1 className="text-sm font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-none">{session.name}</h1>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] py-0 hidden xs:inline-flex">
              Encrypted Online Session
            </Badge>
          </div>
        </div>

        {/* Assigned Therapist Details */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-white">{session.therapistId?.name || "Assigned Therapist"}</p>
            <p className="text-[10px] text-slate-400">{session.therapistId?.specialization || "Licensed Psychologist"}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold border border-rose-500/30 overflow-hidden relative">
            {session.therapistId?.avatar ? (
              <img 
                src={session.therapistId.avatar} 
                alt="" 
                className="w-full h-full object-cover rounded-full" 
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : null}
            <span className={session.therapistId?.avatar ? "absolute -z-10" : ""}>
              {session.therapistId?.name ? session.therapistId.name.replace(/^Dr\.\s*/i, "").slice(0, 2).toUpperCase() : "TH"}
            </span>
          </div>
        </div>
      </header>

      {/* Main Video Call Viewport */}
      <div className="flex-1 relative w-full h-[calc(100vh-4rem)] overflow-hidden">
        {currentUserId && (
          <ZegoVideoCall
            roomID={roomID}
            userID={currentUserId}
            userName={currentUserName || "Patient"}
            onLeaveRoom={() => router.push("/patient/dashboard")}
          />
        )}
      </div>
    </div>
  );
}
