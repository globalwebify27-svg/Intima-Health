"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  FileText, 
  FileSignature, 
  Heart,
  Calendar,
  Pill,
  StickyNote,
  Mail,
  Phone,
  Activity,
  Clock,
  ArrowLeft,
  Sparkles,
  Brain,
  ShieldCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
  totalVisits: number;
}

const getColumns = (onViewRecords: (patient: Patient) => void): ColumnDef<Patient>[] => [
  {
    accessorKey: "name",
    header: "Patient Name",
    cell: ({ row }) => <span className="font-bold">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "lastVisit",
    header: "Last Visit",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const patient = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-lg" onClick={() => onViewRecords(patient)}>
            <FileText className="w-4 h-4 mr-2" /> Records
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Records Modal state
  const [selectedPatientRecords, setSelectedPatientRecords] = useState<Patient | null>(null);
  const [patientPrescriptions, setPatientPrescriptions] = useState<any[]>([]);
  const [patientTherapySessions, setPatientTherapySessions] = useState<any[]>([]);
  const [recordsTab, setRecordsTab] = useState<"all" | "doctor" | "therapist">("all");
  const [loadingRecords, setLoadingRecords] = useState(false);

  const handleViewRecords = async (patient: Patient) => {
    setSelectedPatientRecords(patient);
    setLoadingRecords(true);
    setRecordsTab("all");
    try {
      const [consultRes, therapyRes] = await Promise.all([
        fetch(`/api/consultations?patientId=${patient._id}&_t=${Date.now()}`, { cache: "no-store" }),
        fetch(`/api/therapy-sessions?patientId=${patient._id}&_t=${Date.now()}`, { cache: "no-store" }),
      ]);

      const [consultJson, therapyJson] = await Promise.all([
        consultRes.json(),
        therapyRes.json(),
      ]);

      if (consultJson.success && Array.isArray(consultJson.data)) {
        const history = consultJson.data.filter((c: any) => 
          c.status === "Completed" && (c.notes || c.prescriptionSummary || c.prescribedTherapies)
        );
        history.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPatientPrescriptions(history);
      } else {
        setPatientPrescriptions([]);
      }

      if (therapyJson.success && Array.isArray(therapyJson.data)) {
        const tSessions = therapyJson.data.filter((s: any) => 
          s.therapistNotes || s.doctorNotes || s.status === "Completed"
        );
        tSessions.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPatientTherapySessions(tSessions);
      } else {
        setPatientTherapySessions([]);
      }
    } catch (err) {
      console.error("Failed to load records", err);
    } finally {
      setLoadingRecords(false);
    }
  };

  const columns = getColumns(handleViewRecords);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meJson = await meRes.json();
        if (!meJson.success || meJson.user.role !== "DOCTOR") {
          window.location.href = "/staff-login";
          return;
        }

        const dId = meJson.user.doctorId;
        if (dId) {
          const aptsRes = await fetch(`/api/appointments?doctorId=${dId}`);
          const aptsJson = await aptsRes.json();
          if (aptsJson.success) {
            const uniquePatientsMap = new Map<string, Patient>();
            
            // Sort ascending so the last one processed is the most recent
            const sortedApts = [...aptsJson.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            
            sortedApts.forEach((apt: any) => {
              if (apt.patientId && apt.patientId._id) {
                const existing = uniquePatientsMap.get(apt.patientId._id);
                if (existing) {
                  existing.lastVisit = apt.date;
                  existing.totalVisits += 1;
                } else {
                  uniquePatientsMap.set(apt.patientId._id, {
                    ...apt.patientId,
                    lastVisit: apt.date,
                    totalVisits: 1
                  });
                }
              }
            });
            
            // Sort patients by latest visit first
            const patientsList = Array.from(uniquePatientsMap.values()).sort((a, b) => 
              new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
            );
            
            setPatients(patientsList);
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

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (p.phone && p.phone.includes(searchTerm));
    const matchesDate = filterDate ? p.lastVisit === filterDate : true;
    return matchesSearch && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading patients directory...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Patients</h1>
          <p className="text-muted-foreground mt-2">
            View profiles and clinical records of patients assigned to you.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input 
            type="search" 
            placeholder="Search by name, email or phone..." 
            className="w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Input 
            type="date" 
            className="w-full sm:w-40"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>
      <DataTable columns={columns} data={filteredPatients} />

      {/* Patient Records Sheet */}
      <Sheet open={!!selectedPatientRecords} onOpenChange={(open) => !open && setSelectedPatientRecords(null)}>
        <SheetContent 
          side="right" 
          className="w-full sm:max-w-none md:w-[70vw] lg:w-[52vw] xl:w-[50vw] data-[side=right]:sm:max-w-none data-[side=right]:w-full data-[side=right]:md:w-[70vw] data-[side=right]:lg:w-[52vw] data-[side=right]:xl:w-[50vw] overflow-y-auto p-0 border-l border-border/40 shadow-2xl flex flex-col"
        >
          {/* Sticky Header with Patient Identity */}
          <div className="bg-gradient-to-b from-primary/10 via-primary/5 to-transparent p-4 sm:p-7 border-b border-border/50 sticky top-0 z-10 backdrop-blur-md">
            <SheetHeader>
              <div className="flex items-center justify-between gap-3 pr-8">
                <div className="flex items-center gap-2.5">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedPatientRecords(null)} 
                    className="h-9 px-3 rounded-xl text-xs font-bold gap-1.5 text-foreground hover:bg-muted border-border/80 shadow-xs flex items-center shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4 text-primary" /> Back
                  </Button>
                  <SheetTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2.5 truncate">
                    <div className="p-2 bg-primary/10 text-primary rounded-xl shadow-sm border border-primary/20 hidden sm:flex shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span>Patient Records</span>
                  </SheetTitle>
                </div>
              </div>

              {selectedPatientRecords && (
                <div className="mt-4 bg-background/95 backdrop-blur-sm p-4 sm:p-5 rounded-2xl border border-primary/15 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary font-bold text-base flex items-center justify-center shrink-0 border border-primary/20">
                        {selectedPatientRecords.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-foreground text-xl tracking-tight block">
                          {selectedPatientRecords.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Patient ID: <span className="font-mono text-foreground font-medium">{selectedPatientRecords._id.slice(-6).toUpperCase()}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="px-3 py-1 bg-primary/5 text-primary border-primary/20 font-bold text-xs gap-1.5 rounded-xl">
                        <Clock className="w-3.5 h-3.5" />
                        {patientPrescriptions.length + patientTherapySessions.length} Shared Clinical Records
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-5 pt-2 border-t border-border/50 text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-2 text-foreground/80">
                      <Phone className="w-3.5 h-3.5 text-primary" />
                      {selectedPatientRecords.phone}
                    </span>
                    {selectedPatientRecords.email && (
                      <span className="flex items-center gap-2 text-foreground/80">
                        <Mail className="w-3.5 h-3.5 text-primary" />
                        {selectedPatientRecords.email}
                      </span>
                    )}
                    {selectedPatientRecords.lastVisit && (
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        Last Visit: <strong className="text-foreground">{selectedPatientRecords.lastVisit}</strong>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </SheetHeader>
          </div>

          {/* Main Records Container */}
          <div className="p-6 md:p-8 space-y-6 bg-slate-50/50 dark:bg-background/95 flex-1 min-h-[500px]">
            {/* Shared Access Banner */}
            <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/15 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span className="text-foreground/90 font-medium">
                  <strong>Shared Clinical Record:</strong> Complete clinical visibility across Doctor Consultation Notes and Therapist Clinical Documentation.
                </span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2.5 text-foreground">
                  Clinical Notes & History
                  <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 bg-primary/10 text-primary border-primary/20 text-xs font-bold">
                    {patientPrescriptions.length + patientTherapySessions.length}
                  </Badge>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Unified clinical notes from consultations and therapy sessions.
                </p>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-xl border border-border/60">
                <button
                  type="button"
                  onClick={() => setRecordsTab("all")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    recordsTab === "all"
                      ? "bg-background text-primary shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All ({patientPrescriptions.length + patientTherapySessions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRecordsTab("doctor")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    recordsTab === "doctor"
                      ? "bg-background text-primary shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Doctor ({patientPrescriptions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setRecordsTab("therapist")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    recordsTab === "therapist"
                      ? "bg-background text-primary shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Therapist ({patientTherapySessions.length})
                </button>
              </div>
            </div>
            
            {loadingRecords ? (
              <div className="text-center py-20 text-muted-foreground animate-pulse space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                  <FileText className="w-6 h-6 animate-pulse" />
                </div>
                <p className="font-medium text-sm">Loading medical history & clinical records...</p>
              </div>
            ) : (patientPrescriptions.length === 0 && patientTherapySessions.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-20 bg-background rounded-3xl border border-dashed border-border/70 text-center shadow-sm p-6">
                <FileSignature className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-bold text-base">No clinical records found</p>
                <p className="text-xs text-muted-foreground/70 mt-1 max-w-sm">
                  Consultation diagnosis, prescriptions, and therapy session notes will automatically appear here once documented.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 1. Therapist Clinical Session Notes */}
                {(recordsTab === "all" || recordsTab === "therapist") && patientTherapySessions.map((sess) => (
                  <div
                    key={sess._id}
                    className="relative p-5 sm:p-6 bg-background rounded-3xl border border-violet-500/30 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden space-y-4"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-500" />

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 rounded-2xl border border-violet-500/20 shadow-xs">
                          <Brain className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground text-base tracking-tight">
                              {sess.name}
                            </span>
                            <Badge className="bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30 text-[10px] font-bold">
                              Therapist Clinical Note
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Therapist: <strong className="text-foreground">{sess.therapistId?.name || "Therapist"}</strong>
                            {sess.date && ` • ${sess.date}`}
                            {sess.time && ` at ${sess.time}`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg">
                          {sess.selectedMode || sess.recommendedMode || "Online"} Mode
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] font-bold">
                          {sess.status}
                        </Badge>
                      </div>
                    </div>

                    {/* Therapist Clinical Documentation */}
                    {sess.therapistNotes ? (
                      <div className="p-4 rounded-2xl bg-violet-500/[0.04] border border-violet-500/20 space-y-1.5">
                        <h4 className="text-[11px] font-bold text-violet-700 dark:text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
                          <StickyNote className="w-3.5 h-3.5" />
                          Therapist Observations & Interventions
                        </h4>
                        <p className="text-sm text-foreground leading-relaxed font-normal whitespace-pre-wrap">
                          {sess.therapistNotes}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No session documentation recorded yet.</p>
                    )}

                    {/* Doctor Referral Guidance */}
                    {sess.doctorNotes && (
                      <div className="p-3 rounded-xl bg-muted/30 border border-border/60 text-xs text-muted-foreground">
                        <span className="font-bold text-primary block mb-0.5 text-[11px] uppercase">
                          Doctor Referral Guidance:
                        </span>
                        <p className="italic">"{sess.doctorNotes}"</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* 2. Doctor Consultation Clinical Notes & Prescriptions */}
                {(recordsTab === "all" || recordsTab === "doctor") && patientPrescriptions.map((record) => {
                  let parsedDrugs: any[] = [];
                  let parsedTherapies: any[] = [];
                  try { if (record.prescriptionSummary) parsedDrugs = JSON.parse(record.prescriptionSummary); } catch {}
                  try { if (record.prescribedTherapies) parsedTherapies = JSON.parse(record.prescribedTherapies); } catch {}

                  const hasDrugs = parsedDrugs.length > 0;
                  const hasTherapies = parsedTherapies.length > 0;
                  const isTwoColumn = hasDrugs && hasTherapies;

                  return (
                    <div 
                      key={record._id} 
                      className="relative p-5 sm:p-6 bg-background rounded-3xl border border-primary/30 shadow-xs hover:shadow-md transition-all duration-300 overflow-hidden group space-y-5"
                    >
                      {/* Decorative accent bar */}
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                      
                      {/* Prescription Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
                        <div className="flex items-center gap-3.5">
                          <div className="p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/15 shadow-xs">
                            <FileSignature className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground text-base block tracking-tight">
                                {new Date(record.createdAt).toLocaleDateString("en-US", { 
                                  month: "long", 
                                  day: "numeric", 
                                  year: "numeric" 
                                })}
                              </span>
                              <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] font-bold">
                                Doctor Clinical Note
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground mt-0.5 block">
                              Doctor: <strong className="text-foreground">{record.doctorId?.name ? `Dr. ${record.doctorId.name}` : "Consulting Doctor"}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {!record.appointmentId ? (
                            <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-700 bg-amber-500/10 uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg">
                              Walk-in Consultation
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-700 bg-emerald-500/10 uppercase font-bold tracking-wider px-2.5 py-1 rounded-lg">
                              Appointment Consultation
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Clinical Diagnosis & Notes Section */}
                      {record.notes && (
                        <div className="p-4 rounded-2xl bg-primary/[0.04] border border-primary/20 space-y-1.5">
                          <h4 className="text-[11px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                            <StickyNote className="w-3.5 h-3.5" />
                            Doctor Clinical Diagnosis & Notes
                          </h4>
                          <div className="text-sm text-foreground leading-relaxed font-normal whitespace-pre-wrap">
                            {record.notes}
                          </div>
                        </div>
                      )}

                      {/* Content Grid: Side-by-side on wide drawer */}
                      {(hasDrugs || hasTherapies) && (
                        <div className={`grid gap-4 ${isTwoColumn ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
                          {/* Medications Section */}
                          {hasDrugs && (
                            <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-2.5">
                              <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                                <Pill className="w-3.5 h-3.5 text-primary" />
                                Prescribed Medications ({parsedDrugs.length})
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {parsedDrugs.map((d, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-background border border-primary/20 px-3 py-2 rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2"
                                  >
                                    <span className="text-foreground font-bold">{d.drug}</span>
                                    {(d.dosage || d.duration) && (
                                      <span className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-md font-medium">
                                        {[d.dosage, d.duration].filter(Boolean).join(" • ")}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Therapies Section */}
                          {hasTherapies && (
                            <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/15 space-y-2.5">
                              <h4 className="text-[11px] font-bold text-violet-700 dark:text-violet-400 uppercase tracking-widest flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5" />
                                Recommended Therapies ({parsedTherapies.length})
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {parsedTherapies.map((t, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="bg-background border-violet-500/30 text-violet-800 dark:text-violet-300 px-3 py-1.5 font-bold shadow-xs rounded-xl text-xs flex items-center gap-1.5"
                                  >
                                    <Heart className="w-3.5 h-3.5 text-violet-500 fill-violet-500/20" />
                                    {t.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
