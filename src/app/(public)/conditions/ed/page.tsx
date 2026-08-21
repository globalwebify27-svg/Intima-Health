"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Zap, Activity, BrainCircuit, ShieldCheck, HeartPulse, Pill, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { BookNowButton } from "@/components/ui/book-now-button";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const causes = [
  {
    icon: Activity,
    title: "Physical Factors",
    description: "Conditions like hypertension, diabetes, and cardiovascular disease can restrict blood flow to the penis, making erections difficult."
  },
  {
    icon: BrainCircuit,
    title: "Psychological Factors",
    description: "Stress, anxiety, depression, and performance pressure can interfere with the brain's signals that trigger physical arousal."
  },
  {
    icon: HeartPulse,
    title: "Hormonal Factors",
    description: "Low testosterone levels can significantly reduce sex drive and impact the ability to achieve and maintain an erection."
  }
];

const treatments = [
  {
    icon: Pill,
    title: "PDE5 Inhibitors",
    description: "Clinically proven oral medications like Sildenafil (Viagra) and Tadalafil (Cialis) that improve blood flow to the penis."
  },
  {
    icon: ShieldCheck,
    title: "Hormone Optimization",
    description: "Targeted testosterone replacement therapy (TRT) if blood panels reveal clinically low hormone levels."
  },
  {
    icon: Activity,
    title: "Lifestyle Protocols",
    description: "Evidence-based guidance on diet, exercise, and sleep to improve overall vascular and metabolic health."
  }
];

export default function EDPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-32 overflow-hidden bg-muted/30">
        <div className="absolute top-0 left-0 w-full lg:w-1/2 h-full bg-blue-500/5 -z-10 lg:rounded-br-[120px]" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Text Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="lg:w-1/2"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-6 border border-blue-200">
                <Zap className="w-4 h-4" />
                Erectile Dysfunction
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.1] mb-6">
                Regain confidence <br className="hidden md:block"/> 
                <span className="text-primary italic">and intimacy.</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl">
                ED is common, highly treatable, and nothing to be ashamed of. Get personalized, clinically proven treatment plans from licensed specialists without the awkward waiting room.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <BookNowButton className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 text-base font-semibold shadow-xl group")}>
                  Book an ED Consultation
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </BookNowButton>
              </div>
            </motion.div>

            {/* Abstract Visual / Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 relative"
            >
              <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border border-border bg-white flex items-center justify-center p-8">
                <Image
                  src="/images/lifestyle_couple.png"
                  alt="Couple experiencing intimacy"
                  fill
                  className="object-cover"
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Understanding ED Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-6">Understanding the Root Cause</h2>
            <p className="text-muted-foreground text-lg">
              Erectile dysfunction is usually a symptom of an underlying issue. We treat the root cause, not just the symptom.
            </p>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {causes.map((cause, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
                className="bg-muted/30 p-10 rounded-[2.5rem] border border-border"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mb-8">
                  <cause.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-serif font-medium mb-4">{cause.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {cause.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Treatments Section */}
      <section className="py-24 bg-muted/50 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h2 className="text-3xl md:text-5xl font-serif mb-6">Personalized <span className="text-primary italic">Treatment Plans</span>.</h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                After a thorough video consultation, your specialist will prescribe a treatment plan tailored to your specific medical history and goals.
              </p>
              
              <div className="space-y-8">
                {treatments.map((treatment, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-1">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">{treatment.title}</h4>
                      <p className="text-muted-foreground">{treatment.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2 w-full"
            >
              <div className="relative aspect-square md:aspect-[4/3] rounded-[3rem] overflow-hidden bg-background border border-border shadow-2xl flex items-center justify-center p-8">
                <Image
                  src="/images/product_kit_1.png"
                  alt="Discreet Medication Packaging"
                  width={500}
                  height={500}
                  className="object-contain"
                />
              </div>
            </motion.div>
            
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-serif mb-6">Ready to take action?</h2>
            <p className="text-xl text-primary-foreground/80 mb-10">
              Speak with a licensed specialist today and get your treatment delivered discreetly.
            </p>
            <BookNowButton className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "rounded-full px-10 py-6 text-lg font-bold shadow-2xl hover:scale-105 transition-transform")}>
              Get Started Now
            </BookNowButton>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
