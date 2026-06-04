"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Video, CalendarCheck, FileBadge, ShieldCheck, Headphones, ArrowRight, Activity, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

const steps = [
  {
    icon: CalendarCheck,
    title: "1. Book Your Slot",
    description: "Choose a time that works for you. We offer express 15-minute consultations with board-certified specialists, available 7 days a week."
  },
  {
    icon: Video,
    title: "2. Connect Securely",
    description: "Join your private, encrypted video call directly from your smartphone or computer. No downloads or waiting rooms required."
  },
  {
    icon: FileBadge,
    title: "3. Get Your Treatment",
    description: "Receive a personalized treatment plan immediately. If medication is prescribed, it’s shipped discreetly to your door within 48 hours."
  }
];

export default function ConsultationsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-32 overflow-hidden bg-background">
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-primary/5 -z-10 lg:rounded-bl-[120px]" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Text Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="lg:w-1/2"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
                <Video className="w-4 h-4" />
                Telemedicine Services
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.1] mb-6">
                Expert Clinical Care, <br className="hidden md:block"/> 
                <span className="text-primary italic">From Anywhere.</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl">
                Skip the waiting room. Speak securely with a licensed sexologist or urologist from the comfort and privacy of your own home.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="rounded-full px-8 text-base font-semibold shadow-xl group">
                  Schedule a Consultation
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>

            {/* Abstract Visual / Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 relative"
            >
              <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border border-border bg-muted">
                <Image
                  src="/images/lifestyle_couple.png"
                  alt="Online Consultation"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                
                {/* Floating Badge */}
                <div className="absolute bottom-6 left-6 bg-background/95 backdrop-blur-md px-6 py-4 rounded-2xl border border-border shadow-lg flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">100% Secure</p>
                    <p className="text-sm text-muted-foreground">HIPAA Compliant Platform</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-6">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Getting expert medical advice shouldn't be complicated. Our streamlined platform gets you the care you need in 3 simple steps.
            </p>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
                className="bg-card p-10 rounded-[2.5rem] border border-border shadow-sm hover:shadow-xl transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-8">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif font-medium mb-4">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-10"
            >
              <h2 className="text-3xl md:text-4xl font-serif">Designed for your <span className="text-primary italic">privacy and comfort.</span></h2>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Camera-Optional</h4>
                    <p className="text-muted-foreground">We understand intimacy is sensitive. If permitted by your state's regulations, you can choose an audio-only consultation if you prefer not to be on video.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Express 15-Min Sessions</h4>
                    <p className="text-muted-foreground">Our doctors are focused, empathetic, and efficient. Get a diagnosis and treatment plan without disrupting your entire day.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">Comprehensive Follow-Ups</h4>
                    <p className="text-muted-foreground">Care doesn't end when the call does. You get continuous access to our medical team for dosage adjustments and progress check-ins.</p>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative aspect-square md:aspect-[4/5] bg-muted rounded-[3rem] overflow-hidden border border-border shadow-2xl"
            >
              <Image 
                src="/images/doctor_1.png"
                alt="Doctor Video Call"
                fill
                className="object-cover"
              />
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
            <h2 className="text-4xl md:text-5xl font-serif mb-6">Ready to take control of your health?</h2>
            <p className="text-xl text-primary-foreground/80 mb-10">Appointments available as early as today.</p>
            <Button size="lg" variant="secondary" className="rounded-full px-10 py-6 text-lg font-bold shadow-2xl hover:scale-105 transition-transform">
              Find Available Times
            </Button>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
