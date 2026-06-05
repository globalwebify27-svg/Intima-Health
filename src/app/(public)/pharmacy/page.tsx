"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Package, ShieldCheck, Truck, RefreshCcw, ArrowRight, CheckCircle2 } from "lucide-react";
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

const benefits = [
  {
    icon: Package,
    title: "100% Discreet Packaging",
    description: "Your privacy is paramount. All medications arrive in plain, unbranded boxes with no external indication of what's inside or where it came from."
  },
  {
    icon: ShieldCheck,
    title: "FDA-Approved Medications",
    description: "We only partner with highly regulated, certified US pharmacies. You get the exact same safe, effective medications you would at a local pharmacy."
  },
  {
    icon: Truck,
    title: "Fast, Free Shipping",
    description: "Standard shipping is always on us. Prescriptions are typically processed within 24 hours of doctor approval and delivered in 2-3 business days."
  },
  {
    icon: RefreshCcw,
    title: "Seamless Auto-Refills",
    description: "Never run out of your treatment. Set up flexible auto-refills that you can pause, modify, or cancel at any time with a single click."
  }
];

export default function PharmacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-32 overflow-hidden bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Text Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="lg:w-1/2"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
                <Package className="w-4 h-4" />
                Digital Pharmacy
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.1] mb-6">
                Your prescriptions, <br className="hidden md:block"/> 
                <span className="text-primary italic">delivered discreetly.</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl">
                Skip the pharmacy line and the awkward conversations. Get clinically proven treatments for your intimate health needs shipped directly to your door in plain packaging.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="rounded-full px-8 text-base font-semibold shadow-xl group">
                  Explore Treatments
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button variant="outline" size="lg" className="rounded-full px-8 text-base font-semibold bg-transparent">
                  Transfer Prescription
                </Button>
              </div>
              
              <div className="mt-8 flex items-center gap-6">
                <div className="flex items-center text-sm text-foreground/80 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2" /> No hidden fees
                </div>
                <div className="flex items-center text-sm text-foreground/80 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mr-2" /> Cancel anytime
                </div>
              </div>
            </motion.div>

            {/* Product Image */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 w-full"
            >
              <div className="relative w-full aspect-square md:aspect-[4/3] rounded-[3rem] overflow-hidden bg-background border border-border shadow-2xl flex items-center justify-center p-8">
                <div className="absolute inset-0 bg-primary/5" />
                <Image
                  src="/images/product_kit_1.png"
                  alt="Discreet Medication Packaging"
                  width={600}
                  height={600}
                  priority
                  className="object-contain relative z-10"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-24 bg-background border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-6">A pharmacy built around your privacy.</h2>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
          >
            {benefits.map((benefit, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
                className="flex gap-6 p-8 rounded-3xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-lg">
                  <benefit.icon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
    </div>
  );
}
