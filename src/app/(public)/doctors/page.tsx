"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { IDoctor } from "@/modules/doctors/types";
import { Star, Award, GraduationCap, Calendar, ArrowRight, ShieldCheck, Stethoscope } from "lucide-react";
import Link from "next/link";
import { BookNowButton } from "@/components/ui/book-now-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [clinics, setClinics] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedClinic, setSelectedClinic] = useState("");

  // Fetch clinics on mount
  useEffect(() => {
    fetch("/api/clinics")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setClinics(data.data);
        }
      })
      .catch(err => console.error("Failed to load clinics:", err));
  }, []);

  // Fetch doctors when filters change
  useEffect(() => {
    setLoading(true);
    let url = "/api/doctors?status=Active";
    if (selectedState) url += `&state=${encodeURIComponent(selectedState)}`;
    if (selectedCity) url += `&city=${encodeURIComponent(selectedCity)}`;
    if (selectedClinic) url += `&clinicId=${selectedClinic}`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setDoctors(data.data);
        }
      })
      .catch(err => console.error("Failed to load doctors:", err))
      .finally(() => setLoading(false));
  }, [selectedState, selectedCity, selectedClinic]);

  // Derived filter options
  const availableStates = Array.from(new Set(clinics.map(c => c.state).filter(Boolean))).sort();
  const availableCities = Array.from(new Set(clinics.filter(c => !selectedState || c.state === selectedState).map(c => c.city).filter(Boolean))).sort();
  const availableClinics = clinics.filter(c => 
    (!selectedState || c.state === selectedState) && 
    (!selectedCity || c.city === selectedCity)
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Reset dependent filters when parent changes
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
    setSelectedCity("");
    setSelectedClinic("");
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value);
    setSelectedClinic("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-10 lg:pt-28 lg:pb-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/doctors-header-bg.jpg"
            alt="Intima Health Clinic"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-md text-primary font-bold text-sm mb-6 shadow-sm border border-primary/30">
              <ShieldCheck className="w-4 h-4" />
              Board-Certified Specialists
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium leading-[1.1] mb-6 text-foreground">
              Meet your <br className="hidden md:block"/> 
              <span className="text-primary italic">clinical experts.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-foreground/80 mb-10 leading-relaxed max-w-2xl mx-auto font-medium">
              Our medical team comprises industry-leading urologists, sexologists, and therapists dedicated to elevating your intimate health with zero judgment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Doctors Grid Section */}
      <section className="pt-6 pb-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Filters */}
          <div className="mb-10 bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-foreground mb-2">State</label>
              <select 
                className="w-full h-11 rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                value={selectedState}
                onChange={handleStateChange}
              >
                <option value="">All States</option>
                {availableStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-foreground mb-2">City</label>
              <select 
                className="w-full h-11 rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                value={selectedCity}
                onChange={handleCityChange}
                disabled={availableCities.length === 0}
              >
                <option value="">All Cities</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            
            <div className="w-full md:w-1/3">
              <label className="block text-sm font-medium text-foreground mb-2">Clinic</label>
              <select 
                className="w-full h-11 rounded-xl border border-input bg-transparent px-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                value={selectedClinic}
                onChange={(e) => setSelectedClinic(e.target.value)}
                disabled={availableClinics.length === 0}
              >
                <option value="">All Clinics</option>
                {availableClinics.map(clinic => (
                  <option key={clinic._id} value={clinic._id}>{clinic.name}</option>
                ))}
              </select>
            </div>
          </div>

          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12"
          >
            {loading ? (
              <div className="col-span-full py-20 flex justify-center text-muted-foreground font-medium">Loading clinical experts...</div>
            ) : doctors.length === 0 ? (
              <div className="col-span-full py-20 flex justify-center text-muted-foreground font-medium">No active doctors found.</div>
            ) : doctors.map((doctor, idx) => (
              <motion.div 
                key={doctor._id || idx} 
                variants={fadeIn}
                className="bg-white rounded-[2.5rem] overflow-hidden border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(122,46,122,0.12)] hover:-translate-y-2 transition-all duration-500 group flex flex-col items-center text-center p-10 lg:p-12 relative"
              >
                
                {/* Decorative top blur */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
                
                <div className="relative w-40 h-40 rounded-full mb-8 shadow-xl ring-4 ring-white group-hover:scale-105 transition-transform duration-500 z-10 bg-slate-100 flex items-center justify-center overflow-hidden">
                  {doctor.avatar ? (
                    <Image 
                      src={doctor.avatar}
                      alt={doctor.name}
                      fill
                      sizes="160px"
                      className="object-cover rounded-full"
                    />
                  ) : (
                    <Stethoscope className="w-16 h-16 text-slate-300" />
                  )}
                </div>
                
                <div className="flex items-center justify-center gap-2 mb-4 bg-primary/5 px-4 py-1.5 rounded-full z-10">
                  <ShieldCheck className="w-4 h-4 text-primary" strokeWidth={2.5} />
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">Medical Board</span>
                </div>
                
                <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors z-10">{doctor.name}</h3>
                <p className="text-muted-foreground font-semibold mb-8 text-lg z-10">{doctor.specialization}</p>
                
                  <div className="flex flex-col gap-4 mt-auto w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 z-10 mb-4">
                    <div className="text-center text-sm font-medium text-foreground/80 leading-snug">
                      <Award className="w-4 h-4 mr-1.5 inline-block text-primary align-text-bottom" strokeWidth={2.5} />
                      <span>{doctor.qualifications?.join(", ") || "Certified Professional"}</span>
                    </div>
                    <div className="flex items-center justify-center text-sm font-medium text-foreground/80">
                      <span className="w-4 h-4 mr-2 flex items-center justify-center text-primary font-black text-lg">+</span>
                      {doctor.experience} Years Practice
                    </div>
                  </div>

                  <div className="w-full z-10 mt-auto">
                    <BookNowButton 
                      prefilledData={{
                        doctorId: doctor._id,
                        clinic: doctor.clinicId,
                        city: clinics.find(c => c._id === doctor.clinicId)?.city
                      }}
                      className="w-full h-12 rounded-full font-bold bg-primary hover:bg-primary/90 text-white transition-all shadow-md hover:shadow-lg"
                    >
                      Book Consultation
                    </BookNowButton>
                  </div>
                
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 bg-foreground text-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
          <Award className="w-12 h-12 mx-auto text-primary mb-8" />
          <h2 className="text-3xl md:text-5xl font-serif mb-8 leading-tight">
            "Our philosophy is simple: sexual health is health. We provide a judgment-free space where clinical excellence meets genuine empathy."
          </h2>
          <p className="text-xl text-primary font-medium tracking-wide">— The Intima Health Clinical Board</p>
        </div>
      </section>

    </div>
  );
}
