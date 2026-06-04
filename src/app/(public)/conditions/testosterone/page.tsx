"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BatteryWarning, Dumbbell, Brain, BatteryCharging, FlaskConical, Dna, Syringe, ArrowRight, CheckCircle2 } from "lucide-react";
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

const symptoms = [
  {
    icon: BatteryWarning,
    title: "Chronic Fatigue",
    description: "Feeling constantly exhausted, lacking the energy to push through the day or hit the gym, despite getting enough sleep."
  },
  {
    icon: Dumbbell,
    title: "Muscle Loss",
    description: "Difficulty building or maintaining muscle mass, coupled with unexplained increases in body fat, particularly around the midsection."
  },
  {
    icon: Brain,
    title: "Brain Fog & Mood",
    description: "Experiencing a lack of focus, memory issues, irritability, or depressive symptoms that affect your daily quality of life."
  }
];

const treatments = [
  {
    icon: Syringe,
    title: "Testosterone Replacement Therapy",
    description: "Bioidentical TRT via injections or topical creams to restore your testosterone to optimal, healthy ranges."
  },
  {
    icon: Dna,
    title: "Enclomiphene Therapy",
    description: "An oral alternative to TRT that stimulates your body's natural production of testosterone while preserving fertility."
  },
  {
    icon: FlaskConical,
    title: "Peptide Therapy",
    description: "Cutting-edge therapies like Sermorelin to boost natural growth hormone production, aiding in recovery and vitality."
  }
];

export default function TestosteronePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-32 overflow-hidden bg-muted/30">
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-orange-500/5 -z-10 lg:rounded-bl-[120px]" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Text Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="lg:w-1/2"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm mb-6 border border-orange-200">
                <BatteryCharging className="w-4 h-4" />
                Hormone Optimization
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.1] mb-6">
                Optimize your hormones, <br className="hidden md:block"/> 
                <span className="text-primary italic">reclaim your drive.</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl">
                Low testosterone isn't just about libido—it affects your energy, mood, and physique. Get a comprehensive hormone panel and a customized optimization protocol.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/diagnostics" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 text-base font-semibold shadow-xl group")}>
                  Order a Hormone Panel
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
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500/10 via-transparent to-transparent" />
                <Image
                  src="/images/product_kit_1.png"
                  alt="Hormone Therapy"
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
            <h2 className="text-3xl md:text-5xl font-serif mb-6">Signs of Low Testosterone</h2>
            <p className="text-muted-foreground text-lg">
              Testosterone levels naturally decline with age, but environmental and lifestyle factors can accelerate this process.
            </p>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {symptoms.map((symptom, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
                className="bg-muted/30 p-10 rounded-[2.5rem] border border-border hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center mb-8">
                  <symptom.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-serif font-medium mb-4">{symptom.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {symptom.description}
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
                  src="/images/product_kit_3.png"
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
              <h2 className="text-3xl md:text-5xl font-serif mb-6">Advanced <span className="text-primary italic">Optimization</span>.</h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                After a comprehensive blood panel and a thorough medical review, our endocrinologists will prescribe a protocol that balances efficacy and long-term health.
              </p>
              
              <div className="space-y-8">
                {treatments.map((treatment, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-1">
                      <CheckCircle2 className="w-6 h-6 text-orange-600" />
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
            <h2 className="text-4xl md:text-5xl font-serif mb-6">Ready to feel like yourself again?</h2>
            <p className="text-xl text-primary-foreground/80 mb-10">
              The first step is understanding your baseline. Order an at-home hormone testing kit today.
            </p>
            <Link href="/diagnostics" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "rounded-full px-10 py-6 text-lg font-bold shadow-2xl hover:scale-105 transition-transform")}>
              Get Tested Today
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
