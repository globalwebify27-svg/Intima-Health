"use client";

import { motion } from "framer-motion";
import { Microscope, FileText, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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

const studies = [
  {
    title: "Efficacy of Daily Tadalafil in Enhancing Spontaneous Intimacy",
    phase: "Completed Clinical Study",
    date: "March 2025",
    summary: "A randomized, double-blind study evaluating the psychological and physiological benefits of 5mg daily Tadalafil versus on-demand usage over a 12-month period.",
    link: "#"
  },
  {
    title: "Lidocaine-Prilocaine Aerosol for Premature Ejaculation",
    phase: "Phase IV Analysis",
    date: "November 2024",
    summary: "Assessing the long-term desensitizing efficacy and partner satisfaction rates using topical anesthetics in a cohort of 500 males.",
    link: "#"
  },
  {
    title: "Testosterone Optimization Therapy in Men Over 40",
    phase: "Ongoing Registry",
    date: "Ongoing",
    summary: "A continuous data registry monitoring the safety profile, cardiovascular markers, and quality of life improvements in men undergoing TRT.",
    link: "#"
  }
];

export default function ResearchPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 bg-muted/30 overflow-hidden border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
              <Microscope className="w-8 h-8" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium mb-6">
              Research <span className="text-primary italic">Library</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Every protocol and treatment at Intima Health is grounded in rigorous clinical research. Explore our open-access registry of studies and findings.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Studies List */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12 border-b border-border pb-6 flex items-center justify-between">
              <h2 className="text-2xl font-serif font-medium">Recent Clinical Publications</h2>
              <span className="text-sm font-semibold text-primary px-3 py-1 bg-primary/10 rounded-full">3 Open Studies</span>
            </div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="space-y-8"
            >
              {studies.map((study, idx) => (
                <motion.div 
                  key={idx}
                  variants={fadeIn}
                  className="group flex flex-col md:flex-row gap-6 p-8 rounded-3xl bg-card border border-border hover:shadow-lg transition-all duration-300"
                >
                  <div className="shrink-0 pt-1">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="text-xs font-bold uppercase tracking-widest text-primary">{study.phase}</span>
                      <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted rounded-md">{study.date}</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-serif font-medium mb-3 group-hover:text-primary transition-colors">
                      {study.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {study.summary}
                    </p>
                    <Link href={study.link} className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                      View Full Paper <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Medical Board Banner */}
      <section className="py-20 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-serif mb-6">Backed by our Medical Advisory Board</h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Our clinical protocols are continually reviewed and updated by a board of independent urologists, endocrinologists, and sex therapists to ensure we provide the highest standard of care.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80"><CheckCircle2 className="w-5 h-5 text-emerald-600" /> Peer-Reviewed</div>
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80"><CheckCircle2 className="w-5 h-5 text-emerald-600" /> Evidence-Based</div>
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground/80"><CheckCircle2 className="w-5 h-5 text-emerald-600" /> Continually Updated</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
