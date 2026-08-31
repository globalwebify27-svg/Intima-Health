"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { IDoctor } from "@/modules/doctors/types";
import { Star, Award, GraduationCap, Calendar, ArrowRight, ShieldCheck } from "lucide-react";
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

  useEffect(() => {
    fetch("/api/doctors?status=Active")
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setDoctors(data.data);
        }
      })
      .catch(err => console.error("Failed to load doctors:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-32 overflow-hidden bg-background">
        {/* Soft Background Gradient */}
        <div className="absolute top-0 inset-x-0 h-[600px] bg-gradient-to-b from-primary/5 via-primary/5 to-transparent -z-10" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
              <ShieldCheck className="w-4 h-4" />
              Board-Certified Specialists
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium leading-[1.1] mb-6">
              Meet your <br className="hidden md:block"/> 
              <span className="text-primary italic">clinical experts.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              Our medical team comprises industry-leading urologists, sexologists, and therapists dedicated to elevating your intimate health with zero judgment.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Doctors Grid Section */}
      <section className="py-12 pb-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12"
          >
            {loading ? (
              <div className="col-span-full py-20 flex justify-center text-muted-foreground font-medium">Loading clinical experts...</div>
            ) : doctors.length === 0 ? (
              <div className="col-span-full py-20 flex justify-center text-muted-foreground font-medium">No active doctors found.</div>
            ) : doctors.map((doctor, idx) => (
              <motion.div 
                key={doctor._id || idx}
                variants={fadeIn}
                className="group flex flex-col bg-card rounded-[2.5rem] border border-border shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                {/* Doctor Image */}
                <div className="relative w-full aspect-[4/5] bg-muted overflow-hidden flex items-center justify-center">
                  {doctor.avatar ? (
                    <Image
                      src={doctor.avatar}
                      alt={doctor.name}
                      fill
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="text-6xl font-serif text-primary/20">{doctor.name.charAt(0)}</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                  
                  {/* Floating Rating Badge */}
                  <div className="absolute bottom-6 left-6 bg-background/90 backdrop-blur-md px-4 py-2 rounded-full border border-border flex items-center gap-2 shadow-lg">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-sm">{doctor.rating || "5.0"}</span>
                    <span className="text-muted-foreground text-xs">({doctor.reviewsCount || "0"})</span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-8 flex-1 flex flex-col">
                  <div className="mb-6">
                    <h3 className="text-2xl font-serif font-medium text-foreground mb-1">{doctor.name}</h3>
                    <p className="text-primary font-semibold text-sm uppercase tracking-wider">{doctor.specialization}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(doctor.qualifications && doctor.qualifications.length > 0 ? doctor.qualifications : ["Medical Expert"]).slice(0, 3).map((spec, sIdx) => (
                      <span key={sIdx} className="px-3 py-1 bg-muted text-muted-foreground text-xs font-medium rounded-full">
                        {spec}
                      </span>
                    ))}
                  </div>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-1 line-clamp-4">
                    {doctor.bio || "Dedicated professional committed to providing exceptional care."}
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center text-sm text-foreground/80">
                      <Award className="w-4 h-4 mr-3 text-primary/70" />
                      {doctor.experience} Years Experience
                    </div>
                    <div className="flex items-center justify-between text-sm text-foreground/80">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-3 text-primary/70" />
                        <span className="text-emerald-600 font-medium">Check Availability</span>
                      </div>
                      {doctor.fees ? (
                        <div className="font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                          ₹{doctor.fees}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  
                  <BookNowButton className={cn(buttonVariants(), "w-full rounded-full py-6 text-base font-semibold group-hover:bg-primary/90 transition-colors")}>
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
