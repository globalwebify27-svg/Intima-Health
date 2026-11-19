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
  Pill,
  Download,
  MessageCircle,
  Mail,
  Trash2,
  Send,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatTime12Hour } from "@/lib/utils";

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
  serviceName?: string;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  feeAmount?: number;
  patientId?: PatientData;
  doctorId?: {
    _id: string;
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
  name: string;
  price: number;
  status: string;
  date?: string;
  time?: string;
  patientId: PatientData;
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
  const [advisedCount, setAdvisedCount] = useState(0);
  const [recommendedTherapies, setRecommendedTherapies] = useState<TherapySessionData[]>([]);
  const [consultations, setConsultations] = useState<ConsultationData[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal visibility states
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
  const [appointmentType, setAppointmentType] = useState("Walk-in");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [slots, setSlots] = useState<Slot[]>([]);

  // Action status/errors
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Phone OTP Verification states for Instant Booking
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, "");
    const last10 = digits.slice(-10);
    if (last10.length < 10) {
      setOtpError("Please enter a valid 10-digit WhatsApp number.");
      return;
    }

    setSendingOtp(true);
    setOtpError("");
    try {
      const res = await fetch("/api/clinic-manager/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: last10 }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to send OTP.");
      }
      setOtpSent(true);
      setOtpCountdown(60);
    } catch (err: any) {
      setOtpError(err.message || "Error sending OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const digits = phone.replace(/\D/g, "");
    const last10 = digits.slice(-10);
    if (!otpCode || otpCode.trim().length !== 6) {
      setOtpError("Please enter the complete 6-digit OTP.");
      return;
    }

    setVerifyingOtp(true);
    setOtpError("");
    try {
      const res = await fetch("/api/clinic-manager/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: last10, otp: otpCode.trim() }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Invalid OTP code.");
      }
      setIsPhoneVerified(true);
      setOtpSent(false);
      setOtpError("");
    } catch (err: any) {
      setOtpError(err.message || "Failed to verify OTP.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Therapy reminder & dismissal state
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [dismissingReminderId, setDismissingReminderId] = useState<string | null>(null);
  const [reminderSentMap, setReminderSentMap] = useState<Record<string, boolean>>({});
  const [reminderToast, setReminderToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (reminderToast) {
      const timer = setTimeout(() => setReminderToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [reminderToast]);

  const handleSendTherapyReminder = async (ts: TherapySessionData) => {
    try {
      setSendingReminderId(ts._id);
      const res = await fetch(`/api/therapy-sessions/${ts._id}/remind`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setReminderSentMap((prev) => ({ ...prev, [ts._id]: true }));
        setReminderToast({ type: "success", text: data.message || `Reminder dispatched to ${ts.patientId?.name || "patient"}!` });
      } else {
        setReminderToast({ type: "error", text: data.message || "Failed to dispatch reminder." });
      }
    } catch (err: any) {
      setReminderToast({ type: "error", text: err.message || "Network error while sending reminder." });
    } finally {
      setSendingReminderId(null);
    }
  };

  const handleDismissTherapy = async (tsId: string) => {
    if (!confirm("Are you sure you want to dismiss/remove this pending therapy reminder?")) return;
    try {
      setDismissingReminderId(tsId);
      const res = await fetch(`/api/therapy-sessions/${tsId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setRecommendedTherapies((prev) => prev.filter((t) => t._id !== tsId));
        setAdvisedCount((prev) => Math.max(0, prev - 1));
        setReminderToast({ type: "success", text: "Pending reminder dismissed successfully." });
      } else {
        setReminderToast({ type: "error", text: data.message || "Failed to dismiss reminder." });
      }
    } catch (err: any) {
      setReminderToast({ type: "error", text: err.message || "Network error while dismissing." });
    } finally {
      setDismissingReminderId(null);
    }
  };

  // Reschedule state
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleApt, setRescheduleApt] = useState<AppointmentData | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState<{ start: string; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

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
    setAppointmentType("Walk-in");
    setPaymentMethod("Cash");
    setPaymentStatus("Paid");
    setSlots([]);
    setSuccessMsg("");
    setErrorMsg("");
    setIsPhoneVerified(false);
    setOtpSent(false);
    setOtpCode("");
    setOtpError("");
    setOtpCountdown(0);
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

        // Fetch Therapy Sessions to get advised count
        const therapyRes = await fetch(`/api/therapy-sessions?clinicId=${cId}`);
        const therapyJson = await therapyRes.json();
        if (therapyJson.success) {
          const advised = therapyJson.data.filter((t: TherapySessionData) => t.status === "Recommended" || t.status === "Unpaid");
          setAdvisedCount(advised.length);
          setRecommendedTherapies(advised);
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
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchData();
    }, 30000);
    const onFocus = () => fetchData();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(interval); window.removeEventListener("focus", onFocus); };
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

  // Reschedule slot fetching
  useEffect(() => {
    if (rescheduleDate && rescheduleApt && rescheduleApt.doctorId) {
      const getSlots = async () => {
        setLoadingSlots(true);
        try {
          const res = await fetch(`/api/doctors/${rescheduleApt.doctorId?._id}/slots?date=${rescheduleDate}`);
          const json = await res.json();
          if (json.success) {
            setAvailableSlots(json.data);
          }
        } catch (err) {
          console.error("Failed to fetch slots", err);
        } finally {
          setLoadingSlots(false);
        }
      };
      getSlots();
    }
  }, [rescheduleDate, rescheduleApt]);

  const handleRescheduleSubmit = async () => {
    if (!rescheduleApt || !rescheduleDate || !rescheduleTime) return;
    setActionLoading("reschedule");
    setErrorMsg("");
    setSuccessMsg("");
    
    try {
      const res = await fetch(`/api/appointments/${rescheduleApt._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: rescheduleDate, time: rescheduleTime })
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.message || "Failed to reschedule.");
      }
      setSuccessMsg("Appointment rescheduled successfully!");
      setShowRescheduleModal(false);
      setRescheduleApt(null);
      await fetchData(); // Refresh dashboard data
    } catch (err: any) {
      let rawMsg = err.message || "An error occurred.";
      try {
        if (rawMsg.trim().startsWith("[") || rawMsg.trim().startsWith("{")) {
          const parsed = JSON.parse(rawMsg);
          if (Array.isArray(parsed) && parsed.length > 0) {
            rawMsg = parsed.map((p: any) => p.message || p.code).join(", ");
          } else if (parsed.message) {
            rawMsg = parsed.message;
          }
        }
      } catch {}
      setErrorMsg(rawMsg);
    } finally {
      setActionLoading(null);
    }
  };

  // Submit handlers
  const handleCollectCash = async (appointmentId: string) => {
    const apt = appointments.find(a => a._id === appointmentId);
    const defaultAmount = apt?.feeAmount ? apt.feeAmount.toString() : "1499";
    
    const isConfirmed = window.confirm(`Confirm cash collection of ₹${defaultAmount} for this appointment?`);
    if (!isConfirmed) return;

    const amount = Number(defaultAmount);
    if (isNaN(amount) || amount < 0) {
      alert("Invalid amount associated with this appointment.");
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

  const handleSendWhatsAppInvoice = async (appointmentId: string) => {
    setActionLoading(appointmentId + "_wa");
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/send-invoice-whatsapp`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert("Invoice sent via WhatsApp successfully!");
      } else {
        alert("Failed to send WhatsApp message: " + data.message);
      }
    } catch (err) {
      alert("Error sending WhatsApp message.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!json.success) {
        alert("Failed to update status.");
      } else {
        await fetchData();
      }
    } catch (err: any) {
      alert("Error updating status");
    } finally {
      setActionLoading(null);
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
      serviceName: appointmentType === "Video" ? "Online Consultation" : "Walk-in Consultation",
      paymentMethod,
      paymentStatus,
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

      setSuccessMsg("Appointment booked successfully! WhatsApp notification with booking details sent to patient.");
      setTimeout(() => {
        setShowBookModal(false);
        resetForms();
        fetchData();
      }, 4000);
    } catch (err: any) {
      let rawMsg = err.message || "An error occurred.";
      try {
        if (rawMsg.trim().startsWith("[") || rawMsg.trim().startsWith("{")) {
          const parsed = JSON.parse(rawMsg);
          if (Array.isArray(parsed) && parsed.length > 0) {
            rawMsg = parsed.map((p: any) => p.message || p.code).join(", ");
          } else if (parsed.message) {
            rawMsg = parsed.message;
          }
        }
      } catch {}
      setErrorMsg(rawMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInstantAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneVerified) {
      setErrorMsg("Please verify the patient's WhatsApp number with OTP first before booking.");
      return;
    }
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

      const patientPhone = resData.data?.patient?.phone || phone;
      setSuccessMsg(`Walk-in appointment scheduled successfully! WhatsApp confirmation & payment link dispatched to +91 ${patientPhone}.`);
      setTimeout(() => {
        setShowInstantModal(false);
        resetForms();
        fetchData();
      }, 4500);
    } catch (err: any) {
      let rawMsg = err.message || "An error occurred.";
      try {
        if (rawMsg.trim().startsWith("[") || rawMsg.trim().startsWith("{")) {
          const parsed = JSON.parse(rawMsg);
          if (Array.isArray(parsed) && parsed.length > 0) {
            rawMsg = parsed.map((p: any) => p.message || p.code).join(", ");
          } else if (parsed.message) {
            rawMsg = parsed.message;
          }
        }
      } catch {}
      setErrorMsg(rawMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  
  // Calculate stats
  const scheduledToday = appointments.filter(a => ["Scheduled", "Checked In", "Engaged", "Rescheduled"].includes(a.status) && a.date === todayStr);
  const totalUpcomingCount = appointments.filter(a => ["Scheduled", "Rescheduled"].includes(a.status)).length;
  
  // Filter prescriptions (completed consultations with prescriptionSummary)
  const prescriptionLogs = consultations.filter(c => c.status === "Completed" && c.prescriptionSummary && c.prescriptionSummary !== "[]");

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
      <div className="bg-card border border-border shadow-sm rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-5 sm:gap-6">
        <div className="flex gap-3.5 sm:gap-4 items-center">
          <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl sm:rounded-full border border-border bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Building2 className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{clinicName || "Pune Intimacy Clinic"}</h1>
            <p className="text-muted-foreground mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium">
              Control Panel &amp; Onsite Actions
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          <Button
            onClick={() => { resetForms(); setShowInstantModal(true); }}
            className="text-white font-bold h-11 px-5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 w-full sm:w-auto shadow-sm"
          >
            <Zap className="w-4 h-4 shrink-0" /> Instant Appointment
          </Button>
          <Button
            variant="outline"
            onClick={() => { resetForms(); setShowBookModal(true); }}
            className="font-bold h-11 px-5 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 shrink-0" /> Book Existing
          </Button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid gap-3.5 sm:gap-6 grid-cols-2 lg:grid-cols-4">
        <div 
          onClick={() => router.push("/clinic-manager/appointments")}
          className="bg-card border border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 cursor-pointer hover:scale-[1.01] transition duration-200 hover:border-primary/40 group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition">
            <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Scheduled Today</p>
            <h3 className="text-xl sm:text-2xl font-black mt-0.5">{scheduledToday.length}</h3>
          </div>
        </div>

        <div 
          onClick={() => router.push("/clinic-manager/patients")}
          className="bg-card border border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 cursor-pointer hover:scale-[1.01] transition duration-200 hover:border-primary/40 group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Patients</p>
            <h3 className="text-xl sm:text-2xl font-black mt-0.5">{patients.length}</h3>
          </div>
        </div>

        <div 
          onClick={() => router.push("/clinic-manager/prescriptions")}
          className="bg-card border border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 cursor-pointer hover:scale-[1.01] transition duration-200 hover:border-primary/40 group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition">
            <Pill className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Pharmacy Orders</p>
            <h3 className="text-xl sm:text-2xl font-black mt-0.5">{prescriptionLogs.length}</h3>
          </div>
        </div>

        <div 
          onClick={() => router.push("/clinic-manager/payments")}
          className="bg-card border border-border p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 cursor-pointer hover:scale-[1.01] transition duration-200 hover:border-primary/40 group"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition">
            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">Advised Therapies</p>
            <h3 className="text-xl sm:text-2xl font-black mt-0.5">{advisedCount}</h3>
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
              <div>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/20 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="p-3">Patient</th>
                        <th className="p-3">Time &amp; Type</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-center">Payment Status</th>
                        <th className="p-3 text-center">Action</th>
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
                            <div className="font-medium text-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-muted-foreground" /> {formatTime12Hour(apt.time)}</div>
                            <div className="text-muted-foreground flex items-center gap-1 mt-0.5">
                              {apt.serviceName || apt.type}
                            </div>
                          </td>
                          <td className="p-3 flex justify-center">
                            <select
                              className="h-8 w-28 rounded-lg border border-input bg-transparent px-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 font-medium text-center"
                              value={apt.status}
                              disabled={actionLoading === apt._id || apt.status === "Engaged" || apt.type === "Video"}
                              onChange={(e) => {
                                if (e.target.value === "Rescheduled") {
                                  setRescheduleApt(apt);
                                  setShowRescheduleModal(true);
                                } else {
                                  handleUpdateStatus(apt._id, e.target.value);
                                }
                              }}
                            >
                              <option value="Scheduled">Scheduled</option>
                              <option value="Checked In">Checked In</option>
                              <option value="Engaged">Engaged</option>
                              <option value="Checked Out">Checked Out</option>
                              <option value="Completed">Completed</option>
                              <option value="Cancelled">Cancelled</option>
                              <option value="Rescheduled">Rescheduled</option>
                            </select>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                              {["Cash", "UPI", "Card"].includes(apt.paymentMethod || "") && apt.paymentStatus !== "Paid" && (
                                <Button onClick={() => handleCollectCash(apt._id)} size="sm" className="h-7 text-[10px] px-3 bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-500/10">
                                  Payment Confirm
                                </Button>
                              )}
                              {apt.paymentStatus === "Paid" && (
                                 <span className="text-[10px] font-bold text-emerald-600 inline-flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> Paid</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            {apt.paymentStatus === "Paid" && (
                              <div className="flex justify-center items-center gap-2">
                                <button className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-muted" onClick={() => window.open(`/api/appointments/${apt._id}/invoice`, "_blank")} title="Download PDF Invoice">
                                  <Download className="w-4 h-4"/>
                                </button>
                                <button className="text-[#25D366] hover:text-[#20bd5a] transition-colors p-1.5 rounded-full hover:bg-[#25D366]/10" onClick={() => handleSendWhatsAppInvoice(apt._id)} disabled={actionLoading === apt._id + "_wa"} title="Send Invoice via WhatsApp">
                                  {actionLoading === apt._id + "_wa" ? (
                                    <span className="w-4 h-4 rounded-full border-2 border-[#25D366] border-t-transparent animate-spin inline-block"></span>
                                  ) : (
                                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                    </svg>
                                  )}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View (Optimized for Small Screens) */}
                <div className="block md:hidden space-y-3">
                  {scheduledToday.map((apt) => (
                    <div key={apt._id} className="p-3.5 rounded-2xl border border-border bg-muted/10 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-sm text-foreground">{apt.patientId?.name || "Patient"}</div>
                          <div className="text-muted-foreground text-xs flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-primary" /> {apt.patientId?.phone || "No phone"}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-xs text-foreground flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3 text-primary" /> {formatTime12Hour(apt.time)}
                          </div>
                          <div className="text-[10px] text-muted-foreground mt-0.5">
                            {apt.serviceName || apt.type}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-muted-foreground">Status:</span>
                          <select
                            className="h-8 rounded-lg border border-input bg-card px-2 text-xs shadow-sm font-medium"
                            value={apt.status}
                            disabled={actionLoading === apt._id || apt.status === "Engaged" || apt.type === "Video"}
                            onChange={(e) => {
                              if (e.target.value === "Rescheduled") {
                                setRescheduleApt(apt);
                                setShowRescheduleModal(true);
                              } else {
                                handleUpdateStatus(apt._id, e.target.value);
                              }
                            }}
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Checked In">Checked In</option>
                            <option value="Engaged">Engaged</option>
                            <option value="Checked Out">Checked Out</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Rescheduled">Rescheduled</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2">
                          {["Cash", "UPI", "Card"].includes(apt.paymentMethod || "") && apt.paymentStatus !== "Paid" && (
                            <Button onClick={() => handleCollectCash(apt._id)} size="sm" className="h-7 text-[10px] px-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold">
                              Collect Payment
                            </Button>
                          )}
                          {apt.paymentStatus === "Paid" && (
                            <span className="text-[11px] font-bold text-emerald-600 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Paid
                            </span>
                          )}

                          {apt.paymentStatus === "Paid" && (
                            <div className="flex items-center gap-1">
                              <button className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted" onClick={() => window.open(`/api/appointments/${apt._id}/invoice`, "_blank")} title="Download PDF Invoice">
                                <Download className="w-3.5 h-3.5"/>
                              </button>
                              <button className="text-[#25D366] hover:text-[#20bd5a] p-1 rounded-lg hover:bg-[#25D366]/10" onClick={() => handleSendWhatsAppInvoice(apt._id)} disabled={actionLoading === apt._id + "_wa"} title="Send Invoice via WhatsApp">
                                {actionLoading === apt._id + "_wa" ? (
                                  <span className="w-3.5 h-3.5 rounded-full border-2 border-[#25D366] border-t-transparent animate-spin inline-block"></span>
                                ) : (
                                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                                  </svg>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
                      <h4 className="font-bold text-sm text-foreground">{d.name}</h4>
                      <p className="text-xs text-muted-foreground">{d.specialization}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-foreground">Advised Therapies Pending Booking</h2>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                {recommendedTherapies.length} Pending
              </Badge>
            </div>

            {reminderToast && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
                  reminderToast.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                <span>{reminderToast.text}</span>
                <button
                  onClick={() => setReminderToast(null)}
                  className="ml-2 hover:opacity-75 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {recommendedTherapies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No patients currently have pending advised therapies.
              </div>
            ) : (
              <div className="divide-y divide-border text-sm">
                {recommendedTherapies.map((ts) => {
                  const patientPhone = ts.patientId?.phone || "";
                  const patientEmail = ts.patientId?.email && !ts.patientId.email.includes("@noemail-intima.com") ? ts.patientId.email : "";
                  const isSending = sendingReminderId === ts._id;
                  const isDismissing = dismissingReminderId === ts._id;
                  const isSent = !!reminderSentMap[ts._id];

                  return (
                    <div key={ts._id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-foreground truncate">{ts.patientId?.name || "Patient"}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            {patientPhone ? (
                              <span className="font-mono">{patientPhone}</span>
                            ) : (
                              <span className="italic text-muted-foreground/70">No phone</span>
                            )}
                          </span>
                          {patientEmail && (
                            <span className="flex items-center gap-1 text-muted-foreground truncate max-w-[180px]">
                              <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{patientEmail}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-center px-2">
                        <div className="font-medium text-foreground">{ts.name || "Advised Therapy"}</div>
                        <div className="text-[11px] text-muted-foreground font-mono">Estimated ₹{ts.price || 0}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          disabled={isSending || isDismissing}
                          onClick={() => handleSendTherapyReminder(ts)}
                          className={`text-xs border transition-colors ${
                            isSent
                              ? "border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                              : "border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 hover:text-amber-800"
                          }`}
                        >
                          {isSending ? (
                            <span className="flex items-center gap-1">
                              <RefreshCw className="w-3 h-3 animate-spin" /> Sending...
                            </span>
                          ) : isSent ? (
                            <span className="flex items-center gap-1 font-semibold">
                              ✓ Sent
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Send className="w-3 h-3" /> Send Reminder
                            </span>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          title="Dismiss / remove invalid reminder"
                          disabled={isSending || isDismissing}
                          onClick={() => handleDismissTherapy(ts._id)}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 p-2 h-8 w-8 rounded-lg"
                        >
                          {isDismissing ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
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

      {/* --- MODAL 2: BOOK EXISTING APPOINTMENT --- */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl sm:rounded-3xl w-full max-w-lg p-4 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto space-y-4">
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
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Booking Created & Notification Dispatched!</span>
                  </div>
                  <p className="leading-relaxed pl-7 text-[12px]">
                    {successMsg}
                  </p>
                  <div className="pl-7 pt-1 flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setShowBookModal(false);
                        resetForms();
                        fetchData();
                      }}
                      className="h-7 px-3 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-none"
                    >
                      Done / Close
                    </Button>
                    <span className="text-[11px] text-muted-foreground">(Closing automatically...)</span>
                  </div>
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
                      <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>
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
                    <option value="Walk-in">Walk-in</option>
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
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      const newMethod = e.target.value;
                      setPaymentMethod(newMethod);
                      if (newMethod === "Online") {
                        setPaymentStatus("Pending");
                      }
                    }}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Cash">Cash (At Clinic)</option>
                    <option value="Online">Online / HDFC</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Card">POS Card</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl sm:rounded-3xl w-full max-w-2xl sm:max-w-3xl p-4 sm:p-6 shadow-2xl relative max-h-[94vh] overflow-y-auto space-y-4">
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
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Booking Created & Notification Dispatched!</span>
                  </div>
                  <p className="leading-relaxed pl-7 text-[12px]">
                    {successMsg}
                  </p>
                  <div className="pl-7 pt-1 flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setShowInstantModal(false);
                        resetForms();
                        fetchData();
                      }}
                      className="h-7 px-3 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-none"
                    >
                      Done / Close
                    </Button>
                    <span className="text-[11px] text-muted-foreground">(Closing automatically...)</span>
                  </div>
                </div>
              )}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 text-xs font-medium rounded-xl border border-rose-200/50 flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" /> {errorMsg}
                </div>
              )}

              <div className="grid gap-3.5 sm:grid-cols-2 items-start">
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
                        placeholder="Enter patient name"
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
                        placeholder="Enter patient email address"
                        className="w-full h-9 px-2.5 rounded-lg border border-border bg-transparent text-sm focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">WhatsApp Mobile *</label>
                        {isPhoneVerified ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        ) : otpSent ? (
                          <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                            OTP Sent
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-muted-foreground">
                            OTP Required
                          </span>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <input
                          type="tel"
                          required
                          disabled={isPhoneVerified}
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            setIsPhoneVerified(false);
                            setOtpSent(false);
                            setOtpError("");
                          }}
                          placeholder="10-digit mobile number"
                          className={`w-full h-9 pl-2.5 pr-24 rounded-lg border text-sm focus:outline-none transition-all ${
                            isPhoneVerified
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-medium"
                              : "border-border bg-transparent"
                          }`}
                        />
                        <div className="absolute right-1 flex items-center">
                          {isPhoneVerified ? (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setIsPhoneVerified(false);
                                setOtpSent(false);
                                setOtpCode("");
                              }}
                              className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground"
                            >
                              Change
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              disabled={phone.replace(/\D/g, "").slice(-10).length < 10 || sendingOtp || otpCountdown > 0}
                              onClick={handleSendOtp}
                              className="h-7 px-2.5 text-[11px] font-bold rounded-md"
                            >
                              {sendingOtp ? "Sending..." : otpCountdown > 0 ? `${otpCountdown}s` : otpSent ? "Resend" : "Send OTP"}
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* OTP Input Card */}
                      {!isPhoneVerified && otpSent && (
                        <div className="p-3 bg-muted/40 border border-primary/20 rounded-xl space-y-2 mt-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-foreground">Enter 6-Digit WhatsApp OTP</span>
                            {otpCountdown > 0 ? (
                              <span className="text-muted-foreground font-mono text-[10px]">Resend in {otpCountdown}s</span>
                            ) : (
                              <button
                                type="button"
                                onClick={handleSendOtp}
                                className="text-primary font-bold hover:underline text-[10px]"
                              >
                                Resend code
                              </button>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={6}
                              value={otpCode}
                              onChange={(e) => {
                                setOtpCode(e.target.value.replace(/\D/g, ""));
                                setOtpError("");
                              }}
                              placeholder="6-digit code"
                              className="flex-1 h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-mono text-center tracking-widest focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                            <Button
                              type="button"
                              size="sm"
                              disabled={otpCode.length !== 6 || verifyingOtp}
                              onClick={handleVerifyOtp}
                              className="h-8 px-3 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                            >
                              {verifyingOtp ? "Verifying..." : "Verify OTP"}
                            </Button>
                          </div>
                          {otpError && (
                            <p className="text-[11px] text-rose-500 font-medium">{otpError}</p>
                          )}
                        </div>
                      )}
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
                          <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>
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
                        <option value="Walk-in">Walk-in</option>
                        <option value="Video">Video Call</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal & Medical Info 4-Column Grid */}
              <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-4 p-3.5 bg-muted/15 border border-border/70 rounded-2xl">
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
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Allergies</label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="e.g. Penicillin"
                    className="w-full h-9 px-2.5 rounded-lg border border-border bg-transparent text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Medical History</label>
                  <input
                    type="text"
                    value={medicalHistory}
                    onChange={(e) => setMedicalHistory(e.target.value)}
                    placeholder="e.g. Sugar, BP"
                    className="w-full h-9 px-2.5 rounded-lg border border-border bg-transparent text-xs"
                  />
                </div>
              </div>

              {/* Payment Settings */}
              <div className="grid gap-2.5 grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => {
                      const newMethod = e.target.value;
                      setPaymentMethod(newMethod);
                      if (newMethod === "Online") {
                        setPaymentStatus("Pending");
                      }
                    }}
                    className="w-full h-9 px-2 rounded-lg border border-border bg-background text-xs"
                  >
                    <option value="Cash">Cash (At Clinic)</option>
                    <option value="Online">Online / HDFC SmartGateway</option>
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Card">POS Card</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg border border-border bg-background text-xs"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={submitting || !isPhoneVerified} 
                className={`w-full h-11 font-bold rounded-xl mt-2 transition-all shadow-md ${
                  isPhoneVerified 
                    ? "bg-primary hover:bg-primary/90 text-white" 
                    : "bg-muted text-muted-foreground cursor-not-allowed opacity-80"
                }`}
              >
                {submitting 
                  ? "Processing Walk-in Booking..." 
                  : !isPhoneVerified 
                  ? "Verify WhatsApp Number with OTP to Book" 
                  : "Register & Book Instant Appointment"}
              </Button>
            </form>
          </div>
        </div>
      )}
      {/* --- RESCHEDULE MODAL --- */}
      {showRescheduleModal && rescheduleApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-2xl md:rounded-3xl w-[95vw] md:max-w-md p-4 md:p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowRescheduleModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-border pb-3 mb-4">
              <Calendar className="w-5 h-5 text-orange-500" />
              <h3 className="text-lg font-bold">Reschedule Appointment</h3>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><strong>Patient:</strong> {rescheduleApt.patientId?.name}</p>
                <p><strong>Current:</strong> {rescheduleApt.date} at {formatTime12Hour(rescheduleApt.time)}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select New Date *</label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={rescheduleDate}
                  onChange={(e) => {
                    setRescheduleDate(e.target.value);
                    setRescheduleTime("");
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {rescheduleDate && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select New Time *</label>
                  {loadingSlots ? (
                    <div className="text-sm text-muted-foreground text-center py-4">Checking availability...</div>
                  ) : availableSlots.length === 0 ? (
                    <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                      No slots available on this date.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot.start}
                          disabled={!slot.available}
                          onClick={() => setRescheduleTime(slot.start)}
                          className={`h-9 text-xs font-bold rounded-lg transition-all ${
                            !slot.available
                              ? "bg-muted/50 text-muted-foreground opacity-50 cursor-not-allowed"
                              : rescheduleTime === slot.start
                              ? "bg-primary text-white shadow-md ring-2 ring-primary/20"
                              : "bg-background border border-border hover:border-primary/50 text-foreground"
                          }`}
                        >
                          {formatTime12Hour(slot.start)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button 
                disabled={actionLoading === "reschedule" || !rescheduleDate || !rescheduleTime} 
                onClick={handleRescheduleSubmit}
                className="w-full h-11 text-white font-bold rounded-xl bg-orange-500 hover:bg-orange-600 shadow-sm shadow-orange-500/20 mt-2"
              >
                {actionLoading === "reschedule" ? "Rescheduling..." : "Confirm Reschedule"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
