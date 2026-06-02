"use client";

import { ArrowRight, Activity, Heart, User, Users, ShieldAlert, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

const conditions = [
  {
    id: "sti",
    title: "STI Testing & Care",
    description: "Private at-home testing kits and rapid online treatment.",
    icon: ShieldAlert,
    href: "/conditions/sti"
  },
  {
    id: "libido",
    title: "Low Libido",
    description: "Personalized care plans for decreased sex drive.",
    icon: User,
    href: "/conditions/low-libido"
  },
  {
    id: "fertility",
    title: "Fertility Support",
    description: "Comprehensive assessments and reproductive care.",
    icon: Heart,
    href: "/conditions/fertility"
  }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 }
  }
};

export function Conditions() {
  return (
    <section className="py-24 lg:py-32 bg-primary/[0.02] relative overflow-hidden border-y border-border/40">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[150px] -z-10 pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8"
        >
          <div className="max-w-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-primary mb-6">
              Targeted therapies for complex concerns.
            </h2>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
              Whether you are looking to optimize your performance or overcome a clinical challenge, our specialized medical protocols are built exclusively for men's most sensitive health needs.
            </p>
          </div>
          <Link href="/conditions">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center text-primary font-bold hover:text-white transition-colors group bg-primary/10 hover:bg-primary px-6 py-3.5 rounded-full"
            >
              View all conditions <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </Link>
        </motion.div>
        
        {/* Bento Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {/* Featured Card 1: Erectile Dysfunction (Spans 2 columns) */}
          <motion.div variants={cardVariants} className="lg:col-span-2">
            <Link href="/conditions/ed" className="group block h-full">
              <div className="h-full rounded-[2rem] bg-white border border-transparent shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(122,46,122,0.08)] hover:-translate-y-2 hover:border-primary/20 transition-all duration-500 relative overflow-hidden flex flex-col md:flex-row">
                
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-primary/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />

                <div className="p-8 md:p-12 flex flex-col flex-1 relative z-10">
                  <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-8 text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-400">
                    <Activity className="h-7 w-7" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                    Erectile Dysfunction
                  </h3>
                  <p className="text-muted-foreground leading-relaxed font-medium mb-12 max-w-sm">
                    Clinically proven treatments for ED, prescribed online by licensed physicians and delivered directly to your door in discreet packaging.
                  </p>
                  <div className="flex items-center text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors mt-auto">
                    Explore ED Treatments 
                    <motion.div className="ml-2 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <ArrowRight className="h-3 w-3" strokeWidth={3} />
                    </motion.div>
                  </div>
                </div>

                <div className="relative w-full md:w-2/5 min-h-[250px] md:min-h-full overflow-hidden shrink-0">
                  <Image 
                    src="/images/lifestyle_couple.png" 
                    alt="Healthy intimate couple" 
                    fill 
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent md:bg-gradient-to-l md:from-transparent md:via-white/20 md:to-white"></div>
                </div>

              </div>
            </Link>
          </motion.div>

          {/* Featured Card 2: Premature Ejaculation */}
          <motion.div variants={cardVariants} className="lg:col-span-1">
            <Link href="/conditions/pe" className="group block h-full">
              <div className="h-full rounded-[2rem] bg-white border border-transparent shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(122,46,122,0.08)] hover:-translate-y-2 hover:border-primary/20 transition-all duration-500 relative overflow-hidden flex flex-col">
                
                <div className="relative w-full h-48 overflow-hidden shrink-0 bg-muted/20">
                  <Image 
                    src="/images/clinical_abstract.png" 
                    alt="Clinical Abstract" 
                    fill 
                    className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                </div>

                <div className="p-8 flex flex-col flex-1 relative z-10 bg-white">
                  <div className="h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mb-6 text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all duration-400 absolute -top-6 right-8 shadow-sm">
                    <Sparkles className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors mt-2">
                    Premature Ejaculation
                  </h3>
                  <p className="text-muted-foreground leading-relaxed font-medium mb-8">
                    Effective, science-backed solutions to help you last longer and improve sexual confidence.
                  </p>
                  <div className="flex items-center text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors mt-auto">
                    Learn More 
                    <motion.div className="ml-2 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                      <ArrowRight className="h-3 w-3" strokeWidth={3} />
                    </motion.div>
                  </div>
                </div>

              </div>
            </Link>
          </motion.div>

          {/* Regular Grid Cards */}
          {conditions.map((condition) => {
            const Icon = condition.icon;
            return (
              <motion.div key={condition.id} variants={cardVariants} className="h-full">
                <Link href={condition.href} className="group block h-full">
                  <div className="h-full rounded-[2rem] bg-white p-8 border border-transparent shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(122,46,122,0.08)] hover:-translate-y-2 hover:border-primary/20 transition-all duration-400 relative overflow-hidden flex flex-col">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-transparent to-primary/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-8 text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-400 relative z-10">
                      <Icon className="h-7 w-7" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors relative z-10">
                      {condition.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed font-medium mb-8 relative z-10 flex-grow">
                      {condition.description}
                    </p>
                    <div className="flex items-center text-sm font-bold text-muted-foreground group-hover:text-primary transition-colors mt-auto relative z-10">
                      Learn More 
                      <motion.div className="ml-2 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <ArrowRight className="h-3 w-3" strokeWidth={3} />
                      </motion.div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}

          {/* Wide Card: Couple Therapy */}
          <motion.div variants={cardVariants} className="lg:col-span-3">
            <Link href="/conditions/couple-therapy" className="group block h-full">
              <div className="h-full rounded-[2rem] bg-gradient-to-r from-primary to-secondary p-1 border border-transparent shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(122,46,122,0.2)] hover:-translate-y-2 transition-all duration-500 relative overflow-hidden flex flex-col">
                <div className="bg-white rounded-[1.9rem] p-8 md:p-12 w-full h-full flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                  
                  {/* Subtle abstract background element */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] transform translate-x-1/2 -translate-y-1/2"></div>
                  
                  <div className="flex items-center gap-6 z-10 relative">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-400 shrink-0">
                      <Users className="h-8 w-8" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        Couple Therapy & Coaching
                      </h3>
                      <p className="text-muted-foreground font-medium max-w-xl">
                        Expert, discreet counseling designed to enhance intimacy, overcome communication blocks, and rebuild relationship health.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm font-bold text-primary group-hover:text-primary/80 transition-colors z-10 shrink-0 bg-primary/5 px-6 py-4 rounded-2xl group-hover:bg-primary/10">
                    Book Consultation
                    <motion.div className="ml-3 h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center text-primary group-hover:text-white group-hover:bg-primary transition-colors">
                      <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                    </motion.div>
                  </div>
                  
                </div>
              </div>
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
