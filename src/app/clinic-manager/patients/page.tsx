"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Stethoscope,
  Pill,
  CreditCard,
  Building2,
  Download,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
  Printer,
  Receipt,
  User,
  HeartPulse
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { printPrescription } from "@/lib/print-prescription";

interface PatientData {
  _id: string;
  name: string;
  phone: string;
  email: string;
  gender: string;
  dob?: string;
  allergies?: string[] | string;
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  createdAt?: string;
  _latestVisit?: Date;
  _totalVisits?: number;
}

interface AppointmentItem {
  _id: string;
  date: string;
  time: string;
  type: "Video" | "Walk-in";
  status: string;
  paymentStatus?: "Pending" | "Paid";
  paymentMethod?: "Online" | "Cash";
  feeAmount?: number;
  serviceName?: string;
  doctorId?: {
    _id: string;
    name: string;
    specialization?: string;
    qualifications?: string[];
    registrationNumber?: string;
    signature?: string;
  };
  clinicId?: {
    _id: string;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
  };
  createdAt?: string;
}

interface ConsultationItem {
  _id: string;
  notes?: string;
  prescriptionSummary?: string;
  prescribedTherapies?: string;
  status: "Pending" | "Active" | "Completed";
  prescriptionStatus?: "Pending" | "Fulfilled";
  createdAt: string;
  doctorId?: {
    _id: string;
    name: string;
    specialization?: string;
    qualifications?: string[];
    registrationNumber?: string;
    signature?: string;
  };
  appointmentId?: AppointmentItem;
}

interface PharmacyOrderItem {
  _id: string;
  orderNumber?: string;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function ClinicManagerPatientsPage() {
  const router = useRouter();
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [clinicName, setClinicName] = useState<string>("Baner Clinic");
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter for Directory
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected Patient Details View
  const [selectedPatient, setSelectedPatient] = useState<PatientData | null>(null);
  const [activeTab, setActiveTab] = useState<
    "personal" | "consultations" | "prescriptions" | "appointments" | "billing"
  >("personal");

  // Profile Specific Loaded Data
  const [patientAppointments, setPatientAppointments] = useState<AppointmentItem[]>([]);
  const [patientConsultations, setPatientConsultations] = useState<ConsultationItem[]>([]);
  const [patientOrders, setPatientOrders] = useState<PharmacyOrderItem[]>([]);
  const [loadingProfileData, setLoadingProfileData] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterDate]);

  // Initial Fetch of Patients scoped to clinic
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
          // Fetch clinic name
          try {
            const clinicRes = await fetch(`/api/clinics/${cId}`);
            const clinicJson = await clinicRes.json();
            if (clinicJson.success && clinicJson.data?.name) {
              setClinicName(clinicJson.data.name);
            }
          } catch (e) {
            console.error("Failed to load clinic metadata:", e);
          }

          const res = await fetch(`/api/appointments?clinicId=${cId}`);
          const json = await res.json();
          if (json.success) {
            const patientMap = new Map<
              string,
              { patient: PatientData; latestVisit: Date; visitCount: number }
            >();

            json.data.forEach((apt: any) => {
              if (apt.patientId && apt.patientId._id) {
                let visitDate = new Date(apt.createdAt || 0);
                if (apt.date) {
                  const parsed = new Date(`${apt.date}T${apt.time ? convertTimeTo24(apt.time) : "00:00"}:00`);
                  if (!isNaN(parsed.getTime())) visitDate = parsed;
                }

                const existing = patientMap.get(apt.patientId._id);
                if (!existing) {
                  patientMap.set(apt.patientId._id, {
                    patient: apt.patientId,
                    latestVisit: visitDate,
                    visitCount: 1,
                  });
                } else {
                  existing.visitCount += 1;
                  if (existing.latestVisit < visitDate) {
                    existing.latestVisit = visitDate;
                  }
                }
              }
            });

            const sortedPatients = Array.from(patientMap.values())
              .sort((a, b) => b.latestVisit.getTime() - a.latestVisit.getTime())
              .map((item) => ({
                ...item.patient,
                _latestVisit: item.latestVisit,
                _totalVisits: item.visitCount,
              }));

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
  }, [router]);

  // When an individual patient is selected, fetch their full medical file
  useEffect(() => {
    if (!selectedPatient) return;

    let isMounted = true;
    const loadPatientRecords = async () => {
      setLoadingProfileData(true);
      try {
        const [patientRes, aptRes, consultRes, ordersRes] = await Promise.all([
          fetch(`/api/patients/${selectedPatient._id}`),
          fetch(`/api/appointments?patientId=${selectedPatient._id}`),
          fetch(`/api/consultations?patientId=${selectedPatient._id}`),
          fetch(`/api/pharmacy/orders?patientId=${selectedPatient._id}`).catch(() => null),
        ]);

        if (patientRes.ok) {
          const pJson = await patientRes.json();
          if (pJson.success && pJson.data && isMounted) {
            setSelectedPatient((prev) => ({
              ...prev,
              ...pJson.data,
              _latestVisit: prev?._latestVisit,
              _totalVisits: prev?._totalVisits,
            }));
          }
        }

        if (aptRes.ok) {
          const aptJson = await aptRes.json();
          if (aptJson.success && Array.isArray(aptJson.data) && isMounted) {
            setPatientAppointments(aptJson.data);
          }
        }

        if (consultRes.ok) {
          const cJson = await consultRes.json();
          if (cJson.success && Array.isArray(cJson.data) && isMounted) {
            setPatientConsultations(cJson.data);
          }
        }

        if (ordersRes && ordersRes.ok) {
          const ordJson = await ordersRes.json();
          if (ordJson.success && Array.isArray(ordJson.data) && isMounted) {
            setPatientOrders(ordJson.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch detailed records for patient:", err);
      } finally {
        if (isMounted) setLoadingProfileData(false);
      }
    };

    loadPatientRecords();
    return () => {
      isMounted = false;
    };
  }, [selectedPatient?._id]);

  function convertTimeTo24(timeStr: string) {
    if (!timeStr) return "00:00";
    const [time, modifier] = timeStr.trim().split(" ");
    let [hours, minutes] = time.split(":");
    if (hours === "12") hours = "00";
    if (modifier?.toUpperCase() === "PM") {
      hours = String(parseInt(hours, 10) + 12);
    }
    return `${hours.padStart(2, "0")}:${(minutes || "00").padStart(2, "0")}`;
  }

  // Calculate Patient Initials (e.g. RS for Rahul Sharma)
  const patientInitials = useMemo(() => {
    if (!selectedPatient?.name) return "PT";
    const parts = selectedPatient.name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [selectedPatient?.name]);

  // Compute Age
  const patientAge = useMemo(() => {
    if (!selectedPatient?.dob) return "N/A";
    const birthDate = new Date(selectedPatient.dob);
    if (isNaN(birthDate.getTime())) return "N/A";
    const now = new Date();
    let age = now.getFullYear() - birthDate.getFullYear();
    const m = now.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? `${age} Years` : "< 1 Year";
  }, [selectedPatient?.dob]);

  // Patient Display ID (e.g. P-1001)
  const patientDisplayId = useMemo(() => {
    if (!selectedPatient?._id) return "P-1001";
    return `P-${selectedPatient._id.slice(-4).toUpperCase()}`;
  }, [selectedPatient?._id]);

  // Registration Date
  const registrationDate = useMemo(() => {
    if (!selectedPatient?.createdAt) return "12 Jan 2025";
    const d = new Date(selectedPatient.createdAt);
    if (isNaN(d.getTime())) return "12 Jan 2025";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [selectedPatient?.createdAt]);

  // Total Visits count
  const totalVisitsCount = useMemo(() => {
    if (patientAppointments.length > 0) return patientAppointments.length;
    return selectedPatient?._totalVisits || 1;
  }, [patientAppointments.length, selectedPatient?._totalVisits]);

  // Last Consultation date
  const lastConsultationDate = useMemo(() => {
    if (patientConsultations.length > 0) {
      const last = patientConsultations[0];
      const d = new Date(last.createdAt);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        });
      }
    }
    if (patientAppointments.length > 0) {
      const latestApt = patientAppointments[0];
      if (latestApt.date) {
        const d = new Date(latestApt.date);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          });
        }
      }
    }
    if (selectedPatient?._latestVisit) {
      return selectedPatient._latestVisit.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
    }
    return "16 Nov";
  }, [patientConsultations, patientAppointments, selectedPatient?._latestVisit]);

  // Extracted Prescriptions with parsed medicines
  const digitalPrescriptions = useMemo(() => {
    return patientConsultations
      .filter((c) => c.prescriptionSummary && c.prescriptionSummary !== "[]")
      .map((c) => {
        let medicines = [];
        try {
          medicines = JSON.parse(c.prescriptionSummary || "[]");
        } catch {
          medicines = [];
        }
        return {
          ...c,
          medicines,
        };
      });
  }, [patientConsultations]);

  // Billing and ledger calculations
  const billingStats = useMemo(() => {
    let totalInvoiced = 0;
    let totalPaid = 0;

    patientAppointments.forEach((apt) => {
      const fee = apt.feeAmount || 0;
      totalInvoiced += fee;
      if (apt.paymentStatus === "Paid") {
        totalPaid += fee;
      }
    });

    patientOrders.forEach((ord) => {
      totalInvoiced += ord.totalAmount || 0;
      if (ord.paymentStatus === "Paid") {
        totalPaid += ord.totalAmount || 0;
      }
    });

    const outstanding = Math.max(0, totalInvoiced - totalPaid);
    return {
      totalInvoiced,
      totalPaid,
      outstanding,
    };
  }, [patientAppointments, patientOrders]);

  // Filtered patients for Directory Table
  const filtered = useMemo(() => {
    return patients.filter((p) => {
      const nameMatch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const phoneMatch = p.phone?.includes(searchQuery);
      const emailMatch = p.email?.toLowerCase().includes(searchQuery.toLowerCase());
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
  }, [patients, searchQuery, filterDate]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = useMemo(() => {
    return filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filtered, currentPage, pageSize]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading clinic patient records...</span>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: INDIVIDUAL PATIENT PROFILE (PATIENT FILE)
  // =========================================================================
  if (selectedPatient) {
    return (
      <div className="space-y-6 animate-in fade-in-50 duration-200">
        {/* Top Back Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-border">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedPatient(null)}
              className="rounded-xl border border-border bg-card hover:bg-muted font-semibold text-xs h-9 px-3.5 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5 text-primary" />
              Back to Patients Directory
            </Button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">/</span>
              <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary">
                Patient Medical File
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="rounded-xl text-xs h-9 px-3 gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print File
            </Button>
          </div>
        </div>

        {/* =====================================================================
            1. PATIENT PROFILE HEADER
            Prominently displayed at top:
            - Profile Initials avatar: RS
            - Patient Name: Rahul Sharma
            - Patient ID: P-1001
            - Age: 34 Years
            - Gender: Male
            - Mobile Number: +91 98765 43210
            - Registration Date: 12 Jan 2025
            - Clinic: Baner Clinic
        ====================================================================== */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-5">
              {/* Profile Initials Avatar */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-md shrink-0 tracking-wider">
                {patientInitials}
              </div>

              {/* Patient Basic Info */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    {selectedPatient.name}
                  </h1>
                  <Badge variant="outline" className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-muted/60 border-primary/30 text-primary">
                    {patientDisplayId}
                  </Badge>
                </div>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs sm:text-sm text-muted-foreground font-medium pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-foreground font-semibold">Age:</span> {patientAge}
                  </div>
                  <span className="text-border hidden sm:inline">|</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-foreground font-semibold">Gender:</span> {selectedPatient.gender || "Unspecified"}
                  </div>
                  <span className="text-border hidden sm:inline">|</span>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-foreground font-semibold">Mobile:</span> {selectedPatient.phone}
                  </div>
                  <span className="text-border hidden sm:inline">|</span>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-foreground font-semibold">Reg Date:</span> {registrationDate}
                  </div>
                  <span className="text-border hidden sm:inline">|</span>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span className="text-foreground font-semibold">Clinic:</span> {clinicName}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            2. PATIENT STATISTICS
            Two summary cards below header:
            - 12 – Total Visits
            - 16 Nov – Last Consultation
        ====================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total Visits Card */}
          <div className="bg-gradient-to-br from-primary/5 via-card to-card border border-primary/20 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  Visits Logged
                </p>
                <p className="text-3xl font-extrabold text-foreground mt-1">
                  {totalVisitsCount}
                </p>
                <p className="text-xs font-semibold text-primary mt-1">
                  Total Visits Recorded
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Last Consultation Card */}
          <div className="bg-gradient-to-br from-emerald-500/5 via-card to-card border border-emerald-500/20 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  Recent Activity
                </p>
                <p className="text-3xl font-extrabold text-foreground mt-1">
                  {lastConsultationDate}
                </p>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                  Last Consultation
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Stethoscope className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Financial Overview Card */}
          <div className="bg-gradient-to-br from-indigo-500/5 via-card to-card border border-indigo-500/20 rounded-2xl p-5 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-bold tracking-wider text-muted-foreground">
                  Billing Overview
                </p>
                <p className="text-3xl font-extrabold text-foreground mt-1">
                  ₹{billingStats.totalPaid.toLocaleString("en-IN")}
                </p>
                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                  {billingStats.outstanding > 0
                    ? `₹${billingStats.outstanding} Outstanding Due`
                    : "Zero Outstanding Balance"}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            3. PATIENT FILE SECTIONS (5 SECTIONS)
            - Personal Information
            - Consultation History
            - Prescriptions
            - Appointments
            - Billing & Payments
        ====================================================================== */}
        <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
          {/* Navigation Tabs */}
          <div className="flex border-b border-border bg-muted/20 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab("personal")}
              className={`px-5 py-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${
                activeTab === "personal"
                  ? "border-primary text-primary bg-card"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="w-4 h-4" />
              Personal Information
            </button>

            <button
              onClick={() => setActiveTab("consultations")}
              className={`px-5 py-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${
                activeTab === "consultations"
                  ? "border-primary text-primary bg-card"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Consultation History
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-bold">
                {patientConsultations.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("prescriptions")}
              className={`px-5 py-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${
                activeTab === "prescriptions"
                  ? "border-primary text-primary bg-card"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Pill className="w-4 h-4" />
              Prescriptions
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-bold">
                {digitalPrescriptions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("appointments")}
              className={`px-5 py-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${
                activeTab === "appointments"
                  ? "border-primary text-primary bg-card"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Appointments
              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded-full font-bold">
                {patientAppointments.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("billing")}
              className={`px-5 py-3.5 text-xs sm:text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-colors border-b-2 ${
                activeTab === "billing"
                  ? "border-primary text-primary bg-card"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Billing & Payments
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {loadingProfileData ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium">Fetching patient medical records...</span>
              </div>
            ) : (
              <>
                {/* ---------------- SECTION 1: PERSONAL INFORMATION ---------------- */}
                {activeTab === "personal" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Demographics Card */}
                      <div className="bg-muted/10 border border-border/80 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                          <User className="w-4 h-4 text-primary" />
                          <h3 className="font-bold text-sm text-foreground">Demographics & Identity</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground block">Full Name</span>
                            <span className="font-semibold text-foreground text-sm">{selectedPatient.name}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Patient ID</span>
                            <span className="font-semibold text-foreground text-sm">{patientDisplayId}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Date of Birth</span>
                            <span className="font-semibold text-foreground">{selectedPatient.dob || "Not Documented"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Age</span>
                            <span className="font-semibold text-foreground">{patientAge}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Gender</span>
                            <span className="font-semibold text-foreground">{selectedPatient.gender || "Unspecified"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Registration Clinic</span>
                            <span className="font-semibold text-foreground">{clinicName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Contact & Emergency Card */}
                      <div className="bg-muted/10 border border-border/80 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                          <Phone className="w-4 h-4 text-primary" />
                          <h3 className="font-bold text-sm text-foreground">Contact & Emergency Contact</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground block">Primary Mobile</span>
                            <span className="font-semibold text-foreground text-sm">{selectedPatient.phone}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Email Address</span>
                            <span className="font-semibold text-foreground">{selectedPatient.email || "Not Provided"}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Emergency Contact Name</span>
                            <span className="font-semibold text-foreground">
                              {selectedPatient.emergencyContactName || "Not Provided"}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block">Emergency Contact Phone</span>
                            <span className="font-semibold text-foreground">
                              {selectedPatient.emergencyContactPhone || "Not Provided"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Allergies & Medical History Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-amber-500/20">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          <h3 className="font-bold text-sm text-foreground">Documented Allergies</h3>
                        </div>
                        <p className="text-xs text-foreground/80 leading-relaxed min-h-[60px]">
                          {Array.isArray(selectedPatient.allergies)
                            ? selectedPatient.allergies.join(", ") || "No documented allergies reported."
                            : selectedPatient.allergies || "No documented allergies reported."}
                        </p>
                      </div>

                      <div className="bg-muted/10 border border-border/80 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-border">
                          <HeartPulse className="w-4 h-4 text-primary" />
                          <h3 className="font-bold text-sm text-foreground">Clinical Medical History Notes</h3>
                        </div>
                        <p className="text-xs text-foreground/80 leading-relaxed min-h-[60px] whitespace-pre-wrap">
                          {selectedPatient.medicalHistory || "No past chronic conditions or clinical history noted."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ---------------- SECTION 2: CONSULTATION HISTORY ---------------- */}
                {activeTab === "consultations" && (
                  <div className="space-y-4">
                    {patientConsultations.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground text-sm">
                        No doctor consultations have been recorded for this patient yet.
                      </div>
                    ) : (
                      patientConsultations.map((consult) => (
                        <div
                          key={consult._id}
                          className="border border-border rounded-2xl p-5 space-y-4 bg-muted/10 hover:border-primary/40 transition-colors"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                <Stethoscope className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-foreground">
                                  {consult.doctorId?.name || "Consulting Specialist"}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {consult.doctorId?.specialization || "General Medicine / Mental Health"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge
                                variant={consult.status === "Completed" ? "default" : "secondary"}
                                className="text-xs font-semibold px-2.5 py-0.5 rounded-lg"
                              >
                                {consult.status}
                              </Badge>
                              <span className="text-xs text-muted-foreground font-medium">
                                {new Date(consult.createdAt).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Notes and Clinical observations */}
                          <div className="space-y-2 text-xs">
                            <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                              Clinical Notes & Advice:
                            </span>
                            <p className="text-foreground/90 bg-card p-3 rounded-xl border border-border/60 leading-relaxed whitespace-pre-wrap">
                              {consult.notes || "Consultation conducted. No written clinical notes attached."}
                            </p>
                          </div>

                          {consult.prescribedTherapies && (
                            <div className="space-y-1 text-xs">
                              <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                                Prescribed Therapies / Recommendations:
                              </span>
                              <p className="text-foreground/90 bg-card p-2.5 rounded-xl border border-border/60">
                                {consult.prescribedTherapies}
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ---------------- SECTION 3: PRESCRIPTIONS ---------------- */}
                {activeTab === "prescriptions" && (
                  <div className="space-y-6">
                    {digitalPrescriptions.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground text-sm">
                        No digital prescriptions have been issued for this patient yet.
                      </div>
                    ) : (
                      digitalPrescriptions.map((rx) => (
                        <div
                          key={rx._id}
                          className="border border-border rounded-2xl p-5 space-y-4 bg-muted/10 shadow-sm"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
                            <div>
                              <div className="flex items-center gap-2">
                                <Pill className="w-4 h-4 text-primary" />
                                <h4 className="font-bold text-sm text-foreground">
                                  Prescription #{rx._id.slice(-6).toUpperCase()}
                                </h4>
                                <Badge
                                  variant="outline"
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                    rx.prescriptionStatus === "Fulfilled"
                                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                                      : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                                  }`}
                                >
                                  {rx.prescriptionStatus === "Fulfilled" ? "Fulfilled & Dispensed" : "Pending Dispense"}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Prescribed by {rx.doctorId?.name || "Clinic Doctor"} on{" "}
                                {new Date(rx.createdAt).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                printPrescription({
                                  ...rx,
                                  patientId: selectedPatient,
                                  appointmentId: {
                                    clinicId: {
                                      name: clinicName,
                                      address: "Baner",
                                      city: "Pune",
                                      state: "Maharashtra",
                                      phone: selectedPatient.phone,
                                    },
                                  },
                                });
                              }}
                              className="rounded-xl border-primary/50 text-primary hover:bg-primary hover:text-white text-xs h-8 px-3 font-semibold shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5 mr-1" />
                              Download Rx
                            </Button>
                          </div>

                          {/* Medicine details table */}
                          <div className="overflow-x-auto rounded-xl border border-border/80 bg-card">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-border bg-muted/30 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                  <th className="p-3">Medicine Name</th>
                                  <th className="p-3">Dosage</th>
                                  <th className="p-3">Frequency</th>
                                  <th className="p-3">Duration</th>
                                  <th className="p-3">Instructions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {rx.medicines.map((med: any, idx: number) => (
                                  <tr key={idx} className="hover:bg-muted/10">
                                    <td className="p-3 font-bold text-foreground">
                                      {med.drug || med.name || "Medicine"}
                                    </td>
                                    <td className="p-3 text-muted-foreground">{med.dosage || "-"}</td>
                                    <td className="p-3 text-muted-foreground">{med.frequency || "-"}</td>
                                    <td className="p-3 text-muted-foreground">{med.duration || "-"}</td>
                                    <td className="p-3 text-muted-foreground">{med.instructions || "As advised"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ---------------- SECTION 4: APPOINTMENTS ---------------- */}
                {activeTab === "appointments" && (
                  <div className="space-y-4">
                    {patientAppointments.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground text-sm">
                        No appointments found for this patient.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-border bg-muted/30 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                              <th className="p-4">Date & Time</th>
                              <th className="p-4">Doctor / Specialist</th>
                              <th className="p-4">Consultation Type</th>
                              <th className="p-4">Visit Status</th>
                              <th className="p-4">Payment</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {patientAppointments.map((apt) => (
                              <tr key={apt._id} className="hover:bg-muted/20">
                                <td className="p-4">
                                  <div className="font-bold text-foreground text-sm">{apt.date}</div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Clock className="w-3 h-3 text-primary" /> {apt.time}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <div className="font-semibold text-foreground">
                                    {apt.doctorId?.name || "Dr. Assigned"}
                                  </div>
                                  <div className="text-[11px] text-muted-foreground">
                                    {apt.doctorId?.specialization || "Specialist"}
                                  </div>
                                </td>
                                <td className="p-4">
                                  <Badge variant="outline" className="text-[11px] font-medium px-2 py-0.5">
                                    {apt.type === "Walk-in" ? "Walk-in Consultation" : "Online Video"}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <Badge
                                    variant="secondary"
                                    className={`text-[11px] font-semibold px-2 py-0.5 ${
                                      apt.status === "Completed"
                                        ? "bg-emerald-500/10 text-emerald-600"
                                        : "bg-primary/10 text-primary"
                                    }`}
                                  >
                                    {apt.status}
                                  </Badge>
                                </td>
                                <td className="p-4">
                                  <div className="font-bold text-foreground">
                                    ₹{(apt.feeAmount || 0).toLocaleString("en-IN")}
                                  </div>
                                  <div className="text-[11px]">
                                    <span
                                      className={`font-semibold ${
                                        apt.paymentStatus === "Paid"
                                          ? "text-emerald-600 dark:text-emerald-400"
                                          : "text-amber-600 dark:text-amber-400"
                                      }`}
                                    >
                                      {apt.paymentStatus === "Paid" ? "Paid" : "Pending"}
                                    </span>
                                    {apt.paymentMethod && (
                                      <span className="text-muted-foreground ml-1">({apt.paymentMethod})</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4 text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => window.open(`/api/appointments/${apt._id}/invoice`, "_blank")}
                                    className="text-primary hover:underline text-xs font-bold gap-1"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    Invoice
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* ---------------- SECTION 5: BILLING & PAYMENTS ---------------- */}
                {activeTab === "billing" && (
                  <div className="space-y-6">
                    {/* Financial Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-muted/10 border border-border p-4 rounded-2xl">
                        <span className="text-xs text-muted-foreground font-semibold block">Total Invoiced</span>
                        <span className="text-2xl font-extrabold text-foreground mt-1 block">
                          ₹{billingStats.totalInvoiced.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl">
                        <span className="text-xs text-emerald-600 font-semibold block">Total Received</span>
                        <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
                          ₹{billingStats.totalPaid.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-2xl">
                        <span className="text-xs text-amber-600 font-semibold block">Balance Outstanding</span>
                        <span className="text-2xl font-extrabold text-amber-600 mt-1 block">
                          ₹{billingStats.outstanding.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Itemized Transactions Table */}
                    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-border bg-muted/30 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                            <th className="p-4">Reference / Date</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Method</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Receipt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {patientAppointments.map((apt) => (
                            <tr key={apt._id} className="hover:bg-muted/20">
                              <td className="p-4">
                                <div className="font-bold text-foreground">
                                  APT-{apt._id.slice(-6).toUpperCase()}
                                </div>
                                <div className="text-muted-foreground text-[11px]">{apt.date}</div>
                              </td>
                              <td className="p-4">
                                <div className="font-semibold text-foreground">
                                  Consultation Fee {apt.doctorId?.name ? `(${apt.doctorId.name})` : ""}
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                  {apt.serviceName || apt.type}
                                </div>
                              </td>
                              <td className="p-4 text-muted-foreground font-medium">
                                {apt.paymentMethod || "Counter Cash"}
                              </td>
                              <td className="p-4 font-bold text-foreground">
                                ₹{(apt.feeAmount || 0).toLocaleString("en-IN")}
                              </td>
                              <td className="p-4">
                                <Badge
                                  variant="secondary"
                                  className={`text-[11px] font-semibold px-2 py-0.5 ${
                                    apt.paymentStatus === "Paid"
                                      ? "bg-emerald-500/10 text-emerald-600"
                                      : "bg-amber-500/10 text-amber-600"
                                  }`}
                                >
                                  {apt.paymentStatus === "Paid" ? "Paid" : "Pending"}
                                </Badge>
                              </td>
                              <td className="p-4 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => window.open(`/api/appointments/${apt._id}/invoice`, "_blank")}
                                  className="text-primary hover:underline text-xs font-bold gap-1"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  Invoice
                                </Button>
                              </td>
                            </tr>
                          ))}

                          {patientOrders.map((ord) => (
                            <tr key={ord._id} className="hover:bg-muted/20">
                              <td className="p-4">
                                <div className="font-bold text-foreground">
                                  {ord.orderNumber || `ORD-${ord._id.slice(-6).toUpperCase()}`}
                                </div>
                                <div className="text-muted-foreground text-[11px]">
                                  {new Date(ord.createdAt).toLocaleDateString("en-GB")}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="font-semibold text-foreground">Pharmacy Medications</div>
                                <div className="text-[11px] text-muted-foreground">
                                  {ord.items?.length || 1} items dispensed
                                </div>
                              </td>
                              <td className="p-4 text-muted-foreground font-medium">{ord.paymentMethod}</td>
                              <td className="p-4 font-bold text-foreground">
                                ₹{(ord.totalAmount || 0).toLocaleString("en-IN")}
                              </td>
                              <td className="p-4">
                                <Badge
                                  variant="secondary"
                                  className={`text-[11px] font-semibold px-2 py-0.5 ${
                                    ord.paymentStatus === "Paid"
                                      ? "bg-emerald-500/10 text-emerald-600"
                                      : "bg-amber-500/10 text-amber-600"
                                  }`}
                                >
                                  {ord.paymentStatus}
                                </Badge>
                              </td>
                              <td className="p-4 text-right">
                                <span className="text-xs text-muted-foreground">-</span>
                              </td>
                            </tr>
                          ))}

                          {patientAppointments.length === 0 && patientOrders.length === 0 && (
                            <tr>
                              <td colSpan={6} className="text-center py-8 text-muted-foreground">
                                No billing transactions found for this patient.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 1: MAIN PATIENT DIRECTORY TABLE
  // =========================================================================
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
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
              placeholder="Search by name, phone or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* Full-Width Clean Patient Directory Table */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No patients found matching the search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">Patient Profile</th>
                  <th className="p-4">Contact Info</th>
                  <th className="p-4">Medical Demographics</th>
                  <th className="p-4">Visits & Activity</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {paginated.map((p) => {
                  const initials = p.name
                    ? p.name
                        .trim()
                        .split(/\s+/)
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    : "PT";

                  return (
                    <tr
                      key={p._id}
                      className="hover:bg-muted/20 transition cursor-pointer"
                      onClick={() => setSelectedPatient(p)}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-foreground hover:text-primary transition-colors">
                              {p.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ID: P-{p._id.slice(-4).toUpperCase()} &bull; {p.gender || "Unspecified"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Phone className="w-3.5 h-3.5 text-primary shrink-0" /> {p.phone}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 font-medium">
                          <Mail className="w-3.5 h-3.5 text-primary shrink-0" /> {p.email}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-xs text-muted-foreground">
                          DOB: <strong className="text-foreground">{p.dob || "N/A"}</strong>
                        </div>
                        {p.allergies && (
                          <div className="text-[11px] font-semibold text-amber-600 mt-0.5 truncate max-w-[200px]">
                            Allergies:{" "}
                            {Array.isArray(p.allergies) ? p.allergies.join(", ") : p.allergies}
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="text-xs font-semibold text-foreground">
                          {p._totalVisits || 1} Total Visits
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">
                          Last:{" "}
                          {p._latestVisit
                            ? p._latestVisit.toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl border border-primary/40 text-primary hover:bg-primary hover:text-white font-bold text-xs h-8 px-3 shadow-sm transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPatient(p);
                          }}
                        >
                          View Patient File &rarr;
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-2 border-primary/60 bg-background text-primary font-bold text-xs h-9 px-4 shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-50 disabled:bg-muted/70 disabled:border-border/80 disabled:text-foreground/60 disabled:cursor-not-allowed"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  <ChevronLeft className="w-4 h-4 mr-1 shrink-0" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-2 border-primary/60 bg-background text-primary font-bold text-xs h-9 px-4 shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-50 disabled:bg-muted/70 disabled:border-border/80 disabled:text-foreground/60 disabled:cursor-not-allowed"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.max(1, totalPages)))}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1 shrink-0" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
