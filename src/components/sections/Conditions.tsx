"use client";

import { 
  ArrowRight, 
  Brain, 
  Heart, 
  ShieldAlert, 
  Sparkles, 
  Activity, 
  ShieldCheck, 
  Users, 
  Lock, 
  HeartHandshake, 
  Info 
} from "lucide-react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

const services = [
  {
    id: "psychiatric-consultation",
    title: "Psychiatric Consultation",
    description: "Professional assessment and treatment planning for a range of mental health concerns.",
    icon: Brain,
    href: "/treatments",
  },
  {
    id: "depression-treatment",
    title: "Depression Treatment",
    description: "Support for persistent sadness, loss of interest, low motivation and other symptoms associated with depression.",
    icon: Heart,
    href: "/treatments/treatment-of-depression",
  },
  {
    id: "anxiety-panic-treatment",
    title: "Anxiety & Panic Disorder Treatment",
    description: "Assessment and care for excessive worry, panic attacks, fear and anxiety-related difficulties.",
    icon: ShieldAlert,
    href: "/treatments/treatment-of-anxiety",
  },
  {
    id: "ocd-treatment",
    title: "OCD Treatment",
    description: "Professional support for obsessive thoughts, repetitive behaviours and related distress.",
    icon: Sparkles,
    href: "/treatments/treatment-of-ocd",
  },
  {
    id: "schizophrenia",
    title: "Schizophrenia & Other Psychiatric Conditions",
    description: "Assessment, treatment planning and ongoing care for serious mental health conditions.",
    icon: Activity,
    href: "/treatments/schizophrenia",
  },
  {
    id: "addiction-services",
    title: "Addiction & De-Addiction Services",
    description: "Support for people experiencing alcohol, nicotine and other substance-use problems, with treatment based on individual needs.",
    icon: ShieldCheck,
    href: "/treatments/treatment-of-alcohol-addiction",
  },
  {
    id: "child-adolescent-mental-health",
    title: "Child & Adolescent Mental Health",
    description: "Assessment and guidance for emotional, behavioural and developmental concerns in children and adolescents.",
    icon: Users,
    href: "/treatments/child-and-adolescent-psychiatry",
  },
  {
    id: "sexual-health-consultation",
    title: "Sexual Health Consultation",
    description: "Confidential, respectful assessment of selected sexual health concerns, including erectile difficulties, premature ejaculation and performance anxiety.",
    icon: Lock,
    href: "/sexual-problems",
  },
  {
    id: "counselling-psychotherapy",
    title: "Counselling & Psychotherapy",
    description: "Psychological support to help people manage emotional challenges, relationship difficulties, stress and behavioural concerns.",
    icon: HeartHandshake,
    href: "/treatments",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 90, damping: 18 },
  },
};

export function Conditions() {
  return (
    <section className="py-24 lg:py-32 bg-primary/[0.02] relative overflow-hidden border-b border-border/40">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8"
        >
          <div className="max-w-2xl">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary mb-3 block">
              Clinical Specializations
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              Our Mental Health &amp; <br />
              <span className="text-primary">Treatment Services</span>
            </h2>
          </div>

          <Link href="/treatments">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center text-primary font-bold hover:text-white transition-colors group bg-primary/10 hover:bg-primary px-6 py-3.5 rounded-full shadow-xs cursor-pointer"
            >
              <span>View all treatments</span>
              <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </Link>
        </motion.div>

        {/* 9 Services 3x3 Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div key={service.id} variants={cardVariants} className="h-full">
                <Link href={service.href} className="group block h-full">
                  <div className="h-full rounded-[2rem] bg-white p-8 sm:p-9 border border-border/60 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(122,46,122,0.08)] hover:-translate-y-1.5 hover:border-primary/25 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
                    
                    {/* Hover gradient highlight */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-primary/[0.04] opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

                    <div>
                      {/* Service Icon */}
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/25 transition-all duration-300">
                        <Icon className="h-7 w-7" strokeWidth={1.75} />
                      </div>

                      {/* Service Title */}
                      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors leading-snug">
                        {service.title}
                      </h3>

                      {/* Service Description */}
                      <p className="text-muted-foreground leading-relaxed font-medium text-sm sm:text-base mb-6">
                        {service.description}
                      </p>
                    </div>

                    {/* Learn More link */}
                    <div className="flex items-center text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors pt-4 border-t border-border/40">
                      <span>Learn More</span>
                      <motion.div className="ml-2 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Disclaimer Note */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 rounded-2xl bg-white p-5 border border-primary/15 shadow-xs max-w-3xl mx-auto flex items-center justify-center gap-3 text-center"
        >
          <Info className="w-4 h-4 text-primary shrink-0" />
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            The availability of specific services and treatment options should be confirmed directly with the hospital.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
