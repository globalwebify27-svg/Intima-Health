"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Activity, HeartPulse, Shield, Zap, Brain, Stethoscope, Sparkles, Smile, Video, Building2 } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { useBookingModal } from "@/store/useBookingModal";

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
  const { openBooking } = useBookingModal();
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
            <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-[-0.03em] text-foreground leading-[1.12] mb-5">
              Expert Mental Health &amp; Psychiatric Care at <br />
              <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient">
                KELKAR MANAS HEALTH CARE
              </span>
            </motion.h1>
            {/* 
            <motion.p variants={itemVariants} className="text-lg sm:text-xl font-bold text-primary mb-6 leading-snug">
              Expert Care for Mental Health, Emotional Well-being &amp; Addiction Recovery
            </motion.p> */}

            <motion.p variants={itemVariants} className="text-sm sm:text-lg text-muted-foreground mb-10 max-w-xl font-medium leading-relaxed">
              At KELKAR MANAS HEALTH CARE, we believe that mental health is an essential
              part of overall well-being. Our goal is to provide compassionate, confidential
              and professional care to individuals and families experiencing mental health
              challenges, emotional difficulties, addiction-related concerns and selected
              sexual health problems.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  onClick={() => openBooking({ appointmentType: "online" })}
                  className="rounded-2xl px-7 py-7 text-base font-bold shadow-float hover:shadow-xl transition-all w-full sm:w-auto bg-primary hover:bg-primary/90 text-white border-none flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <Video className="h-5 w-5 shrink-0 text-white/90 group-hover:scale-110 transition-transform" />
                  <span>Online Appointment</span>
                  <ArrowRight className="ml-1 h-5 w-5 shrink-0 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => openBooking({ appointmentType: "walk-in" })}
                  className="rounded-2xl px-7 py-7 text-base font-bold transition-all w-full sm:w-auto bg-card/90 hover:bg-primary/10 text-foreground border-2 border-primary/25 hover:border-primary shadow-sm hover:shadow-md flex items-center justify-center gap-2 group cursor-pointer backdrop-blur-sm"
                >
                  <Building2 className="h-5 w-5 shrink-0 text-primary group-hover:scale-110 transition-transform" />
                  <span>Walk-in(Physical) Appointment</span>
                  <ArrowRight className="ml-1 h-5 w-5 shrink-0 text-primary group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                {[
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
                  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
                  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop",
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                ].map((src, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + (i * 0.1) }}
                    className="inline-block h-12 w-12 rounded-full border-2 border-background bg-muted overflow-hidden shadow-sm"
                  >
                    <img src={src} alt="Happy patient" className="w-full h-full object-cover" />
                  </motion.div>
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
                <span className="text-sm font-semibold text-foreground">Trusted by 10,000+ patients across India</span>
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
              className="relative aspect-[4/5] w-full max-w-md mx-auto lg:ml-auto cursor-pointer isolate"
            >
              {/* Decorative block behind image matching About page style */}
              <div className="absolute -bottom-6 -right-6 w-2/3 h-2/3 bg-secondary/30 rounded-[2rem] z-0 pointer-events-none" />
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-primary/20 to-secondary/15 transform rotate-3 scale-105 transition-transform duration-700 ease-out blur-[2px] z-0 pointer-events-none" />

              <div className="absolute inset-0 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-background z-10 bg-gradient-to-t from-primary/20 via-primary/5 to-background">
                <div className="absolute inset-x-0 bottom-0 top-6">
                  <Image
                    src="/images/dr.kelkar-home.png"
                    alt="Dr. Deepak Kelkar - Expert Healthcare Specialist"
                    fill
                    className="object-contain object-bottom"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="absolute inset-0 bg-primary/10 mix-blend-color-burn pointer-events-none" />
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
