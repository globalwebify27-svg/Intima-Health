"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { TimerReset, BrainCircuit, Activity, ShieldCheck, HeartHandshake, Syringe, ArrowRight, CheckCircle2 } from "lucide-react";
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

const causes = [
  {
    icon: Activity,
    title: "Biological Factors",
    description: "Abnormal hormone levels, irregular levels of brain chemicals (neurotransmitters), or inherited traits can contribute to PE."
  },
  {
    icon: BrainCircuit,
    title: "Psychological Factors",
    description: "Early sexual experiences, sexual abuse, poor body image, depression, and significant stress can play a role."
  },
  {
    icon: HeartHandshake,
    title: "Relationship Dynamics",
    description: "Interpersonal issues or a lack of communication and intimacy between partners can exacerbate the condition."
  }
];

const treatments = [
  {
    icon: ShieldCheck,
    title: "Topical Anesthetics",
    description: "Desensitizing creams and sprays applied shortly before sex can significantly delay ejaculation without losing pleasure."
  },
  {
    icon: Syringe,
    title: "Oral Medications",
    description: "Certain SSRIs, utilized off-label, have been clinically proven to delay ejaculation effectively."
  },
  {
    icon: BrainCircuit,
    title: "Behavioral Techniques",
    description: "Start-stop techniques and the squeeze method, often guided by our sex therapists, to help you recognize and control sensations."
  }
];

export default function PEPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-32 overflow-hidden bg-muted/30">
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-indigo-500/5 -z-10 lg:rounded-bl-[120px]" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
            
            {/* Text Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="lg:w-1/2"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm mb-6 border border-indigo-200">
                <TimerReset className="w-4 h-4" />
                Premature Ejaculation
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.1] mb-6">
                Take control of <br className="hidden md:block"/> 
                <span className="text-primary italic">your performance.</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl">
                PE is the most common sexual dysfunction, affecting up to 1 in 3 men. We offer discreet, effective medical and behavioral treatments to help you build endurance safely.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/booking" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 text-base font-semibold shadow-xl group")}>
                  Speak with a Specialist
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
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
                <Image
                  src="/images/clinical_abstract.png"
                  alt="Clinical Abstract"
                  fill
                  className="object-cover"
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Understanding Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-6">Primary vs. Secondary PE</h2>
            <p className="text-muted-foreground text-lg">
              Understanding the root cause is the first step toward effective treatment.
            </p>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {causes.map((cause, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
                className="bg-muted/30 p-10 rounded-[2.5rem] border border-border hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-8">
                  <cause.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-serif font-medium mb-4">{cause.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {cause.description}
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
                  src="/images/product_kit_2.png"
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
              <h2 className="text-3xl md:text-5xl font-serif mb-6">Comprehensive <span className="text-primary italic">Solutions</span>.</h2>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                Whether you need a fast-acting topical solution or a long-term behavioral plan, our specialists will guide you toward lasting results.
              </p>
              
              <div className="space-y-8">
                {treatments.map((treatment, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-1">
                      <CheckCircle2 className="w-6 h-6 text-indigo-600" />
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
            <h2 className="text-4xl md:text-5xl font-serif mb-6">Stop guessing. Start treating.</h2>
            <p className="text-xl text-primary-foreground/80 mb-10">
              Get an accurate diagnosis and a customized treatment plan without leaving your house.
            </p>
            <Link href="/booking" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "rounded-full px-10 py-6 text-lg font-bold shadow-2xl hover:scale-105 transition-transform")}>
              Book a Confidential Visit
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
