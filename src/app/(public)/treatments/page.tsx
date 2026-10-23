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

export const MENTAL_HEALTH_TREATMENTS = [
  {
    title: "Treatment of Depression",
    slug: "treatment-of-depression",
    description: "Clinical diagnostic care, evidence-based psychotherapy, and personalized medical management to restore emotional balance.",
    features: ["Clinical Assessment", "Individualized Care", "Relapse Prevention"],
    icon: HeartHandshake,
    color: "bg-teal-600 text-white"
  },
  {
    title: "Mania (Bipolar Disorder)",
    slug: "mania",
    description: "Specialized clinical stabilization and long-term mood regulation for elevated mood, hyperactivity, and bipolar disorder.",
    features: ["Mood Stabilization", "Clinical Assessment", "Maintenance Planning"],
    icon: Activity,
    color: "bg-blue-600 text-white"
  },
  {
    title: "Treatment of Anxiety",
    slug: "treatment-of-anxiety",
    description: "Targeted therapy and evidence-based care plans for generalized anxiety, excessive worry, and persistent tension.",
    features: ["Cognitive Restructuring", "Stress Management", "Pharmacotherapy Options"],
    icon: ShieldCheck,
    color: "bg-indigo-600 text-white"
  },
  {
    title: "Treatment of OCD (Obsessive-Compulsive Disorder)",
    slug: "treatment-of-ocd",
    description: "Specialized ERP (Exposure & Response Prevention) therapy and clinical psychiatric management for obsessive thoughts and compulsions.",
    features: ["ERP Protocols", "Behavioral Therapy", "Long-term Maintenance"],
    icon: ClipboardList,
    color: "bg-purple-600 text-white"
  },
  {
    title: "Treatment of Phobia",
    slug: "treatment-of-phobia",
    description: "Overcome irrational, debilitating fears and avoidance behaviors through structured desensitization and targeted therapy.",
    features: ["Exposure Therapy", "Cognitive Restructuring", "Anxiety Reduction"],
    icon: ShieldCheck,
    color: "bg-cyan-600 text-white"
  },
  {
    title: "Treatment of Panic Attacks",
    slug: "treatment-of-panic-attacks",
    description: "Effective medical and cognitive interventions to manage sudden intense panic episodes and distressing physical symptoms.",
    features: ["Symptom Management", "Emergency Coping Strategies", "Therapeutic Support"],
    icon: Activity,
    color: "bg-rose-600 text-white"
  },
  {
    title: "Treatment of Hysteria",
    slug: "treatment-of-hysteria",
    description: "Compassionate therapeutic interventions for conversion disorders, somatic symptoms, and severe emotional dysregulation.",
    features: ["Psychotherapy", "Emotional Stabilization", "Supportive Care"],
    icon: HeartHandshake,
    color: "bg-teal-600 text-white"
  },
  {
    title: "Child & Adolescent Psychiatry",
    slug: "child-and-adolescent-psychiatry",
    description: "Comprehensive developmental and behavioral care for children and teens facing ADHD, autism, or emotional stress.",
    features: ["ADHD & Autism Support", "Behavioral Guidance", "Parental Guidance"],
    icon: Stethoscope,
    color: "bg-amber-600 text-white"
  },
  {
    title: "Geriatric Psychiatry",
    slug: "geriatric-psychiatry",
    description: "Compassionate mental healthcare and memory care tailored for senior citizens, dementia, and late-life depression.",
    features: ["Memory Assessment", "Dementia Care", "Family Support"],
    icon: Clock,
    color: "bg-emerald-600 text-white"
  },
  {
    title: "Schizophrenia Treatment",
    slug: "schizophrenia",
    description: "Comprehensive psychiatric care and family counseling to manage altered perceptions, thoughts, and behaviors.",
    features: ["Antipsychotic Management", "Rehabilitation Support", "Family Counseling"],
    icon: Activity,
    color: "bg-violet-600 text-white"
  },
  {
    title: "Irritable Bowel Syndrome (IBS)",
    slug: "ibs",
    description: "Gut-brain interaction therapies and medical support to alleviate recurring abdominal distress and anxiety-linked bowel habits.",
    features: ["Gut-Brain Care", "Stress Reduction", "Lifestyle Guidance"],
    icon: Activity,
    color: "bg-sky-600 text-white"
  },
  {
    title: "Cognitive Behavioural Therapy",
    slug: "cognitive-behavioural-therapy",
    description: "Structured, time-tested psychotherapy to identify and reframe negative thoughts and unhealthy behavioral patterns.",
    features: ["Thought Restructuring", "Behavioral Activation", "Practical Coping Skills"],
    icon: ClipboardList,
    color: "bg-indigo-600 text-white"
  },
  {
    title: "Treatment of Alcohol Addiction",
    slug: "treatment-of-alcohol-addiction",
    description: "Medically supervised detoxification, inpatient rehabilitation at Ashakiran Centre & Sanmitra Hospital, and relapse prevention.",
    features: ["Inpatient Rehabilitation", "Ashakiran & Sanmitra Centres", "Ayushman Card Eligible"],
    icon: FlaskConical,
    color: "bg-orange-600 text-white"
  },
  {
    title: "Nicotine De-Addiction",
    slug: "nicotine-de-addiction",
    description: "Structured cessation programs, craving management, and behavioral counseling to overcome smoking and tobacco dependence.",
    features: ["Craving Control Protocols", "Nicotine Replacement Advice", "Habit Cessation"],
    icon: ShieldAlert,
    color: "bg-red-600 text-white"
  },
  {
    title: "Brown Sugar De-Addiction",
    slug: "brown-sugar-de-addiction",
    description: "Dedicated residential and medical rehabilitation for severe opioid and brown sugar dependence.",
    features: ["Supervised Medical Detox", "Residential Care", "Relapse Aftercare"],
    icon: Pill,
    color: "bg-slate-700 text-white"
  },
  {
    title: "Treatment Available for Sexual Health Problems",
    slug: "sexual-health-problems",
    description: "Confidential evaluation and clinical care for intimacy, psychosexual, and reproductive health concerns.",
    features: ["Confidential Consultations", "Personalized Plans", "Couples Guidance"],
    icon: HeartHandshake,
    color: "bg-pink-600 text-white",
    customHref: "/sexual-problems"
  }
];

export const SEXUAL_HEALTH_PROBLEMS = [
  {
    title: "Premature Ejaculation",
    slug: "premature-ejaculation",
    description: "Clinical and psychological treatment protocols to improve endurance, control, and sexual confidence.",
    features: ["Medical Therapy", "Behavioral Exercises", "Sensitivity Control"],
    icon: Activity,
    color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400"
  },
  {
    title: "Erectile Dysfunction",
    slug: "erectile-dysfunction",
    description: "Advanced medical evaluation and personalized treatment plans for physical vascular and psychosexual causes.",
    features: ["Pharmacotherapy", "Vascular Assessment", "Psychological Counseling"],
    icon: Zap,
    color: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
  },
  {
    title: "Performance Anxiety",
    slug: "sexual-performance-anxiety",
    description: "Holistic psychosexual counseling to overcome performance pressure, nervousness, and intimacy fears.",
    features: ["Intimacy Counseling", "CBT Techniques", "Confidence Building"],
    icon: HeartPulse,
    color: "bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400"
  },
  {
    title: "STIs (Sexually Transmitted Infections)",
    slug: "sexually-transmitted-infections",
    description: "Confidential screening, rapid diagnosis, and evidence-based antibiotic or antiviral treatments.",
    features: ["Diagnostic Testing", "Medical Treatment", "Prevention Counseling"],
    icon: ShieldAlert,
    color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400"
  },
  {
    title: "Precum Concerns",
    slug: "precum",
    description: "Medical reassurance, counseling, and guidance to understand physiological pre-ejaculatory fluid and resolve anxiety.",
    features: ["Medical Evaluation", "Psychoeducation", "Anxiety Reassurance"],
    icon: Beaker,
    color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400"
  },
  {
    title: "Nocturnal Emissions",
    slug: "nocturnal-emissions",
    description: "Clinical reassurance, scientific myth clarification, and counseling for nightfall and associated emotional distress.",
    features: ["Psychoeducation", "Lifestyle Counseling", "Anxiety Reduction"],
    icon: Heart,
    color: "bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400"
  },
  {
    title: "Masturbation Habit",
    slug: "masturbation-habit",
    description: "Confidential behavioral guidance, scientific myth-busting, and counseling for guilt or compulsive habits.",
    features: ["Behavioral Therapy", "Psychoeducation", "Guilt Alleviation"],
    icon: ShieldCheck,
    color: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
  },
  {
    title: "Infertility",
    slug: "infertility",
    description: "Comprehensive diagnostic testing, semen analysis, and supportive medical treatments for couples.",
    features: ["Medical Testing", "Fertility Counseling", "Specialist Referral"],
    icon: Activity,
    color: "bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-400"
  },
  {
    title: "Homosexuality Counseling",
    slug: "homosexuality-counseling",
    description: "Private, affirmative psychological support and non-judgmental guidance for identity and emotional wellness.",
    features: ["Affirmative Therapy", "Stress Management", "Confidential Guidance"],
    icon: ShieldCheck,
    color: "bg-teal-50 text-teal-600 dark:bg-teal-950 dark:text-teal-400"
  },
  {
    title: "Couple Therapy & Relationship Counselling",
    slug: "couple-therapy",
    description: "Compassionate, confidential joint therapy to overcome intimacy barriers, communication conflicts, and psychosexual concerns together.",
    features: ["Joint Intimacy Counseling", "Sensate Focus Exercises", "Conflict Resolution"],
    icon: HeartHandshake,
    color: "bg-pink-50 text-pink-600 dark:bg-pink-950 dark:text-pink-400"
  }
];

export default function TreatmentsPage() {
  const [activeTab, setActiveTab] = useState<"mental-health" | "sexual-problems">("mental-health");
  const { openBooking } = useBookingModal();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Header */}
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 overflow-hidden bg-muted/30 border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center max-w-4xl">
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
              <Stethoscope className="w-4 h-4" />
              KELKAR MANAS HEALTH CARE
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.15] mb-6">
              Specialized Treatments & <br className="hidden sm:inline" />
              <span className="text-primary italic">Clinical Services</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
              Comprehensive psychiatric care, psychotherapy, addiction recovery, and confidential sexual health support delivered by qualified medical specialists.
            </p>

            {/* Separate Tabs for Mental Health and Sexual Problems */}
            <div className="inline-flex p-1.5 rounded-full bg-background border border-border shadow-sm max-w-full overflow-x-auto">
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
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Tabbed Content */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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

          {activeTab === "sexual-problems" && (
            <div>
              <div className="max-w-3xl mb-12">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Department of Psychosexual Medicine</span>
                <h2 className="text-3xl md:text-4xl font-serif mt-2 mb-4">Sexual Health Problems</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Confidential consultations, medical evaluations, and psychosexual counselling for intimacy, performance, and reproductive health concerns.
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
                          <span className="text-xs font-bold uppercase tracking-wider text-primary">Treatment Modalities</span>
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
        </div>
      </section>

      {/* Booking CTA Section */}
      <section className="py-20 bg-muted/40 border-t border-border/50">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">Need Confidential Guidance?</h2>
          <p className="text-muted-foreground mb-8 text-base">
            Consultations are handled with complete medical confidentiality. Contact KELKAR MANAS HEALTH CARE to discuss your concerns with an experienced clinician.
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
