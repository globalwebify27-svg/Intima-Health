"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Heart, 
  Shield, 
  Sparkles, 
  Users, 
  Award, 
  ShieldCheck, 
  Stethoscope,
  ArrowRight 
} from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { IDoctor } from "@/modules/doctors/types";
import { BookNowButton } from "@/components/ui/book-now-button";

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

const floatAnimation = {
  y: ["-10px", "10px", "-10px"],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

interface AboutClientProps {
  initialAboutData: any;
  initialClinics: any[];
  initialDoctors: IDoctor[];
}

export default function AboutClient({ initialAboutData, initialClinics, initialDoctors }: AboutClientProps) {
  const [aboutData] = useState<any>(initialAboutData);
  const [clinics] = useState<any[]>(initialClinics);
  const [doctors, setDoctors] = useState<IDoctor[]>(initialDoctors);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedClinic, setSelectedClinic] = useState("");

  // Fetch doctors when filters change
  useEffect(() => {
    const isDefault = !selectedState && !selectedCity && !selectedClinic;
    if (isDefault) {
      setDoctors(initialDoctors);
      setDoctorsLoading(false);
      return;
    }

    setDoctorsLoading(true);
    let url = "/api/doctors?status=Active&showOnHomepage=true&limit=100";
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
      .finally(() => setDoctorsLoading(false));
  }, [selectedState, selectedCity, selectedClinic, initialDoctors]);

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

  // Priority sorting for doctors (Founders first, then all active staff doctors marked for About Us)
  const DOCTOR_ORDER_KEYS = ["deepak", "amol", "radhika", "anuja", "mahajan", "vishwas"];
  const getDoctorRank = (name: string): number => {
    const lower = (name || "").toLowerCase();
    const idx = DOCTOR_ORDER_KEYS.findIndex(key => lower.includes(key));
    return idx === -1 ? 99 : idx;
  };

  const sortedDoctors = [...doctors]
    .filter(doc => doc.showOnHomepage !== false)
    .sort((a, b) => getDoctorRank(a.name) - getDoctorRank(b.name));

  const defaultData = {
    heroTitle1: "Leading Psychiatric &",
    heroTitle2: "Mental Health Care.",
    heroSubtitle: "Founded by Dr. Deepak Kelkar, Dr. Kelkar Hospital in Akola & Nagpur provides pioneer psychiatric treatment and de-addiction rehabilitation.",
    valuesTitle: "What Drives Us Forward",
    valuesDescription: "Everything we do at Kelkar Hospital is guided by four core principles that ensure we deliver the best possible care.",
    values: [
      { icon: "Shield", title: "Clinical Excellence", description: "Backed by rigorous research and leading medical professionals." },
      { icon: "Heart", title: "Compassionate Care", description: "Empathy and understanding at the heart of every interaction." },
      { icon: "Sparkles", title: "Innovation", description: "Continuously pushing boundaries in intimate health solutions." },
      { icon: "Users", title: "Inclusivity", description: "Accessible, judgment-free care designed for every body." }
    ],
    expertsTitle: "Meet Our Medical Experts",
    expertsDescription: "Our clinical protocols and treatments are developed by leading specialists in psychiatry, sexual medicine, and holistic rehabilitation.",
    aboutContent: "Kelkar Hospital, Akola, has been providing comprehensive treatment for all types of mental health and psychiatric disorders in Akola for the past 44 years.<br/><br/>The hospital is led by qualified and experienced psychiatrists, offering scientific and compassionate care for a wide range of mental health conditions.<br/><br/>Associated with Kelkar Hospital is Sanmitra Hospital, where treatment for various mental health conditions is provided free of cost to eligible patients under government health schemes.<br/><br/>Patients who come with the PM-JAY (Ayushman Bharat) Card or are eligible under the Mahatma Jyotiba Phule Jan Arogya Yojana (MJPJAY) can receive treatment free of cost, as per scheme eligibility and approved packages.<br/><br/>The covered services may include psychiatric consultation, medicines, hospitalization, food and accommodation, and ECT (electroconvulsive therapy/shock treatment), as applicable under the government scheme.<br/><br/>Our aim is to ensure that financial difficulties do not become a barrier to receiving appropriate and timely mental healthcare.",
    storyImage: "/images/kelkar_hospital.jpeg"
  };

  const data = {
    ...defaultData,
    ...(aboutData || {}),
    aboutContent: (aboutData?.aboutContent && aboutData.aboutContent.trim()) ? aboutData.aboutContent : defaultData.aboutContent,
    values: (aboutData?.values && aboutData.values.length > 0) ? aboutData.values : defaultData.values,
  };
  const aboutContent = data.aboutContent;

  const getIcon = (name: string) => {
    if (name === "Shield") return Shield;
    if (name === "Heart") return Heart;
    if (name === "Sparkles") return Sparkles;
    return Users;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Redesigned Clean Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden bg-background">
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-muted/40 -z-10 lg:rounded-bl-[120px]" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            
            {/* Left Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="w-full lg:w-1/2 text-left"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-6 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>About Kelkar Hospital</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
                {data.heroTitle1} <br />
                <span className="text-primary">{data.heroTitle2}</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl font-normal">
                {data.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <BookNowButton className="rounded-full shadow-lg hover:shadow-primary/25 transition-all text-base px-8 h-12 bg-primary text-white font-semibold inline-flex items-center justify-center">
                  Book Consultation
                </BookNowButton>
                <Link 
                  href="#story" 
                  className="inline-flex items-center justify-center rounded-full border border-border bg-background px-6 h-12 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Our Legacy
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div className="grid grid-cols-3 gap-6 pt-10 mt-10 border-t border-border/60 max-w-lg">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-foreground">44+</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">Years of Service</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-foreground">4</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">Healthcare Centers</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-foreground">100%</div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium mt-0.5">Cashless Schemes</div>
                </div>
              </div>
            </motion.div>

            {/* Right Visual Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-1/2 flex justify-center"
            >
              <div className="relative w-full max-w-lg aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-background">
                <Image
                  src={data.storyImage || "/images/kelkar_hospital.jpeg"}
                  alt="Kelkar Hospital Building"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-white/40 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Akola &amp; Nagpur Pioneer Centers</h4>
                      <p className="text-xs text-muted-foreground">Pioneers in advanced clinical psychiatry &amp; rehabilitation</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Main Narrative / Hospital Overview Section */}
      <section id="story" className="py-20 lg:py-28 bg-muted/20 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="bg-card rounded-[2.5rem] p-8 sm:p-12 lg:p-16 border border-border shadow-xs relative overflow-hidden">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
                Our History &amp; Mission
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-8">
                Four Decades of Dedicated Psychiatric &amp; Healthcare Care
              </h2>
              
              <div 
                className="prose prose-lg max-w-none text-muted-foreground leading-relaxed font-normal space-y-4"
                dangerouslySetInnerHTML={{ __html: aboutContent }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles / Values Section */}
      <section className="py-20 lg:py-28 bg-background border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary mb-3 block">
              Guiding Principles
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              {data.valuesTitle}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              {data.valuesDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.values.map((v: any, idx: number) => {
              const Icon = getIcon(v.icon);
              return (
                <div key={idx} className="p-8 rounded-3xl bg-muted/30 border border-border hover:border-primary/30 transition-all hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Medical Experts Section with Filters */}
      <section className="py-20 lg:py-28 bg-muted/20 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary mb-2 block">
                Our Specialists
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
                {data.expertsTitle}
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                {data.expertsDescription}
              </p>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedState}
                onChange={handleStateChange}
                className="h-10 px-3.5 py-1 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <option value="">All States</option>
                {availableStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>

              <select
                value={selectedCity}
                onChange={handleCityChange}
                className="h-10 px-3.5 py-1 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <option value="">All Cities</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <select
                value={selectedClinic}
                onChange={(e) => setSelectedClinic(e.target.value)}
                className="h-10 px-3.5 py-1 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:outline-none"
              >
                <option value="">All Clinics</option>
                {availableClinics.map(clinic => (
                  <option key={clinic._id} value={clinic._id}>{clinic.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Doctors Grid */}
          {doctorsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-96 rounded-3xl bg-muted/40 animate-pulse border border-border" />
              ))}
            </div>
          ) : sortedDoctors.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-3xl border border-border p-8">
              <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-foreground mb-1">No Doctors Found</h3>
              <p className="text-sm text-muted-foreground mb-4">No specialists match the selected location filters.</p>
              <button
                onClick={() => { setSelectedState(""); setSelectedCity(""); setSelectedClinic(""); }}
                className="text-sm text-primary font-semibold hover:underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedDoctors.map((doctor) => {
                const isSpecialFounder = doctor.name?.toLowerCase().includes("deepak kelkar");
                return (
                  <div
                    key={doctor._id}
                    className="group flex flex-col rounded-3xl bg-card border border-border overflow-hidden hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                  >
                    {/* Doctor Image Header */}
                    <div className="relative aspect-[4/3] w-full bg-muted/50 overflow-hidden">
                      <Image
                        src={doctor.avatar || "/images/doctor_1.png"}
                        alt={doctor.name}
                        fill
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {isSpecialFounder && (
                        <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-md">
                          Founder &amp; Chief Psychiatrist
                        </div>
                      )}

                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h3 className="text-xl font-bold leading-tight">{doctor.name}</h3>
                        <p className="text-xs text-white/80 font-medium">{doctor.specialization || "Psychiatrist"}</p>
                      </div>
                    </div>

                    {/* Doctor Body Details */}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        {doctor.experience && (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mb-3">
                            <Award className="w-4 h-4 text-primary" />
                            <span>{doctor.experience} Years of Clinical Practice</span>
                          </div>
                        )}

                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-6 font-normal">
                          {doctor.bio || "Experienced specialist providing individualized clinical care and psychiatric consultation."}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-border/60 flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Consultation Available
                        </span>
                        <BookNowButton prefilledData={{ doctorId: doctor._id }} className="rounded-full px-5 py-2 text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors inline-flex items-center justify-center">
                          Book Consultation
                        </BookNowButton>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-20 bg-background border-t border-border text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
            Begin Your Wellness Journey Today
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed">
            Our compassionate team of specialists is ready to guide you towards mental clarity, emotional health, and recovery.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <BookNowButton className="rounded-full px-8 h-12 bg-primary text-white font-semibold shadow-lg inline-flex items-center justify-center">
              Book Consultation
            </BookNowButton>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-border px-8 h-12 text-sm font-semibold hover:bg-muted transition-colors"
            >
              Contact Hospital
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
