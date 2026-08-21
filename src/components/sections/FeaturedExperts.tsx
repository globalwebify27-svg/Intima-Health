"use client";

import { ArrowRight, Award, ShieldCheck, Microscope, Stethoscope, Dna } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

const experts = [
  {
    id: "expert-1",
    name: "Dr. Deepak Kelkar",
    specialty: "Senior Psychiatrist & Founder",
    credentials: "MD Psychiatry, Mind Gym Pioneer",
    experience: "35+ Years Practice",
    image: "/images/doctor_1.png"
  },
  {
    id: "expert-2",
    name: "Dr. Amol Kelkar",
    specialty: "Consultant Psychiatrist",
    credentials: "MD Psychiatry, De-Addiction Specialist",
    experience: "12+ Years Practice",
    image: "/images/doctor_2.png"
  },
  {
    id: "expert-3",
    name: "Dr. Radhika Kelkar",
    specialty: "Child & Adolescent Psychiatrist",
    credentials: "DPM, Fellowship in Child Psychiatry",
    experience: "10+ Years Practice",
    image: "/images/doctor_3.png"
  }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 20 }
  }
};

export function FeaturedExperts() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-primary/[0.02]">
      
      {/* Floating Medical SVGs in Background */}
      <motion.div
        animate={{ y: [0, -30, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 text-primary/5 pointer-events-none z-0 hidden lg:block"
      >
        <Microscope className="w-64 h-64" />
      </motion.div>
      
      <motion.div
        animate={{ y: [0, 40, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 right-10 text-primary/5 pointer-events-none z-0 hidden lg:block"
      >
        <Stethoscope className="w-72 h-72" />
      </motion.div>
      
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary/5 pointer-events-none z-0"
      >
        <Dna className="w-96 h-96" />
      </motion.div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
            Care led by <span className="text-primary">industry authorities.</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed">
            We don't rely on generic practitioners. Intima Health is built on the expertise of leading specialists who focus exclusively on reproductive and sexual wellness.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12"
        >
          {experts.map((expert) => (
            <motion.div 
              key={expert.id} 
              variants={cardVariants}
              className="bg-white rounded-[2.5rem] overflow-hidden border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(122,46,122,0.12)] hover:-translate-y-2 transition-all duration-500 group flex flex-col items-center text-center p-10 lg:p-12 relative"
            >
              
              {/* Decorative top blur */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/[0.03] to-transparent pointer-events-none" />
              
              <div className="relative w-40 h-40 rounded-full mb-8 shadow-xl ring-4 ring-white group-hover:scale-105 transition-transform duration-500 z-10">
                <Image 
                  src={expert.image}
                  alt={expert.name}
                  fill
                  sizes="160px"
                  className="object-cover rounded-full"
                />
              </div>
              
              <div className="flex items-center justify-center gap-2 mb-4 bg-primary/5 px-4 py-1.5 rounded-full z-10">
                <ShieldCheck className="w-4 h-4 text-primary" strokeWidth={2.5} />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Medical Board</span>
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors z-10">{expert.name}</h3>
              <p className="text-muted-foreground font-semibold mb-8 text-lg z-10">{expert.specialty}</p>
              
              <div className="flex flex-col gap-4 mb-10 w-full bg-slate-50 border border-slate-100 rounded-3xl p-5 z-10">
                <div className="flex items-center justify-center text-sm font-medium text-foreground/80">
                  <Award className="w-4 h-4 mr-2 text-primary" strokeWidth={2.5} />
                  {expert.credentials}
                </div>
                <div className="flex items-center justify-center text-sm font-medium text-foreground/80">
                  <span className="w-4 h-4 mr-2 flex items-center justify-center text-primary font-black text-lg">+</span>
                  {expert.experience}
                </div>
              </div>
              
              <Button className="w-full rounded-2xl py-7 font-bold mt-auto hover:bg-primary hover:text-white transition-all text-lg shadow-sm hover:shadow-lg z-10" variant="outline">
                Schedule a Visit
              </Button>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="mt-20 text-center">
          <Button variant="ghost" className="text-primary font-bold text-lg group hover:bg-primary/5 rounded-full px-8 py-6">
            See the full clinical team <ArrowRight className="ml-3 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}
