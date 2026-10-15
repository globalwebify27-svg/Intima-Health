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

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Doctors & Filters State - Exact implementation from Meet Experts page
  const [doctors, setDoctors] = useState<IDoctor[]>([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [clinics, setClinics] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedClinic, setSelectedClinic] = useState("");

  // Fetch about content
  useEffect(() => {
    fetch("/api/public/content/pages/about")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(json => {
        if (json && json.success && json.data && json.data.content) {
          try {
            setAboutData(JSON.parse(json.data.content));
          } catch (e) {
            console.error("Failed to parse about content JSON");
          }
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

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
    setDoctorsLoading(true);
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
      .finally(() => setDoctorsLoading(false));
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

  const defaultData = {
    heroTitle1: "Leading Psychiatric &",
    heroTitle2: "Mental Health Care.",
    heroSubtitle: "Founded by Dr. Deepak Kelkar, Dr. Kelkar Hospital in Akola & Nagpur provides pioneer psychiatric treatment, de-addiction rehabilitation, and the Happiness 20 – Mind Gym program.",
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
              className="w-full lg:w-1/2"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-12 bg-primary"></div>
                <span className="text-sm font-bold tracking-widest text-primary uppercase">About Kelkar Manas Hospital</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-foreground leading-[1.1] mb-6">
                {data.heroTitle1} <br/>
                <span className="text-primary italic">{data.heroTitle2}</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed border-l-2 border-primary/20 pl-6 max-w-lg">
                {data.heroSubtitle}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/treatments" className="group inline-flex items-center justify-center px-8 py-4 text-sm font-bold uppercase tracking-wider text-primary-foreground bg-foreground rounded-none hover:bg-primary transition-colors">
                  Explore Services
                  <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full lg:w-1/2 relative"
            >
              <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-background z-10 bg-gradient-to-t from-primary/20 via-primary/5 to-background">
                <Image
                  src="/images/dr_kelkar_hero_nobg.png"
                  alt="Dr. Deepak Kelkar"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-color-burn" />
              </div>
              {/* Decorative block behind image */}
              <div className="absolute -bottom-6 -right-6 w-2/3 h-2/3 bg-secondary/20 rounded-[2rem] -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="order-2 lg:order-1 relative rounded-[2rem] overflow-hidden aspect-video shadow-xl border border-border"
            >
              <Image
                src={data.storyImage || "/images/kelkar_hospital.jpeg"}
                alt="Kelkar Hospital Akola"
                fill
                className="object-cover"
               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
            </motion.div>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="order-1 lg:order-2"
            >
              {aboutContent ? (
                <div 
                  className="space-y-4 text-lg text-muted-foreground prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: aboutContent }}
                />
              ) : (
                <div className="space-y-4 text-lg text-muted-foreground animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Our Values</h2>
            <h3 className="text-3xl md:text-4xl font-serif text-foreground mb-4">{data.valuesTitle}</h3>
            <p className="text-lg text-muted-foreground">
              {data.valuesDescription}
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {data.values.map((value: any, idx: number) => {
              const IconComp = getIcon(value.icon);
              return (
                <motion.div 
                  key={idx}
                  variants={fadeIn}
                  className="bg-card p-8 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-semibold text-foreground mb-3">{value.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Meet the Experts */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">{data.expertsTitle}</h2>
            <p className="text-lg text-muted-foreground">
              {data.expertsDescription}
            </p>
          </motion.div>

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
            {doctorsLoading ? (
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
                      {doctor.experience || 0} Years Practice
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


      {/* Final CTA */}
      <section className="relative py-32 bg-muted/50 overflow-hidden">
        <div className="absolute inset-0 z-0 mix-blend-luminosity">
          <Image
            src="/images/cta_bg.png"
            alt="Background pattern"
            fill
            className="object-cover opacity-10"
           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6">
              Ready to prioritize your intimate health?
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              Discover our range of expertly formulated products designed for your unique needs.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
