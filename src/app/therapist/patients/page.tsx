"use client";

import { useEffect, useState } from "react";
import { Users, Search, Phone, Mail, Calendar, FileText, ChevronRight, Shield, X } from "lucide-react";
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
          placeholder="Search by name, email, or phone..."
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
                  onClick={() => setSelectedPatient(patient)}
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
          <div className="bg-background rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-border max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Patient Therapy Records
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {selectedPatient.name} • {selectedPatient.gender}
                </p>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="w-7 h-7 rounded-full bg-muted/40 hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <span className="text-xs font-bold text-foreground block">
                Session History ({selectedPatient.sessions.length})
              </span>

              {selectedPatient.sessions.map((sess) => (
                <div key={sess._id} className="p-3.5 rounded-2xl bg-muted/20 border border-border text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{sess.name}</span>
                    <Badge variant={sess.status === "Completed" ? "default" : "secondary"} className="text-[9px]">
                      {sess.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-[11px]">
                    <span>Mode: <strong className="text-foreground">{sess.selectedMode || "Online"}</strong></span>
                    <span>Date: {sess.date || "Not scheduled"}</span>
                  </div>

                  {sess.doctorNotes && (
                    <div className="p-2 rounded-xl bg-primary/5 border border-primary/20 text-[11px] text-muted-foreground italic">
                      Doctor Referral: "{sess.doctorNotes}"
                    </div>
                  )}

                  {sess.therapistNotes && (
                    <div className="p-2 rounded-xl bg-background border border-border text-[11px] text-foreground leading-relaxed">
                      <strong className="block text-primary text-[10px] uppercase font-bold mb-0.5">Your Clinical Notes:</strong>
                      {sess.therapistNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border mt-4">
              <Button
                variant="outline"
                className="w-full rounded-xl text-xs"
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
