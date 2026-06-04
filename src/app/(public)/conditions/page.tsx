"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, Zap, HeartPulse, Beaker, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

const conditions = [
  {
    icon: Zap,
    title: "Erectile Dysfunction (ED)",
    description: "Difficulty achieving or maintaining an erection. We offer personalized, clinically proven treatment plans to help you regain confidence and intimacy.",
    treatments: ["PDE5 Inhibitors (Sildenafil, Tadalafil)", "Hormone Therapy", "Lifestyle & Dietary Protocols"],
    color: "bg-blue-50 text-blue-600",
    slug: "/conditions/ed"
  },
  {
    icon: Activity,
    title: "Premature Ejaculation (PE)",
    description: "Ejaculation that happens sooner than desired. Our specialists provide comprehensive behavioral and medical solutions to improve stamina.",
    treatments: ["Topical Anesthetics", "SSRIs", "Behavioral Therapy"],
    color: "bg-indigo-50 text-indigo-600",
    slug: "/conditions/pe"
  },
  {
    icon: HeartPulse,
    title: "Low Libido",
    description: "A persistent decrease in sexual desire. We take a holistic approach, analyzing hormonal, psychological, and lifestyle factors to reignite your drive.",
    treatments: ["Testosterone Replacement Therapy (TRT)", "Counseling", "Peptide Therapy"],
    color: "bg-rose-50 text-rose-600",
    slug: "/conditions/testosterone"
  },
  {
    icon: ShieldCheck,
    title: "STI Testing & Management",
    description: "Discreet, accurate, and fast testing for sexually transmitted infections from the comfort of your home, followed by expert medical guidance.",
    treatments: ["At-Home Test Kits", "Antibiotic Prescriptions", "Partner Notification Support"],
    color: "bg-emerald-50 text-emerald-600",
    slug: "/conditions/sti"
  },
  {
    icon: Beaker,
    title: "Fertility Support",
    description: "Navigating fertility challenges can be overwhelming. We provide advanced diagnostics and expert consultations to optimize your reproductive health.",
    treatments: ["Semen Analysis", "Hormonal Panels", "Nutritional Supplementation"],
    color: "bg-amber-50 text-amber-600",
    slug: "/conditions/fertility"
  },
  {
    icon: ShieldAlert,
    title: "Hormone Imbalance",
    description: "Fluctuating hormones can impact mood, energy, and sexual function. Our comprehensive blood panels identify deficiencies for targeted optimization.",
    treatments: ["Bioidentical Hormones", "Thyroid Management", "Adrenal Support"],
    color: "bg-purple-50 text-purple-600",
    slug: "/conditions/hormone-imbalance"
  }
];

export default function ConditionsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-32 overflow-hidden bg-muted/30">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -z-10 rounded-bl-[150px]" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary-foreground font-semibold text-sm mb-6 border border-secondary/20">
              <Activity className="w-4 h-4" />
              Conditions We Treat
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-medium leading-[1.1] mb-6">
              Expert care for every <br className="hidden md:block"/> 
              <span className="text-primary italic">part of you.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              We specialize in diagnosing and treating a wide spectrum of intimate health conditions with discretion, empathy, and scientific rigor.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="rounded-full px-8 text-base font-semibold shadow-xl">
                Take Self Assessment
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8 text-base font-semibold bg-transparent">
                Book a Consultation
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Conditions Grid Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
          >
            {conditions.map((condition, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
                className="group flex flex-col bg-card rounded-[2rem] border border-border overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-8 flex-1">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${condition.color}`}>
                    <condition.icon className="w-7 h-7" />
                  </div>
                  
                  <h3 className="text-2xl font-serif font-medium text-foreground mb-4">
                    {condition.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {condition.description}
                  </p>
                  
                  <div className="space-y-3 mb-8">
                    <p className="text-sm font-semibold uppercase tracking-wider text-primary">Treatment Options</p>
                    <ul className="space-y-2">
                      {condition.treatments.map((treatment, tIdx) => (
                        <li key={tIdx} className="flex items-start text-sm text-foreground/80 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-primary/70 mr-3 mt-0.5 flex-shrink-0" />
                          {treatment}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="p-6 bg-muted/30 border-t border-border mt-auto">
                  <Link href={condition.slug} className="flex items-center justify-between text-foreground font-semibold group-hover:text-primary transition-colors">
                    Learn more about {condition.title.split(' ')[0]}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/cta_bg.png')] opacity-10 mix-blend-overlay object-cover" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-serif mb-6">Don't see your condition listed?</h2>
            <p className="text-xl text-primary-foreground/80 mb-10 leading-relaxed">
              Every body is unique. Our specialists are experienced in a wide range of sexual and reproductive health issues. Speak with a doctor today to discuss your specific symptoms.
            </p>
            <Button size="lg" variant="secondary" className="rounded-full px-10 py-6 text-lg font-bold shadow-2xl hover:scale-105 transition-transform">
              Schedule a Video Consultation
            </Button>
          </motion.div>
        </div>
      </section>
      
    </div>
  );
}
