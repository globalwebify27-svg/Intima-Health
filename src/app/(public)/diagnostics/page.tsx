"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { TestTube2, ArrowRight, Home, FlaskConical, FileSearch, HeartPulse, Dna, Activity } from "lucide-react";
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

const process = [
  {
    icon: Home,
    title: "1. Order Your Kit",
    description: "Select the test you need. We’ll ship your discreet testing kit directly to your door within 2-3 business days."
  },
  {
    icon: TestTube2,
    title: "2. Collect Your Sample",
    description: "Follow the simple, step-by-step instructions provided to collect your sample (blood prick, saliva, or urine) in the privacy of your home."
  },
  {
    icon: FlaskConical,
    title: "3. Mail to Our Lab",
    description: "Use the prepaid shipping label to send your sample to our CLIA-certified partner laboratories for rapid processing."
  },
  {
    icon: FileSearch,
    title: "4. Review Your Results",
    description: "View your highly accurate results on our secure portal within 2-5 days, and discuss them with one of our specialists."
  }
];

const kits = [
  {
    icon: Activity,
    title: "Comprehensive Hormone Panel",
    description: "Measure testosterone, estradiol, SHBG, and thyroid markers to identify imbalances affecting libido, mood, and energy.",
    price: "₹4,999",
    color: "bg-purple-50 text-purple-600"
  },
  {
    icon: HeartPulse,
    title: "Complete STI Screening",
    description: "Confidential testing for Chlamydia, Gonorrhea, Syphilis, HIV, and Trichomoniasis. Fast, highly accurate results.",
    price: "₹2,999",
    color: "bg-rose-50 text-rose-600"
  },
  {
    icon: Dna,
    title: "Male Fertility Assessment",
    description: "Advanced semen analysis kit that measures sperm concentration, motility, and morphology to help you plan for the future.",
    price: "₹6,999",
    color: "bg-blue-50 text-blue-600"
  }
];

export default function DiagnosticsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-32 overflow-hidden bg-background">
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-secondary/10 -z-10 lg:rounded-bl-[120px]" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Text Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="lg:w-1/2"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary-foreground font-semibold text-sm mb-6 border border-secondary/30">
                <FlaskConical className="w-4 h-4" />
                At-Home Diagnostics
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.1] mb-6">
                Understand your body. <br className="hidden md:block"/> 
                <span className="text-primary italic">No waiting rooms.</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl">
                Take control of your health with clinical-grade, at-home testing kits. We use the same CLIA-certified labs as your local doctor's office.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="rounded-full px-8 text-base font-semibold shadow-xl group">
                  View Diagnostic Kits
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
              <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border border-border bg-white flex items-center justify-center p-8">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/10 via-background to-background" />
                <Image
                  src="/images/product_kit_2.png"
                  alt="Diagnostic Test Kit"
                  width={500}
                  height={500}
                  className="object-contain relative z-10"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-6">Lab testing, simplified.</h2>
            <p className="text-muted-foreground text-lg">
              Get clinical-level insights from the comfort of your couch.
            </p>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            {process.map((step, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
                className="bg-card p-8 rounded-3xl border border-border shadow-sm text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 text-secondary-foreground flex items-center justify-center mb-6 mx-auto">
                  <step.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-serif font-medium mb-3">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Kits Section */}
      <section className="py-24 bg-background border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-4">Available Testing Kits</h2>
            <p className="text-muted-foreground text-lg">HSA/FSA eligible. No insurance required.</p>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {kits.map((kit, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
                className="flex flex-col bg-card rounded-[2rem] border border-border overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="p-8 flex-1">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${kit.color}`}>
                    <kit.icon className="w-7 h-7" />
                  </div>
                  
                  <h3 className="text-2xl font-serif font-medium text-foreground mb-4">
                    {kit.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed mb-8">
                    {kit.description}
                  </p>
                  
                  <div className="mt-auto">
                    <span className="text-3xl font-bold text-foreground">{kit.price}</span>
                  </div>
                </div>
                
                <div className="p-6 bg-muted/30 border-t border-border">
                  <Button className="w-full rounded-xl py-6 text-base font-semibold group">
                    Order Kit
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

    </div>
  );
}
