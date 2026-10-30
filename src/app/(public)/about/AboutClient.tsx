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
  ArrowRight,
  MapPin,
  Building2,
  Calendar,
  CheckCircle2,
  GraduationCap
} from "lucide-react";
import Link from "next/link";
import React, { useState, useMemo } from "react";
import { IDoctor } from "@/modules/doctors/types";
import { BookNowButton } from "@/components/ui/book-now-button";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

interface ClinicItem {
  _id?: string;
  name: string;
  city?: string;
  state?: string;
}

interface ValueItem {
  icon: string;
  title: string;
  description: string;
}

interface AboutDataPayload {
  heroTitle1?: string;
  heroTitle2?: string;
  heroSubtitle?: string;
  valuesTitle?: string;
  valuesDescription?: string;
  values?: ValueItem[];
  expertsTitle?: string;
  expertsDescription?: string;
  aboutContent?: string;
  storyImage?: string;
}

interface AboutClientProps {
  initialAboutData: AboutDataPayload | null;
  initialClinics: ClinicItem[];
  initialDoctors: IDoctor[];
}

export default function AboutClient({ initialAboutData, initialClinics, initialDoctors }: AboutClientProps) {
  const clinics = initialClinics;
  const aboutData = initialAboutData;
  const [doctors, setDoctors] = useState<IDoctor[]>(initialDoctors);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedClinic, setSelectedClinic] = useState("");

  const isFilterActive = Boolean(selectedState || selectedCity || selectedClinic);

  const fetchFilteredDoctors = (stateVal: string, cityVal: string, clinicVal: string) => {
    if (!stateVal && !cityVal && !clinicVal) {
      setDoctors(initialDoctors);
      setDoctorsLoading(false);
      return;
    }

    setDoctorsLoading(true);
    let url = "/api/doctors?status=Active&showOnHomepage=true&limit=100";
    if (stateVal) url += `&state=${encodeURIComponent(stateVal)}`;
    if (cityVal) url += `&city=${encodeURIComponent(cityVal)}`;
    if (clinicVal) url += `&clinicId=${encodeURIComponent(clinicVal)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setDoctors(data.data);
        }
      })
      .catch((err) => console.error("Failed to load doctors:", err))
      .finally(() => setDoctorsLoading(false));
  };

  // Derived filter options
  const availableStates = Array.from(new Set(clinics.map((c) => c.state).filter(Boolean))).sort() as string[];
  const availableCities = Array.from(
    new Set(
      clinics
        .filter((c) => !selectedState || c.state === selectedState)
        .map((c) => (c.city || "").trim())
        .filter(Boolean)
    )
  ).sort() as string[];
  const availableClinics = clinics
    .filter(
      (c) =>
        (!selectedState || c.state === selectedState) &&
        (!selectedCity || (c.city || "").trim() === selectedCity)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  // Reset dependent filters when parent changes
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextState = e.target.value;
    setSelectedState(nextState);
    setSelectedCity("");
    setSelectedClinic("");
    fetchFilteredDoctors(nextState, "", "");
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextCity = e.target.value;
    setSelectedCity(nextCity);
    setSelectedClinic("");
    fetchFilteredDoctors(selectedState, nextCity, "");
  };

  const handleClinicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextClinic = e.target.value;
    setSelectedClinic(nextClinic);
    fetchFilteredDoctors(selectedState, selectedCity, nextClinic);
  };

  const handleResetFilters = () => {
    setSelectedState("");
    setSelectedCity("");
    setSelectedClinic("");
    setDoctors(initialDoctors);
  };

  // Priority sorting for doctors (Founders first, then all active staff doctors marked for About Us)
  const sortedDoctors = useMemo(() => {
    const DOCTOR_ORDER_KEYS = ["deepak", "amol", "radhika", "anuja", "mahajan", "vishwas"];
    const getDoctorRank = (name: string): number => {
      const lower = (name || "").toLowerCase();
      const idx = DOCTOR_ORDER_KEYS.findIndex((key) => lower.includes(key));
      return idx === -1 ? 99 : idx;
    };

    return [...doctors]
      .filter((doc) => doc.showOnHomepage !== false)
      .sort((a, b) => getDoctorRank(a.name) - getDoctorRank(b.name));
  }, [doctors]);

  const defaultData: AboutDataPayload & { values: ValueItem[]; aboutContent: string } = {
    heroTitle1: "Pioneering Psychiatric &",
    heroTitle2: "Holistic Mental Health Care.",
    heroSubtitle: "Founded by Dr. Deepak Kelkar, Dr. Kelkar Hospital & Sanmitra Hospital provide four decades of clinical excellence, de-addiction rehabilitation, and government cashless healthcare schemes across Maharashtra.",
    valuesTitle: "What Drives Us Forward",
    valuesDescription: "Everything we do at Kelkar Hospital is guided by four core principles that ensure every patient receives compassionate, dignified, evidence-based care.",
    values: [
      { icon: "Shield", title: "Clinical Excellence", description: "Backed by 44+ years of rigorous clinical experience, psychiatry qualifications, and cutting-edge evidence-based therapeutics." },
      { icon: "Heart", title: "Compassionate Empathy", description: "A patient-first, judgment-free clinical environment where mental and emotional healing is treated with warmth and dignity." },
      { icon: "Sparkles", title: "Holistic Rehabilitation", description: "Integrating medical psychiatry, psychotherapy, clinical hypnotherapy, and specialized de-addiction rehabilitation." },
      { icon: "Users", title: "Universal Healthcare", description: "Ensuring financial hardship never limits care through free PM-JAY and MJPJAY cashless government scheme treatments." }
    ],
    expertsTitle: "Meet Our Board-Certified Specialists",
    expertsDescription: "Our clinical protocols and therapeutic consultations are led by experienced psychiatrists, de-addiction experts, and clinical hypnotherapists.",
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
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden bg-gradient-to-b from-primary/[0.04] via-background to-background border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            
            {/* Left Narrative */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="w-full lg:w-7/12 text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-6 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>44+ Years of Clinical Psychiatric Care</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-foreground leading-[1.15] mb-6">
                {data.heroTitle1} <br />
                <span className="text-primary italic font-serif">{data.heroTitle2}</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl font-normal">
                {data.heroSubtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-10">
                <BookNowButton className="rounded-full shadow-lg hover:shadow-primary/25 transition-all text-base px-8 h-12 bg-primary text-white font-semibold inline-flex items-center justify-center">
                  Book Consultation
                </BookNowButton>
                <Link 
                  href="#doctors" 
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-6 h-12 text-sm font-medium hover:bg-muted transition-colors"
                >
                  Our Specialists <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>

              {/* Quick Trust Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border/70 max-w-xl">
                <div className="bg-card p-4 rounded-2xl border border-border/60 shadow-xs">
                  <div className="flex items-center gap-2 text-primary font-bold text-2xl sm:text-3xl">
                    <Calendar className="w-5 h-5 opacity-80" />
                    44+
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">Years of Service</div>
                </div>
                <div className="bg-card p-4 rounded-2xl border border-border/60 shadow-xs">
                  <div className="flex items-center gap-2 text-primary font-bold text-2xl sm:text-3xl">
                    <Building2 className="w-5 h-5 opacity-80" />
                    5
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">Hospital Centers</div>
                </div>
                <div className="bg-card p-4 rounded-2xl border border-border/60 shadow-xs">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-2xl sm:text-3xl">
                    <ShieldCheck className="w-5 h-5 opacity-80" />
                    100%
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium mt-1">Cashless Schemes</div>
                </div>
              </div>
            </motion.div>

            {/* Right Hospital Building Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="w-full lg:w-5/12 flex justify-center"
            >
              <div className="relative w-full max-w-md aspect-[4/3] sm:aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-background bg-muted">
                <Image
                  src={data.storyImage || "/images/kelkar_hospital.jpeg"}
                  alt="Kelkar Hospital Akola"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-white/40 shadow-xl">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Dr. Kelkar Hospital &amp; Sanmitra Hospital</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                        Akola &bull; Nagpur &bull; Thane &bull; Pune
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. HISTORY & CASHLESS SCHEMES EDITORIAL */}
      <section id="story" className="py-20 lg:py-28 bg-muted/20 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Scheme & Accreditation Cards */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-xs">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-4 border border-emerald-500/20">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Government Scheme Coverage
                </div>
                <h3 className="text-2xl font-serif font-bold text-foreground mb-3">
                  100% Free Treatment under PM-JAY &amp; MJPJAY
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  At Sanmitra Hospital (associated with Kelkar Hospital), eligible patients receive full psychiatric and healthcare treatment at zero out-of-pocket cost under Maharashtra and National healthcare schemes.
                </p>

                <div className="space-y-3 pt-4 border-t border-border">
                  {[
                    "Psychiatric consultations & medical diagnostic evaluations",
                    "Complete hospital stay, accommodation & nutritious meals",
                    "Prescription medications supplied during hospital admission",
                    "Advanced ECT (Electroconvulsive Therapy) where clinically indicated"
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground/80 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-primary/5 p-6 rounded-3xl border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-foreground">Have Questions Regarding Schemes?</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Contact our helpdesk for PM-JAY and MJPJAY verification.</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-primary/10 flex justify-end">
                  <Link href="/contact" className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1">
                    Contact Hospital Helpdesk &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Mission Narrative */}
            <div className="lg:col-span-7 bg-card p-8 sm:p-12 rounded-3xl border border-border shadow-xs">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
                Our History &amp; Mission
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-foreground mb-6">
                Four Decades of Clinical Psychiatric Leadership
              </h2>
              
              <div 
                className="prose prose-base sm:prose-lg max-w-none text-muted-foreground leading-relaxed font-normal space-y-4"
                dangerouslySetInnerHTML={{ __html: aboutContent }}
              />

              <div className="mt-8 pt-8 border-t border-border flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 overflow-hidden relative shrink-0 border border-primary/20">
                  <Image
                    src="/images/dr_kelkar_hero_nobg.png"
                    alt="Dr. Deepak Kelkar"
                    fill
                    className="object-cover object-top"
                  />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-foreground text-base">Dr. Deepak Kelkar</h4>
                  <p className="text-xs text-muted-foreground">Founder, MD (Psychiatry), DPM, DNB &bull; 43+ Years Clinical Experience</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. CORE GUIDING VALUES */}
      <section className="py-20 lg:py-28 bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary mb-3 block">
              Our Core Philosophy
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-foreground mb-4">
              {data.valuesTitle}
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              {data.valuesDescription}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {data.values.map((v, idx) => {
              const Icon = getIcon(v.icon);
              return (
                <div 
                  key={idx} 
                  className="p-8 rounded-3xl bg-card border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-xs">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-foreground mb-3">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. REDESIGNED DOCTOR SECTION WITH STUNNING DOCTOR CARDS */}
      <section id="doctors" className="py-20 lg:py-28 bg-muted/20 border-b border-border scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          
          {/* Header & Filter Controls */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-3">
                <Stethoscope className="w-3.5 h-3.5 text-primary" />
                Specialist Faculty
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-foreground mb-3">
                {data.expertsTitle}
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                {data.expertsDescription}
              </p>
            </div>

            {/* Filter Dropdowns Bar */}
            <div className="bg-card p-2 rounded-2xl border border-border/80 shadow-xs flex flex-wrap gap-2 items-center">
              <select
                value={selectedState}
                onChange={handleStateChange}
                className="h-10 px-3.5 text-sm rounded-xl border border-border/60 bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:outline-none cursor-pointer"
              >
                <option value="">All States</option>
                {availableStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>

              <select
                value={selectedCity}
                onChange={handleCityChange}
                className="h-10 px-3.5 text-sm rounded-xl border border-border/60 bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:outline-none cursor-pointer"
              >
                <option value="">All Cities</option>
                {availableCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <select
                value={selectedClinic}
                onChange={handleClinicChange}
                className="h-10 px-3.5 text-sm rounded-xl border border-border/60 bg-background text-foreground focus:ring-2 focus:ring-primary/20 focus:outline-none cursor-pointer"
              >
                <option value="">All Hospital Centers</option>
                {availableClinics.map(clinic => (
                  <option key={clinic._id} value={clinic._id}>{clinic.name}</option>
                ))}
              </select>

              {isFilterActive && (
                <button
                  onClick={handleResetFilters}
                  className="px-3 h-10 text-xs font-semibold text-primary hover:bg-primary/10 rounded-xl transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Doctors Grid */}
          {doctorsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-[460px] rounded-3xl bg-muted/40 animate-pulse border border-border" />
              ))}
            </div>
          ) : sortedDoctors.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-3xl border border-border p-8">
              <Stethoscope className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
              <h3 className="text-xl font-serif font-bold text-foreground mb-1">No Doctors Found</h3>
              <p className="text-sm text-muted-foreground mb-6">No specialists currently match the selected city or clinic location filters.</p>
              <button
                onClick={handleResetFilters}
                className="px-6 py-2.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Clear Location Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedDoctors.map((doctor) => {
                const isSpecialFounder = doctor.name?.toLowerCase().includes("deepak kelkar");
                const clinic = clinics.find(c => c._id?.toString() === doctor.clinicId?.toString());
                const cleanCity = clinic?.city?.trim() || "";

                return (
                  <div
                    key={doctor._id}
                    className="group flex flex-col rounded-[2rem] bg-card border border-border/80 overflow-hidden hover:shadow-2xl hover:border-primary/30 transition-all duration-300"
                  >
                    {/* 1. Doctor Portrait Container (Clean, dedicated framing - NO text covering face!) */}
                    <div className="relative aspect-[4/3] sm:aspect-[1.15/1] w-full overflow-hidden bg-gradient-to-b from-primary/10 via-slate-100/60 to-muted/40 border-b border-border/50">
                      {doctor.avatar ? (
                        <Image
                          src={doctor.avatar}
                          alt={doctor.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-contain object-bottom p-2 group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary/30">
                          <Stethoscope className="w-20 h-20" />
                        </div>
                      )}
                      
                      {/* Top Badges */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
                        {isSpecialFounder ? (
                          <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-md">
                            Founder &amp; Chief Psychiatrist
                          </span>
                        ) : (
                          <span className="bg-background/90 backdrop-blur-md text-foreground text-xs font-semibold px-3 py-1 rounded-full border border-border shadow-xs">
                            Senior Specialist
                          </span>
                        )}

                        {doctor.experience ? (
                          <span className="bg-white/95 backdrop-blur-md text-foreground text-xs font-bold px-2.5 py-1 rounded-full border border-border/80 shadow-xs flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-primary" />
                            {doctor.experience}+ Yrs
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* 2. Doctor Information Body (Clean, highly legible text hierarchy) */}
                    <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                      <div>
                        {/* Doctor Name */}
                        <h3 className="text-2xl font-serif font-bold text-foreground mb-1 leading-snug group-hover:text-primary transition-colors">
                          {doctor.name}
                        </h3>

                        {/* Specialization */}
                        <p className="text-xs sm:text-sm font-semibold text-primary mb-3 leading-snug">
                          {doctor.specialization || "Psychiatrist & Mental Health Specialist"}
                        </p>

                        {/* Qualifications Pills */}
                        {doctor.qualifications && doctor.qualifications.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
                            <GraduationCap className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            {doctor.qualifications.map((q, idx) => (
                              <span 
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-semibold text-foreground/80 border border-border/60"
                              >
                                {q}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Hospital / Clinic Branch Location */}
                        {clinic && (
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span>{clinic.name} {cleanCity ? `(${cleanCity})` : ""}</span>
                          </div>
                        )}

                        {/* Bio summary */}
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {doctor.bio || "Experienced specialist providing individualized clinical psychiatric care and patient consultation."}
                        </p>
                      </div>

                      {/* 3. Action Footer */}
                      <div className="pt-4 border-t border-border/70">
                        <BookNowButton 
                          prefilledData={{ 
                            doctorId: doctor._id,
                            clinic: doctor.clinicId,
                            city: cleanCity
                          }} 
                          className="w-full rounded-full py-3.5 text-sm font-semibold bg-primary text-white hover:bg-primary/95 transition-all shadow-md hover:shadow-lg inline-flex items-center justify-center gap-2 group/btn cursor-pointer"
                        >
                          Book Consultation
                          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
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

      {/* 5. BOTTOM CTA BANNER */}
      <section className="py-20 lg:py-24 bg-background text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
            <Heart className="w-7 h-7" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium tracking-tight text-foreground mb-4">
            Begin Your Wellness Journey Today
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg mb-8 leading-relaxed max-w-xl mx-auto">
            Our team of specialists is ready to provide confidential psychiatric consultation, counselling, and clinical guidance.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <BookNowButton className="rounded-full px-8 h-12 bg-primary text-white font-semibold shadow-lg hover:shadow-primary/25 transition-all inline-flex items-center justify-center">
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
