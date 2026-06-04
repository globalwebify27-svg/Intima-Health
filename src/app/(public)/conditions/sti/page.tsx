"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShieldAlert, FileSearch, Pill, Stethoscope, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

const conditionsTested = [
  {
    title: "Chlamydia & Gonorrhea",
    description: "Often asymptomatic, these common bacterial infections can lead to serious long-term health issues if left untreated. Easily cured with targeted antibiotics."
  },
  {
    title: "Syphilis",
    description: "A highly contagious bacterial infection that progresses through stages. Early detection via a simple blood test allows for rapid, effective treatment."
  },
  {
    title: "HIV",
    description: "Early detection is critical. With modern medicine, HIV is highly manageable, allowing those affected to live long, healthy lives without transmitting the virus."
  }
];

const treatments = [
  {
    icon: FileSearch,
    title: "At-Home Test Kits",
    description: "Discreetly shipped to your door. Collect a simple urine or blood-prick sample and mail it to our CLIA-certified labs."
  },
  {
    icon: Pill,
    title: "Rapid Prescriptions",
    description: "If your results are positive, our doctors can immediately prescribe antibiotics and have them shipped overnight in unbranded packaging."
  },
  {
    icon: Stethoscope,
    title: "Expert Guidance",
    description: "Consult with infectious disease specialists who can walk you through your diagnosis and advise on partner notification safely."
  }
];

export default function STIPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-32 overflow-hidden bg-muted/30">
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-emerald-500/5 -z-10 lg:rounded-bl-[120px]" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Text Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="lg:w-1/2"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-sm mb-6 border border-emerald-200">
                <ShieldAlert className="w-4 h-4" />
                STI Management
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.1] mb-6">
                Fast, private testing <br className="hidden md:block"/> 
                <span className="text-primary italic">and treatment.</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl">
                Sexual health shouldn't be stressful. Get tested and treated for common STIs from the comfort of your home, completely judgment-free.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/diagnostics" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 text-base font-semibold shadow-xl group")}>
                  Order an STI Test Kit
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link href="/booking" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-8 text-base font-semibold bg-transparent")}>
                  Consult a Specialist
                </Link>
              </div>
            </motion.div>

            {/* Abstract Visual / Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 relative w-full"
            >
              <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border border-border bg-white flex items-center justify-center p-8">
                <div className="absolute inset-0 bg-emerald-500/5" />
                <Image
                  src="/images/product_kit_2.png"
                  alt="At Home STI Testing"
                  width={500}
                  height={500}
                  className="object-contain relative z-10"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Understanding Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-6">What We Test For</h2>
            <p className="text-muted-foreground text-lg">
              Our comprehensive panel covers the most common STIs. Knowing your status is the most responsible action you can take for yourself and your partners.
            </p>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {conditionsTested.map((condition, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
                className="bg-muted/30 p-10 rounded-[2.5rem] border border-border hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-8">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-serif font-medium mb-4">{condition.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {condition.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Treatments Section */}
      <section className="py-24 bg-muted/50 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2 w-full"
            >
              <div className="relative aspect-square md:aspect-[4/3] rounded-[3rem] overflow-hidden bg-background border border-border shadow-2xl flex items-center justify-center p-8">
                <Image
                  src="/images/product_kit_1.png"
                  alt="Medical Treatment"
                  width={400}
                  height={400}
                  className="object-contain"
                />
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h2 className="text-3xl md:text-5xl font-serif mb-6">Private <span className="text-primary italic">Resolution</span>.</h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                If your lab results come back positive, we move fast to get you the treatment you need, without ever requiring an in-person clinic visit.
              </p>
              
              <div className="space-y-8">
                {treatments.map((treatment, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-1">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold mb-2">{treatment.title}</h4>
                      <p className="text-muted-foreground">{treatment.description}</p>
                    </div>
                  </div>
                ))}
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
            <h2 className="text-4xl md:text-5xl font-serif mb-6">Peace of mind is just a click away.</h2>
            <p className="text-xl text-primary-foreground/80 mb-10">
              Get comprehensive STI testing sent directly to your door in discreet packaging.
            </p>
            <Link href="/diagnostics" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "rounded-full px-10 py-6 text-lg font-bold shadow-2xl hover:scale-105 transition-transform")}>
              Order a Test Kit
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
