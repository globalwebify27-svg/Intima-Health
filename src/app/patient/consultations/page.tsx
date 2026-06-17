"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Video, VideoOff, Mic, MicOff, ScreenShare, PhoneOff, 
  User, Calendar, Clock, ChevronRight, Heart, ShieldCheck 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
}

interface Consultation {
  _id: string;
  appointmentId: {
    _id?: string;
    date: string;
    time: string;
    type?: string;
  };
  patientId: any;
  doctorId: Doctor;
  videoChannelName: string;
  status: "Pending" | "Active" | "Completed";
  notes?: string;
  createdAt: string;
}

export default function PatientConsultationsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium">Loading consultation room...</p>
      </div>
    }>
      <ConsultationRoomContent />
    </Suspense>
  );
}

function ConsultationRoomContent() {
  const searchParams = useSearchParams();
  const targetAptId = searchParams.get("appointmentId");

  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [activeConsultation, setActiveConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Video Room Controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const fetchConsultations = async (pId: string) => {
    try {
      const res = await fetch(`/api/consultations?patientId=${pId}&_t=${Date.now()}`, { cache: "no-store" });
      const resData = await res.json();
      if (resData.success) {
        const list: Consultation[] = resData.data || [];
        setConsultations(list);

        // Find the active or pending consultation
        let active = list.find(c => c.status === "Active");
        if (!active) {
          active = list.find(c => c.status === "Pending");
        }
        
        if (targetAptId) {
          const match = list.find(c => c.appointmentId?._id === targetAptId);
          if (match) active = match;
        }

        if (active) {
          setActiveConsultation(active);
        }
      } else {
        throw new Error(resData.message || "Failed to load consultations.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch consultation details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && data.user.patientId) {
          fetchConsultations(data.user.patientId);
        } else {
          window.location.href = "/login";
        }
      })
      .catch((err) => {
        console.error(err);
        window.location.href = "/login";
      });
  }, []);

  const handleEndCall = () => {
    window.location.href = "/patient/dashboard";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-medium">Entering secure server room...</p>
      </div>
    );
  }

  if (error || !activeConsultation) {
    return (
      <div className="max-w-md mx-auto my-12 text-center p-8 bg-card border border-border shadow-xl rounded-3xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto border border-destructive/20">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-foreground">No Active Consultation</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            There is no active video consultation session scheduled right now, or the doctor hasn't started the session yet. Please check your appointments page.
          </p>
        </div>
        <Button onClick={() => window.location.href = "/patient/dashboard"} className="w-full rounded-xl">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col justify-between overflow-hidden">
      {/* Header Overlay */}
      <div className="absolute top-6 left-6 z-10 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm border border-primary/30">
          Dr
        </div>
        <div>
          <h4 className="text-white text-sm font-bold">Dr. {activeConsultation.doctorId?.name || "Specialist"}</h4>
          <p className="text-[10px] text-primary font-semibold">{activeConsultation.doctorId?.specialization || "Clinician Practitioner"}</p>
        </div>
      </div>

      <div className="absolute top-6 right-6 z-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
        <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Secure Video Room</span>
      </div>

      {/* Main Video Stream Window */}
      <div className="w-full h-full flex flex-col md:flex-row gap-4 items-center justify-center p-8 relative">
        
        {/* Doctor video feed */}
        <div className="w-full md:w-[70%] h-[75vh] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 relative shadow-2xl">
          <div className="absolute bottom-4 left-4 z-10 bg-black/60 px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Live Doctor Feed
          </div>
          
          {/* Simulated doctor stream */}
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-950">
            <User className="w-24 h-24 text-slate-700 animate-pulse mb-3" />
            <p className="text-xs text-slate-500 font-bold tracking-wider">Awaiting specialist connection...</p>
            <p className="text-[10px] text-slate-600">The doctor will join you shortly.</p>
          </div>
        </div>

        {/* Self Video Stream (Floating) */}
        <div className="absolute bottom-28 right-12 w-40 h-52 rounded-2xl border-2 border-slate-700 overflow-hidden bg-slate-900 shadow-2xl z-20 hidden md:block">
          <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-0.5 rounded-lg text-white text-[9px] font-bold">
            You (Patient)
          </div>
          {isCamOn ? (
            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
              <User className="w-12 h-12 text-slate-600" />
            </div>
          ) : (
            <div className="w-full h-full bg-slate-950 flex items-center justify-center text-[10px] text-slate-500 font-bold">
              Camera Off
            </div>
          )}
        </div>
      </div>

      {/* Control Bar Overlay */}
      <div className="flex flex-col items-center gap-2 py-6 z-10 bg-gradient-to-t from-slate-950 to-transparent">
        <div className="flex items-center justify-center gap-4">
          <Button 
            onClick={() => setIsMicOn(!isMicOn)}
            className={`rounded-full w-12 h-12 flex items-center justify-center p-0 ${
              isMicOn ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-red-600 hover:bg-red-500 text-white"
            }`}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>
          
          <Button 
            onClick={() => setIsCamOn(!isCamOn)}
            className={`rounded-full w-12 h-12 flex items-center justify-center p-0 ${
              isCamOn ? "bg-slate-800 hover:bg-slate-700 text-white" : "bg-red-600 hover:bg-red-500 text-white"
            }`}
          >
            {isCamOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>

          <Button 
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`rounded-full w-12 h-12 flex items-center justify-center p-0 ${
              isScreenSharing ? "bg-primary text-white" : "bg-slate-800 hover:bg-slate-700 text-white"
            }`}
          >
            <ScreenShare className="w-5 h-5" />
          </Button>

          <Button 
            onClick={handleEndCall}
            className="rounded-full w-12 h-12 bg-red-600 hover:bg-red-500 text-white flex items-center justify-center p-0"
          >
            <PhoneOff className="w-5 h-5" />
          </Button>
        </div>
        <p className="text-[9px] text-slate-500 mt-1">Encrypted peer-to-peer connection • Powered by Intima Health</p>
      </div>
    </div>
  );
}
