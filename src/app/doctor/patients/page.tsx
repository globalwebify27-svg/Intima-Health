"use client";

import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, FileText, FileSignature, Heart } from "lucide-react";
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
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0 sm:max-w-2xl border-l border-border/40 shadow-2xl">
          <div className="bg-primary/5 p-6 border-b border-border/50 sticky top-0 z-10 backdrop-blur-md">
            <SheetHeader>
              <SheetTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 text-primary rounded-xl shadow-sm border border-primary/10">
                  <FileText className="w-6 h-6" />
                </div>
                Patient Records
              </SheetTitle>
              {selectedPatientRecords && (
                <div className="mt-5 flex flex-col gap-1 text-sm text-muted-foreground bg-background p-5 rounded-2xl border border-primary/10 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-foreground text-xl tracking-tight">{selectedPatientRecords.name}</span>
                  </div>
                  <div className="flex items-center gap-5 mt-1 font-medium">
                    <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span> {selectedPatientRecords.phone}</span>
                    {selectedPatientRecords.email && <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span> {selectedPatientRecords.email}</span>}
                  </div>
                </div>
              )}
            </SheetHeader>
          </div>

          <div className="p-6 md:p-8 space-y-6 bg-slate-50/50 dark:bg-background/95 min-h-screen">
            <h3 className="font-bold text-lg flex items-center gap-2.5 text-foreground">
              Prescription History
              <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 bg-primary/10 text-primary border-primary/20 text-xs font-bold">
                {patientPrescriptions.length}
              </Badge>
            </h3>
            
            {loadingRecords ? (
              <div className="text-center py-16 text-muted-foreground animate-pulse">
                Loading medical records...
              </div>
            ) : patientPrescriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-background rounded-3xl border border-dashed border-border/60 text-center shadow-sm">
                <FileSignature className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground font-medium text-lg">No prescriptions on record.</p>
                <p className="text-sm text-muted-foreground/70 mt-1">Consultation history will appear here once issued.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {patientPrescriptions.map((record) => {
                  let parsedDrugs: any[] = [];
                  let parsedTherapies: any[] = [];
                  try { if (record.prescriptionSummary) parsedDrugs = JSON.parse(record.prescriptionSummary); } catch {}
                  try { if (record.prescribedTherapies) parsedTherapies = JSON.parse(record.prescribedTherapies); } catch {}

                  return (
                    <div key={record._id} className="relative p-5 sm:p-6 bg-background rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
                      {/* Decorative accent */}
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/30 group-hover:bg-primary transition-colors duration-300"></div>
                      
                      <div className="flex justify-between items-start mb-5">
                        <div className="flex items-center gap-3.5">
                          <div className="p-2.5 bg-primary/10 text-primary rounded-xl border border-primary/10">
                            <FileSignature className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-foreground text-base block tracking-tight">
                              {new Date(record.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5 block">
                              Prescription
                            </span>
                          </div>
                        </div>
                        {!record.appointmentId && (
                          <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-600 bg-amber-500/10 uppercase font-bold tracking-wider px-2 py-0.5">Walk-in</Badge>
                        )}
                      </div>

                      {parsedDrugs.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Medications</h4>
                          <div className="flex flex-wrap gap-2">
                            {parsedDrugs.map((d, idx) => (
                              <Badge key={idx} variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-1.5 font-semibold shadow-sm rounded-lg text-xs">
                                {d.drug} <span className="opacity-60 ml-1.5 font-medium">({d.dosage} • {d.duration})</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {parsedTherapies.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Therapies</h4>
                          <div className="flex flex-wrap gap-2">
                            {parsedTherapies.map((t, idx) => (
                              <Badge key={idx} variant="outline" className="bg-violet-500/5 border-violet-500/20 text-violet-700 px-3 py-1.5 font-semibold shadow-sm rounded-lg text-xs flex items-center gap-1.5">
                                <Heart className="w-3 h-3" />{t.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {record.notes && (
                        <div className="mt-5 pt-4 border-t border-border/50">
                          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">Clinical Notes</h4>
                          <p className="text-sm text-foreground bg-muted/30 p-4 rounded-xl border border-border/40 leading-relaxed">
                            {record.notes}
                          </p>
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
