"use client";

import { useEffect, useState } from "react";
import { Users, Search, Phone, Mail, Calendar, FileText, ChevronRight, Shield, X, StickyNote, Brain, Pill, Activity, ShieldCheck, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PatientCardData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  age?: number;
  sessionsCount: number;
  lastSessionDate?: string;
  sessions: any[];
}

export default function TherapistPatientsPage() {
  const [patients, setPatients] = useState<PatientCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientCardData | null>(null);
  const [patientConsultations, setPatientConsultations] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyTab, setHistoryTab] = useState<"all" | "doctor" | "therapist">("all");

  const handleOpenPatient = async (patient: PatientCardData) => {
    setSelectedPatient(patient);
    setLoadingHistory(true);
    setHistoryTab("all");
    try {
      const [consultRes, sessionsRes] = await Promise.all([
        fetch(`/api/consultations?patientId=${patient._id}&_t=${Date.now()}`),
        fetch(`/api/therapy-sessions?patientId=${patient._id}&_t=${Date.now()}`),
      ]);
      const [consultJson, sessionsJson] = await Promise.all([
        consultRes.json(),
        sessionsRes.json(),
      ]);

      if (consultJson.success && Array.isArray(consultJson.data)) {
        const sortedConsults = consultJson.data.filter((c: any) => 
          c.status === "Completed" && (c.notes || c.prescriptionSummary || c.prescribedTherapies)
        );
        sortedConsults.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPatientConsultations(sortedConsults);
      } else {
        setPatientConsultations([]);
      }

      if (sessionsJson.success && Array.isArray(sessionsJson.data)) {
        const sortedSessions = sessionsJson.data.filter((s: any) => 
          s.therapistNotes || s.doctorNotes || s.status === "Completed"
        );
        sortedSessions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        patient.sessions = sortedSessions;
      }
    } catch (e) {
      console.error("Error fetching patient clinical history:", e);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meJson = await meRes.json();
        if (!meJson.success || meJson.user.role !== "THERAPIST") {
          window.location.href = "/staff-login";
          return;
        }

        const tId = meJson.user.therapistId;
        if (tId) {
          // Fetch all therapy sessions for this therapist
          const sessionsRes = await fetch(`/api/therapy-sessions?therapistId=${tId}&_t=${Date.now()}`);
          const sessionsJson = await sessionsRes.json();
          if (sessionsJson.success && Array.isArray(sessionsJson.data)) {
            // Group by patientId
            const map = new Map<string, PatientCardData>();
            for (const s of sessionsJson.data) {
              const p = s.patientId;
              if (!p || !p._id) continue;
              if (!map.has(p._id)) {
                map.set(p._id, {
                  _id: p._id,
                  name: p.name || "Patient",
                  email: p.email || "",
                  phone: p.phone,
                  gender: p.gender,
                  age: p.age,
                  sessionsCount: 0,
                  sessions: [],
                });
              }
              const item = map.get(p._id)!;
              item.sessionsCount += 1;
              item.sessions.push(s);
              if (s.date && (!item.lastSessionDate || s.date > item.lastSessionDate)) {
                item.lastSessionDate = s.date;
              }
            }
            setPatients(Array.from(map.values()));
          }
        }
      } catch (err) {
        console.error("Error fetching patients:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone && p.phone.includes(search))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My Assigned Patients</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Confidential medical records for patients under your active therapeutic care.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search here..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-card focus:outline-none focus:border-primary font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Loading patient records...</div>
      ) : filteredPatients.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-3xl border border-border">
          <Users className="w-10 h-10 mx-auto text-muted-foreground/50 mb-2" />
          <h3 className="font-bold text-sm text-foreground">No assigned patients found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Patients allotted to your schedule will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((patient) => (
            <div
              key={patient._id}
              className="p-5 bg-card rounded-2xl border border-border/80 hover:border-primary/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {patient.name.substring(0, 2).toUpperCase()}
                  </div>
                  <Badge variant="outline" className="text-[10px] font-semibold border-primary/20 text-primary">
                    {patient.sessionsCount} {patient.sessionsCount === 1 ? "Session" : "Sessions"}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-bold text-base text-foreground">{patient.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {patient.gender || "Patient"} • {patient.age ? `${patient.age} yrs` : "Adult"}
                  </p>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground pt-1 border-t border-border/50">
                  {patient.email && (
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                  )}
                  {patient.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span>{patient.phone}</span>
                    </div>
                  )}
                  {patient.lastSessionDate && (
                    <div className="flex items-center gap-2 pt-1">
                      <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="text-[11px] font-medium text-foreground">
                        Last Session: {patient.lastSessionDate}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOpenPatient(patient)}
                  className="rounded-xl text-xs font-semibold gap-1.5 h-8 w-full"
                >
                  <FileText className="w-3.5 h-3.5 text-primary" /> View Clinical History
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Patient Clinical History Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-border max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Shared Clinical Health Records
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Patient: <strong className="text-foreground">{selectedPatient.name}</strong> • {selectedPatient.gender || "Patient"} • {selectedPatient.phone || selectedPatient.email}
                </p>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="w-7 h-7 rounded-full bg-muted/40 hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Shared Access Banner */}
            <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 flex items-center gap-2.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span className="text-foreground/90 font-medium">
                <strong>Shared Clinical Record:</strong> Therapists and doctors share visibility of doctor diagnosis notes and therapy session observations.
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between gap-2 border-b border-border/70 pb-2">
              <span className="text-xs font-bold text-foreground">
                Clinical History ({patientConsultations.length + (selectedPatient.sessions?.length || 0)})
              </span>

              <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/60 text-xs">
                <button
                  type="button"
                  onClick={() => setHistoryTab("all")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    historyTab === "all" ? "bg-background text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All ({patientConsultations.length + (selectedPatient.sessions?.length || 0)})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryTab("doctor")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    historyTab === "doctor" ? "bg-background text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Doctor ({patientConsultations.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryTab("therapist")}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    historyTab === "therapist" ? "bg-background text-primary shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Therapy ({selectedPatient.sessions?.length || 0})
                </button>
              </div>
            </div>

            {loadingHistory ? (
              <div className="text-center py-10 text-muted-foreground text-xs animate-pulse">
                Loading shared clinical records & consultation notes...
              </div>
            ) : (patientConsultations.length === 0 && (!selectedPatient.sessions || selectedPatient.sessions.length === 0)) ? (
              <div className="text-center py-10 text-muted-foreground text-xs">
                No clinical documentation recorded yet for this patient.
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. Doctor Consultation Notes */}
                {(historyTab === "all" || historyTab === "doctor") && patientConsultations.map((consult) => {
                  let parsedMeds: any[] = [];
                  let parsedTherapies: any[] = [];
                  try { if (consult.prescriptionSummary) parsedMeds = JSON.parse(consult.prescriptionSummary); } catch {}
                  try { if (consult.prescribedTherapies) parsedTherapies = JSON.parse(consult.prescribedTherapies); } catch {}

                  return (
                    <div key={consult._id} className="p-4 rounded-2xl bg-primary/[0.03] border border-primary/25 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] font-bold">
                            Doctor Clinical Note
                          </Badge>
                          <span className="font-bold text-foreground">
                            {consult.doctorId?.name ? `Dr. ${consult.doctorId.name}` : "Doctor"}
                          </span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(consult.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>

                      {/* Doctor Clinical Diagnosis & Notes */}
                      {consult.notes && (
                        <div className="p-3 rounded-xl bg-background border border-primary/20 space-y-1">
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                            <StickyNote className="w-3 h-3" /> Doctor Diagnosis & Clinical Notes:
                          </span>
                          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                            {consult.notes}
                          </p>
                        </div>
                      )}

                      {/* Prescribed Medications */}
                      {parsedMeds.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/50 space-y-1.5">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                            <Pill className="w-3 h-3 text-primary" /> Prescribed Medications:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {parsedMeds.map((m: any, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 rounded-md bg-background border border-border text-[11px] font-medium text-foreground">
                                {m.drug || m.name} {[m.dosage, m.duration].filter(Boolean).join(" • ")}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommended Therapies */}
                      {parsedTherapies.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold text-violet-700 dark:text-violet-400 uppercase tracking-wider">
                            Recommended Therapies:
                          </span>
                          {parsedTherapies.map((t: any, idx: number) => (
                            <Badge key={idx} variant="outline" className="border-violet-500/30 text-violet-800 dark:text-violet-300 text-[10px]">
                              {t.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 2. Therapy Sessions Documentation */}
                {(historyTab === "all" || historyTab === "therapist") && selectedPatient.sessions.map((sess) => (
                  <div key={sess._id} className="p-4 rounded-2xl bg-muted/20 border border-violet-500/30 text-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30 text-[10px] font-bold">
                          Therapist Clinical Session
                        </Badge>
                        <span className="font-bold text-foreground">{sess.name}</span>
                      </div>
                      <Badge variant={sess.status === "Completed" ? "default" : "secondary"} className="text-[9px]">
                        {sess.status}
                      </Badge>
                    </div>

                    <div className="flex justify-between text-muted-foreground text-[11px]">
                      <span>Therapist: <strong className="text-foreground">{sess.therapistId?.name || "Therapist"}</strong></span>
                      <span>Mode: <strong className="text-foreground">{sess.selectedMode || "Online"}</strong> • {sess.date || "Not scheduled"}</span>
                    </div>

                    {sess.doctorNotes && (
                      <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/20 text-[11px] text-muted-foreground">
                        <span className="font-bold text-primary block text-[10px] uppercase mb-0.5">Doctor Guidance:</span>
                        <p className="italic">"{sess.doctorNotes}"</p>
                      </div>
                    )}

                    {sess.therapistNotes && (
                      <div className="p-3 rounded-xl bg-background border border-border text-[11px] text-foreground leading-relaxed space-y-1">
                        <strong className="block text-violet-700 dark:text-violet-400 text-[10px] uppercase font-bold flex items-center gap-1">
                          <Brain className="w-3 h-3" /> Therapist Clinical Observations:
                        </strong>
                        <p className="whitespace-pre-wrap">{sess.therapistNotes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-border flex justify-end">
              <Button
                variant="outline"
                className="rounded-xl text-xs px-6"
                onClick={() => setSelectedPatient(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
