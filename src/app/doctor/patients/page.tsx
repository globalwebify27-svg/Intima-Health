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
  Clock
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
  const [loadingRecords, setLoadingRecords] = useState(false);

  const handleViewRecords = async (patient: Patient) => {
    setSelectedPatientRecords(patient);
    setLoadingRecords(true);
    try {
      // Fetch all completed consultations and filter by patient id
      const res = await fetch(`/api/consultations?_t=${Date.now()}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        const history = json.data.filter((c: any) => 
          c.status === "Completed" && 
          c.prescriptionSummary && 
          c.patientId?._id === patient._id
        );
        // Sort history by date descending
        history.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPatientPrescriptions(history);
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
          <div className="bg-gradient-to-b from-primary/10 via-primary/5 to-transparent p-6 sm:p-7 border-b border-border/50 sticky top-0 z-10 backdrop-blur-md">
            <SheetHeader>
              <div className="flex items-center justify-between pr-8">
                <SheetTitle className="text-2xl font-bold flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl shadow-sm border border-primary/20">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span>Patient Records</span>
                </SheetTitle>
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
                        {patientPrescriptions.length} {patientPrescriptions.length === 1 ? "Record" : "Records"} Found
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2.5 text-foreground">
                  Prescription History
                  <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 bg-primary/10 text-primary border-primary/20 text-xs font-bold">
                    {patientPrescriptions.length}
                  </Badge>
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Chronological history of prescribed medications, recommended therapies, and doctor notes.
                </p>
              </div>
            </div>
            
            {loadingRecords ? (
              <div className="text-center py-20 text-muted-foreground animate-pulse space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary mx-auto flex items-center justify-center">
                  <FileText className="w-6 h-6 animate-pulse" />
                </div>
                <p className="font-medium text-sm">Loading medical history & clinical records...</p>
              </div>
            ) : patientPrescriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-background rounded-3xl border border-dashed border-border/70 text-center shadow-sm p-6">
                <FileSignature className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-bold text-base">No prescriptions on record</p>
                <p className="text-xs text-muted-foreground/70 mt-1 max-w-sm">
                  Consultation records, medications, and therapy regimens will automatically appear here once issued.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {patientPrescriptions.map((record) => {
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
                      className="relative p-5 sm:p-6 bg-background rounded-3xl border border-border/80 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group space-y-5"
                    >
                      {/* Decorative accent bar */}
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/30 group-hover:bg-primary transition-colors duration-300" />
                      
                      {/* Prescription Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/60">
                        <div className="flex items-center gap-3.5">
                          <div className="p-2.5 bg-primary/10 text-primary rounded-2xl border border-primary/15 shadow-xs">
                            <FileSignature className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-foreground text-base block tracking-tight">
                              {new Date(record.createdAt).toLocaleDateString("en-US", { 
                                month: "long", 
                                day: "numeric", 
                                year: "numeric" 
                              })}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5 block">
                              Prescription Issued
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

                      {/* Clinical Notes Section */}
                      {record.notes && (
                        <div className="pt-2">
                          <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <StickyNote className="w-3.5 h-3.5 text-primary" />
                            Clinical Notes & Observations
                          </h4>
                          <div className="text-sm text-foreground bg-primary/[0.03] dark:bg-muted/30 p-4 sm:p-5 rounded-2xl border border-border/70 leading-relaxed font-normal whitespace-pre-wrap">
                            {record.notes}
                          </div>
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
