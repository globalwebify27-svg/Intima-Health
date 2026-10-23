"use client";

import { motion } from "framer-motion";
import { 
  HeartHandshake, 
  Activity, 
  ShieldCheck, 
  ClipboardList, 
  Stethoscope, 
  Clock, 
  FlaskConical, 
  ShieldAlert, 
  Pill, 
  Zap, 
  HeartPulse, 
  Heart, 
  Beaker, 
  ArrowRight, 
  CheckCircle2 
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { useBookingModal } from "@/store/useBookingModal";
import { MENTAL_HEALTH_TREATMENTS, SEXUAL_HEALTH_PROBLEMS } from "../treatments/page";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};

export default function SexualProblemsPage() {
  const [activeTab, setActiveTab] = useState<"sexual-problems" | "mental-health">("sexual-problems");
  const { openBooking } = useBookingModal();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Header */}
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden bg-muted/30 border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-4xl">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary-foreground font-semibold text-sm mb-6 border border-secondary/20">
              <Activity className="w-4 h-4" />
              KELKAR MANAS HEALTH CARE
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.15] mb-6">
              Sexual Health & <br className="hidden sm:inline" />
              <span className="text-primary italic">Relationship Counselling</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              Confidential, scientific clinical consultations, diagnostic guidance, and psychological support for men, women, and couples in a safe and judgment-free environment.
            </p>

            {/* Separate Tabs for Sexual Problems and Mental Health */}
            <div className="inline-flex p-1.5 rounded-full bg-background border border-border shadow-sm max-w-full overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("sexual-problems")}
                className={cn(
                  "px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap",
                  activeTab === "sexual-problems"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                Sexual Problems ({SEXUAL_HEALTH_PROBLEMS.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("mental-health")}
                className={cn(
                  "px-6 sm:px-8 py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap",
                  activeTab === "mental-health"
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                Mental Health Treatments ({MENTAL_HEALTH_TREATMENTS.length})
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Tabbed Content */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {activeTab === "sexual-problems" && (
            <div>
              <div className="max-w-3xl mb-12">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Department of Psychosexual Medicine</span>
                <h2 className="text-3xl md:text-4xl font-serif mt-2 mb-4">Sexual Health Topics</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Confidential medical evaluations, evidence-based treatments, and therapy for intimacy, performance, and relationship concerns.
                </p>
              </div>

              <motion.div
                key="sexual-problems-grid"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {SEXUAL_HEALTH_PROBLEMS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <motion.div
                      key={item.title}
                      variants={fadeIn}
                      className="bg-card rounded-3xl p-8 border border-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                    >
                      <div>
                        <div className="flex items-center gap-4 mb-6">
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-sm", item.color)}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <span className="text-xs font-semibold text-muted-foreground">Topic {idx + 1}</span>
                            <h3 className="text-xl font-serif font-medium leading-snug">{item.title}</h3>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                          {item.description}
                        </p>

                        <div className="space-y-2.5 mb-8">
                          <span className="text-xs font-bold uppercase tracking-wider text-primary">Key Modalities</span>
                          {item.features.map((feature, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border/50">
                        <Link
                          href={`/sexual-problems/${item.slug}`}
                          className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full rounded-full group font-semibold text-sm justify-between")}
                        >
                          <span>Learn More</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          )}

          {activeTab === "mental-health" && (
            <div>
              <div className="max-w-3xl mb-12">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Department of Psychiatry & Psychology</span>
                <h2 className="text-3xl md:text-4xl font-serif mt-2 mb-4">Mental Health Treatments</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Evidence-based psychiatric assessments, medical management, psychotherapy, and de-addiction programs tailored to individual clinical requirements.
                </p>
              </div>

              <motion.div
                key="mental-health-grid"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {MENTAL_HEALTH_TREATMENTS.map((item, idx) => {
                  const Icon = item.icon;
                  const targetHref = item.customHref || `/treatments/${item.slug}`;
                  return (
                    <motion.div
                      key={item.title}
                      variants={fadeIn}
                      className="bg-card rounded-3xl p-8 border border-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
                    >
                      <div>
                        <div className="flex items-center gap-4 mb-6">
                          <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-sm", item.color)}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <span className="text-xs font-semibold text-muted-foreground">Topic {idx + 1}</span>
                            <h3 className="text-xl font-serif font-medium leading-snug">{item.title}</h3>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                          {item.description}
                        </p>

                        <div className="space-y-2.5 mb-8">
                          {item.features.map((feature, fIdx) => (
                            <div key={fIdx} className="flex items-center gap-2 text-xs font-medium text-foreground/90">
                              <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border/50">
                        <Link
                          href={targetHref}
                          className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full rounded-full group font-semibold text-sm justify-between")}
                        >
                          <span>Learn More</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* Booking CTA Section */}
      <section className="py-20 bg-muted/40 border-t border-border/50">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">Confidential Consultations</h2>
          <p className="text-muted-foreground mb-8 text-base">
            Every concern is addressed with privacy and professional clinical care. Contact KELKAR MANAS HEALTH CARE to speak with a specialist.
          </p>
          <button
            type="button"
            onClick={() => openBooking()}
            className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 font-semibold shadow-lg")}
          >
            Book a Consultation
          </button>
        </div>
      </section>
    </div>
  );
}
