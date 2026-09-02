"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { HeartHandshake, BrainCircuit, Users, Sparkles, ArrowRight, CalendarHeart } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
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

const focusAreas = [
  {
    icon: BrainCircuit,
    title: "Performance Anxiety",
    description: "Learn cognitive behavioral techniques to manage stress and anxiety that interfere with intimacy, helping you stay present and relaxed."
  },
  {
    icon: Users,
    title: "Couples Counseling",
    description: "Improve communication, navigate mismatched libidos, and rebuild emotional and physical connection with your partner in a safe, mediated environment."
  },
  {
    icon: Sparkles,
    title: "Reclaiming Desire",
    description: "Explore the psychological, relational, and emotional factors contributing to low libido, and develop actionable strategies to reignite your drive."
  }
];

export default function TherapyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-32 overflow-hidden bg-background">
        {/* Soft Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 -z-10" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-600 font-semibold text-sm mb-6 border border-rose-200">
              <HeartHandshake className="w-4 h-4" />
              Clinical Sex Therapy
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-medium leading-[1.1] mb-6">
              Rebuild connection <br className="hidden md:block"/> 
              <span className="text-primary italic">and intimacy.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              Sexual health is deeply connected to mental and emotional well-being. Our certified therapists provide a judgment-free space to explore and overcome psychological barriers to intimacy.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" className="rounded-full px-8 text-base font-semibold shadow-xl group">
                Book a Therapy Session
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Focus Areas Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-serif mb-6">What We Treat</h2>
            <p className="text-muted-foreground text-lg">
              Therapy is not one-size-fits-all. Our specialists tailor their approach to your specific relationship dynamics and personal goals.
            </p>
          </div>
          
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {focusAreas.map((area, idx) => (
              <motion.div 
                key={idx}
                variants={fadeIn}
                className="bg-card p-10 rounded-[2.5rem] border border-border shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <area.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif font-medium mb-4">{area.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {area.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Meet the Therapist / Philosophy */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
            
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <h2 className="text-3xl md:text-5xl font-serif mb-6">A safe, <span className="text-primary italic">trauma-informed</span> approach.</h2>
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Discussing intimacy can be daunting. Our therapists are trained to handle sensitive topics with the utmost care, utilizing evidence-based frameworks like Cognitive Behavioral Therapy (CBT) and Emotionally Focused Therapy (EFT).
              </p>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                Whether you're attending solo or with a partner, our goal is to empower you with the tools to foster a fulfilling and healthy sexual life.
              </p>
              
              <ul className="space-y-4 mb-10">
                <li className="flex items-center text-foreground font-medium">
                  <div className="w-2 h-2 rounded-full bg-primary mr-4" /> 30-minute comprehensive sessions
                </li>
                <li className="flex items-center text-foreground font-medium">
                  <div className="w-2 h-2 rounded-full bg-primary mr-4" /> Secure, high-definition video platform
                </li>
                <li className="flex items-center text-foreground font-medium">
                  <div className="w-2 h-2 rounded-full bg-primary mr-4" /> Flexible scheduling including evenings & weekends
                </li>
              </ul>
              
              <Link href="/doctors" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-8 text-base font-semibold")}>
                Meet Our Therapists
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="lg:w-1/2 w-full"
            >
              <div className="relative aspect-square md:aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl border border-border">
                <Image
                  src="/images/clinical_abstract.png"
                  alt="Therapy Session Abstract"
                  fill
                  className="object-cover"
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
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
            <CalendarHeart className="w-16 h-16 mx-auto mb-8 opacity-90" />
            <h2 className="text-4xl md:text-5xl font-serif mb-6">Take the first step toward better intimacy.</h2>
            <p className="text-xl text-primary-foreground/80 mb-10">
              Start your journey with a confidential initial assessment.
            </p>
            <Button size="lg" variant="secondary" className="rounded-full px-10 py-6 text-lg font-bold shadow-2xl hover:scale-105 transition-transform">
              Book Your Initial Assessment
            </Button>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
