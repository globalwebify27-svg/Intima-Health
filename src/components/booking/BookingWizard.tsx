"use client";

import { useState, useEffect } from "react";
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
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useServices } from "@/store/useServices";

const IconMap: any = { Video, HeartHandshake, Building2, CalendarIcon, Clock, ShieldCheck, CreditCard, MapPin, FlaskConical, CheckCircle2, ChevronRight, ChevronLeft };

const cities = [
  { id: "pune", name: "Pune", description: "Maharashtra's premium wellness hub" },
  { id: "mumbai", name: "Mumbai", description: "Bandra and Andheri luxury centers" },
  { id: "delhi", name: "New Delhi", description: "Vasant Vihar clinical flagship" }
];

const clinics = [
  // Pune
  { id: "pune-kalyani", name: "Kalyani Nagar Care Center", cityId: "pune", address: "102 Kalyani Nagar, Pune" },
  { id: "pune-main", name: "Pune Intimacy Clinic", cityId: "pune", address: "Sector 4, Koregaon Park, Pune" },
  // Mumbai
  { id: "mumbai-bandra", name: "Bandra Premium Clinic", cityId: "mumbai", address: "Linking Road, Bandra West, Mumbai" },
  { id: "mumbai-andheri", name: "Andheri Health Center", cityId: "mumbai", address: "Lokhandwala, Andheri West, Mumbai" },
  // Delhi
  { id: "delhi-vasant", name: "Vasant Vihar Premium Clinic", cityId: "delhi", address: "Vasant Vihar, New Delhi" },
  { id: "delhi-cp", name: "Connaught Place Clinic", cityId: "delhi", address: "Radial Road, Connaught Place, New Delhi" }
];

const timeSlots = ["09:00 AM", "10:30 AM", "01:00 PM", "03:45 PM", "05:00 PM"];

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service: "",
    city: "",
    clinic: "",
    date: "",
    time: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: ""
  });
  
  const { services, loading: loadingServices, fetchServices } = useServices();

  useEffect(() => {
    fetchServices();
  }, []);

  const nextStep = () => setStep((s) => Math.min(s + 1, 6));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const updateForm = (key: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [key]: value };
      // Reset dependent fields if city changes
      if (key === "city") {
        updated.clinic = "";
      }
      return updated;
    });
  };

  const isStepValid = () => {
    if (step === 1) return !!formData.service;
    if (step === 2) return !!formData.city;
    if (step === 3) return !!formData.clinic;
    if (step === 4) return !!formData.date && !!formData.time;
    if (step === 5) return !!formData.firstName && !!formData.lastName && !!formData.email && !!formData.phone && !!formData.dob;
    return true;
  };

  const filteredClinics = clinics.filter(c => c.cityId === formData.city);

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
            <span>Service</span>
            <span>City</span>
            <span>Clinic</span>
            <span>Date & Time</span>
            <span>Details</span>
            <span>Confirm</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-card border border-border shadow-2xl rounded-[2.5rem] p-6 md:p-10 min-h-[500px] flex flex-col relative overflow-hidden">
          
          <AnimatePresence mode="wait">
            
            {/* Step 1: Service */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <h2 className="text-2xl font-serif mb-6">What can we help you with?</h2>
                <div className="space-y-4">
                  {loadingServices ? (
                    <div className="py-8 text-center text-muted-foreground">Loading services...</div>
                  ) : services.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">No services available.</div>
                  ) : (
                    services.map((service) => {
                      const Icon = IconMap[service.icon] || Video;
                      return (
                        <button
                          key={service._id}
                          onClick={() => updateForm('service', service._id)}
                          className={`w-full flex items-center p-6 rounded-2xl border-2 text-left transition-all ${
                            formData.service === service._id 
                              ? "border-primary bg-primary/5 shadow-md" 
                              : "border-border hover:border-primary/40 hover:bg-muted"
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-5 ${
                            formData.service === service._id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                          }`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">{service.name}</h3>
                            <p className="text-muted-foreground text-sm">{service.description}</p>
                          </div>
                          <div className="font-bold text-lg text-primary">₹{service.price}</div>
                        </button>
                      );
                    })
                  )}
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
                className="flex-1"
              >
                <h2 className="text-2xl font-serif mb-6">Choose a City</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {cities.map((city) => (
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
                  ))}
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
                className="flex-1"
              >
                <h2 className="text-2xl font-serif mb-6">Select a Clinic in {cities.find(c => c.id === formData.city)?.name}</h2>
                <div className="space-y-4">
                  {filteredClinics.map((clinic) => (
                    <button
                      key={clinic.id}
                      onClick={() => updateForm('clinic', clinic.id)}
                      className={`w-full flex items-center p-6 rounded-2xl border-2 text-left transition-all ${
                        formData.clinic === clinic.id 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-border hover:border-primary/40 hover:bg-muted"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 mr-5 ${
                        formData.clinic === clinic.id ? "bg-primary text-primary-foreground" : "bg-muted text-primary"
                      }`}>
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{clinic.name}</h3>
                        <p className="text-muted-foreground text-sm">{clinic.address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Date & Time */}
            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
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
                        {timeSlots.map((time) => (
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

            {/* Step 5: Details */}
            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <h2 className="text-2xl font-serif mb-6">Patient Details</h2>
                
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">First Name</label>
                      <input 
                        type="text" 
                        value={formData.firstName}
                        onChange={(e) => updateForm('firstName', e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                        placeholder="John" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Last Name</label>
                      <input 
                        type="text" 
                        value={formData.lastName}
                        onChange={(e) => updateForm('lastName', e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" 
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
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                        placeholder="john@example.com" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone Number</label>
                      <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => updateForm('phone', e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                        placeholder="(555) 123-4567" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date of Birth</label>
                    <input 
                      type="date" 
                      value={formData.dob}
                      onChange={(e) => updateForm('dob', e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    />
                    <p className="text-xs text-muted-foreground mt-1">You must be 18 or older to use this service.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 6: Review & Confirm */}
            {step === 6 && (
              <motion.div 
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-emerald-700" />
                  </div>
                  <h2 className="text-2xl font-serif">Review Your Appointment</h2>
                  <p className="text-muted-foreground text-sm mt-2">Almost there. Please review your details before confirming.</p>
                </div>
                
                <div className="bg-muted/30 rounded-2xl p-6 border border-border space-y-4 mb-8">
                  <div className="flex justify-between items-start pb-4 border-b border-border/50">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium mb-1">Service</p>
                      <p className="font-semibold text-lg">{services.find(s => s.id === formData.service)?.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground font-medium mb-1">Total</p>
                      <p className="font-bold text-xl text-primary">{services.find(s => s.id === formData.service)?.price}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Location</p>
                      <p className="font-semibold">{clinics.find(c => c.id === formData.clinic)?.name}</p>
                      <p className="text-xs text-muted-foreground">{cities.find(c => c.id === formData.city)?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">Date & Time</p>
                      <p className="font-semibold">{formData.date} at {formData.time}</p>
                    </div>
                    <div className="col-span-2 pt-2">
                      <p className="text-sm text-muted-foreground font-medium">Patient</p>
                      <p className="font-semibold">{formData.firstName} {formData.lastName}</p>
                      <p className="text-sm text-muted-foreground">{formData.email} • {formData.phone}</p>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
            
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-border flex justify-between items-center">
            {step > 1 ? (
              <Button variant="ghost" onClick={prevStep} className="rounded-full">
                <ChevronLeft className="w-4 h-4 mr-2" /> Back
              </Button>
            ) : (
              <div /> // Placeholder for flex alignment
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
              <Button className="rounded-full px-8 shadow-xl bg-emerald-600 hover:bg-emerald-700 text-white group">
                <CreditCard className="w-4 h-4 mr-2" /> Confirm & Pay
              </Button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
