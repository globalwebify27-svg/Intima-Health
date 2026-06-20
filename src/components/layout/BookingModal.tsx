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
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookingModal } from "@/store/useBookingModal";

// Data
const services = [
  { id: "consultation", title: "Online Consultation", icon: Video, description: "15-min video call with a specialist", price: "₹999" },
  { id: "therapy", title: "Sex Therapy", icon: HeartHandshake, description: "50-min psychological counseling", price: "₹2,499" },
  { id: "walk_in", title: "Walk-in Consultation", icon: Building2, description: "In-person visit to our premium clinic", price: "₹1,499" }
];

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
  
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [clinicsList, setClinicsList] = useState<any[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(false);
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
    // payment card mock fields
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: ""
  });

  // Reset steps and form when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setErrorMsg("");
      setSuccessMsg("");
      setRealSlots([]);
      setWhatsappMsg("");
      setFormData({
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
        cardName: "",
        cardNumber: "",
        cardExpiry: "",
        cardCvv: ""
      });
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

  const updateForm = (key: string, value: string) => {
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
    if (step === 6) return !!formData.firstName && !!formData.lastName && !!formData.email && !!formData.phone;
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

  const handleConfirmBooking = async () => {
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
            className="relative z-10 w-full max-w-2xl bg-card border border-border shadow-2xl rounded-[2.5rem] flex flex-col max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-bold font-serif text-foreground">Book Appointment</h2>
                <p className="text-xs text-muted-foreground mt-1">Multi-step clinic checkout wizard</p>
              </div>
              <button 
                onClick={closeBooking}
                className="p-2.5 rounded-full bg-muted/60 text-muted-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress indicators */}
            <div className="px-6 pt-4 pb-2 flex gap-1 items-center justify-between overflow-x-auto text-[10px] font-semibold text-muted-foreground border-b border-border/50">
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
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => updateForm('service', service.id)}
                        className={`w-full flex items-center p-4 rounded-2xl border text-left transition-all ${
                          formData.service === service.id 
                            ? "border-primary bg-primary/5 shadow-sm" 
                            : "border-border hover:border-primary/40 hover:bg-muted"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mr-4 ${
                          formData.service === service.id ? "bg-primary text-white" : "bg-muted text-foreground"
                        }`}>
                          <service.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-bold">{service.title}</h4>
                          <p className="text-muted-foreground text-xs mt-0.5">{service.description}</p>
                        </div>
                        <div className="font-bold text-sm text-primary">{service.price}</div>
                      </button>
                    ))}
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
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {loadingClinics ? (
                        <div className="col-span-3 py-8 text-center text-xs text-muted-foreground">Loading cities...</div>
                      ) : derivedCities.length === 0 ? (
                        <div className="col-span-3 py-8 text-center text-xs text-muted-foreground">No clinic locations found.</div>
                      ) : (
                        derivedCities.map((city) => (
                          <button
                            key={city.id}
                            onClick={() => updateForm('city', city.id)}
                            className={`flex flex-col items-center text-center p-5 rounded-2xl border transition-all ${
                              formData.city === city.id 
                                ? "border-primary bg-primary/5 shadow-sm" 
                                : "border-border hover:border-primary/40 hover:bg-muted"
                            }`}
                          >
                            <MapPin className={`w-6 h-6 mb-3 ${formData.city === city.id ? "text-primary" : "text-muted-foreground"}`} />
                            <h4 className="text-sm font-bold mb-1">{city.name}</h4>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">{city.description}</p>
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
                            <p className="text-xs font-bold text-primary">₹{doc.fees}</p>
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
                        {/* Green Success Icon */}
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-2 shadow-inner">
                          <CheckCircle2 className="w-12 h-12" />
                        </div>

                        {/* Booking Title */}
                        <div className="space-y-1">
                          <h3 className="text-2xl font-bold font-serif text-foreground">Booking Confirmed!</h3>
                          <p className="text-sm text-muted-foreground">Your appointment has been successfully scheduled and paid.</p>
                        </div>

                        {/* Mobile App Callout Card */}
                        <div className="border border-primary/25 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-[2rem] p-6 space-y-4 max-w-md mx-auto shadow-sm text-left">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1 rounded-full">Patient Account Created</span>
                          </div>
                          
                          <p className="text-xs text-muted-foreground leading-relaxed text-center">
                            We've automatically created your patient profile. Your login credentials and receipt have been dispatched to your registered WhatsApp number.
                          </p>

                          <div className="h-px bg-border/50 my-2" />

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
                          <div className="border border-border/80 rounded-2xl p-4 bg-muted/20 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Patient Info</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <input 
                                type="text" 
                                value={formData.firstName}
                                onChange={(e) => updateForm('firstName', e.target.value)}
                                className="bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" 
                                placeholder="First Name" 
                              />
                              <input 
                                type="text" 
                                value={formData.lastName}
                                onChange={(e) => updateForm('lastName', e.target.value)}
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
                                placeholder="Email" 
                              />
                              <input 
                                type="tel" 
                                value={formData.phone}
                                onChange={(e) => updateForm('phone', e.target.value)}
                                className="bg-background border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary" 
                                placeholder="WhatsApp Number" 
                              />
                            </div>
                          </div>
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
                    router.push("/patient/dashboard");
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
                  className="rounded-full px-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  {submitting ? "Processing..." : "Pay & Book Appointment"}
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
