"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  FileText,
  AlertCircle,
  Calendar,
  Smile
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PatientData {
  _id: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  dob?: string;
  allergies?: string;
  medicalHistory?: string;
  _latestVisit?: Date;
}

interface AppointmentData {
  patientId?: PatientData;
}

export default function PatientsPage() {
  const router = useRouter();
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDate]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meJson = await meRes.json();
        if (!meJson.success || meJson.user.role !== "CLINIC_MANAGER") {
          router.push("/staff-login");
          return;
        }
        
        const cId = meJson.user.clinicId;
        setClinicId(cId);

        if (cId) {
          const res = await fetch(`/api/appointments?clinicId=${cId}`);
          const json = await res.json();
          if (json.success) {
            // Extract unique patients in-memory and track latest visit
            const patientMap = new Map<string, { patient: PatientData; latestVisit: Date }>();
            json.data.forEach((apt: any) => {
              if (apt.patientId && apt.patientId._id) {
                // Determine visit timestamp
                let visitDate = new Date(0); // Epoch as fallback
                if (apt.date && apt.time) {
                  visitDate = new Date(`${apt.date}T${apt.time}:00`);
                }
                
                const existing = patientMap.get(apt.patientId._id);
                if (!existing || existing.latestVisit < visitDate) {
                  patientMap.set(apt.patientId._id, { 
                    patient: apt.patientId, 
                    latestVisit: visitDate 
                  });
                }
              }
            });
            
            // Sort by latest visit (descending)
            const sortedPatients = Array.from(patientMap.values())
              .sort((a, b) => b.latestVisit.getTime() - a.latestVisit.getTime())
              .map(item => ({ ...item.patient, _latestVisit: item.latestVisit }));
              
            setPatients(sortedPatients);
          }
        }
      } catch (err) {
        console.error("Failed to fetch clinic patients:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filtered = patients.filter((p) => {
    const nameMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const phoneMatch = p.phone.includes(searchQuery);
    const emailMatch = p.email.toLowerCase().includes(searchQuery.toLowerCase());
    const searchMatch = nameMatch || phoneMatch || emailMatch;
    
    const dateMatch = (() => {
      if (filterDate === "All") return true;
      if (!p._latestVisit) return false;
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - p._latestVisit.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (filterDate === "Today") return diffDays <= 1;
      if (filterDate === "7Days") return diffDays <= 7;
      if (filterDate === "30Days") return diffDays <= 30;
      return true;
    })();
    
    return searchMatch && dateMatch;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading patient records...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Patients Directory</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          View all registered and onboarded patients at your clinic.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 text-primary font-bold text-sm">
          <Users className="w-5 h-5" />
          <span>Total Records: {patients.length}</span>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <select 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">All Time</option>
            <option value="Today">Visited Today</option>
            <option value="7Days">Last 7 Days</option>
            <option value="30Days">Last 30 Days</option>
          </select>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Grid container with list & details panel */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Patient Table/List */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No patients found matching the search criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-4">Patient Name</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Details</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {paginated.map((p) => (
                    <tr 
                      key={p._id} 
                      className={`hover:bg-muted/20 transition cursor-pointer ${selectedPatient?._id === p._id ? "bg-muted/40" : ""}`}
                      onClick={() => setSelectedPatient(p)}
                    >
                      <td className="p-4">
                        <div className="font-bold text-foreground">{p.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{p.gender}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Phone className="w-3.5 h-3.5" /> {p.phone}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 font-medium">
                          <Mail className="w-3.5 h-3.5" /> {p.email}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs text-muted-foreground">
                          {p.dob ? `DOB: ${p.dob}` : "DOB: N/A"}
                        </div>
                        <div className="text-[11px] font-bold text-amber-600 mt-1 max-w-[150px] truncate">
                          {p.allergies ? `Allergies: ${p.allergies}` : ""}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs font-bold text-primary hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatient(p);
                          }}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={currentPage === totalPages || totalPages === 0} 
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.max(1, totalPages)))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected Patient Details side-panel */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6 self-start">
          <div className="flex items-center gap-2 border-b border-border pb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">Patient Medical File</h2>
          </div>

          {selectedPatient ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-foreground">{selectedPatient.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">Gender: {selectedPatient.gender}</p>
              </div>

              <div className="space-y-4 border-t border-border pt-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium text-foreground">{selectedPatient.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium text-foreground">{selectedPatient.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span>DOB: <strong className="text-foreground">{selectedPatient.dob || "N/A"}</strong></span>
                </div>
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" /> Allergies
                </h4>
                <p className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-950/50 p-3 rounded-xl min-h-[50px]">
                  {selectedPatient.allergies || "No documented allergies."}
                </p>
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-primary" /> Medical History Notes
                </h4>
                <p className="text-sm text-muted-foreground bg-muted/30 border border-border/40 p-3 rounded-xl min-h-[80px] whitespace-pre-wrap">
                  {selectedPatient.medicalHistory || "No clinical history noted."}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground text-sm flex flex-col items-center justify-center gap-2">
              <Smile className="w-8 h-8 text-muted-foreground/60" />
              <span>Select a patient from the directory to review their medical history file.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
