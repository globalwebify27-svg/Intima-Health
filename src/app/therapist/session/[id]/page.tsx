"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Shield, Video, Calendar, Clock, User, FileText, CheckCircle2, 
  Sparkles, Save, HeartHandshake, Eye, AlertCircle, StickyNote, ShieldCheck, Pill 
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
  const [patientConsultations, setPatientConsultations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"notes" | "doctor_history">("notes");

  useEffect(() => {
    let isCancelled = false;

    Promise.all([
      fetch("/api/auth/me").then((res) => res.json()).catch(() => null),
      fetch(`/api/therapy-sessions/${id}?_t=${Date.now()}`).then((res) => res.json())
    ])
      .then(([authData, sessionData]) => {
        if (isCancelled) return;

        if (authData && authData.success && authData.user) {
          if (authData.user.role !== "THERAPIST") {
            router.push("/staff-login");
            return;
          }
          const tId = authData.user.therapistId || authData.user.id || "therapist_user";
          const tName = authData.user.name || "Therapist";
          setCurrentUserId(String(tId));
          setCurrentUserName(tName);
        } else {
          router.push("/staff-login");
          return;
        }

        if (sessionData && sessionData.success && sessionData.data) {
          const sessData = sessionData.data;
          setSession(sessData);
          setNotes(sessData.therapistNotes || "");

          const pId = sessData.patientId?._id || sessData.patientId;
          if (pId) {
            fetch(`/api/consultations?patientId=${pId}&_t=${Date.now()}`)
              .then((r) => r.json())
              .then((cJson) => {
                if (!isCancelled && cJson?.success && Array.isArray(cJson.data)) {
                  setPatientConsultations(
                    cJson.data.filter((c: any) => c.status === "Completed" && (c.notes || c.prescriptionSummary))
                  );
                }
              })
              .catch((err) => console.warn("Failed to fetch doctor consultation notes:", err));
          }
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

  const handleExitOrConclude = () => {
    if (window.confirm("Would you like to conclude and complete this therapy session? Click OK to mark Completed & archive, or Cancel to exit without completing.")) {
      handleSaveNotes(true);
    } else {
      router.push("/therapist/dashboard");
    }
  };

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
          <p className="text-muted-foreground text-sm">{error || "Unable to load therapy room."}</p>
          <Button onClick={() => router.push("/therapist/dashboard")} variant="outline" className="rounded-xl border-slate-700 text-slate-200">
            Return to Therapist Dashboard
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
            onClick={handleExitOrConclude}
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
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-4rem)]">
        {/* Left: Video Call Room */}
        <div className="lg:col-span-8 bg-black relative flex flex-col h-full min-h-[450px] lg:min-h-0 overflow-hidden">
          {currentUserId && (
            <ZegoVideoCall
              roomID={roomID}
              userID={currentUserId}
              userName={currentUserName || "Therapist"}
              onLeaveRoom={handleExitOrConclude}
            />
          )}
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

          {/* Panel Navigation Tabs */}
          <div className="flex rounded-xl bg-slate-800 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                activeTab === "notes" ? "bg-primary text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              Session Notes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("doctor_history")}
              className={`flex-1 py-1.5 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === "doctor_history" ? "bg-primary text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              <StickyNote className="w-3.5 h-3.5" />
              Doctor Clinical Notes ({patientConsultations.length})
            </button>
          </div>

          {activeTab === "notes" ? (
            <>
              {/* Prescribing Doctor's Referral Notes */}
              {session.doctorId && (
                <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-2">
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
            </>
          ) : (
            <div className="flex-1 space-y-3">
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Shared Clinical Access: Reviewing consulting doctor notes for this patient.</span>
              </div>

              {patientConsultations.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-800 text-center text-xs text-slate-400">
                  No previous consultation notes on record for this patient.
                </div>
              ) : (
                patientConsultations.map((c) => {
                  let meds: any[] = [];
                  let therapies: any[] = [];
                  try { if (c.prescriptionSummary) meds = JSON.parse(c.prescriptionSummary); } catch {}
                  try { if (c.prescribedTherapies) therapies = JSON.parse(c.prescribedTherapies); } catch {}

                  return (
                    <div key={c._id} className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <StickyNote className="w-3.5 h-3.5 text-primary" />
                          {c.doctorId?.name ? `Dr. ${c.doctorId.name}` : "Consulting Doctor"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(c.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>

                      {c.notes && (
                        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                            Doctor Clinical Diagnosis & Advice:
                          </span>
                          <p className="text-slate-200 leading-relaxed whitespace-pre-wrap font-normal">
                            {c.notes}
                          </p>
                        </div>
                      )}

                      {meds.length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                            Prescribed Medications:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {meds.map((m: any, idx: number) => (
                              <Badge key={idx} variant="outline" className="border-slate-700 text-slate-300 text-[10px]">
                                {m.drug || m.name} {[m.dosage, m.duration].filter(Boolean).join(" • ")}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
