"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Pill, Activity, Hospital, CreditCard, Calendar, Clock, Video, FileText, CheckCircle2, 
  ChevronRight, AlertCircle, X, Download, MapPin, User, Sparkles, Building2, RefreshCw, MessageSquare 
} from "lucide-react";
import { formatTime12Hour } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useBookingModal } from "@/store/useBookingModal";
import { Badge } from "@/components/ui/badge";
import { UpcomingAppointmentsSlider } from "@/components/patient/UpcomingAppointmentsSlider";
import { DigitalPrescriptionsList } from "@/components/patient/DigitalPrescriptionsList";

interface Appointment {
  _id: string;
  doctorId: {
    name: string;
    specialization: string;
    clinicId?: string;
    fees?: number;
  };
  date: string;
  time: string;
  type: string;
  status: string;
  paymentStatus?: string;
  serviceName?: string;
}

interface Consultation {
  _id: string;
  doctorId: {
    _id: string;
    name: string;
    specialization: string;
    clinicId?: string;
  };
  status: string;
  prescriptionSummary?: string;
  prescribedTherapies?: string;
  notes?: string;
  createdAt: string;
}

interface Medicine {
  drug: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface TherapistProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  specialization?: string;
  registrationNumber?: string;
  qualifications?: string[];
  experience?: number;
  bio?: string;
  rating?: number;
  fees?: number;
}

interface TherapySession {
  _id: string;
  name: string;
  price: number;
  status: "Recommended" | "Scheduled" | "Booked" | "Paid" | "In_Progress" | "Completed" | "Cancelled" | "Reassignment_Requested" | string;
  recommendedMode?: "Online" | "Offline" | "Both";
  selectedMode?: "Online" | "Offline";
  doctorNotes?: string;
  date?: string;
  time?: string;
  videoChannelName?: string;
  clinicId?: {
    _id: string;
    name: string;
    address?: string;
    city?: string;
    phone?: string;
  };
  doctorId?: {
    _id: string;
    name: string;
    specialization?: string;
    avatar?: string;
  };
  therapistId?: TherapistProfile;
  createdAt?: string;
}

interface PharmacyOrder {
  _id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

const normalizeDateToYMD = (dateStr?: string): string => {
  if (!dateStr) return "";
  const clean = dateStr.trim();
  if (clean.includes("T")) return clean.split("T")[0];
  const parts = clean.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
    } else if (parts[2].length === 4) {
      // DD-MM-YYYY
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }
  return clean;
};

const parseDateTimeToMs = (dateStr?: string, timeStr?: string): number => {
  if (!dateStr) return 0;

  let hours = 0;
  let minutes = 0;

  if (timeStr) {
    const cleanTime = timeStr.trim().toUpperCase();
    if (cleanTime.includes("AM") || cleanTime.includes("PM")) {
      const isPM = cleanTime.includes("PM");
      const parts = cleanTime.replace(/\s*(AM|PM)/, "").split(":");
      hours = parseInt(parts[0], 10) || 0;
      minutes = parseInt(parts[1], 10) || 0;
      if (isPM && hours < 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
    } else {
      const parts = cleanTime.split(":");
      hours = parseInt(parts[0], 10) || 0;
      minutes = parseInt(parts[1], 10) || 0;
    }
  }

  const ymd = normalizeDateToYMD(dateStr);
  const [y, m, d] = ymd.split("-").map(Number);
  if (!y || !m || !d) return 0;
  return new Date(y, m - 1, d, hours, minutes, 0, 0).getTime() || 0;
};

export default function PatientDashboard() {
  const { openBooking } = useBookingModal();
  const [patientId, setPatientId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [loading, setLoading] = useState(true);
  const [upcomingApts, setUpcomingApts] = useState<Appointment[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [therapySessions, setTherapySessions] = useState<TherapySession[]>([]);
  const [pharmacyOrders, setPharmacyOrders] = useState<PharmacyOrder[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Therapy Booking Flow States
  const [therapyToBook, setTherapyToBook] = useState<TherapySession | null>(null);
  const [therapyStep, setTherapyStep] = useState(1); // 1: Mode Selection, 2: Slot Picker, 3: Prepaid Payment
  const [selectedTherapyMode, setSelectedTherapyMode] = useState<"Online" | "Offline">("Online");
  const [realSlots, setRealSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [therapyDate, setTherapyDate] = useState("");
  const [therapyTime, setTherapyTime] = useState("");
  const [isTherapyListModalOpen, setIsTherapyListModalOpen] = useState(false);

  // Reassignment Modal States
  const [reassigningSession, setReassigningSession] = useState<TherapySession | null>(null);
  const [reassignmentReason, setReassignmentReason] = useState("");
  const [submittingReassignment, setSubmittingReassignment] = useState(false);

  const openTherapyBooking = (session: TherapySession) => {
    setTherapyToBook(session);
    setTherapyStep(1);
    setSelectedTherapyMode(session.recommendedMode === "Offline" ? "Offline" : "Online");
    setTherapyDate("");
    setTherapyTime("");
    setRealSlots([]);
  };

  const closeTherapyModal = () => {
    setTherapyToBook(null);
    setTherapyStep(1);
    setTherapyDate("");
    setTherapyTime("");
    setRealSlots([]);
  };

  // Fetch real availability dynamically from assigned therapist's actual schedule
  useEffect(() => {
    if (therapyToBook && therapyDate) {
      const therapistId = therapyToBook.therapistId?._id;
      if (therapistId) {
        setLoadingSlots(true);
        fetch(`/api/therapists/${therapistId}/slots?date=${therapyDate}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.data)) {
              setRealSlots(data.data);
            } else {
              setRealSlots([]);
            }
          })
          .catch((err) => {
            console.error("Error loading therapist slots:", err);
            setRealSlots([]);
          })
          .finally(() => setLoadingSlots(false));
      } else {
        setRealSlots(["10:00 AM", "11:30 AM", "02:00 PM", "04:00 PM"]);
      }
    }
  }, [therapyToBook, therapyDate]);

  const formatSlotTime = (time24: string) => {
    if (!time24) return "";
    if (time24.includes("AM") || time24.includes("PM")) return time24;
    let [hoursStr, minutesStr] = time24.split(":");
    let hours = parseInt(hoursStr, 10);
    if (isNaN(hours)) return time24;
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${String(hours).padStart(2, "0")}:${minutesStr || "00"} ${ampm}`;
  };

  const parseTimeToMinutes = (timeStr: string): number | null => {
    if (!timeStr) return null;
    const clean = timeStr.trim().toUpperCase();
    const isPM = clean.includes("PM");
    const isAM = clean.includes("AM");

    const numericPart = clean.replace(/\s*(AM|PM)/i, "").trim();
    const parts = numericPart.split(":");
    if (parts.length < 2) return null;

    let hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10) || 0;

    if (isNaN(hours)) return null;

    if (isPM && hours < 12) hours += 12;
    if (isAM && hours === 12) hours = 0;

    return hours * 60 + minutes;
  };

  const getAvailableTimeSlots = () => {
    const formatted = realSlots
      .map((s: any) => {
        const raw = typeof s === "string" ? s : s?.start || "";
        return formatSlotTime(raw);
      })
      .filter(Boolean);

    if (!therapyDate) return formatted;

    const ymd = normalizeDateToYMD(therapyDate);

    // Calculate today's date in Indian Standard Time (Asia/Kolkata)
    const istTimeStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const nowIST = new Date(istTimeStr);
    const localYear = nowIST.getFullYear();
    const localMonth = String(nowIST.getMonth() + 1).padStart(2, "0");
    const localDay = String(nowIST.getDate()).padStart(2, "0");
    const todayLocal = `${localYear}-${localMonth}-${localDay}`;

    if (ymd < todayLocal) {
      return [];
    }

    if (ymd === todayLocal) {
      const currentMinutes = nowIST.getHours() * 60 + nowIST.getMinutes();
      return formatted.filter((slotTime) => {
        const slotMins = parseTimeToMinutes(slotTime);
        if (slotMins === null) return true;
        return slotMins > currentMinutes;
      });
    }

    return formatted;
  };

  const fetchDashboardData = (pId: string) => {
    setLoading(true);
    const t = Date.now();
    Promise.all([
      fetch(`/api/appointments?patientId=${pId}&_t=${t}`, { cache: "no-store" }),
      fetch(`/api/consultations?patientId=${pId}&_t=${t}`, { cache: "no-store" }),
      fetch(`/api/therapy-sessions?patientId=${pId}&_t=${t}`, { cache: "no-store" }),
      fetch(`/api/pharmacy/orders?patientId=${pId}&_t=${t}`, { cache: "no-store" })
    ])
      .then(async ([aptRes, consultRes, therapyRes, ordersRes]) => {
        const aptData = await aptRes.json();
        const consultData = await consultRes.json();
        const therapyData = await therapyRes.json();
        const ordersData = await ordersRes.json();

        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const validStatuses = ["Scheduled", "Checked In", "Engaged", "Rescheduled", "Confirmed", "Booked", "Pending", "In_Progress"];

        const isStillUpcoming = (date?: string, time?: string) => {
          if (!date) return true;
          const ymd = normalizeDateToYMD(date);
          if (ymd < todayStr) return false;
          if (ymd === todayStr && time) {
            const ms = parseDateTimeToMs(date, time);
            if (ms > 0 && Date.now() - ms > 2 * 60 * 60 * 1000) {
              return false; // Ended > 2 hours ago
            }
          }
          return true;
        };

        // Process doctor consultations / appointments
        const docApts: Appointment[] = (aptData.success && Array.isArray(aptData.data))
          ? aptData.data.filter((a: any) => 
              validStatuses.some(s => s.toLowerCase() === (a.status || "").toLowerCase().trim()) &&
              a.status !== "Completed" && a.status !== "Checked Out" && a.status !== "Cancelled" &&
              isStillUpcoming(a.date, a.time)
            )
          : [];

        // Also process scheduled / booked therapy sessions as upcoming sessions
        const therapyApts: Appointment[] = (therapyData.success && Array.isArray(therapyData.data))
          ? therapyData.data
              .filter((ts: any) => 
                validStatuses.some(s => s.toLowerCase() === (ts.status || "").toLowerCase().trim()) &&
                ts.status !== "Completed" &&
                ts.date && ts.time &&
                isStillUpcoming(ts.date, ts.time)
              )
              .map((ts: any) => ({
                _id: ts._id,
                doctorId: {
                  name: ts.therapistId?.name || ts.doctorId?.name || "Therapy Specialist",
                  specialization: ts.therapistId?.specialization || "Psychotherapy / Counseling",
                  clinicId: ts.clinicId?._id,
                  fees: ts.price,
                },
                date: ts.date,
                time: ts.time,
                type: ts.selectedMode === "Offline" ? "Walk-in" : "Video",
                status: ts.status,
                paymentStatus: ["Paid", "Completed"].includes(ts.status) ? "Paid" : "Pending",
                serviceName: ts.name || "Therapy Session",
                feeAmount: ts.price,
              }))
          : [];

        // Combine and deduplicate mirror records
        const combined = [...docApts, ...therapyApts];
        const seen = new Set<string>();
        const deduplicatedUpcoming: Appointment[] = [];
        for (const item of combined) {
          const normDate = normalizeDateToYMD(item.date);
          const key = `${normDate}_${(item.time || "").trim()}_${(item.serviceName || "").toLowerCase().trim()}`;
          if (!seen.has(key)) {
            seen.add(key);
            deduplicatedUpcoming.push(item);
          }
        }

        deduplicatedUpcoming.sort(
          (a, b) => parseDateTimeToMs(a.date, a.time) - parseDateTimeToMs(b.date, b.time)
        );

        setUpcomingApts(deduplicatedUpcoming);

        // Process consultations
        if (consultData.success && consultData.data) {
          setConsultations(consultData.data);
        }

        // Process therapy sessions
        if (therapyData.success && therapyData.data) {
          setTherapySessions(therapyData.data);
        }

        // Process pharmacy orders
        if (ordersData.success && ordersData.data) {
          setPharmacyOrders(ordersData.data);
        }
      })
      .catch((err) => console.error("Error loading dashboard data:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // Fast path: use cached patient info for instant initial query on frame 0
    if (typeof window !== "undefined") {
      try {
        const cached = sessionStorage.getItem("patient_auth_user");
        if (cached) {
          const user = JSON.parse(cached);
          if (user.patientId) {
            setPatientId(user.patientId);
            if (user.name) setPatientName(user.name);
            fetchDashboardData(user.patientId);
          }
        }
      } catch {}
    }

    const loadSession = () => {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            if (data.user.patientId) {
              setPatientId(data.user.patientId);
              setPatientName(data.user.name);
              try {
                sessionStorage.setItem("patient_auth_user", JSON.stringify(data.user));
              } catch {}
              fetchDashboardData(data.user.patientId);
            } else {
              // If logged in as Admin, Doctor, or Staff, auto-route to proper dashboard
              const role = data.user.role?.toUpperCase();
              if (role === "SUPER_ADMIN" || role === "ADMIN") {
                window.location.href = "/admin/dashboard";
              } else if (role === "DOCTOR") {
                window.location.href = "/doctor/dashboard";
              } else if (role === "THERAPIST") {
                window.location.href = "/therapist/dashboard";
              } else if (role === "PHARMACY_STAFF" || role === "PHARMACY") {
                window.location.href = "/pharmacy/dashboard";
              } else if (role === "CLINIC_MANAGER") {
                window.location.href = "/clinic-manager/dashboard";
              } else {
                setLoading(false);
              }
            }
          } else {
            setLoading(false);
          }
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    };

    loadSession();

    // Re-fetch when user switches back to this tab or booking modal completes
    const handleRefresh = () => {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user?.patientId) {
            setPatientId(data.user.patientId);
            fetchDashboardData(data.user.patientId);
          }
        })
        .catch(() => {});
    };

    window.addEventListener("focus", handleRefresh);
    window.addEventListener("refresh-dashboard", handleRefresh);

    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("refresh-dashboard", handleRefresh);
    };
  }, []);

  const handleDownloadPrescription = (consultation: Consultation) => {
    const { printPrescription } = require("@/lib/print-prescription");
    printPrescription(consultation);
  };

  const handleOrderFromPharmacy = async (consultation: Consultation) => {
    if (!consultation.prescriptionSummary || !patientId) return;

    try {
      const meds: Medicine[] = JSON.parse(consultation.prescriptionSummary);
      if (meds.length === 0) return;

      // Resolve clinicId from the prescribing doctor
      const clinicId = consultation.doctorId?.clinicId;
      if (!clinicId) {
        alert("This prescription does not have an associated clinic pharmacy.");
        return;
      }

      // Create dummy products or link them. We will create mock product references.
      const items = meds.map((m) => {
        return {
          productId: "65f27c62d08a50672e811bc3", // placeholder valid ObjectId
          quantity: 1,
          priceAtPurchase: 450 // average cost
        };
      });

      const totalAmount = items.length * 450;

      const res = await fetch("/api/pharmacy/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          clinicId,
          items,
          totalAmount,
          status: "Pending",
          shippingAddress: "Home Address on file"
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Medications order placed successfully at the Clinic Pharmacy! You can check it under 'Active Orders'.");
        fetchDashboardData(patientId);
      } else {
        alert(data.message || "Failed to order from pharmacy.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to process order.");
    }
  };

  const handlePayTherapy = async (sessionId: string) => {
    try {
      const res = await fetch("/api/therapy-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pay",
          sessionId
        }),
      });

      const data = await res.json();
      if (data.success && patientId) {
        alert("Payment processed successfully! Therapy session marked as Paid.");
        window.location.reload();
      } else {
        alert(data.message || "Payment failed.");
      }
    } catch (err) {
      console.error("Payment error:", err);
    }
  };

  const handlePayAppointment = async (appointmentId: string, amountToPay: number) => {
    try {
      setPaymentProcessing(true);
      
      const orderRes = await fetch("/api/payments/razorpay/order", {
          method: "POST",
          body: JSON.stringify({ amount: amountToPay }),
          headers: { "Content-Type": "application/json" }
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
         throw new Error(orderData.error || "Failed to initialize payment");
      }

      const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
          amount: orderData.order.amount,
          currency: orderData.order.currency,
          name: "Kelkar Manas Health Clinic",
          description: "Consultation Fee",
          order_id: orderData.order.id,
          handler: async function (response: any) {
              try {
                const verifyRes = await fetch("/api/payments/razorpay/verify", {
                    method: "POST",
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        amount: amountToPay,
                        patientId: patientId, 
                        appointmentId: appointmentId
                    }),
                    headers: { "Content-Type": "application/json" }
                });
                const verifyData = await verifyRes.json();
                
                if (verifyData.success) {
                    alert("Consultation fee paid successfully! You can now join the consultation room.");
                    window.location.reload();
                } else {
                    alert("Payment Failed Verification. Please contact support.");
                }
              } catch (err: any) {
                alert(err.message || "Error processing payment.");
              }
          },
          theme: {
              color: "#6b21a8" // primary color
          }
      };
      
      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
        alert("Payment failed: " + response.error.description);
      });
      rzp1.open();

    } catch (err: any) {
      console.error("Payment error:", err);
      alert(err.message || "Error initiating payment.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePayAndBookTherapy = async () => {
    if (!therapyToBook || !therapyDate || !therapyTime) return;
    setPaymentProcessing(true);

    try {
      const res = await fetch(`/api/therapy-sessions/${therapyToBook._id}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: therapyDate,
          time: therapyTime,
          selectedMode: selectedTherapyMode,
          paymentMethod: "Online",
          transactionId: `TXN-${Date.now()}`
        })
      });
      const data = await res.json();
      if (data.success) {
        alert("Prepaid payment completed & therapy session scheduled successfully!");
        closeTherapyModal();
        if (patientId) fetchDashboardData(patientId);
      } else {
        alert(data.message || "Failed to book therapy session.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during booking.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleRequestReassignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassigningSession) return;
    setSubmittingReassignment(true);
    try {
      const res = await fetch("/api/therapy-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_reassignment",
          sessionId: reassigningSession._id,
          reason: reassignmentReason || "Patient requested reassignment due to schedule unavailability.",
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Reassignment request submitted. Your prescribing doctor has been notified.");
        setReassigningSession(null);
        setReassignmentReason("");
        if (patientId) fetchDashboardData(patientId);
      } else {
        alert(data.message || "Failed to submit request.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to submit reassignment request.");
    } finally {
      setSubmittingReassignment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full max-w-full min-w-0 overflow-x-hidden">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent break-words">
          Welcome back, {patientName || "Valued Patient"}!
        </h1>
        <p className="text-muted-foreground mt-2 text-sm md:text-base">
          Here is your custom overview, prescriptions, therapies, and treatment plans.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr w-full max-w-full min-w-0">
        {/* Next Appointment Card */}
        <UpcomingAppointmentsSlider
          upcomingApts={upcomingApts}
          openBooking={openBooking}
          handlePayAppointment={handlePayAppointment}
        />

        {/* Therapy Session Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-card rounded-3xl border border-border/60 shadow-sm flex flex-col justify-between min-h-[260px] lg:min-h-[220px]"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-muted rounded-xl">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold">Therapy Sessions</h3>
            </div>
            <div className="text-2xl font-black mt-2 text-foreground flex items-center gap-3">
              {therapySessions.filter(s => (s.status as string) === "Recommended" || (s.status as string) === "Unpaid").length} Recommended
              <div className="text-[10px] text-green-600 font-bold bg-green-500/5 px-2 py-0.5 rounded-lg border border-green-500/10 h-fit">
                {therapySessions.filter(s => s.status === "Booked").length} Upcoming
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-medium mt-1">
              Book your prescribed therapy sessions to begin treatment.
            </p>
          </div>

        </motion.div>

        {/* Pharmacy Orders Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-card rounded-3xl border border-border/60 shadow-sm flex flex-col justify-between min-h-[260px] lg:min-h-[220px]"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-muted rounded-xl">
                <Pill className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold">Clinic Pharmacy Orders</h3>
            </div>
            <p className="text-2xl font-black mb-1">{pharmacyOrders.length} Orders</p>
            <p className="text-xs text-muted-foreground font-medium">Medication packages ordered from clinic pharmacies.</p>
          </div>
          <div className="text-xs text-primary font-bold bg-primary/5 px-2.5 py-1 rounded-xl border border-primary/10 w-fit">
            {pharmacyOrders.filter(o => o.status === "Pending").length} Pending Fulfillment
          </div>
        </motion.div>
      </div>

      {/* Main Layout: Left = Prescriptions & Therapies, Right = Orders */}
      <div className="grid gap-6 lg:grid-cols-3 w-full max-w-full min-w-0">

        {/* Left Column: Digital Prescriptions & Prescribed Therapies */}
        <div className="lg:col-span-2 space-y-6 w-full max-w-full min-w-0">

          {/* Therapy Sessions Section */}
          {therapySessions.length > 0 && (
            <div className="p-4 sm:p-6 bg-card rounded-3xl border border-border/60 shadow-sm space-y-6 w-full max-w-full min-w-0 overflow-hidden" id="recommended-therapies">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border/50 pb-3">
                <h3 className="text-base sm:text-lg font-bold flex items-center gap-2 min-w-0">
                  <Hospital className="w-5 h-5 text-primary shrink-0" /> 
                  <span className="truncate sm:overflow-visible">Prescribed Therapy & Counseling</span>
                </h3>
                <Badge variant="outline" className="text-xs font-semibold text-primary border-primary/20 bg-primary/5 w-fit shrink-0">
                  Personally Doctor-Assigned
                </Badge>
              </div>

              {/* 1. Recommended / Ready to Schedule */}
              {therapySessions.filter(s => (s.status as string) === "Recommended" || (s.status as string) === "Unpaid").length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-2 min-w-0">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" /> 
                      <span className="truncate sm:overflow-visible">Action Required: Doctor-Prescribed Therapy</span>
                    </h4>
                    <span className="text-xs text-muted-foreground font-medium shrink-0">Prepaid confirmation required</span>
                  </div>

                  <div className="grid gap-4">
                    {therapySessions.filter(s => (s.status as string) === "Recommended" || (s.status as string) === "Unpaid").map((session) => (
                      <div key={session._id} className="p-4 sm:p-5 rounded-2xl border-2 border-amber-200/80 bg-gradient-to-br from-amber-50/60 to-orange-50/30 dark:from-amber-950/20 dark:to-orange-950/10 space-y-4 shadow-sm w-full min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/60 dark:border-amber-900/40 pb-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-base text-foreground break-words">{session.name}</h4>
                              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 text-[10px] font-bold shrink-0">
                                Assigned – Ready to Book
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
                              <span>Session Fee: <strong className="text-primary">₹{session.price}</strong></span>
                              {session.recommendedMode && (
                                <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-semibold text-foreground/80 shrink-0">
                                  Doctor Recommended: {session.recommendedMode === "Online" ? "Online Video" : session.recommendedMode === "Offline" ? "In-Person Clinic" : "Flexible"}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            onClick={() => openTherapyBooking(session)}
                            className="rounded-xl h-10 px-5 text-xs font-bold gap-2 bg-primary hover:bg-primary/90 text-white shadow-md self-start sm:self-auto shrink-0 w-full sm:w-auto justify-center"
                          >
                            <Calendar className="w-4 h-4" /> Book Session
                          </Button>
                        </div>

                        {/* Doctor Referral Notes */}
                        {session.doctorNotes && (
                          <div className="p-3 bg-background/80 rounded-xl border border-border/60 text-xs">
                            <span className="font-bold text-primary text-[11px] uppercase tracking-wider block mb-1">Doctor's Guidance Notes:</span>
                            <p className="text-muted-foreground italic leading-relaxed break-words">"{session.doctorNotes}"</p>
                          </div>
                        )}

                        {/* Assigned Therapist Details Card */}
                        {(() => {
                          const thPhoto = session.therapistId?.avatar || 
                            (session.therapistId?.name?.toLowerCase().includes("deepak") ? "/images/doctor_1.png" : "") || 
                            (session.therapistId?.name?.toLowerCase().includes("amol") ? "/images/doctor_2.png" : "") || 
                            (session.therapistId?.name?.toLowerCase().includes("radhika") ? "/images/doctor_3.png" : "") || 
                            session.doctorId?.avatar || "";
                          const thInitials = (session.therapistId?.name || "Specialist")
                            .replace(/^Dr\.\s*/i, "")
                            .trim()
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() || "TH";

                          return (
                            <div className="p-3.5 rounded-xl bg-background/90 border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0">
                              <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0 border border-primary/20 overflow-hidden relative">
                                  {thPhoto ? (
                                    <img 
                                      src={thPhoto} 
                                      alt="" 
                                      className="w-full h-full rounded-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  ) : null}
                                  <span className={thPhoto ? "absolute -z-10 text-xs font-bold" : "text-xs font-bold"}>
                                    {thInitials}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-xs font-bold text-foreground break-words">
                                      {session.therapistId?.name || "Assigned Licensed Specialist"}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 font-semibold shrink-0">
                                      Assigned by Doctor
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-muted-foreground mt-0.5 break-words">
                                    {session.therapistId?.specialization || "Clinical Psychology & Sex Therapy"}
                                    {session.therapistId?.experience ? ` • ${session.therapistId.experience} yrs exp` : ""}
                                  </p>
                                </div>
                              </div>

                              <button
                                onClick={() => setReassigningSession(session)}
                                className="text-[11px] font-semibold text-muted-foreground hover:text-primary transition flex items-center gap-1 underline underline-offset-2 self-start sm:self-center shrink-0"
                              >
                                <RefreshCw className="w-3 h-3 shrink-0" /> Schedule conflict? Request Reassignment
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Reassignment Requested */}
              {therapySessions.filter(s => s.status === "Reassignment_Requested").length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-muted-foreground">Pending Doctor Reassignment</h4>
                  {therapySessions.filter(s => s.status === "Reassignment_Requested").map((session) => (
                    <div key={session._id} className="p-4 rounded-2xl border border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-sm text-foreground break-words">{session.name}</h4>
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300 text-[10px] font-bold shrink-0">
                            Reassignment In Review
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 break-words">
                          Your request was sent to your doctor. You will receive an updated therapist allotment shortly.
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0 self-start sm:self-auto">Under Review</Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* 3. Scheduled / Confirmed Sessions */}
              {therapySessions.filter(s => {
                if (s.status === "Completed" || s.status === "Cancelled") return false;
                if (!["Scheduled", "Booked", "Paid", "In_Progress"].includes(s.status)) return false;
                if (s.date) {
                  const norm = normalizeDateToYMD(s.date);
                  const now = new Date();
                  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
                  if (norm && norm < todayStr) return false;
                }
                return true;
              }).length > 0 && (
                <div className="space-y-3 w-full max-w-full min-w-0">
                  <h4 className="text-sm font-bold text-foreground">Upcoming &amp; Scheduled Sessions</h4>
                  <div className="space-y-3 w-full max-w-full min-w-0">
                    {therapySessions.filter(s => {
                      if (s.status === "Completed" || s.status === "Cancelled") return false;
                      if (!["Scheduled", "Booked", "Paid", "In_Progress"].includes(s.status)) return false;
                      if (s.date) {
                        const norm = normalizeDateToYMD(s.date);
                        const now = new Date();
                        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
                        if (norm && norm < todayStr) return false;
                      }
                      return true;
                    }).map((session) => (
                      <div key={session._id} className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card hover:border-primary/40 transition shadow-sm space-y-3 w-full max-w-full min-w-0 overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-sm break-words">{session.name}</h4>
                              <Badge className={session.selectedMode === "Online" ? "bg-rose-50 text-rose-700 border-rose-200 text-[10px] shrink-0" : "bg-sky-50 text-sky-700 border-sky-200 text-[10px] shrink-0"}>
                                {session.selectedMode === "Online" ? "Online Video Call" : "In-Person Clinic"}
                              </Badge>
                              <Badge variant="outline" className="text-xs text-emerald-700 border-emerald-200 bg-emerald-50 shrink-0">
                                Paid &amp; Confirmed
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1.5 font-medium">
                              <span className="flex items-center gap-1.5 shrink-0"><Calendar className="w-3.5 h-3.5 text-primary" /> {session.date}</span>
                              <span className="flex items-center gap-1.5 shrink-0"><Clock className="w-3.5 h-3.5 text-primary" /> {session.time ? formatTime12Hour(session.time) : ""}</span>
                            </div>
                          </div>

                          {session.selectedMode === "Online" ? (
                            (() => {
                              let canJoin = false;
                              let statusMessage = "Opens on schedule";

                              if (session.date && session.time) {
                                const normSessionDate = normalizeDateToYMD(session.date);
                                const sessionMs = parseDateTimeToMs(session.date, session.time);
                                
                                const now = new Date();
                                const todayLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

                                if (normSessionDate > todayLocal) {
                                  // Tomorrow or future date: strictly locked until scheduled date!
                                  canJoin = false;
                                  statusMessage = `Opens on ${session.date} (${formatTime12Hour(session.time)})`;
                                } else if (normSessionDate < todayLocal) {
                                  // Past date
                                  canJoin = false;
                                  statusMessage = "Session Expired";
                                } else {
                                  // Scheduled for today: only open 15m before until session ends
                                  if (sessionMs > 0) {
                                    const diffMinutes = (sessionMs - Date.now()) / (1000 * 60);
                                    if (diffMinutes > 15) {
                                      canJoin = false;
                                      statusMessage = `Available 15m before (${formatTime12Hour(session.time)})`;
                                    } else if (diffMinutes >= -90) {
                                      canJoin = true;
                                    } else {
                                      canJoin = false;
                                      statusMessage = "Session Ended";
                                    }
                                  }
                                }
                              }

                              if (canJoin) {
                                return (
                                  <Link href={`/patient/therapy-session/${session._id}`} className="shrink-0 w-full sm:w-auto">
                                    <Button size="sm" className="rounded-xl h-10 px-4 text-xs font-bold gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm w-full sm:w-auto justify-center">
                                      <Video className="w-4 h-4" /> Join Video Session
                                    </Button>
                                  </Link>
                                );
                              }

                              return (
                                <Button 
                                  size="sm" 
                                  disabled 
                                  variant="secondary" 
                                  className="rounded-xl h-10 px-3.5 text-xs font-semibold gap-1.5 opacity-80 cursor-not-allowed bg-muted text-muted-foreground border border-border shrink-0 w-full sm:w-auto justify-center"
                                >
                                  <Clock className="w-3.5 h-3.5 text-muted-foreground" /> {statusMessage}
                                </Button>
                              );
                            })()
                          ) : (
                            <Badge variant="outline" className="text-xs font-semibold px-3 py-1 bg-muted shrink-0 self-start sm:self-auto">
                              In-Person Visit
                            </Badge>
                          )}
                        </div>

                        {/* Therapist details & clinic address */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-muted-foreground gap-2 pt-1 min-w-0">
                          <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
                            <User className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5 sm:mt-0" />
                            <p className="min-w-0 break-words leading-relaxed text-xs">
                              Therapist: <strong className="text-foreground">{session.therapistId?.name || "Assigned Specialist"}</strong>{" "}
                              <span className="text-muted-foreground break-words">({session.therapistId?.specialization || "Psychologist"})</span>
                            </p>
                          </div>
                          {session.selectedMode === "Offline" && session.clinicId && (
                            <div className="flex items-center gap-1 text-primary font-medium shrink-0 self-start sm:self-auto">
                              <MapPin className="w-3.5 h-3.5 shrink-0" /> {session.clinicId.name} ({session.clinicId.city || "Clinic Location"})
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Completed Sessions */}
              {therapySessions.filter(s => s.status === "Completed").length > 0 && (
                <div className="space-y-3 pt-2 border-t border-border/50">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Past Completed Sessions</h4>
                  <div className="space-y-2">
                    {therapySessions.filter(s => s.status === "Completed").map((session) => (
                      <div key={session._id} className="p-3.5 rounded-xl border border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs min-w-0 overflow-hidden">
                        <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
                          <div className="min-w-0 break-words">
                            <span className="font-bold text-foreground">{session.name}</span>
                            <span className="text-muted-foreground ml-1.5 text-[11px]">with {session.therapistId?.name || "Therapist"}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-200 bg-emerald-50 shrink-0 self-start sm:self-auto">
                          Completed on {session.date || "file"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Prescriptions Section */}
          <DigitalPrescriptionsList
            consultations={consultations}
            orders={pharmacyOrders}
            handleOrderFromPharmacy={handleOrderFromPharmacy}
            handleDownloadPrescription={handleDownloadPrescription}
          />

        </div>

        {/* Right Column: Pharmacy Orders History */}
        <div className="p-6 bg-card rounded-3xl border border-border/60 shadow-sm min-h-[350px] space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Pill className="w-4 h-4 text-primary" /> Active Medicine Orders
            </h3>
            <Link href="/patient/orders" className="text-xs font-semibold text-primary hover:underline">
              View All
            </Link>
          </div>

          <div className="space-y-4">
            {pharmacyOrders.length > 0 ? (
              pharmacyOrders.map((order) => {
                const normStatus = (order.status || "").toUpperCase();
                const isFulfilled = normStatus === "FULFILLED" || normStatus === "DELIVERED";
                const isCancelled = normStatus === "CANCELLED";
                const isCallDone = normStatus === "CALL_COMPLETED" || normStatus === "PRESCRIPTION_APPROVED";

                return (
                  <div key={order._id} className="text-xs space-y-1.5 p-3.5 bg-muted/20 border border-border/50 rounded-2xl">
                    <div className="flex justify-between font-bold">
                      <span className="font-mono text-muted-foreground">#{order._id.substring(18)}</span>
                      <span className="text-primary">₹{order.totalAmount}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
                      {isFulfilled ? (
                        <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 text-[9px] font-bold px-1.5 py-0">
                          Fulfilled
                        </Badge>
                      ) : isCallDone ? (
                        <Badge className="bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 text-[9px] font-bold px-1.5 py-0">
                          Call Verified
                        </Badge>
                      ) : isCancelled ? (
                        <Badge variant="destructive" className="text-[9px] font-bold px-1.5 py-0">
                          Cancelled
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[9px] font-bold px-1.5 py-0">
                          Pending Verification
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground/60">
                <Pill className="w-10 h-10 mb-2 stroke-[1.5]" />
                <p className="text-sm font-semibold">No active pharmacy orders.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Therapy Selection Modal Overlay */}
      {isTherapyListModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-md w-full p-6 shadow-xl border border-border">
            <h3 className="text-xl font-bold mb-2">Select Therapy to Book</h3>
            <p className="text-muted-foreground text-sm mb-6">Choose one of your prescribed therapy sessions to schedule.</p>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {therapySessions.filter(s => (s.status as string) === "Recommended" || (s.status as string) === "Unpaid").map((session) => (
                <div key={session._id} className="flex items-center justify-between p-4 rounded-2xl border border-border bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">Th</div>
                    <div>
                      <h4 className="font-bold text-sm">{session.name}</h4>
                      <p className="text-[10px] text-muted-foreground font-medium">Estimated Cost: ₹{session.price}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsTherapyListModalOpen(false);
                      setTherapyToBook(session);
                    }}
                    className="rounded-xl h-9 text-xs font-bold gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Book
                  </Button>
                </div>
              ))}
              {therapySessions.filter(s => (s.status as string) === "Recommended" || (s.status as string) === "Unpaid").length === 0 && (
                <div className="py-8 text-center text-sm font-medium text-muted-foreground">
                  No prescribed therapies available to book.
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border mt-4">
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() => setIsTherapyListModalOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Therapy Booking Date/Time Modal Overlay */}
      {therapyToBook && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> Book Therapy Session
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{therapyToBook.name}</p>
              </div>
              <button 
                onClick={closeTherapyModal} 
                className="w-8 h-8 rounded-full bg-muted/40 hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-6 relative px-2">
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-border/50 rounded-full z-0"></div>
              <div 
                className="absolute left-6 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-300" 
                style={{ width: `${(therapyStep - 1) * 45}%` }}
              ></div>
              
              <div className="flex flex-col items-center gap-1 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${therapyStep >= 1 ? 'bg-primary border-primary text-white shadow-md' : 'bg-card border-border text-muted-foreground'}`}>1</div>
                <span className="text-[10px] font-semibold text-muted-foreground">Mode</span>
              </div>
              <div className="flex flex-col items-center gap-1 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${therapyStep >= 2 ? 'bg-primary border-primary text-white shadow-md' : 'bg-card border-border text-muted-foreground'}`}>2</div>
                <span className="text-[10px] font-semibold text-muted-foreground">Time Slot</span>
              </div>
              <div className="flex flex-col items-center gap-1 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${therapyStep >= 3 ? 'bg-primary border-primary text-white shadow-md' : 'bg-card border-border text-muted-foreground'}`}>3</div>
                <span className="text-[10px] font-semibold text-muted-foreground">Prepaid</span>
              </div>
            </div>

            {/* STEP 1: MODE SELECTION */}
            {therapyStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-foreground">Select Session Mode</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Your doctor recommended: <strong className="text-primary">{therapyToBook.recommendedMode || "Flexible (Online or Offline)"}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Online Option */}
                  <div
                    onClick={() => setSelectedTherapyMode("Online")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedTherapyMode === "Online" 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "border-border/60 hover:border-primary/40 bg-card"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${selectedTherapyMode === "Online" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                          <Video className="w-5 h-5" />
                        </div>
                        {therapyToBook.recommendedMode === "Online" && (
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[9px]">Recommended</Badge>
                        )}
                      </div>
                      <h5 className="font-bold text-sm text-foreground">Online Video Call</h5>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        Secure 1-on-1 encrypted video session inside your patient portal. Join from anywhere.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-border/50 text-[10px] font-semibold text-primary flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Direct Portal Room
                    </div>
                  </div>

                  {/* Offline Option */}
                  <div
                    onClick={() => setSelectedTherapyMode("Offline")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedTherapyMode === "Offline" 
                        ? "border-primary bg-primary/5 shadow-sm" 
                        : "border-border/60 hover:border-primary/40 bg-card"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${selectedTherapyMode === "Offline" ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                          <Hospital className="w-5 h-5" />
                        </div>
                        {therapyToBook.recommendedMode === "Offline" && (
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[9px]">Recommended</Badge>
                        )}
                      </div>
                      <h5 className="font-bold text-sm text-foreground">In-Person Clinic Visit</h5>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                        Face-to-face consultation at {therapyToBook.clinicId?.name || "our clinic"}.
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-border/50 text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> {therapyToBook.clinicId?.city || "Physical Clinic"}
                    </div>
                  </div>
                </div>

                {/* Assigned Therapist Details Card */}
                {therapyToBook.therapistId && (() => {
                  const modalThPhoto = therapyToBook.therapistId.avatar || 
                    (therapyToBook.therapistId.name?.toLowerCase().includes("deepak") ? "/images/doctor_1.png" : "") || 
                    (therapyToBook.therapistId.name?.toLowerCase().includes("amol") ? "/images/doctor_2.png" : "") || 
                    (therapyToBook.therapistId.name?.toLowerCase().includes("radhika") ? "/images/doctor_3.png" : "") || 
                    therapyToBook.doctorId?.avatar || "";
                  const modalThInitials = (therapyToBook.therapistId.name || "Specialist")
                    .replace(/^Dr\.\s*/i, "")
                    .trim()
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "TH";

                  return (
                    <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden relative">
                        {modalThPhoto ? (
                          <img 
                            src={modalThPhoto} 
                            alt="" 
                            className="w-full h-full object-cover rounded-xl"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : null}
                        <span className={modalThPhoto ? "absolute -z-10" : ""}>
                          {modalThInitials}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-foreground truncate">{therapyToBook.therapistId.name}</p>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-primary/30 text-primary">Allotted Therapist</Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{therapyToBook.therapistId.specialization}</p>
                      </div>
                    </div>
                  );
                })()}

                <div className="flex gap-3 pt-4 border-t border-border mt-4">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={closeTherapyModal}>
                    Cancel
                  </Button>
                  <Button 
                    className="flex-1 rounded-xl text-white font-bold bg-primary hover:bg-primary/90" 
                    onClick={() => setTherapyStep(2)}
                  >
                    Next: Choose Slot <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: SLOT PICKER */}
            {therapyStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-foreground">Select Consultation Date & Time</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Live schedule for <strong>{therapyToBook.therapistId?.name || "Allotted Therapist"}</strong>
                  </p>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1.5">Select Date</label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-sm focus:outline-none focus:border-primary font-medium"
                    value={therapyDate}
                    onChange={(e) => {
                      setTherapyDate(e.target.value);
                      setTherapyTime("");
                    }}
                    min={(() => {
                      const d = new Date();
                      const y = d.getFullYear();
                      const m = String(d.getMonth() + 1).padStart(2, "0");
                      const day = String(d.getDate()).padStart(2, "0");
                      return `${y}-${m}-${day}`;
                    })()}
                  />
                </div>
                
                {therapyDate && (
                  <div className="space-y-2 pt-1 min-h-[140px]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" /> Available Slots
                      </label>
                      <span className="text-[10px] text-muted-foreground">{therapyDate}</span>
                    </div>

                    {loadingSlots ? (
                      <div className="text-xs text-center py-8 text-muted-foreground animate-pulse">
                        Checking therapist calendar...
                      </div>
                    ) : getAvailableTimeSlots().length === 0 ? (
                      <div className="text-center py-6 px-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
                        <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold mb-1">
                          No available slots for this date.
                        </p>
                        <p className="text-[11px] text-muted-foreground mb-3">
                          The therapist has no open slots on this date.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setReassigningSession(therapyToBook);
                            closeTherapyModal();
                          }}
                          className="text-xs rounded-xl border-rose-500/30 text-rose-600 hover:bg-rose-500/10"
                        >
                          Request Therapist Reassignment
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {getAvailableTimeSlots().map((time, index) => (
                          <button
                            key={`${time}-${index}`}
                            type="button"
                            onClick={() => setTherapyTime(time)}
                            className={`py-2 px-3 rounded-xl border transition-all text-xs font-semibold ${
                              therapyTime === time 
                                ? "bg-primary text-white border-primary shadow-sm ring-2 ring-primary/30" 
                                : "bg-card border-border hover:border-primary/50 text-foreground"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Conflict Reassignment Link */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setReassigningSession(therapyToBook);
                      closeTherapyModal();
                    }}
                    className="text-[11px] text-muted-foreground hover:text-primary transition-colors underline font-medium"
                  >
                    Schedule conflict or therapist unavailable? Request reassignment
                  </button>
                </div>

                <div className="flex gap-3 pt-4 border-t border-border mt-4">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setTherapyStep(1)}>
                    Back
                  </Button>
                  <Button 
                    className="flex-1 rounded-xl text-white font-bold bg-primary hover:bg-primary/90" 
                    disabled={!therapyDate || !therapyTime || !getAvailableTimeSlots().includes(therapyTime)}
                    onClick={() => setTherapyStep(3)}
                  >
                    Review & Pay <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: PREPAID SUMMARY & PAYMENT */}
            {therapyStep === 3 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-3">
                  <h4 className="font-bold text-sm border-b border-border/60 pb-2 flex items-center justify-between">
                    <span>Prepaid Booking Summary</span>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">
                      {selectedTherapyMode} Session
                    </Badge>
                  </h4>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Therapy Service:</span>
                    <span className="font-semibold text-foreground">{therapyToBook.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Allotted Therapist:</span>
                    <span className="font-semibold text-foreground">{therapyToBook.therapistId?.name || "Licensed Specialist"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Mode:</span>
                    <span className="font-semibold text-primary">{selectedTherapyMode === "Online" ? "Online Video Room" : "In-Person Clinic Visit"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Scheduled Time:</span>
                    <span className="font-semibold text-foreground">{therapyDate} at {therapyTime}</span>
                  </div>
                  {selectedTherapyMode === "Offline" && therapyToBook.clinicId && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Clinic Address:</span>
                      <span className="font-semibold text-foreground text-right">{therapyToBook.clinicId.name}, {therapyToBook.clinicId.city}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-2.5 border-t border-border/60 font-bold">
                    <span>Total Session Fee:</span>
                    <span className="text-primary text-base">₹{therapyToBook.price}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-[11px] text-muted-foreground leading-relaxed">
                  <strong className="text-primary block font-semibold mb-0.5">Prepaid Guarantee</strong>
                  Once payment is completed, your slot will be officially booked on the therapist's calendar. For online sessions, you can join the room directly from this dashboard.
                </div>

                <div className="flex gap-3 pt-4 border-t border-border mt-4">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setTherapyStep(2)} disabled={paymentProcessing}>
                    Back
                  </Button>
                  <Button 
                    className="flex-1 rounded-xl text-white font-bold bg-primary hover:bg-primary/90 shadow-md" 
                    onClick={handlePayAndBookTherapy}
                    disabled={paymentProcessing}
                  >
                    {paymentProcessing ? (
                      <span className="flex items-center gap-1.5">
                        <RefreshCw className="w-4 h-4 animate-spin" /> Processing...
                      </span>
                    ) : (
                      `Pay ₹${therapyToBook.price} & Confirm`
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Therapist Reassignment Request Modal */}
      {reassigningSession && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-3xl max-w-md w-full p-6 shadow-2xl border border-border">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-primary" /> Request Reassignment
              </h3>
              <button 
                onClick={() => setReassigningSession(null)}
                className="w-7 h-7 rounded-full bg-muted/40 hover:bg-muted flex items-center justify-center text-muted-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              If your assigned therapist is unavailable or their timings conflict with your schedule, submit a request to your prescribing doctor to allot an alternative therapist.
            </p>

            <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 text-xs space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Session:</span>
                <span className="font-semibold text-foreground">{reassigningSession.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Currently Allotted:</span>
                <span className="font-semibold text-primary">{reassigningSession.therapistId?.name || "Assigned Therapist"}</span>
              </div>
            </div>

            <form onSubmit={handleRequestReassignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Reason for Change</label>
                <select
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:outline-none focus:border-primary font-medium"
                  value={reassignmentReason.startsWith("Other:") ? "Other" : reassignmentReason}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "Other") {
                      setReassignmentReason("Other: ");
                    } else {
                      setReassignmentReason(val);
                    }
                  }}
                  required
                >
                  <option value="">Select a reason...</option>
                  <option value="Schedule / time slots conflict">Schedule / time slots conflict</option>
                  <option value="Need an earlier appointment date">Need an earlier appointment date</option>
                  <option value="Prefer different therapist specialization">Prefer different therapist specialization</option>
                  <option value="Prefer in-person clinic closer to my location">Prefer in-person clinic closer to my location</option>
                  <option value="Other">Other reason</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Additional Notes for Doctor</label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs focus:outline-none focus:border-primary font-medium"
                  placeholder="Mention preferred timing, preferred days, or specific concerns..."
                  value={reassignmentReason.startsWith("Other: ") ? reassignmentReason.replace("Other: ", "") : reassignmentReason}
                  onChange={(e) => setReassignmentReason(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-border">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 rounded-xl text-xs" 
                  onClick={() => setReassigningSession(null)}
                  disabled={submittingReassignment}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 rounded-xl text-white font-bold text-xs bg-primary hover:bg-primary/90"
                  disabled={submittingReassignment || !reassignmentReason}
                >
                  {submittingReassignment ? "Submitting..." : "Submit to Doctor"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
