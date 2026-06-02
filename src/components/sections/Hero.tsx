"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Activity, HeartPulse, Shield, Zap, Brain, Stethoscope, Sparkles, Smile } from "lucide-react";
import { motion, Variants } from "framer-motion";

// Stagger container for the text elements
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

// Item animation for slide up
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-background pt-8 lg:pt-24 pb-16">
      {/* Static Magic Background Orbs for better scroll performance */}
      <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

      {/* Interactive Medical/Wellness SVGs */}
      <motion.div
        animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.3, rotate: 180, color: "var(--primary)" }}
        className="absolute top-[5%] left-[8%] text-primary/30 z-0 cursor-pointer hidden sm:block"
      >
        <Activity size={64} strokeWidth={1.5} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 25, 0], x: [0, -10, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        whileHover={{ scale: 1.3, rotate: -180, color: "var(--secondary)" }}
        className="absolute bottom-[20%] left-[50%] text-secondary/30 z-0 cursor-pointer hidden lg:block"
      >
        <HeartPulse size={80} strokeWidth={1.5} />
      </motion.div>
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        whileHover={{ scale: 1.4, rotate: 45, color: "var(--primary)" }}
        className="absolute top-[10%] left-[45%] text-primary/30 z-0 cursor-pointer hidden md:block"
      >
        <Shield size={48} strokeWidth={2} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 30, 0], rotate: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        whileHover={{ scale: 1.3, rotate: 90, color: "var(--secondary)" }}
        className="absolute top-[45%] right-[8%] text-secondary/30 z-0 cursor-pointer hidden sm:block"
      >
        <Zap size={56} strokeWidth={1.5} />
      </motion.div>
      <motion.div
        animate={{ y: [0, -30, 0], x: [0, 15, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        whileHover={{ scale: 1.3, rotate: -45, color: "var(--primary)" }}
        className="absolute bottom-[5%] left-[35%] text-primary/20 z-0 cursor-pointer hidden lg:block"
      >
        <Brain size={72} strokeWidth={1.5} />
      </motion.div>
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, 30, 0] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
        whileHover={{ scale: 1.4, rotate: 180, color: "var(--secondary)" }}
        className="absolute bottom-[25%] right-[12%] text-secondary/20 z-0 cursor-pointer hidden md:block"
      >
        <Stethoscope size={64} strokeWidth={1.5} />
      </motion.div>
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.5, color: "var(--primary)" }}
        className="absolute top-[5%] right-[25%] text-primary/40 z-0 cursor-pointer"
      >
        <Sparkles size={40} strokeWidth={2} />
      </motion.div>
      <motion.div
        animate={{ y: [0, -15, 0], rotate: [-10, 10, -10] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        whileHover={{ scale: 1.3, color: "var(--secondary)" }}
        className="absolute bottom-[10%] left-[15%] text-secondary/30 z-0 cursor-pointer hidden sm:block"
      >
        <Smile size={56} strokeWidth={1.5} />
      </motion.div>
      
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 z-10 max-w-3xl"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center rounded-full border border-border/50 bg-white/50 backdrop-blur-md px-4 py-1.5 text-sm font-semibold text-foreground shadow-sm mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse shadow-[0_0_8px_rgba(131,24,67,0.8)]"></span>
              India's #1 Premium Sexual Health Provider
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-[-0.04em] text-foreground leading-[1.05] mb-8">
              Clinical expertise for <br/>
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient">
                your most private life.
              </span>
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl font-medium leading-relaxed">
              Skip the awkward waiting rooms. Get confidential, physician-guided treatments for erectile dysfunction, premature ejaculation, and complete reproductive wellness—shipped directly to your door.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button size="lg" className="rounded-2xl px-8 py-7 text-base font-bold shadow-float hover:shadow-lg transition-all w-full sm:w-auto bg-primary hover:bg-primary/90 text-white border-none">
                  Book Appointment <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="rounded-2xl px-8 py-7 text-base font-bold w-full sm:w-auto shadow-sm border-border/60 hover:bg-muted/50 bg-white">
                  Take Self Assessment
                </Button>
              </motion.div>
            </motion.div>
            
            <motion.div variants={itemVariants} className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + (i * 0.1) }}
                    className="inline-block h-12 w-12 rounded-full border-2 border-background bg-muted overflow-hidden shadow-sm" 
                  />
                ))}
              </div>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="flex flex-col"
              >
                <div className="flex text-amber-500 mb-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.div key={star} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2 + (star * 0.1) }}>
                      <Star className="h-4 w-4 fill-current" />
                    </motion.div>
                  ))}
                </div>
                <span className="text-sm font-semibold text-foreground">Serving 50,000+ men across India</span>
              </motion.div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-5 relative"
          >
            {/* Main Image Card - Static by default, floats on hover */}
            <motion.div 
              whileHover={{ y: -15, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative aspect-[4/5] w-full max-w-md mx-auto lg:ml-auto cursor-pointer"
            >
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-primary/20 to-secondary/10 transform rotate-3 scale-105 transition-transform duration-700 ease-out blur-[2px]"></div>
              <div className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(122,46,122,0.15)] border border-border/50 bg-white">
                <Image
                  src="/images/hero_doctor.png"
                  alt="Expert Healthcare Professional"
                  fill
                  className="object-cover object-top"
                  priority
                />
              </div>
              
              {/* Glassmorphism Floating Badge - Still gently floats on its own */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -left-6 sm:-left-10 bottom-12 z-20"
              >
                <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-4 rounded-2xl shadow-card max-w-[240px]">
                  <div className="flex items-center gap-3 mb-2">
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)]"
                    />
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Available Now</p>
                  </div>
                  <p className="text-sm font-bold text-foreground leading-snug">Connect with a specialist in under 15 minutes.</p>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
