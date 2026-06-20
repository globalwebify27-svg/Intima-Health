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
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Data
const services = [
  { id: "consultation", title: "Online Consultation", icon: Video, description: "15-min video call with a specialist", price: "₹999" },
  { id: "therapy", title: "Sex Therapy", icon: HeartHandshake, description: "50-min psychological counseling", price: "₹2,499" },
  { id: "walk_in", title: "Walk-in Consultation", icon: Building2, description: "In-person visit to our premium clinic", price: "₹1,499" }
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

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const [doctorsList, setDoctorsList] = useState<Doctor[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [clinicsList, setClinicsList] = useState<any[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(false);

  const [formData, setFormData] = useState({
    service: "",
    city: "",
    clinic: "",
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

  // Fetch clinics list on mount
  useEffect(() => {
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
  }, []);

  // Fetch doctors list when clinic is selected
  useEffect(() => {
    if (formData.clinic) {
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
  }, [formData.clinic]);

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

  const getAvailableTimeSlots = () => {
    if (!formData.date) return timeSlots;
    const todayStr = new Date().toLocaleDateString('en-CA');
    if (formData.date !== todayStr) {
      return timeSlots;
    }
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    return timeSlots.filter(slot => {
      const [timePart, modifier] = slot.split(" ");
      let [hoursStr, minutesStr] = timePart.split(":");
      let hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      if (hours === 12) {
        hours = 0;
      }
      if (modifier === "PM") {
        hours += 12;
      }
      if (hours > currentHours) return true;
      if (hours === currentHours && minutes > currentMinutes) return true;
      return false;
    });
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
    <div className="min-h-screen bg-muted/20 text-foreground pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-serif mb-4">Book Your Appointment</h1>
          <p className="text-muted-foreground text-lg">Fast, discreet, and secure scheduling.</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex justify-between items-center relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border rounded-full -z-10" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full -z-10 transition-all duration-500" 
              style={{ width: `${((step - 1) / 5) * 100}%` }}
            />
            
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors duration-300 shadow-sm border-2 ${
                  step > i 
                    ? "bg-primary border-primary text-primary-foreground" 
                    : step === i 
                      ? "bg-background border-primary text-primary" 
                      : "bg-background border-border text-muted-foreground"
                }`}
              >
                {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-xs font-medium text-muted-foreground hidden sm:flex">
            <span>Services</span>
            <span>City</span>
            <span>Clinics</span>
            <span>Doctor</span>
            <span>Schedule</span>
            <span>Payment</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-card border border-border shadow-2xl rounded-[2.5rem] p-6 md:p-10 min-h-[500px] flex flex-col relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            
            {/* Step 1: Services */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 animate-in fade-in duration-300"
              >
                <h2 className="text-2xl font-serif mb-6">Select Service Type</h2>
                <div className="space-y-4">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => updateForm('service', service.id)}
                      className={`w-full flex items-center p-6 rounded-2xl border-2 text-left transition-all ${
                        formData.service === service.id 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-border hover:border-primary/40 hover:bg-muted"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-5 ${
                        formData.service === service.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}>
                        <service.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{service.title}</h3>
                        <p className="text-muted-foreground text-sm">{service.description}</p>
                      </div>
                      <div className="font-bold text-lg text-primary">{service.price}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Choose City */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 animate-in fade-in duration-300"
              >
                <h2 className="text-2xl font-serif mb-6">Choose Your City</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {loadingClinics ? (
                    <div className="col-span-3 py-8 text-center text-sm text-muted-foreground">Loading cities...</div>
                  ) : derivedCities.length === 0 ? (
                    <div className="col-span-3 py-8 text-center text-sm text-muted-foreground">No clinic locations found.</div>
                  ) : (
                    derivedCities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => updateForm('city', city.id)}
                        className={`flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all ${
                          formData.city === city.id 
                            ? "border-primary bg-primary/5 shadow-md" 
                            : "border-border hover:border-primary/40 hover:bg-muted"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 mb-4 ${
                          formData.city === city.id ? "bg-primary text-primary-foreground" : "bg-muted text-primary"
                        }`}>
                          <MapPin className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{city.name}</h3>
                        <p className="text-xs text-muted-foreground">{city.description}</p>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Choose Clinic */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 animate-in fade-in duration-300"
              >
                <h2 className="text-2xl font-serif mb-6">Select Clinic Location</h2>
                <div className="space-y-4">
                  {filteredClinics.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No clinics registered in this city.</p>
                  ) : (
                    filteredClinics.map((clinic) => (
                      <button
                        key={clinic._id}
                        onClick={() => updateForm('clinic', clinic._id)}
                        className={`w-full flex items-center p-6 rounded-2xl border-2 text-left transition-all ${
                          formData.clinic === clinic._id 
                            ? "border-primary bg-primary/5 shadow-md" 
                            : "border-border hover:border-primary/40 hover:bg-muted"
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-5 ${
                          formData.clinic === clinic._id ? "bg-primary text-primary-foreground" : "bg-muted text-primary"
                        }`}>
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{clinic.name}</h3>
                          <p className="text-muted-foreground text-sm">{clinic.address}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 4: Doctor List */}
            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 animate-in fade-in duration-300"
              >
                <h2 className="text-2xl font-serif mb-6">Choose Your Doctor</h2>
                <div className="space-y-4">
                  {loadingDocs ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">Loading available doctors...</div>
                  ) : displayDoctors.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">No doctors registered in this clinic.</div>
                  ) : (
                    displayDoctors.map((doc) => (
                      <button
                        key={doc._id}
                        onClick={() => updateForm('doctorId', doc._id)}
                        className={`w-full flex items-center p-6 rounded-2xl border-2 text-left transition-all ${
                          formData.doctorId === doc._id 
                            ? "border-primary bg-primary/5 shadow-md" 
                            : "border-border hover:border-primary/40 hover:bg-muted"
                        }`}
                      >
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold">{doc.name}</h3>
                          <p className="text-muted-foreground text-sm">{doc.specialization} • {doc.experience} yrs exp</p>
                        </div>
                        <div className="font-bold text-lg text-primary">₹{doc.fees}</div>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 5: Date & Time */}
            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 animate-in fade-in duration-300"
              >
                <h2 className="text-2xl font-serif mb-6">Select Date & Time</h2>
                
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary" /> Select Date
                    </label>
                    <input 
                      type="date" 
                      value={formData.date}
                      onChange={(e) => updateForm('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>

                  {formData.date && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <label className="text-sm font-semibold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" /> Available Slots
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {getAvailableTimeSlots().map((time) => (
                          <button
                            key={time}
                            onClick={() => updateForm('time', time)}
                            className={`py-3 px-4 rounded-xl border transition-all text-sm font-medium ${
                              formData.time === time 
                                ? "bg-primary text-primary-foreground border-primary shadow-md" 
                                : "bg-background border-border hover:border-primary/50 text-foreground"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 6: Patient Details & Payment Checkout */}
            {step === 6 && (
              <motion.div 
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 animate-in fade-in duration-300"
              >
                {whatsappMsg ? (
                  <div className="space-y-6 text-center py-6">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500 mb-2 shadow-inner">
                      <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-bold font-serif text-foreground">Booking Confirmed!</h3>
                      <p className="text-sm text-muted-foreground">Your appointment has been successfully scheduled and paid.</p>
                    </div>
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
                    <h2 className="text-2xl font-serif mb-6">Patient Details</h2>
                    
                    {errorMsg && (
                      <div className="mb-4 p-3 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 text-xs font-semibold rounded-xl border border-rose-200/50 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" /> {errorMsg}
                      </div>
                    )}

                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">First Name</label>
                          <input 
                            type="text" 
                            value={formData.firstName}
                            onChange={(e) => updateForm('firstName', e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
                            placeholder="John" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Last Name</label>
                          <input 
                            type="text" 
                            value={formData.lastName}
                            onChange={(e) => updateForm('lastName', e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
                            placeholder="Doe" 
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email Address</label>
                          <input 
                            type="email" 
                            value={formData.email}
                            onChange={(e) => updateForm('email', e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm" 
                            placeholder="john@example.com" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">WhatsApp Number</label>
                          <input 
                            type="tel" 
                            value={formData.phone}
                            onChange={(e) => updateForm('phone', e.target.value)}
                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm" 
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

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
            {step > 1 ? (
              <Button variant="ghost" disabled={submitting} onClick={prevStep} className="rounded-full">
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            ) : (
              <div /> 
            )}
            
            {step < 6 ? (
              <Button 
                onClick={nextStep} 
                disabled={!isStepValid()}
                className="rounded-full px-8 shadow-md"
              >
                Continue <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleConfirmBooking} 
                disabled={submitting || !isStepValid()} 
                className="rounded-full px-8 shadow-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {submitting ? "Processing..." : "Pay & Book Appointment"}
              </Button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
