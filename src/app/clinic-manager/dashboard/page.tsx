"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  UserPlus, 
  Calendar, 
  Clock,
  Video,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Phone,
  Users,
  CreditCard,
  Plus,
  Zap,
  X,
  Pill
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DoctorData {
  _id: string;
  name: string;
  specialization: string;
}

interface PatientData {
  _id: string;
  name: string;
  phone: string;
  email: string;
}

interface AppointmentData {
  _id: string;
  date: string;
  time: string;
  type: string;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  patientId?: PatientData;
  doctorId?: {
    name: string;
  };
}

interface Slot {
  start: string;
  end: string;
  available: boolean;
}

interface TherapySessionData {
  _id: string;
  status: "Unpaid" | "Paid";
}

interface ConsultationData {
  _id: string;
  prescriptionSummary?: string;
  status: string;
  patientId?: PatientData;
  doctorId?: {
    name: string;
  };
  appointmentId?: {
    date: string;
  };
}

export default function ClinicManagerDashboardPage() {
  const router = useRouter();
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [clinicName, setClinicName] = useState("");
  const [clinicLocation, setClinicLocation] = useState("");
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [consultations, setConsultations] = useState<ConsultationData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal visibility states
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showInstantModal, setShowInstantModal] = useState(false);

  // Form states (Onboarding)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [allergies, setAllergies] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");
  
  // Scheduling states
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("In-person");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [slots, setSlots] = useState<Slot[]>([]);

  // Action status/errors
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const resetForms = () => {
    setName("");
    setEmail("");
    setPhone("");
    setGender("Male");
    setDob("");
    setAllergies("");
    setMedicalHistory("");
    setSelectedPatientId("");
    setSelectedDoctor("");
    setSelectedDate("");
    setSelectedTime("");
    setAppointmentType("In-person");
    setPaymentMethod("Cash");
    setPaymentStatus("Paid");
    setSlots([]);
    setSuccessMsg("");
    setErrorMsg("");
  };

  const fetchData = async () => {
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
        // Fetch clinic details
        const clinicRes = await fetch(`/api/clinics/${cId}`);
        const clinicJson = await clinicRes.json();
        if (clinicJson.success) {
          setClinicName(clinicJson.data.name);
          setClinicLocation(clinicJson.data.city);
        }

        // Fetch clinic doctors
        const docsRes = await fetch(`/api/doctors?clinicId=${cId}`);
        const docsJson = await docsRes.json();
        if (docsJson.success) {
          setDoctors(docsJson.data);
        }

        // Fetch appointments
        const aptsRes = await fetch(`/api/appointments?clinicId=${cId}`);
        const aptsJson = await aptsRes.json();
        if (aptsJson.success) {
          setAppointments(aptsJson.data);

          // Build unique patient list
          const patientMap = new Map<string, PatientData>();
          aptsJson.data.forEach((apt: AppointmentData) => {
            if (apt.patientId && apt.patientId._id) {
              patientMap.set(apt.patientId._id, apt.patientId);
            }
          });
          setPatients(Array.from(patientMap.values()));
        }

        // Fetch Therapy Sessions to get unpaid count
        const therapyRes = await fetch(`/api/therapy-sessions?clinicId=${cId}`);
        const therapyJson = await therapyRes.json();
        if (therapyJson.success) {
          const unpaid = therapyJson.data.filter((t: TherapySessionData) => t.status === "Unpaid").length;
          setUnpaidCount(unpaid);
        }

        // Fetch consultations (prescriptions)
        const consultRes = await fetch(`/api/consultations?clinicId=${cId}`);
        const consultJson = await consultRes.json();
        if (consultJson.success) {
          setConsultations(consultJson.data);
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch slots when doctor or date changes in booking modals
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDoctor || !selectedDate) {
        setSlots([]);
        return;
      }
      try {
        const slotsRes = await fetch(`/api/doctors/${selectedDoctor}/slots?date=${selectedDate}`);
        const slotsJson = await slotsRes.json();
        if (slotsJson.success) {
          setSlots(slotsJson.data);
        }
      } catch (err) {
        console.error("Failed to load doctor slots:", err);
      }
    };
    fetchSlots();
  }, [selectedDoctor, selectedDate]);

  // Submit handlers
  const handleCollectCash = async (appointmentId: string) => {
    const amountStr = window.prompt("Enter the amount collected (₹):", "1499");
    if (amountStr === null) return; // User cancelled

    const amount = Number(amountStr);
    if (isNaN(amount) || amount < 0) {
      alert("Please enter a valid amount.");
      return;
    }

    try {
      const res = await fetch(`/api/appointments/${appointmentId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => prev.map(a => a._id === appointmentId ? { ...a, paymentStatus: "Paid" } : a));
      } else {
        alert("Failed to collect cash: " + data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error collecting cash payment.");
    }
  };

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    const payload = {
      name,
      email,
      phone,
      gender,
      dob: dob || undefined,
      allergies: allergies || undefined,
      medicalHistory: medicalHistory || undefined
    };

    try {
      const res = await fetch("/api/clinic-manager/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (!resData.success) {
        throw new Error(resData.message || "Failed to onboard patient.");
      }

      setSuccessMsg("Patient registered successfully!");
      setTimeout(() => {
        setShowRegisterModal(false);
        resetForms();
        fetchData();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    const payload = {
      patientId: selectedPatientId,
      doctorId: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      type: appointmentType,
      notes: "Booked at Clinic Manager counter."
    };

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (!resData.success) {
        throw new Error(resData.message || "Failed to book appointment.");
      }

      setSuccessMsg("Appointment booked successfully!");
      setTimeout(() => {
        setShowBookModal(false);
        resetForms();
        fetchData();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInstantAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    const payload = {
      name,
      email,
      phone,
      gender,
      dob: dob || undefined,
      allergies: allergies || undefined,
      medicalHistory: medicalHistory || undefined,
      doctorId: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      type: appointmentType,
      paymentMethod,
      paymentStatus
    };

    try {
      const res = await fetch("/api/clinic-manager/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (!resData.success) {
        throw new Error(resData.message || "Failed to process walk-in booking.");
      }

      setSuccessMsg("Walk-in patient registered & scheduled successfully!");
      setTimeout(() => {
        setShowInstantModal(false);
        resetForms();
        fetchData();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  
  // Calculate stats
  const scheduledToday = appointments.filter(a => a.status === "Scheduled" && a.date === todayStr);
  const totalUpcomingCount = appointments.filter(a => a.status === "Scheduled").length;
  
  // Filter prescriptions (completed consultations with prescriptionSummary)
  const prescriptionLogs = consultations.filter(c => c.status === "Completed" && c.prescriptionSummary);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading Clinic Manager Dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-card border border-border shadow-sm rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex gap-4 items-center">
          <div className="w-16 h-16 rounded-full border border-border bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{clinicName || "Pune Intimacy Clinic"}</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              Control Panel & Onsite Actions
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-row items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 shrink-0">
          <Button
            onClick={() => { resetForms(); setShowInstantModal(true); }}
            className="text-white font-bold h-11 px-5 rounded-2xl flex items-center gap-2 shrink-0"
          >
            <Zap className="w-4 h-4" /> Instant Appointment
          </Button>
          <Button
            variant="outline"
            onClick={() => { resetForms(); setShowRegisterModal(true); }}
            className="font-bold h-11 px-5 rounded-2xl flex items-center gap-2 shrink-0"
          >
            <UserPlus className="w-4 h-4" /> Register Walk-in
          </Button>
          <Button
            variant="outline"
            onClick={() => { resetForms(); setShowBookModal(true); }}
            className="font-bold h-11 px-5 rounded-2xl flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" /> Book Existing
          </Button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div 
          onClick={() => router.push("/clinic-manager/appointments")}
          className="bg-card border border-border p-6 rounded-3xl shadow-sm flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition duration-200 hover:border-primary/40 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Scheduled Today</p>
            <h3 className="text-2xl font-black mt-0.5">{scheduledToday.length}</h3>
          </div>
        </div>

        <div 
          onClick={() => router.push("/clinic-manager/patients")}
          className="bg-card border border-border p-6 rounded-3xl shadow-sm flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition duration-200 hover:border-primary/40 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Patients</p>
            <h3 className="text-2xl font-black mt-0.5">{patients.length}</h3>
          </div>
        </div>

        <div 
          onClick={() => router.push("/clinic-manager/prescriptions")}
          className="bg-card border border-border p-6 rounded-3xl shadow-sm flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition duration-200 hover:border-primary/40 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pharmacy Orders</p>
            <h3 className="text-2xl font-black mt-0.5">{prescriptionLogs.length}</h3>
          </div>
        </div>

        <div 
          onClick={() => router.push("/clinic-manager/payments")}
          className="bg-card border border-border p-6 rounded-3xl shadow-sm flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition duration-200 hover:border-primary/40 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Unpaid Therapies</p>
            <h3 className="text-2xl font-black mt-0.5">{unpaidCount}</h3>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column (Patients Directory Quick List) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Today's Upcoming Appointments</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push("/clinic-manager/appointments")} className="text-xs text-primary font-bold hover:underline px-0">
                View All ({scheduledToday.length})
              </Button>
            </div>

            {scheduledToday.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No upcoming appointments today.
              </div>
            ) : (
              <div className="divide-y divide-border overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/20 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <th className="p-3">Patient</th>
                      <th className="p-3">Time & Type</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {scheduledToday.map((apt) => (
                      <tr key={apt._id} className="hover:bg-muted/10 transition">
                        <td className="p-3">
                          <div className="font-bold text-foreground">{apt.patientId?.name || "Patient"}</div>
                          <div className="text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {apt.patientId?.phone || "No phone"}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-muted-foreground" /> {apt.time}</div>
                          <div className="text-muted-foreground flex items-center gap-1 mt-0.5">
                            {apt.type === "Video" ? <Video className="w-3 h-3 text-blue-500" /> : <MapPin className="w-3 h-3 text-green-500" />} {apt.type}
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge className="text-[10px]">{apt.status}</Badge>
                        </td>
                        <td className="p-3 text-right">
                          {apt.paymentMethod === "Cash" && apt.paymentStatus !== "Paid" && (
                            <Button onClick={() => handleCollectCash(apt._id)} size="sm" className="h-7 text-[10px] px-3 bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-500/10">
                              Payment Confirm
                            </Button>
                          )}
                          {apt.paymentStatus === "Paid" && (
                             <span className="text-[10px] font-bold text-emerald-600 inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> Paid</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Clinic Specialists</h2>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                {doctors.length} Active
              </Badge>
            </div>

            {doctors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No doctors assigned to this clinic yet.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {doctors.map((d) => (
                  <div key={d._id} className="flex items-center gap-3 p-3.5 rounded-2xl border border-border bg-muted/10 hover:border-primary/20 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                      {d.name.split(" ").filter(n => n.toLowerCase() !== "dr.").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">Dr. {d.name}</h4>
                      <p className="text-xs text-muted-foreground">{d.specialization}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Recent Patients list) */}
        <div className="p-6 bg-card border border-border rounded-3xl shadow-sm space-y-4 max-h-[500px] flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold">Recent Patients</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/clinic-manager/patients")} className="text-xs text-primary font-bold hover:underline px-0">
              View Directory
            </Button>
          </div>

          {patients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm flex-1 flex items-center justify-center">
              No patients registered yet.
            </div>
          ) : (
            <div className="divide-y divide-border overflow-y-auto pr-1 flex-1 space-y-1">
              {patients.slice(0, 10).map((p) => (
                <div key={p._id} className="py-3 first:pt-0 last:pb-0 space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{p.name}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> {p.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/40">
                    <span className="truncate max-w-[180px]">{p.email || "No email"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL 1: REGISTER WALKIN PATIENT --- */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl w-full max-w-xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button 
              onClick={() => setShowRegisterModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-border pb-3">
              <UserPlus className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Register Walk-in Patient</h3>
            </div>

            <form onSubmit={handleRegisterPatient} className="space-y-4">
              {successMsg && (
                <div className="p-3.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs font-medium rounded-xl border border-emerald-200/50 flex items-center gap-2">
                  <CheckCircle2 className="w-4.5 h-4.5 shrink-0" /> {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 text-xs font-medium rounded-xl border border-rose-200/50 flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" /> {errorMsg}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Amit Kumar"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="amit@gmail.com"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Allergies</label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="Penicillin, Peanuts"
                    className="w-full h-10 px-3 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Medical History Notes</label>
                <textarea
                  rows={2}
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="Chronic diseases, past surgeries, active medications..."
                  className="w-full p-2.5 rounded-lg border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <Button type="submit" disabled={submitting} className="w-full h-11 text-white font-bold rounded-xl">
                {submitting ? "Registering..." : "Onboard Patient Profile"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: BOOK EXISTING APPOINTMENT --- */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button 
              onClick={() => setShowBookModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Book Appointment</h3>
            </div>

            <form onSubmit={handleBookAppointment} className="space-y-4">
              {successMsg && (
                <div className="p-3.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs font-medium rounded-xl border border-emerald-200/50 flex items-center gap-2">
                  <CheckCircle2 className="w-4.5 h-4.5 shrink-0" /> {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 text-xs font-medium rounded-xl border border-rose-200/50 flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" /> {errorMsg}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Patient *</label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">-- Choose Registered Patient --</option>
                  {patients.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} ({p.phone})</option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Doctor *</label>
                  <select
                    required
                    value={selectedDoctor}
                    onChange={(e) => setSelectedDoctor(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">-- Choose Specialist --</option>
                    {doctors.map((d) => (
                      <option key={d._id} value={d._id}>Dr. {d.name} ({d.specialization})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Consultation Type</label>
                  <select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="In-person">In-person</option>
                    <option value="Video">Video Call</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Date *</label>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Available Slots *</label>
                  <select
                    required
                    disabled={slots.length === 0}
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">-- Choose Slot --</option>
                    {slots.map((s, idx) => (
                      <option key={idx} value={s.start} disabled={!s.available}>
                        {s.start} {s.available ? "" : "(Booked)"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full h-11 text-white font-bold rounded-xl mt-2">
                {submitting ? "Booking..." : "Schedule Appointment"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 3: INSTANT APPOINTMENT --- */}
      {showInstantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button 
              onClick={() => setShowInstantModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Instant Walk-in Booking</h3>
            </div>

            <form onSubmit={handleInstantAppointment} className="space-y-4">
              {successMsg && (
                <div className="p-3.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs font-medium rounded-xl border border-emerald-200/50 flex items-center gap-2">
                  <CheckCircle2 className="w-4.5 h-4.5 shrink-0" /> {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 text-xs font-medium rounded-xl border border-rose-200/50 flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" /> {errorMsg}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Patient Block */}
                <div className="space-y-3 p-4 bg-muted/20 border border-border rounded-2xl">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary">Patient Info</h4>
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Name"
                        className="w-full h-9 px-2.5 rounded-lg border border-border bg-transparent text-sm focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full h-9 px-2.5 rounded-lg border border-border bg-transparent text-sm focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone *</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="WhatsApp phone"
                        className="w-full h-9 px-2.5 rounded-lg border border-border bg-transparent text-sm focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Gender</label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full h-9 px-2 rounded-lg border border-border bg-background text-xs"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">DOB</label>
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full h-9 px-2 rounded-lg border border-border bg-background text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scheduling Block */}
                <div className="space-y-3 p-4 bg-muted/25 border border-border rounded-2xl">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-primary">Appointment Slots</h4>
                  <div className="space-y-2.5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Doctor *</label>
                      <select
                        required
                        value={selectedDoctor}
                        onChange={(e) => setSelectedDoctor(e.target.value)}
                        className="w-full h-9 px-2 rounded-lg border border-border bg-background text-xs"
                      >
                        <option value="">-- Select Specialist --</option>
                        {doctors.map((d) => (
                          <option key={d._id} value={d._id}>Dr. {d.name} ({d.specialization})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Date *</label>
                      <input
                        type="date"
                        required
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Time Slot *</label>
                      <select
                        required
                        disabled={slots.length === 0}
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full h-9 px-2 rounded-lg border border-border bg-background text-xs"
                      >
                        <option value="">-- Choose Slot --</option>
                        {slots.map((s, idx) => (
                          <option key={idx} value={s.start} disabled={!s.available}>
                            {s.start} {s.available ? "" : "(Booked)"}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Type</label>
                      <select
                        value={appointmentType}
                        onChange={(e) => setAppointmentType(e.target.value)}
                        className="w-full h-9 px-2 rounded-lg border border-border bg-background text-xs"
                      >
                        <option value="In-person">In-person</option>
                        <option value="Video">Video Call</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Allergies</label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="Penicillin, Peanuts"
                    className="w-full h-9 px-2.5 rounded-lg border border-border bg-transparent text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Medical History</label>
                  <input
                    type="text"
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    placeholder="Sugar, Thyroid, BP, etc."
                    className="w-full h-9 px-2.5 rounded-lg border border-border bg-transparent text-xs"
                  />
                </div>
              </div>

              <div className="grid gap-2 grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg border border-border bg-background text-xs"
                  >
                    <option value="Cash">Cash (At Clinic)</option>
                    <option value="Online">Online</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg border border-border bg-background text-xs"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="w-full h-11 text-white font-bold rounded-xl mt-2">
                {submitting ? "Processing Walk-in Booking..." : "Register & Book Instant Appointment"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
