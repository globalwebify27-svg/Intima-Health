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
    // 1. Fetch current user session
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUserId(data.user.id || data.user.patientId || "patient_user");
          setCurrentUserName(data.user.name || "Patient");
        }
      })
      .catch((err) => console.error("Error loading auth session:", err));

    // 2. Fetch therapy session details
    fetch(`/api/therapy-sessions/${id}?_t=${Date.now()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSession(data.data);
        } else {
          setError(data.message || "Therapy session not found.");
        }
      })
      .catch((err) => setError(err.message || "Failed to load therapy session."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
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
        <p className="text-muted-foreground text-sm">{error || "Unable to load session."}</p>
        <Button onClick={() => router.push("/patient/dashboard")} variant="outline" className="rounded-xl">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const roomID = session.videoChannelName || `therapy_room_${session._id}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="h-16 px-4 sm:px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between z-20">
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
            <h1 className="text-sm font-bold text-white tracking-wide">{session.name}</h1>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] py-0">
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
          <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold border border-rose-500/30">
            {session.therapistId?.name ? session.therapistId.name.slice(0, 2).toUpperCase() : "TH"}
          </div>
        </div>
      </header>

      {/* Main Video Call Viewport */}
      <div className="flex-1 relative w-full h-[calc(100vh-4rem)]">
        <ZegoVideoCall
          roomID={roomID}
          userID={currentUserId || "patient_anonymous"}
          userName={currentUserName || "Patient"}
          onLeaveRoom={() => router.push("/patient/dashboard")}
        />
      </div>
    </div>
  );
}
