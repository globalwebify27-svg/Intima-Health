"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Video, 
  FlaskConical, 
  HeartHandshake, 
  Calendar as CalendarIcon, 
  Clock,
  ShieldCheck,
  CreditCard,
  MapPin,
  Building2,
  AlertCircle,
  X,
  User,
  Star,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookingModal } from "@/store/useBookingModal";
import { useServices } from "@/store/useServices";
import { getServiceIcon } from "@/lib/service-icons";

const cities = [
  { id: "pune", name: "Pune", description: "Maharashtra's premium wellness hub" },
  { id: "mumbai", name: "Mumbai", description: "Bandra and Andheri luxury centers" },
  { id: "delhi", name: "New Delhi", description: "Vasant Vihar clinical flagship" }
];

const clinics = [
  { id: "pune-kalyani", name: "Kalyani Nagar Care Center", cityId: "pune", address: "102 Kalyani Nagar, Pune" },
  { id: "pune-main", name: "Pune Intimacy Clinic", cityId: "pune", address: "Sector 4, Koregaon Park, Pune" },
  { id: "mumbai-bandra", name: "Bandra Premium Clinic", cityId: "mumbai", address: "Linking Road, Bandra West, Mumbai" },
  { id: "mumbai-andheri", name: "Andheri Health Center", cityId: "mumbai", address: "Lokhandwala, Andheri West, Mumbai" },
  { id: "delhi-vasant", name: "Vasant Vihar Premium Clinic", cityId: "delhi", address: "Vasant Vihar, New Delhi" },
  { id: "delhi-cp", name: "Connaught Place Clinic", cityId: "delhi", address: "Radial Road, Connaught Place, New Delhi" }
];

const conditions = [
  { id: "ed", name: "Erectile Dysfunction (ED)", spec: "Urology" },
  { id: "pe", name: "Premature Ejaculation (PE)", spec: "Urology" },
  { id: "low-libido", name: "Low Libido", spec: "Sexual Medicine" },
  { id: "sti", name: "STI Testing & Prevention", spec: "Urology" },
  { id: "fertility", name: "Fertility Concerns", spec: "Urology" },
  { id: "couples", name: "Relationship & Couple Therapy", spec: "Sexual Medicine" }
];

const timeSlots = ["09:00 AM", "10:30 AM", "01:00 PM", "03:45 PM", "05:00 PM"];

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  experience: number;
  fees: number;
  bio: string;
  rating?: number;
  conditions?: string[];
}

export function BookingModal() {
  const { isOpen, closeBooking } = useBookingModal();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [clinicsList, setClinicsList] = useState<any[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
  const { services, loading: loadingServices, fetchServices } = useServices();
  const [realSlots, setRealSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [whatsappMsg, setWhatsappMsg] = useState("");

  const [formData, setFormData] = useState({
    service: "",
    city: "",
    clinic: "",
    condition: "",
    doctorId: "",
    date: "",
    time: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    paymentMethod: "Online",
    // payment card mock fields
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    isExistingPatient: false,
  });

  const [otpStep, setOtpStep] = useState<'phone' | 'otp' | 'verified'>('phone');
  const [otpCode, setOtpCode] = useState("");
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Reset steps and form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setFormData(prev => ({ ...prev, service: "", city: "", clinic: "", doctorId: "", date: "", time: "", condition: "" }));
      setErrorMsg("");
      setSuccessMsg("");
      setRealSlots([]);
      setWhatsappMsg("");
      setOtpStep('phone');
      setOtpCode("");
      setOtpError("");
      setLoggedInUser(null);
    } else {
      // Fetch services
      fetchServices();
      // Check if user is logged in
      fetch("/api/auth/me")
        .then(res => res.json())
        .then(async data => {
          if (data.success && data.user && data.user.role === 'PATIENT') {
            const profileRes = await fetch("/api/patients/profile");
            const profileData = await profileRes.json();
            if (profileData.success && profileData.profile) {
              setLoggedInUser(profileData.profile);
              setFormData(prev => ({
                ...prev,
                isExistingPatient: true,
                phone: profileData.profile.phone || "",
                firstName: profileData.profile.name?.split(' ')[0] || '',
                lastName: profileData.profile.name?.split(' ').slice(1).join(' ') || '',
                email: profileData.profile.email || ''
              }));
              setOtpStep('verified');
            }
          }
        })
        .catch(err => console.error("Error fetching user:", err));
    }
  }, [isOpen]);

  // Fetch clinics list when modal opens
  useEffect(() => {
    if (isOpen) {
      setLoadingClinics(true);
      fetch("/api/clinics")
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data) {
            setClinicsList(json.data);
          }
        })
        .catch(err => console.error("Error loading clinics:", err))
        .finally(() => setLoadingClinics(false));
    }
  }, [isOpen]);

  // Fetch doctors list when clinic is selected
  useEffect(() => {
    if (isOpen && formData.clinic) {
      setLoadingDocs(true);
      fetch(`/api/doctors?clinicId=${formData.clinic}`)
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data) {
            setDoctorsList(json.data);
          }
        })
        .catch(err => console.error("Error loading doctors:", err))
        .finally(() => setLoadingDocs(false));
    }
  }, [isOpen, formData.clinic]);

  // Fetch available slots when doctor and date are selected
  useEffect(() => {
    if (isOpen && formData.doctorId && formData.date) {
      setLoadingSlots(true);
      setErrorMsg("");
      fetch(`/api/doctors/${formData.doctorId}/slots?date=${formData.date}`)
        .then(res => res.json())
        .then(json => {
          if (json.success && json.data) {
            setRealSlots(json.data);
          } else {
            setRealSlots([]);
          }
        })
        .catch(err => {
          console.error("Error loading slots:", err);
          setRealSlots([]);
        })
        .finally(() => setLoadingSlots(false));
    } else {
      setRealSlots([]);
    }
  }, [isOpen, formData.doctorId, formData.date]);

  const nextStep = () => setStep((s) => Math.min(s + 1, 6));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const updateForm = (key: string, value: string | boolean) => {
    setFormData(prev => {
      const updated = { ...prev, [key]: value };
      if (key === "city") {
        updated.clinic = "";
        updated.doctorId = "";
      }
      if (key === "clinic") {
        updated.doctorId = "";
      }
      return updated;
    });
  };

  const isStepValid = () => {
    if (step === 1) return !!formData.service;
    if (step === 2) return !!formData.city;
    if (step === 3) return !!formData.clinic;
    if (step === 4) return !!formData.doctorId;
    if (step === 5) return !!formData.date && !!formData.time;
    if (step === 6) {
      if (formData.isExistingPatient) {
        return !!formData.phone && otpStep === 'verified';
      }
      return !!formData.firstName && !!formData.lastName && !!formData.phone;
    }
    return true;
  };

  const formatSlotTime = (time24: string) => {
    let [hoursStr, minutesStr] = time24.split(":");
    let hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${String(hours).padStart(2, "0")}:${minutesStr} ${ampm}`;
  };

  const getAvailableTimeSlots = () => {
    const availableSlots = realSlots.filter(s => s.available);
    return availableSlots.map(s => formatSlotTime(s.start));
  };

  // Derive cities list from real clinics
  const derivedCities = Array.from(new Set(clinicsList.map(c => c.city).filter(Boolean))).map(cityName => ({
    id: cityName.toLowerCase(),
    name: cityName,
    description: `Wellness hubs in ${cityName}`
  }));

  const filteredClinics = clinicsList.filter(c => c.city && c.city.toLowerCase() === formData.city);
  const displayDoctors = doctorsList;

  const isWalkIn = services.find(s => s._id === formData.service)?.name?.toLowerCase().includes('walk-in');

  const handleSendOtp = async () => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      setOtpError("Please enter a valid 10-digit WhatsApp number.");
      return;
    }
    setLoadingOtp(true);
    setOtpError("");
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpStep('otp');
        setResendTimer(30);
        if (data.code) {
          alert(`[Test OTP Code]: ${data.code}`);
        }
      } else {
        throw new Error(data.message || "Failed to send OTP.");
      }
    } catch (err: any) {
      setOtpError(err.message || "Something went wrong.");
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoadingOtp(true);
    setOtpError("");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone, otp: otpCode }),
      });
      const data = await res.json();
      if (data.success) {
        setOtpStep('verified');
        if (data.user?.name) {
          const parts = data.user.name.split(' ');
          updateForm('firstName', parts[0] || '');
          updateForm('lastName', parts.slice(1).join(' ') || '');
        }
        if (data.user?.email) {
          updateForm('email', data.user.email);
        }
      } else {
        throw new Error(data.message || "Invalid OTP code.");
      }
    } catch (err: any) {
      setOtpError(err.message || "Failed to verify OTP.");
    } finally {
      setLoadingOtp(false);
    }
  };

  const handleConfirmBooking = async () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      setErrorMsg("Please enter a valid WhatsApp number (exactly 10 digits).");
      return;
    }

    if (!formData.isExistingPatient) {
      if (!formData.firstName || formData.firstName.trim().length < 2 || !nameRegex.test(formData.firstName)) {
        setErrorMsg("Please enter a valid first name (letters only, min 2 characters).");
        return;
      }
      if (!formData.lastName || formData.lastName.trim().length < 2 || !nameRegex.test(formData.lastName)) {
        setErrorMsg("Please enter a valid last name (letters only, min 2 characters).");
        return;
      }
      if (formData.email && formData.email.trim() !== "" && !emailRegex.test(formData.email)) {
        setErrorMsg("Please enter a valid email address.");
        return;
      }
    } else {
      if (otpStep !== 'verified') {
        setErrorMsg("Please verify your phone number first.");
        return;
      }
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // 1. Create booking
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to submit booking.");
      }

      const appointmentId = data.data._id;

      if (formData.paymentMethod === "Cash") {
        setSuccessMsg("Appointment booked provisionally! Cash payment at clinic.");
        setWhatsappMsg("Your appointment has been scheduled provisionally. Please complete the cash payment at the clinic 15 minutes before your time slot.");
      } else {
        // 2. Mock payment confirmation
        const payRes = await fetch(`/api/appointments/${appointmentId}/pay`, {
          method: "POST"
        });
        const payData = await payRes.json();
        if (!payData.success) {
          throw new Error(payData.message || "Failed to process appointment payment.");
        }

        setSuccessMsg("Appointment booked and paid successfully!");
        setWhatsappMsg(payData.whatsappMessage || "Your appointment has been scheduled and confirmed.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBooking}
            className="fixed inset-0 bg-background/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative z-10 w-full max-w-2xl bg-card border border-border shadow-2xl rounded-3xl md:rounded-[2.5rem] flex flex-col max-h-[90vh] md:max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 md:p-6 border-b border-border">
              <div>
                <h2 className="text-xl md:text-2xl font-bold font-serif text-foreground">Book Appointment</h2>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Multi-step clinic checkout wizard</p>
              </div>
              <button 
                onClick={closeBooking}
                className="p-2 md:p-2.5 rounded-full bg-muted/60 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Progress indicators - Desktop */}
            <div className="hidden md:flex px-6 pt-4 pb-2 gap-1 items-center justify-between text-[10px] font-semibold text-muted-foreground border-b border-border/50">
              {["Services", "City", "Clinics", "Doctor", "Schedule", "Payment"].map((name, index) => {
                const isActive = step >= index + 1;
                return (
                  <div key={name} className="flex items-center gap-1.5 shrink-0">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[9px] ${
                      isActive ? "bg-primary border-primary text-white" : "border-border"
                    }`}>
                      {index + 1}
                    </span>
                    <span className={isActive ? "text-primary" : ""}>{name}</span>
                    {index < 5 && <span className="text-border">/</span>}
                  </div>
                );
              })}
            </div>

            {/* Progress indicators - Mobile */}
            <div className="md:hidden px-5 py-3 flex items-center justify-between border-b border-border/50 bg-muted/20">
               <div className="text-xs font-bold text-foreground">
                 Step {step} of 6: <span className="text-primary">{["Services", "City", "Clinics", "Doctor", "Schedule", "Payment"][step - 1]}</span>
               </div>
               <div className="flex gap-1">
                 {[1,2,3,4,5,6].map(i => (
                   <div key={i} className={`h-1.5 w-1.5 rounded-full ${step >= i ? "bg-primary" : "bg-muted-foreground/30"}`} />
                 ))}
               </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 min-h-[350px]">
              <AnimatePresence mode="wait">
                {/* Step 1: Services */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-bold font-serif mb-4">Select Service Type</h3>
                    {loadingServices ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">Loading services...</div>
                    ) : services.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">No services available.</div>
                    ) : (
                      services.map((service) => {
                        const Icon = getServiceIcon(service.icon);
                        return (
                          <button
                            key={service._id}
                            onClick={() => updateForm('service', service._id)}
                            className={`w-full flex items-center p-4 rounded-2xl border text-left transition-all ${
                              formData.service === service._id 
                                ? "border-primary bg-primary/5 shadow-sm" 
                                : "border-border hover:border-primary/40 hover:bg-muted"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mr-4 ${
                              formData.service === service._id ? "bg-primary text-white" : "bg-muted text-foreground"
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-bold">{service.name}</h4>
                              <p className="text-muted-foreground text-xs mt-0.5">{service.description}</p>
                            </div>
                            <div className="font-bold text-sm text-primary">₹{service.price}</div>
                          </button>
                        );
                      })
                    )}
                  </motion.div>
                )}

                {/* Step 2: City */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-bold font-serif mb-4">Choose Your City</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {loadingClinics ? (
                        <div className="col-span-2 sm:col-span-3 py-8 text-center text-xs text-muted-foreground">Loading cities...</div>
                      ) : derivedCities.length === 0 ? (
                        <div className="col-span-2 sm:col-span-3 py-8 text-center text-xs text-muted-foreground">No clinic locations found.</div>
                      ) : (
                        derivedCities.map((city) => (
                          <button
                            key={city.id}
                            onClick={() => updateForm('city', city.id)}
                            className={`flex flex-col items-center text-center p-3 sm:p-5 rounded-2xl border transition-all ${
                              formData.city === city.id 
                                ? "border-primary bg-primary/5 shadow-sm" 
                                : "border-border hover:border-primary/40 hover:bg-muted"
                            }`}
                          >
                            <MapPin className={`w-5 h-5 sm:w-6 sm:h-6 mb-2 sm:mb-3 ${formData.city === city.id ? "text-primary" : "text-muted-foreground"}`} />
                            <h4 className="text-sm font-bold mb-1">{city.name}</h4>
                            <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-relaxed">{city.description}</p>
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Clinics */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-bold font-serif mb-4">Select Clinic Location</h3>
                    {filteredClinics.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No clinics registered in this city.</p>
                    ) : (
                      filteredClinics.map((clinic) => (
                        <button
                          key={clinic._id}
                          onClick={() => updateForm('clinic', clinic._id)}
                          className={`w-full flex items-center p-4 rounded-2xl border text-left transition-all ${
                            formData.clinic === clinic._id 
                              ? "border-primary bg-primary/5 shadow-sm" 
                              : "border-border hover:border-primary/40 hover:bg-muted"
                          }`}
                        >
                          <Building2 className={`w-5 h-5 mr-4 ${formData.clinic === clinic._id ? "text-primary" : "text-muted-foreground"}`} />
                          <div className="flex-1">
                            <h4 className="text-sm font-bold">{clinic.name}</h4>
                            <p className="text-muted-foreground text-xs mt-0.5">{clinic.address}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}

                {/* Step 4: Doctor List */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-bold font-serif mb-4">Choose Your Doctor</h3>
                    {loadingDocs ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">Loading available doctors...</div>
                    ) : displayDoctors.length === 0 ? (
                      <div className="py-8 text-center text-xs text-muted-foreground">No doctors registered in this clinic.</div>
                    ) : (
                      displayDoctors.map((doc) => (
                        <button
                          key={doc._id}
                          onClick={() => updateForm('doctorId', doc._id)}
                          className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                            formData.doctorId === doc._id 
                              ? "border-primary bg-primary/5 shadow-sm" 
                              : "border-border hover:border-primary/40 hover:bg-muted"
                          }`}
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {doc.name.split(' ').pop()?.[0]}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-bold">{doc.name}</h4>
                            <p className="text-xs text-muted-foreground">{doc.specialization} • {doc.experience} yrs exp</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{doc.bio}</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-0.5 mt-0.5">
                                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                <span className="text-[10px] font-bold">5.0</span>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </motion.div>
                )}

                {/* Step 5: Date & Time */}
                {step === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    <h3 className="text-lg font-bold font-serif mb-4">Select Date & Time</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold flex items-center gap-2">
                          <CalendarIcon className="w-3.5 h-3.5 text-primary" /> Select Date
                        </label>
                        <input 
                          type="date" 
                          value={formData.date}
                          onChange={(e) => updateForm('date', e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>

                      {formData.date && (
                        <div className="space-y-2 pt-2">
                          <label className="text-xs font-semibold flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-primary" /> Available Slots
                          </label>
                          {loadingSlots ? (
                            <div className="text-xs text-muted-foreground py-4 text-center">Loading available slots...</div>
                          ) : getAvailableTimeSlots().length === 0 ? (
                            <div className="text-xs text-rose-500 font-semibold py-4 text-center">No slots available for this date. Please select another date.</div>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {getAvailableTimeSlots().map((time) => (
                                <button
                                  key={time}
                                  onClick={() => updateForm('time', time)}
                                  className={`py-2.5 px-4 rounded-xl border transition-all text-xs font-semibold ${
                                    formData.time === time 
                                      ? "bg-primary text-white border-primary shadow-sm" 
                                      : "bg-background border-border hover:border-primary/50 text-foreground"
                                  }`}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 6: Patient Details & Payment */}
                {step === 6 && (
                  <motion.div
                    key="step6"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    {whatsappMsg ? (
                      <div className="space-y-6 text-center py-6">
                        {/* Status Icon */}
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner ${
                          formData.paymentMethod === "Cash" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                        }`}>
                          {formData.paymentMethod === "Cash" ? <AlertCircle className="w-12 h-12" /> : <CheckCircle2 className="w-12 h-12" />}
                        </div>

                        {/* Booking Title */}
                        <div className="space-y-2 mt-4">
                          <h3 className="text-2xl font-bold font-serif text-foreground">
                            {formData.paymentMethod === "Cash" ? "Booking Initiated!" : "Booking Confirmed!"}
                          </h3>
                          {formData.paymentMethod === "Cash" ? (
                            <div className="space-y-3 max-w-md mx-auto">
                              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-700 font-medium">
                                Your appointment is provisionally held. <span className="font-bold">Please pay at the clinic to confirm your slot.</span>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Prefer paying online? You can complete the payment anytime from your <span className="font-semibold text-primary">Patient Dashboard</span>.
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">Your appointment has been successfully scheduled and paid.</p>
                          )}
                        </div>

                        {/* Mobile App Callout Card */}
                        <div className="border border-primary/25 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-[2rem] p-6 space-y-4 max-w-md mx-auto shadow-sm text-left">
                          {!formData.isExistingPatient && (
                            <>
                              <div className="flex items-center justify-center gap-2 mb-1">
                                <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1 rounded-full">Patient Account Created</span>
                              </div>
                              
                              <p className="text-xs text-muted-foreground leading-relaxed text-center">
                                We've automatically created your patient profile. Your login credentials and receipt have been dispatched to your registered WhatsApp number.
                              </p>

                              <div className="h-px bg-border/50 my-2" />
                            </>
                          )}

                          <div className="space-y-2">
                            <p className="text-xs font-bold text-foreground">📲 Get the Mobile App</p>
                            <p className="text-[11px] text-muted-foreground leading-relaxed">
                              Download our mobile app to track your appointment history, view digital prescriptions, and join your video consultations directly.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-bold font-serif mb-4">Checkout & Secure Booking</h3>

                        {successMsg && (
                          <div className="p-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-200/50 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" /> {successMsg}
                          </div>
                        )}
                        {errorMsg && (
                          <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 text-xs font-semibold rounded-xl border border-rose-200/50 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" /> {errorMsg}
                          </div>
                        )}

                        <div className="space-y-4">
                          {/* Patient info fields */}
                          {!loggedInUser ? (
                          <div className="border border-border/80 rounded-2xl p-4 bg-muted/20 space-y-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Patient Info</h4>
                              <div className="flex items-center gap-3">
                                <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="patientType"
                                    checked={!formData.isExistingPatient} 
                                    onChange={() => updateForm('isExistingPatient', false)} 
                                    className="accent-primary" 
                                  />
                                  New Patient
                                </label>
                                <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="patientType"
                                    checked={formData.isExistingPatient} 
                                    onChange={() => updateForm('isExistingPatient', true)} 
                                    className="accent-primary" 
                                  />
                                  Existing Patient
                                </label>
                              </div>
                            </div>
                            
                            {!formData.isExistingPatient ? (
                              <>
                                <div className="grid grid-cols-2 gap-3">
                                  <input 
                                    type="text" 
                                    value={formData.firstName}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                      updateForm('firstName', val);
                                    }}
                                    className="bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" 
                                    placeholder="First Name" 
                                  />
                                  <input 
                                    type="text" 
                                    value={formData.lastName}
                                    onChange={(e) => {
                                      const val = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                      updateForm('lastName', val);
                                    }}
                                    className="bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" 
                                    placeholder="Last Name" 
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <input 
                                    type="email" 
                                    value={formData.email}
                                    onChange={(e) => updateForm('email', e.target.value)}
                                    className="bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" 
                                    placeholder="Email (Optional)" 
                                  />
                                  <input 
                                    type="tel" 
                                    value={formData.phone}
                                    onChange={(e) => {
                                      let val = e.target.value.replace(/\D/g, '');
                                      if (val.length > 0 && !/^[6-9]/.test(val[0])) {
                                        val = '';
                                      }
                                      updateForm('phone', val);
                                    }}
                                    maxLength={10}
                                    className="bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" 
                                    placeholder="WhatsApp Number" 
                                  />
                                </div>
                              </>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex gap-2">
                                  <input 
                                    type="tel" 
                                    value={formData.phone}
                                    onChange={(e) => {
                                      let val = e.target.value.replace(/\D/g, '');
                                      if (val.length > 0 && !/^[6-9]/.test(val[0])) {
                                        val = '';
                                      }
                                      updateForm('phone', val);
                                      if (otpStep !== 'phone') setOtpStep('phone');
                                    }}
                                    disabled={otpStep === 'verified' || loadingOtp}
                                    maxLength={10}
                                    className="bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary flex-1 disabled:opacity-50" 
                                    placeholder="WhatsApp Number" 
                                  />
                                  {otpStep === 'phone' && (
                                    <button 
                                      type="button"
                                      onClick={handleSendOtp}
                                      disabled={loadingOtp || formData.phone.length !== 10}
                                      className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap disabled:opacity-50"
                                    >
                                      {loadingOtp ? "Sending..." : "Verify"}
                                    </button>
                                  )}
                                  {otpStep === 'verified' && (
                                    <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-1.5 whitespace-nowrap">
                                      <ShieldCheck className="w-3.5 h-3.5" /> Verified
                                    </div>
                                  )}
                                </div>

                                {otpStep === 'verified' && (
                                  <div className="grid grid-cols-2 gap-3 mt-3">
                                    <input 
                                      type="text" 
                                      value={formData.firstName}
                                      disabled
                                      className="bg-muted border border-border rounded-xl px-3 py-2 text-xs opacity-70 cursor-not-allowed" 
                                      placeholder="First Name" 
                                    />
                                    <input 
                                      type="text" 
                                      value={formData.lastName}
                                      disabled
                                      className="bg-muted border border-border rounded-xl px-3 py-2 text-xs opacity-70 cursor-not-allowed" 
                                      placeholder="Last Name" 
                                    />
                                  </div>
                                )}

                                {otpStep === 'otp' && (
                                  <div className="space-y-2">
                                    <div className="flex gap-2">
                                      <input 
                                        type="text" 
                                        value={otpCode}
                                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                        maxLength={6}
                                        className="bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary flex-1 tracking-widest text-center" 
                                        placeholder="Enter 6-digit OTP" 
                                      />
                                      <button 
                                        type="button"
                                        onClick={handleVerifyOtp}
                                        disabled={loadingOtp || otpCode.length < 4}
                                        className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap disabled:opacity-50"
                                      >
                                        {loadingOtp ? "Verifying..." : "Confirm"}
                                      </button>
                                    </div>
                                    <div className="text-right">
                                      <button
                                        type="button"
                                        onClick={handleSendOtp}
                                        disabled={resendTimer > 0 || loadingOtp}
                                        className="text-[10px] font-bold text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
                                      >
                                        {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                                      </button>
                                    </div>
                                  </div>
                                )}
                                
                                {otpError && (
                                  <p className="text-xs text-rose-500 font-medium">{otpError}</p>
                                )}
                              </div>
                            )}
                          </div>
                          ) : (
                            <div className="border border-border/80 rounded-2xl p-4 bg-muted/20 space-y-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Patient Info</h4>
                                <div className="text-sm font-medium text-foreground">
                                   Booking as <span className="font-bold">{loggedInUser.name}</span> ({loggedInUser.phone})
                                </div>
                            </div>
                          )}

                          {/* Payment method selector only for Walk-in Consultation */}
                          {isWalkIn && (
                            <div className="border border-border/80 rounded-2xl p-4 bg-muted/20 space-y-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Payment Method</h4>
                              <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="paymentMethodModal" 
                                    value="Online" 
                                    checked={formData.paymentMethod === "Online"}
                                    onChange={(e) => updateForm('paymentMethod', e.target.value)}
                                    className="accent-primary"
                                  />
                                  Pay Online (UPI/Card)
                                </label>
                                <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                                  <input 
                                    type="radio" 
                                    name="paymentMethodModal" 
                                    value="Cash" 
                                    checked={formData.paymentMethod === "Cash"}
                                    onChange={(e) => updateForm('paymentMethod', e.target.value)}
                                    className="accent-primary"
                                  />
                                  Pay in Cash (At Clinic)
                                </label>
                              </div>
                              
                              {formData.paymentMethod === "Cash" && (
                                <div className="p-3 bg-amber-500/10 text-amber-800 dark:text-amber-300 text-xs font-medium rounded-xl border border-amber-500/25 flex gap-2 items-start mt-2">
                                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                                  <div>
                                    <span className="font-bold">Provisional Booking:</span> Your appointment is held provisionally. Please arrive at the clinic at least 15 minutes prior to your time slot to complete the cash payment at the reception desk. Failure to do so may result in automatic cancellation of your slot.
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 border-t border-border flex justify-between items-center bg-muted/10">
              {whatsappMsg ? (
                <div />
              ) : step > 1 ? (
                <Button variant="ghost" disabled={submitting} onClick={prevStep} className="rounded-full text-xs">
                  <ChevronLeft className="w-4 h-4 mr-1.5" /> Back
                </Button>
              ) : (
                <div />
              )}
              
              {whatsappMsg ? (
                <Button 
                  onClick={() => {
                    closeBooking();
                    if (window.location.pathname === "/patient/dashboard") {
                      window.location.reload();
                    } else {
                      router.push("/patient/dashboard");
                    }
                  }} 
                  className="rounded-full px-8 bg-primary hover:bg-primary/95 text-white text-xs font-bold"
                >
                  Go to Dashboard
                </Button>
              ) : step < 6 ? (
                <Button 
                  onClick={nextStep} 
                  disabled={!isStepValid()}
                  className="rounded-full px-6 text-xs"
                >
                  Continue <ChevronRight className="w-4 h-4 ml-1.5" />
                </Button>
              ) : (
                <Button 
                  onClick={handleConfirmBooking} 
                  disabled={submitting || !isStepValid()} 
                  className={`rounded-full px-8 shadow-xl text-white text-xs font-bold ${
                    formData.paymentMethod === "Cash" ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {submitting ? "Processing..." : formData.paymentMethod === "Cash" ? "Confirm Provisional Booking" : "Pay & Book Appointment"}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
