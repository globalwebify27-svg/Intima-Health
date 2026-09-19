"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";
import { ZegoVideoCall } from "@/components/consultations/ZegoVideoCall";

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
}

interface Consultation {
  _id: string;
  appointmentId: any;
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

  const [activeConsultation, setActiveConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchConsultations = async (pId: string) => {
    try {
      const res = await fetch(`/api/consultations?patientId=${pId}&_t=${Date.now()}`, { cache: "no-store" });
      const resData = await res.json();
      if (resData.success) {
        const list: Consultation[] = resData.data || [];

        // Always prioritize the consultation linked to the appointmentId from URL
        let active: Consultation | undefined;
        if (targetAptId) {
          active = list.find(c => {
            const aptId = (c.appointmentId as any)?._id || c.appointmentId;
            return String(aptId) === targetAptId;
          });
        }
        // Fallback: find active/pending if no URL param or no match
        if (!active) {
          active = list.find(c => c.status === "Active");
        }
        if (!active) {
          active = list.find(c => c.status === "Pending");
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
      <div className="w-full h-full flex flex-col items-center justify-center relative pt-24 pb-8 px-8">
        <div className="w-full h-[80vh] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 relative shadow-2xl">
          <ZegoVideoCall 
            roomID={activeConsultation.videoChannelName}
            userID={activeConsultation.patientId && typeof activeConsultation.patientId === 'object' ? (activeConsultation.patientId as any)._id : String(activeConsultation.patientId) || `patient-stable-id`}
            userName="Patient"
            onLeaveRoom={handleEndCall}
            onJoinRoom={async () => {
              const aptId = (activeConsultation.appointmentId as any)?._id || activeConsultation.appointmentId;
              if (aptId) {
                try {
                  await fetch(`/api/appointments/${aptId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "Checked In" }),
                  });
                } catch (err) {
                  console.error("Failed to update status to Checked In", err);
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
