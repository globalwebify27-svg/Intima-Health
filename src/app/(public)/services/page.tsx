"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Video, 
  Pill, 
  ClipboardList, 
  HeartHandshake, 
  FlaskConical, 
  ArrowRight, 
  CheckCircle2,
  Stethoscope,
  Clock,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

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

const services = [
  {
    icon: Video,
    title: "Online Video Consultations",
    description: "Speak directly with board-certified urologists, gynecologists, and sexologists from the privacy of your home. No awkward waiting rooms.",
    features: ["15-minute express booking", "100% confidential", "Available 7 days a week"],
    color: "bg-chart-1"
  },
  {
    icon: ClipboardList,
    title: "Personalized Treatment Plans",
    description: "Receive a tailored protocol addressing ED, PE, low libido, or other intimate health concerns, designed specifically for your biology and lifestyle.",
    features: ["Physician-guided", "Holistic approach", "Ongoing progress tracking"],
    color: "bg-chart-2"
  },
  {
    icon: Pill,
    title: "Discreet Doorstep Pharmacy",
    description: "Get your prescribed medications, premium supplements, and wellness kits delivered directly to your door in unbranded, discreet packaging.",
    features: ["Free standard shipping", "Auto-refill available", "FDA-approved medications"],
    color: "bg-chart-4"
  },
  {
    icon: HeartHandshake,
    title: "Couples Therapy & Counseling",
    description: "Navigate intimacy challenges together. Our specialized therapists provide a safe, judgment-free space to rebuild connection and communication.",
    features: ["Joint or individual sessions", "Trauma-informed care", "Actionable exercises"],
    color: "bg-primary"
  },
  {
    icon: FlaskConical,
    title: "At-Home Diagnostic Testing",
    description: "Understand your body better with our comprehensive hormone and wellness test kits. Collect your sample at home and mail it to our certified labs.",
    features: ["Testosterone & hormone panels", "STI screening", "Detailed clinical reports"],
    color: "bg-secondary"
  }
];

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Complete Assessment",
    description: "Fill out a quick, secure medical intake form detailing your symptoms and medical history."
  },
  {
    number: "02",
    icon: Stethoscope,
    title: "Consult an Expert",
    description: "Connect with a specialized doctor via a secure video call or text-based consultation."
  },
  {
    number: "03",
    icon: Pill,
    title: "Receive Treatment",
    description: "Your personalized treatment plan and discreetly packaged medications are shipped to your door."
  }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Services Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-32 overflow-hidden bg-muted/30">
        <div className="absolute inset-0 bg-[url('/images/cta_bg.png')] opacity-5 mix-blend-multiply pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
              <ShieldCheck className="w-4 h-4" />
              Comprehensive Care
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-medium leading-[1.1] mb-6">
              Expert care for your most <br className="hidden md:block"/> 
              <span className="text-primary italic">private needs.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              From online consultations to doorstep medication delivery, we provide an end-to-end clinical ecosystem designed around your privacy and comfort.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-24 bg-background relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {services.map((service, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
                className={`relative bg-card rounded-3xl p-8 border border-border shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden ${idx === 0 || idx === 3 ? 'md:col-span-2 lg:col-span-2' : ''}`}
              >
                {/* Decorative background glow */}
                <div className={`absolute -right-20 -top-20 w-64 h-64 ${service.color} opacity-5 rounded-full blur-[60px] group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white shadow-lg ${service.color}`}>
                    <service.icon className="w-7 h-7" />
                  </div>
                  
                  <h3 className="text-2xl font-serif font-medium text-foreground mb-4 group-hover:text-primary transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed mb-8">
                    {service.description}
                  </p>
                  
                  <ul className="space-y-3">
                    {service.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start text-sm text-foreground/80 font-medium">
                        <CheckCircle2 className="w-5 h-5 text-primary/70 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-muted/50 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-serif text-foreground mb-6">Seamless, Discreet, Effective</h2>
            <p className="text-lg text-muted-foreground">
              We've simplified the process of getting clinical care so you can focus entirely on your wellness.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-12"
            >
              {steps.map((step, idx) => (
                <motion.div key={idx} variants={fadeIn} className="relative bg-background p-8 rounded-[2rem] border border-border text-center shadow-sm hover:-translate-y-2 transition-transform duration-300">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.number}
                  </div>
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 mt-4">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-3">{step.title}</h4>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Conditions We Treat Banner */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-foreground text-background rounded-[3rem] p-10 md:p-16 lg:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12 shadow-2xl">
            {/* Decorative BG */}
            <div className="absolute -right-20 -bottom-20 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="w-full lg:w-1/2 relative z-10">
              <h2 className="text-3xl md:text-5xl font-serif mb-6">Conditions We Treat</h2>
              <p className="text-lg text-background/80 mb-8 max-w-lg">
                Our specialists are equipped to diagnose and treat a wide range of sexual and reproductive health conditions for all genders.
              </p>
              <div className="flex flex-wrap gap-3">
                {['Erectile Dysfunction', 'Premature Ejaculation', 'Low Libido', 'STI Testing', 'Fertility Support', 'Hormone Imbalance'].map((condition, i) => (
                  <span key={i} className="px-4 py-2 rounded-full border border-background/20 bg-background/10 backdrop-blur-sm text-sm font-medium">
                    {condition}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 relative z-10 flex justify-center lg:justify-end">
              <Link href="/conditions" className="group flex items-center justify-between w-full max-w-sm bg-primary text-primary-foreground p-6 rounded-3xl hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-xl">
                <div>
                  <span className="block text-sm font-bold uppercase tracking-wider mb-1 opacity-80">Explore Catalog</span>
                  <span className="block text-2xl font-serif">View All Conditions</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-background/20 flex items-center justify-center group-hover:bg-background/30 transition-colors">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
