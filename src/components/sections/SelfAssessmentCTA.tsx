"use client";

import { ArrowRight, BrainCircuit, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export function SelfAssessmentCTA() {
  return (
    <section className="py-24 lg:py-32 bg-background px-6 lg:px-12 relative">
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-[3rem] overflow-hidden shadow-[0_20px_60px_rgb(0,0,0,0.06)] border border-border/60 group min-h-[500px] flex items-center"
        >
          
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image 
              src="/images/cta_bg.png" 
              alt="Premium Clinic Interior" 
              fill 
              className="object-cover transform group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
          </div>

          {/* Frosted Glass Overlay */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-md z-10" />
          
          {/* Content */}
          <div className="relative z-20 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 px-8 py-16 sm:px-16 w-full">
            
            <div className="max-w-2xl text-center lg:text-left">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/80 text-primary mb-8 shadow-sm border border-white relative"
              >
                <BrainCircuit className="w-8 h-8 relative z-10" />
              </motion.div>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
                Discover your <br className="hidden sm:block"/>
                <span className="text-primary">
                  clinical path.
                </span>
              </h2>
              
              <p className="text-lg sm:text-xl text-foreground/80 font-medium leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                Spend 60 seconds with our AI-guided wellness quiz. We'll securely analyze your symptoms and instantly map out a personalized protocol combining diagnostics, therapy, and medical care.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm font-bold text-primary/70">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5" />
                  <span>HIPAA COMPLIANT</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>AI-POWERED</span>
                </div>
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative z-20 shrink-0 w-full lg:w-auto flex flex-col items-center"
            >
              {/* Glowing Orbs (Static for performance) */}
              <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-[80px] -z-10 pointer-events-none" />
              {/* Premium Button */}
              <button className="group relative w-full sm:w-auto inline-flex items-center justify-center px-10 py-6 text-lg font-bold text-white transition-all duration-300 ease-in-out bg-primary rounded-[2rem] hover:bg-primary/90 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(122,46,122,0.3)] overflow-hidden">
                <span className="relative z-10 flex items-center">
                  Start Evaluation 
                  <ArrowRight className="ml-3 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
              
              <p className="mt-6 text-sm font-bold text-foreground/60 text-center">
                Takes less than a minute. <br className="sm:hidden" /> No credit card required.
              </p>
            </motion.div>
            
          </div>
          
        </motion.div>
      </div>
    </section>
  );
}
