"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  Calendar,
  Building2,
  Stethoscope,
  Video,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  UserX,
  Clock,
  ChevronRight,
  X,
  FileText,
  Activity,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowUpDown,
  Eye,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { parsePrescribedMedicines, parsePrescribedTherapies } from "@/lib/clinical-formatters";

interface PatientSummary {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dob?: string | null;
  gender?: string;
  allergies?: string[];
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  status: "Active" | "Inactive";
  createdAt: string;
  registeredClinic: {
    _id: string;
    name: string;
    city: string;
  } | null;
  allClinics: Array<{ _id: string; name: string; city: string }>;
  assignedDoctor: {
    _id: string;
    name: string;
    specialization: string;
  } | null;
  assignedDoctors: Array<{ _id: string; name: string; specialization: string }>;
  assignedTherapist: {
    _id: string;
    name: string;
    specialization: string;
  } | null;
  assignedTherapists: Array<{ _id: string; name: string; specialization: string }>;
  treatments: string[];
  primaryTreatment: string;
  appointmentMode: "Online" | "Walk-in" | "Both" | "None";
  totalAppointments: number;
  lastAppointmentDate: string | null;
}

interface FilterOptions {
  clinics: Array<{ _id: string; name: string; city: string }>;
  doctors: Array<{ _id: string; name: string; specialization: string }>;
  therapists: Array<{ _id: string; name: string; specialization: string }>;
  treatments: string[];
}

interface PatientDetailsFull {
  patient: any;
  appointments: any[];
  therapySessions: any[];
  consultations: any[];
}

export default function AdminPatientsPage() {
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    clinics: [],
    doctors: [],
    therapists: [],
    treatments: [],
  });
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    onlinePatients: 0,
    walkinPatients: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClinic, setSelectedClinic] = useState("All");
  const [selectedDoctor, setSelectedDoctor] = useState("All");
  const [selectedTherapist, setSelectedTherapist] = useState("All");
  const [selectedMode, setSelectedMode] = useState("All");
  const [selectedTreatment, setSelectedTreatment] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name_asc" | "name_desc" | "appointments">("newest");

  // Selected Patient Details Drawer/Modal
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientDetails, setPatientDetails] = useState<PatientDetailsFull | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState<"overview" | "appointments" | "therapy" | "clinical">("overview");

  // Fetch Patients List
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/patients");
      const json = await res.json();
      if (json.success) {
        setPatients(json.data.patients || []);
        setFilterOptions(json.data.filterOptions || { clinics: [], doctors: [], therapists: [], treatments: [] });
        setStats(json.data.meta || { totalPatients: 0, activePatients: 0, onlinePatients: 0, walkinPatients: 0 });
      }
    } catch (err) {
      console.error("Failed to load patients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Fetch Single Patient Full Details
  const viewPatientProfile = async (id: string) => {
    setSelectedPatientId(id);
    setLoadingDetails(true);
    setActiveDetailTab("overview");
    try {
      const res = await fetch(`/api/admin/patients/${id}`);
      const json = await res.json();
      if (json.success) {
        setPatientDetails(json.data);
      }
    } catch (err) {
      console.error("Failed to load patient details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closePatientProfile = () => {
    setSelectedPatientId(null);
    setPatientDetails(null);
  };

  // Toggle Patient Status (Active / Inactive)
  const togglePatientStatus = async (patientId: string, currentStatus: "Active" | "Inactive") => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      const res = await fetch(`/api/admin/patients/${patientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setPatients((prev) =>
          prev.map((p) => (p._id === patientId ? { ...p, status: nextStatus } : p))
        );
        if (patientDetails && patientDetails.patient._id === patientId) {
          setPatientDetails({
            ...patientDetails,
            patient: { ...patientDetails.patient, status: nextStatus },
          });
        }
      }
    } catch (err) {
      console.error("Status toggle error:", err);
    }
  };

  // Multi-Filter & Search Logic
  const filteredPatients = useMemo(() => {
    return patients
      .filter((p) => {
        // Search by Name, Phone, Email, or Patient ID
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = p.name.toLowerCase().includes(q);
          const matchesPhone = p.phone.toLowerCase().includes(q);
          const matchesEmail = p.email.toLowerCase().includes(q);
          const matchesId = p._id.toLowerCase().includes(q) || p._id.slice(-6).toLowerCase().includes(q);
          if (!matchesName && !matchesPhone && !matchesEmail && !matchesId) return false;
        }

        // Clinic filter
        if (selectedClinic !== "All") {
          const matchesPrimary = p.registeredClinic?._id === selectedClinic;
          const matchesAny = p.allClinics.some((c) => c._id === selectedClinic);
          if (!matchesPrimary && !matchesAny) return false;
        }

        // Doctor filter
        if (selectedDoctor !== "All") {
          const matchesDoc = p.assignedDoctors.some((d) => d._id === selectedDoctor);
          if (!matchesDoc) return false;
        }

        // Therapist filter
        if (selectedTherapist !== "All") {
          const matchesTherapist = p.assignedTherapists.some((t) => t._id === selectedTherapist);
          if (!matchesTherapist) return false;
        }

        // Appointment Mode filter
        if (selectedMode !== "All") {
          if (selectedMode === "Online" && p.appointmentMode !== "Online" && p.appointmentMode !== "Both") {
            return false;
          }
          if (selectedMode === "Walk-in" && p.appointmentMode !== "Walk-in" && p.appointmentMode !== "Both") {
            return false;
          }
        }

        // Treatment filter
        if (selectedTreatment !== "All") {
          const matchesTreatment = p.treatments.some((t) =>
            t.toLowerCase().includes(selectedTreatment.toLowerCase())
          );
          if (!matchesTreatment) return false;
        }

        // Patient Status filter
        if (selectedStatus !== "All") {
          if (p.status !== selectedStatus) return false;
        }

        // Date filter (Registration date)
        if (startDate) {
          const patientCreated = new Date(p.createdAt).getTime();
          const start = new Date(startDate).setHours(0, 0, 0, 0);
          if (patientCreated < start) return false;
        }
        if (endDate) {
          const patientCreated = new Date(p.createdAt).getTime();
          const end = new Date(endDate).setHours(23, 59, 59, 999);
          if (patientCreated > end) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === "name_asc") {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === "name_desc") {
          return b.name.localeCompare(a.name);
        }
        if (sortBy === "appointments") {
          return b.totalAppointments - a.totalAppointments;
        }
        return 0;
      });
  }, [
    patients,
    searchQuery,
    selectedClinic,
    selectedDoctor,
    selectedTherapist,
    selectedMode,
    selectedTreatment,
    selectedStatus,
    startDate,
    endDate,
    sortBy,
  ]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedClinic !== "All") count++;
    if (selectedDoctor !== "All") count++;
    if (selectedTherapist !== "All") count++;
    if (selectedMode !== "All") count++;
    if (selectedTreatment !== "All") count++;
    if (selectedStatus !== "All") count++;
    if (startDate) count++;
    if (endDate) count++;
    return count;
  }, [
    searchQuery,
    selectedClinic,
    selectedDoctor,
    selectedTherapist,
    selectedMode,
    selectedTreatment,
    selectedStatus,
    startDate,
    endDate,
  ]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedClinic("All");
    setSelectedDoctor("All");
    setSelectedTherapist("All");
    setSelectedMode("All");
    setSelectedTreatment("All");
    setSelectedStatus("All");
    setStartDate("");
    setEndDate("");
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      "Patient ID",
      "Full Name",
      "Phone",
      "Email",
      "Registered Clinic",
      "Assigned Doctor",
      "Assigned Therapist",
      "Treatment",
      "Appointment Mode",
      "Status",
      "Total Appointments",
      "Registration Date",
    ];

    const rows = filteredPatients.map((p) => [
      `KMH-PT-${p._id.slice(-6).toUpperCase()}`,
      `"${p.name.replace(/"/g, '""')}"`,
      p.phone,
      p.email,
      `"${p.registeredClinic ? `${p.registeredClinic.name} (${p.registeredClinic.city})` : "General / All Clinics"}"`,
      `"${p.assignedDoctor?.name || "Unassigned"}"`,
      `"${p.assignedTherapist?.name || "None"}"`,
      `"${p.primaryTreatment}"`,
      p.appointmentMode,
      p.status,
      p.totalAppointments,
      new Date(p.createdAt).toLocaleDateString("en-IN"),
    ]);

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Kelkar_Manas_Patients_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#4A154B] text-xs font-bold mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            Centralized Patient Management
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
            Patient Directory
          </h1>
          <p className="text-muted-foreground text-sm">
            Centralized registry of all registered patients across all Kelkar Manas clinics and services.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPatients}
            disabled={loading}
            className="rounded-xl h-10 gap-2 border-border"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={exportToCSV}
            disabled={filteredPatients.length === 0}
            className="rounded-xl h-10 gap-2 border-border"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-5 rounded-2xl border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total Registered
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2 text-foreground">{stats.totalPatients}</div>
          <div className="text-xs text-muted-foreground mt-1">Across all clinics</div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Active Patients
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2 text-emerald-600">{stats.activePatients}</div>
          <div className="text-xs text-muted-foreground mt-1">Eligible for bookings</div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Online / Video
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2 text-blue-600">{stats.onlinePatients}</div>
          <div className="text-xs text-muted-foreground mt-1">Telehealth users</div>
        </div>

        <div className="bg-card p-5 rounded-2xl border border-border shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Walk-in / In-Clinic
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold mt-2 text-amber-600">{stats.walkinPatients}</div>
          <div className="text-xs text-muted-foreground mt-1">Physical clinic visits</div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className="bg-card p-5 rounded-3xl border border-border shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">Advanced Filters</span>
            {activeFiltersCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                {activeFiltersCount} Active
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none text-sm placeholder:text-muted-foreground/70"
          />
        </div>

        {/* Multi-Select Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {/* Clinic filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Clinic</label>
            <select
              value={selectedClinic}
              onChange={(e) => setSelectedClinic(e.target.value)}
              className="w-full h-9 px-2 text-xs font-medium rounded-xl border border-border bg-background text-foreground focus:outline-none"
            >
              <option value="All">All Clinics</option>
              {filterOptions.clinics.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.city})
                </option>
              ))}
            </select>
          </div>

          {/* Doctor filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Doctor</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full h-9 px-2 text-xs font-medium rounded-xl border border-border bg-background text-foreground focus:outline-none"
            >
              <option value="All">All Doctors</option>
              {filterOptions.doctors.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Therapist filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Therapist</label>
            <select
              value={selectedTherapist}
              onChange={(e) => setSelectedTherapist(e.target.value)}
              className="w-full h-9 px-2 text-xs font-medium rounded-xl border border-border bg-background text-foreground focus:outline-none"
            >
              <option value="All">All Therapists</option>
              {filterOptions.therapists.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Appointment Mode filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Mode</label>
            <select
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="w-full h-9 px-2 text-xs font-medium rounded-xl border border-border bg-background text-foreground focus:outline-none"
            >
              <option value="All">All Modes</option>
              <option value="Online">Online (Video)</option>
              <option value="Walk-in">Walk-in (Clinic)</option>
            </select>
          </div>

          {/* Treatment / Service filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Treatment</label>
            <select
              value={selectedTreatment}
              onChange={(e) => setSelectedTreatment(e.target.value)}
              className="w-full h-9 px-2 text-xs font-medium rounded-xl border border-border bg-background text-foreground focus:outline-none"
            >
              <option value="All">All Treatments</option>
              {filterOptions.treatments.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Patient Status filter */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full h-9 px-2 text-xs font-medium rounded-xl border border-border bg-background text-foreground focus:outline-none"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Date Range & Sorting Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
          <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>Registered Between:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 px-2 text-xs rounded-lg border border-border bg-background text-foreground"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 px-2 text-xs rounded-lg border border-border bg-background text-foreground"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-8 px-2 text-xs font-medium rounded-lg border border-border bg-background text-foreground focus:outline-none"
            >
              <option value="newest">Newest Registered</option>
              <option value="oldest">Oldest Registered</option>
              <option value="name_asc">Name (A → Z)</option>
              <option value="name_desc">Name (Z → A)</option>
              <option value="appointments">Most Appointments</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-card rounded-3xl border border-border shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="text-xs font-bold text-muted-foreground">
            Displaying <strong className="text-foreground">{filteredPatients.length}</strong> of {patients.length} Registered Patients
          </div>
          {filteredPatients.length !== patients.length && (
            <span className="text-xs text-primary font-medium">Filtered Results</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Patient</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Registered Clinic</th>
                <th className="py-3.5 px-4">Assigned Doctor</th>
                <th className="py-3.5 px-4">Treatment</th>
                <th className="py-3.5 px-4">Mode</th>
                <th className="py-3.5 px-4">Registered Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-muted-foreground">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    <span>Loading patient records...</span>
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-muted-foreground">
                    <UserX className="w-8 h-8 mx-auto mb-2 text-muted-foreground/60" />
                    <p className="font-semibold text-foreground">No patients found</p>
                    <p className="text-xs mt-1">Try adjusting or clearing your filters.</p>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="mt-4 rounded-xl text-xs"
                      >
                        Clear All Filters
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const initials = patient.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();

                  return (
                    <tr
                      key={patient._id}
                      onClick={() => viewPatientProfile(patient._id)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                    >
                      {/* Name & ID */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-purple-100 text-[#4A154B] font-bold text-xs flex items-center justify-center shrink-0 border border-purple-200">
                            {initials || "PT"}
                          </div>
                          <div>
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {patient.name}
                            </div>
                            <div className="text-[11px] font-mono text-muted-foreground">
                              KMH-PT-{patient._id.slice(-6).toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <a
                            href={`tel:${patient.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs font-medium text-foreground hover:text-primary inline-flex items-center gap-1.5"
                          >
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            {patient.phone || "No phone"}
                          </a>
                          {patient.email && (
                            <div className="text-[11px] text-muted-foreground truncate max-w-[170px]">
                              {patient.email}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Clinic */}
                      <td className="py-3.5 px-4">
                        {patient.registeredClinic ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 text-xs font-medium text-foreground">
                            <Building2 className="w-3 h-3 text-primary" />
                            <span>{patient.registeredClinic.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Central / All Clinics</span>
                        )}
                      </td>

                      {/* Assigned Doctor / Therapist */}
                      <td className="py-3.5 px-4">
                        {patient.assignedDoctor ? (
                          <div>
                            <div className="text-xs font-medium text-foreground">
                              {patient.assignedDoctor.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground">
                              {patient.assignedDoctor.specialization}
                            </div>
                          </div>
                        ) : patient.assignedTherapist ? (
                          <div>
                            <div className="text-xs font-medium text-foreground">
                              {patient.assignedTherapist.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground">Therapist</div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Unassigned</span>
                        )}
                      </td>

                      {/* Treatment */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-50 text-purple-900 border border-purple-200 text-xs font-medium max-w-[170px] truncate">
                          {patient.primaryTreatment}
                        </div>
                      </td>

                      {/* Appointment Mode */}
                      <td className="py-3.5 px-4">
                        {patient.appointmentMode === "Online" ? (
                          <Badge variant="outline" className="text-[11px] bg-blue-50 text-blue-700 border-blue-200 gap-1 font-semibold">
                            <Video className="w-3 h-3" /> Online
                          </Badge>
                        ) : patient.appointmentMode === "Walk-in" ? (
                          <Badge variant="outline" className="text-[11px] bg-amber-50 text-amber-800 border-amber-200 gap-1 font-semibold">
                            <Building2 className="w-3 h-3" /> Walk-in
                          </Badge>
                        ) : patient.appointmentMode === "Both" ? (
                          <Badge variant="outline" className="text-[11px] bg-purple-50 text-purple-700 border-purple-200 gap-1 font-semibold">
                            Hybrid
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">None yet</span>
                        )}
                      </td>

                      {/* Registration Date */}
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {new Date(patient.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            patient.status === "Active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              patient.status === "Active" ? "bg-emerald-500" : "bg-gray-400"
                            }`}
                          />
                          {patient.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewPatientProfile(patient._id);
                          }}
                          className="h-8 px-2.5 text-xs font-semibold text-primary hover:bg-primary/10 rounded-lg gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Profile</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- PATIENT COMPLETE PROFILE DRAWER / MODAL --- */}
      {selectedPatientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl border border-border flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95">
            {/* Header */}
            <div className="p-6 border-b border-border bg-muted/30 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-[#4A154B] text-white font-serif font-bold text-xl flex items-center justify-center shadow-md">
                  {patientDetails?.patient?.name
                    ? patientDetails.patient.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "PT"}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold font-serif text-foreground">
                      {patientDetails?.patient?.name || "Patient Profile"}
                    </h2>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        patientDetails?.patient?.status === "Active"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {patientDetails?.patient?.status || "Active"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1 font-mono">
                    <span>ID: KMH-PT-{selectedPatientId.slice(-6).toUpperCase()}</span>
                    <span>•</span>
                    <span>
                      Registered:{" "}
                      {patientDetails?.patient?.createdAt
                        ? new Date(patientDetails.patient.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {patientDetails?.patient && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      togglePatientStatus(selectedPatientId, patientDetails.patient.status)
                    }
                    className="text-xs h-9 rounded-xl border-border"
                  >
                    Set as {patientDetails.patient.status === "Active" ? "Inactive" : "Active"}
                  </Button>
                )}
                <button
                  onClick={closePatientProfile}
                  className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="px-6 border-b border-border bg-background flex items-center gap-6 text-sm font-semibold">
              <button
                onClick={() => setActiveDetailTab("overview")}
                className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
                  activeDetailTab === "overview"
                    ? "border-[#4A154B] text-[#4A154B]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Overview &amp; Demographics</span>
              </button>

              <button
                onClick={() => setActiveDetailTab("appointments")}
                className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
                  activeDetailTab === "appointments"
                    ? "border-[#4A154B] text-[#4A154B]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Appointment History ({patientDetails?.appointments?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveDetailTab("therapy")}
                className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
                  activeDetailTab === "therapy"
                    ? "border-[#4A154B] text-[#4A154B]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <HeartHandshake className="w-4 h-4" />
                <span>Therapy Sessions ({patientDetails?.therapySessions?.length || 0})</span>
              </button>

              <button
                onClick={() => setActiveDetailTab("clinical")}
                className={`py-3.5 border-b-2 transition-colors flex items-center gap-2 ${
                  activeDetailTab === "clinical"
                    ? "border-[#4A154B] text-[#4A154B]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Clinical Notes ({patientDetails?.consultations?.length || 0})</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 overflow-y-auto flex-1">
              {loadingDetails ? (
                <div className="py-20 text-center text-muted-foreground">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                  <span>Loading full patient record...</span>
                </div>
              ) : !patientDetails ? (
                <div className="py-20 text-center text-muted-foreground">
                  <span>Failed to load profile details.</span>
                </div>
              ) : (
                <>
                  {/* TAB 1: OVERVIEW */}
                  {activeDetailTab === "overview" && (
                    <div className="space-y-6">
                      {/* Contact & Demographics Card */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-muted/20 p-5 rounded-2xl border border-border space-y-3">
                          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                            <Phone className="w-4 h-4 text-primary" /> Contact Information
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-border/50">
                              <span className="text-muted-foreground">Primary Phone:</span>
                              <span className="font-semibold text-foreground">
                                {patientDetails.patient.phone || "Not specified"}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-border/50">
                              <span className="text-muted-foreground">Email Address:</span>
                              <span className="font-semibold text-foreground">
                                {patientDetails.patient.email || "Not specified"}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-border/50">
                              <span className="text-muted-foreground">Emergency Contact:</span>
                              <span className="font-semibold text-foreground">
                                {patientDetails.patient.emergencyContactName || "Not provided"}
                              </span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-muted-foreground">Emergency Phone:</span>
                              <span className="font-semibold text-foreground">
                                {patientDetails.patient.emergencyContactPhone || "Not provided"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted/20 p-5 rounded-2xl border border-border space-y-3">
                          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-primary" /> Demographics &amp; Identity
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-border/50">
                              <span className="text-muted-foreground">Gender:</span>
                              <span className="font-semibold text-foreground">
                                {patientDetails.patient.gender || "Not disclosed"}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-border/50">
                              <span className="text-muted-foreground">Date of Birth:</span>
                              <span className="font-semibold text-foreground">
                                {patientDetails.patient.dob
                                  ? new Date(patientDetails.patient.dob).toLocaleDateString("en-IN")
                                  : "Not recorded"}
                              </span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-border/50">
                              <span className="text-muted-foreground">Status:</span>
                              <span className="font-bold text-emerald-600">
                                {patientDetails.patient.status || "Active"}
                              </span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-muted-foreground">System ID:</span>
                              <span className="font-mono text-muted-foreground">
                                {patientDetails.patient._id}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Allergies & Medical History */}
                      <div className="space-y-4">
                        <div className="bg-muted/20 p-5 rounded-2xl border border-border space-y-2">
                          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500" /> Allergies
                          </h4>
                          {patientDetails.patient.allergies &&
                          patientDetails.patient.allergies.length > 0 ? (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {patientDetails.patient.allergies.map((allergy: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold"
                                >
                                  {allergy}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">
                              No known drug or clinical allergies recorded.
                            </p>
                          )}
                        </div>

                        <div className="bg-muted/20 p-5 rounded-2xl border border-border space-y-2">
                          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                            <Activity className="w-4 h-4 text-primary" /> Medical History &amp; Background
                          </h4>
                          <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap">
                            {patientDetails.patient.medicalHistory ||
                              "No previous medical history or background recorded for this patient."}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: APPOINTMENT HISTORY */}
                  {activeDetailTab === "appointments" && (
                    <div className="space-y-4">
                      {patientDetails.appointments.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground">
                          <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                          <p className="font-semibold text-foreground">No appointments recorded</p>
                          <p className="text-xs mt-1">This patient has not booked any consultations yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {patientDetails.appointments.map((app: any) => (
                            <div
                              key={app._id}
                              className="p-4 rounded-2xl border border-border bg-muted/10 hover:bg-muted/25 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-foreground">
                                    {app.serviceName || "Clinical Consultation"}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={`text-[11px] font-semibold ${
                                      app.type === "Video"
                                        ? "bg-blue-50 text-blue-700 border-blue-200"
                                        : "bg-amber-50 text-amber-800 border-amber-200"
                                    }`}
                                  >
                                    {app.type === "Video" ? "Video Consultation" : "Walk-in Consultation"}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`text-[11px] font-semibold ${
                                      app.status === "Completed"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : app.status === "Cancelled"
                                        ? "bg-red-50 text-red-700 border-red-200"
                                        : "bg-purple-50 text-purple-700 border-purple-200"
                                    }`}
                                  >
                                    {app.status}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-3">
                                  <span className="font-medium text-foreground">
                                    Doctor: {app.doctorId?.name || "Dr. Kelkar"}
                                  </span>
                                  <span>•</span>
                                  <span>
                                    Clinic: {app.clinicId?.name ? `${app.clinicId.name} (${app.clinicId.city})` : "General"}
                                  </span>
                                </div>
                                {app.notes && (
                                  <p className="text-xs text-muted-foreground italic pt-1">
                                    &ldquo;{app.notes}&rdquo;
                                  </p>
                                )}
                              </div>

                              <div className="text-left md:text-right shrink-0">
                                <div className="text-xs font-bold text-foreground">
                                  {app.date} at {app.time}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  Fee: INR {app.feeAmount || 0} ({app.paymentStatus || "Pending"})
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: THERAPY SESSIONS */}
                  {activeDetailTab === "therapy" && (
                    <div className="space-y-4">
                      {patientDetails.therapySessions.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground">
                          <HeartHandshake className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                          <p className="font-semibold text-foreground">No therapy sessions</p>
                          <p className="text-xs mt-1">This patient has no prescribed or booked therapy sessions.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {patientDetails.therapySessions.map((session: any) => (
                            <div
                              key={session._id}
                              className="p-4 rounded-2xl border border-border bg-muted/10 hover:bg-muted/25 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-foreground">
                                    {session.name}
                                  </span>
                                  <Badge variant="outline" className="text-[11px] bg-purple-50 text-purple-700 border-purple-200 font-semibold">
                                    {session.selectedMode || session.recommendedMode || "Online"}
                                  </Badge>
                                  <Badge variant="outline" className="text-[11px] font-semibold">
                                    {session.status}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground flex items-center gap-3">
                                  <span>Therapist: {session.therapistId?.name || "Assigned Therapist"}</span>
                                  <span>•</span>
                                  <span>Clinic: {session.clinicId?.name || "Main Clinic"}</span>
                                </div>
                                {session.therapistNotes && (
                                  <p className="text-xs text-muted-foreground pt-1">
                                    <strong>Notes:</strong> {session.therapistNotes}
                                  </p>
                                )}
                              </div>

                              <div className="text-left md:text-right shrink-0">
                                <div className="text-xs font-bold text-foreground">
                                  {session.date || "Schedule pending"} {session.time ? `at ${session.time}` : ""}
                                </div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  Fee: INR {session.price || 0} ({session.paymentStatus || "Pending"})
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: CLINICAL NOTES */}
                  {activeDetailTab === "clinical" && (
                    <div className="space-y-4">
                      {patientDetails.consultations.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground">
                          <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                          <p className="font-semibold text-foreground">No clinical consultations</p>
                          <p className="text-xs mt-1">No doctor notes or prescription records found for this patient.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {patientDetails.consultations.map((c: any) => {
                            const parsedMeds = parsePrescribedMedicines(c.prescriptionSummary);
                            const parsedTherapies = parsePrescribedTherapies(c.prescribedTherapies);
                            const hasMeds = parsedMeds.items.length > 0 || Boolean(parsedMeds.plainText);
                            const hasTherapies = parsedTherapies.items.length > 0 || Boolean(parsedTherapies.plainText);

                            return (
                              <div key={c._id} className="p-5 rounded-2xl border border-border bg-card space-y-3.5 shadow-2xs">
                                <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-2.5">
                                  <div className="text-xs font-bold text-[#4A154B] flex items-center gap-2">
                                    <Stethoscope className="w-4 h-4 shrink-0" />
                                    <span>Consultation by {c.doctorId?.name || "Doctor"}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground font-medium shrink-0">
                                    {new Date(c.createdAt).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </div>
                                </div>

                                {c.notes && (
                                  <div className="space-y-1.5">
                                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                      Clinical Doctor Notes
                                    </div>
                                    <p className="text-xs text-foreground bg-muted/25 p-3 rounded-xl whitespace-pre-wrap leading-relaxed break-words">
                                      {c.notes}
                                    </p>
                                  </div>
                                )}

                                {hasMeds && (
                                  <div className="space-y-1.5">
                                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                      Prescription Summary
                                    </div>
                                    {parsedMeds.items.length > 0 ? (
                                      <div className="bg-purple-50/60 dark:bg-purple-950/20 p-3 rounded-xl border border-purple-100 dark:border-purple-900/40 divide-y divide-purple-100/80 dark:divide-purple-900/30">
                                        {parsedMeds.items.map((med, idx) => (
                                          <div key={idx} className="py-2 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                            <div>
                                              <p className="text-xs font-semibold text-foreground">{med.drug}</p>
                                              {med.instructions && (
                                                <p className="text-[11px] text-muted-foreground mt-0.5">{med.instructions}</p>
                                              )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                                              {med.dosage && (
                                                <span className="px-2 py-0.5 rounded-md bg-background border border-border/70 font-medium text-foreground">
                                                  Dosage: {med.dosage}
                                                </span>
                                              )}
                                              {med.frequency && (
                                                <span className="px-2 py-0.5 rounded-md bg-background border border-border/70 font-medium text-foreground">
                                                  Freq: {med.frequency}
                                                </span>
                                              )}
                                              {med.duration && (
                                                <span className="px-2 py-0.5 rounded-md bg-background border border-border/70 font-medium text-foreground">
                                                  Duration: {med.duration}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-foreground bg-purple-50/50 p-3 rounded-xl border border-purple-100 leading-relaxed break-words">
                                        {parsedMeds.plainText}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {hasTherapies && (
                                  <div className="space-y-1.5">
                                    <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                      Recommended Therapies
                                    </div>
                                    {parsedTherapies.items.length > 0 ? (
                                      <div className="bg-blue-50/60 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40 divide-y divide-blue-100/80 dark:divide-blue-900/30">
                                        {parsedTherapies.items.map((th, idx) => (
                                          <div key={idx} className="py-2 first:pt-0 last:pb-0 space-y-1">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                              <span className="text-xs font-semibold text-foreground">{th.name}</span>
                                              <div className="flex items-center gap-1.5">
                                                {th.recommendedMode && (
                                                  <Badge variant="outline" className="text-[10px] bg-background border-blue-200 text-blue-700 font-semibold">
                                                    {th.recommendedMode}
                                                  </Badge>
                                                )}
                                                {th.price !== undefined && (
                                                  <span className="text-[11px] font-bold text-foreground">
                                                    ₹{th.price.toLocaleString("en-IN")}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            {th.doctorNotes && (
                                              <p className="text-[11px] text-muted-foreground italic break-words">
                                                Guidance: &ldquo;{th.doctorNotes}&rdquo;
                                              </p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-foreground bg-blue-50/50 p-3 rounded-xl border border-blue-100 leading-relaxed break-words">
                                        {parsedTherapies.plainText}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-end">
              <Button onClick={closePatientProfile} className="rounded-xl px-5 text-xs font-bold">
                Close Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
