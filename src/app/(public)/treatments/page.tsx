"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Video, 
  Pill, 
  ClipboardList, 
  HeartHandshake, 
  FlaskConical, 
  ArrowRight, 
  CheckCircle2,
  Stethoscope,
  Clock,
  ShieldCheck,
  Activity
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

import React from "react";

export default function ServicesPage() {
  const [servicesData, setServicesData] = React.useState<any>(null);

  React.useEffect(() => {
    // Temporarily disabled fetching from DB so we show the new treatments
    // fetch("/api/public/content/pages/treatments")
    // ...
  }, []);

  const data = servicesData || {
    heroTitle1: "Expert care for your most",
    heroTitle2: "private needs.",
    heroSubtitle: "From online consultations to doorstep medication delivery, we provide an end-to-end clinical ecosystem designed around your privacy and comfort.",
    servicesTitle: "Our Specialties",
    servicesDescription: "Explore our specialized treatment options tailored to your specific needs.",
    services: [
      {
        icon: "ShieldCheck",
        title: "Treatment of Phobia",
        description: "Overcome irrational fears and anxiety through targeted therapy.",
        features: ["Exposure Therapy", "Cognitive Restructuring", "Anxiety Management"],
        color: "bg-chart-1",
        slug: "treatment-of-phobia"
      },
      {
        icon: "Activity",
        title: "Treatment of Panic Attacks",
        description: "Manage and reduce sudden panic episodes with clinical interventions.",
        features: ["Symptom Management", "Coping Strategies", "Therapeutic Support"],
        color: "bg-chart-2",
        slug: "treatment-of-panic-attacks"
      },
      {
        icon: "ClipboardList",
        title: "Treatment of OCD",
        description: "Specialized ERP (Exposure & Response Prevention) therapy and clinical care for Obsessive-Compulsive Disorder.",
        features: ["Behavioral Therapy", "ERP Protocols", "Long-term Maintenance"],
        color: "bg-chart-4",
        slug: "treatment-of-ocd"
      },
      {
        icon: "HeartHandshake",
        title: "Treatment of Hysteria",
        description: "Therapeutic interventions for conversion disorders and severe emotional dysregulation.",
        features: ["Psychotherapy", "Emotional Stabilization", "Holistic Support"],
        color: "bg-primary",
        slug: "treatment-of-hysteria"
      },
      {
        icon: "Stethoscope",
        title: "Treatment of Depression",
        description: "Clinical diagnostic care, psychotherapy, and individual medication management to restore emotional balance.",
        features: ["Clinical Assessment", "Individualized Treatment", "Mind Gym Integration"],
        color: "bg-secondary",
        slug: "treatment-of-depression"
      },
      {
        icon: "Pill",
        title: "Treatment of Anxiety",
        description: "Evidence-based therapy and care plans for generalized anxiety and social anxiety.",
        features: ["Cognitive Restructuring", "Stress Management", "Pharmacotherapy"],
        color: "bg-chart-3",
        slug: "treatment-of-anxiety"
      },
      {
        icon: "FlaskConical",
        title: "Treatment of Alcohol Addiction",
        description: "Inpatient and outpatient detoxification, counseling, and relapse prevention.",
        features: ["Medical Detoxification", "Relapse Prevention", "Family Counseling"],
        color: "bg-chart-5",
        slug: "treatment-of-alcohol-addiction"
      },
      {
        icon: "HeartHandshake",
        title: "Treatment Available for Sexual Health Problems",
        description: "Confidential care and specialized solutions for various sexual health concerns.",
        features: ["Clinical Assessment", "Personalized Care Plans", "Discreet Consultations"],
        color: "bg-chart-1",
        slug: "sexual-health-problems"
      },
      {
        icon: "Stethoscope",
        title: "Child & Adolescent Psychiatry",
        description: "Specialized care for children and teens experiencing emotional and behavioral challenges.",
        features: ["ADHD & Autism", "Behavioral Therapy", "Parental Guidance"],
        color: "bg-chart-2",
        slug: "child-and-adolescent-psychiatry"
      },
      {
        icon: "BrainCircuit",
        title: "Geriatric Psychiatry",
        description: "Compassionate mental healthcare for older adults, including dementia and memory care.",
        features: ["Memory Assessments", "Dementia Care", "Caregiver Support"],
        color: "bg-chart-3",
        slug: "geriatric-psychiatry"
      },
      {
        icon: "Activity",
        title: "Cognitive Behavioural Therapy",
        description: "Evidence-based psychotherapy focusing on negative thinking patterns and behaviors.",
        features: ["Structured Therapy", "Stress Management", "Resilience Building"],
        color: "bg-chart-4",
        slug: "cognitive-behavioural-therapy"
      },
      {
        icon: "Pill",
        title: "Nicotine De-Addiction",
        description: "Structured medical and psychological protocols to help you quit tobacco permanently.",
        features: ["Craving Management", "Behavioral Support", "Relapse Prevention"],
        color: "bg-chart-5",
        slug: "nicotine-de-addiction"
      },
      {
        icon: "FlaskConical",
        title: "Brown Sugar De-Addiction",
        description: "Dedicated residential rehabilitation for severe opioid and brown sugar dependence.",
        features: ["Medical Detox", "Residential Rehab", "Long-term Aftercare"],
        color: "bg-primary",
        slug: "brown-sugar-de-addiction"
      },
      {
        icon: "BrainCircuit",
        title: "Schizophrenia Treatment",
        description: "Management of thoughts, perceptions, and behaviors through modern psychiatric care.",
        features: ["Antipsychotic Care", "ECT Support", "Family Support"],
        color: "bg-secondary",
        slug: "schizophrenia"
      },
      {
        icon: "Activity",
        title: "Irritable Bowel Syndrome (IBS)",
        description: "Gut-brain care to manage recurring abdominal pain and bowel habit changes.",
        features: ["Symptom Relief", "Gut-directed CBT", "Dietary Guidance"],
        color: "bg-chart-1",
        slug: "ibs"
      },
      {
        icon: "Activity",
        title: "Mania (Bipolar Disorder)",
        description: "Management of abnormally elevated mood, energy, and severe bipolar symptoms.",
        features: ["Mood Stabilisers", "Hospital Care", "Maintenance Planning"],
        color: "bg-chart-2",
        slug: "mania"
      }
    ]
  };

  const getIcon = (name: string) => {
    switch(name) {
      case "Video": return Video;
      case "Pill": return Pill;
      case "ClipboardList": return ClipboardList;
      case "HeartHandshake": return HeartHandshake;
      case "FlaskConical": return FlaskConical;
      case "Stethoscope": return Stethoscope;
      case "Clock": return Clock;
      case "ShieldCheck": return ShieldCheck;
      case "Activity": return Activity;
      default: return HeartHandshake;
    }
  };

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Complete Assessment",
    description: "Fill out a quick, secure medical intake form detailing your symptoms and medical history."
  },
  {
    number: "02",
    icon: Stethoscope,
    title: "Consult an Expert",
    description: "Connect with a specialized doctor via a secure video call or text-based consultation."
  },
  {
    number: "03",
    icon: Pill,
    title: "Receive Treatment",
    description: "Your personalized treatment plan and discreetly packaged medications are shipped to your door."
  }
];

  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Services Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-32 overflow-hidden bg-muted/30">
        <div className="absolute inset-0 bg-[url('/images/cta_bg.png')] opacity-5 mix-blend-multiply pointer-events-none" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
              <ShieldCheck className="w-4 h-4" />
              Comprehensive Care
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-medium leading-[1.1] mb-6">
              {data.heroTitle1} <br className="hidden md:block"/> 
              <span className="text-primary italic">{data.heroTitle2}</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              {data.heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-24 bg-background relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {data.services.map((service: any, idx: number) => {
              const IconComp = getIcon(service.icon);
              return (
                <motion.div 
                  key={service.title}
                  variants={fadeIn}
                  className="bg-card rounded-3xl p-8 border border-border shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-2xl ${service.color} flex items-center justify-center text-white font-bold`}>
                        <IconComp className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-serif font-medium">{service.title}</h3>
                    </div>
                    
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    
                    <div className="space-y-3 mb-8">
                      {service.features.map((feature: any, fIdx: number) => (
                        <div key={fIdx} className="flex items-center gap-2 text-sm text-foreground font-medium">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Link 
                      href={`/treatments/${service.slug}`}
                      className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full rounded-full group font-semibold")}
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-muted/50 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-serif text-foreground mb-6">Seamless, Discreet, Effective</h2>
            <p className="text-lg text-muted-foreground">
              We've simplified the process of getting clinical care so you can focus entirely on your wellness.
            </p>
          </motion.div>

          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-12"
            >
              {steps.map((step, idx) => (
                <motion.div key={idx} variants={fadeIn} className="relative bg-background p-8 rounded-[2rem] border border-border text-center shadow-sm hover:-translate-y-2 transition-transform duration-300">
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                    {step.number}
                  </div>
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 mt-4">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-3">{step.title}</h4>
                  <p className="text-muted-foreground">{step.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Conditions We Treat Banner */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-foreground text-background rounded-[3rem] p-10 md:p-16 lg:p-20 relative overflow-hidden flex flex-col lg:flex-row items-center gap-12 shadow-2xl">
            {/* Decorative BG */}
            <div className="absolute -right-20 -bottom-20 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="w-full lg:w-1/2 relative z-10">
              <h2 className="text-3xl md:text-5xl font-serif mb-6">Conditions We Treat</h2>
              <p className="text-lg text-background/80 mb-8 max-w-lg">
                Our specialists are equipped to diagnose and treat a wide range of sexual and reproductive health conditions for all genders.
              </p>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'Erectile Dysfunction', slug: 'erectile-dysfunction' },
                  { name: 'Premature Ejaculation', slug: 'premature-ejaculation' },
                  { name: 'Performance Anxiety', slug: 'sexual-performance-anxiety' },
                  { name: 'STIs', slug: 'sexually-transmitted-infections' },
                  { name: 'Precum', slug: 'precum-concerns' },
                  { name: 'Nocturnal Emissions', slug: 'nocturnal-emissions' },
                  { name: 'Masturbation Habit', slug: 'masturbation-habit' },
                  { name: 'Infertility', slug: 'infertility' },
                  { name: 'Homosexuality Counseling', slug: 'homosexuality-counseling' }
                ].map((condition, i) => (
                  <Link href={`/treatments/${condition.slug}`} key={i} className="px-4 py-2 rounded-full border border-background/20 bg-background/10 backdrop-blur-sm text-sm font-medium hover:bg-background/20 transition-colors">
                    {condition.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="w-full lg:w-1/2 relative z-10 flex justify-center lg:justify-end">
              <Link href="/sexual-problems" className="group flex items-center justify-between w-full max-w-sm bg-primary text-primary-foreground p-6 rounded-3xl hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-xl">
                <div>
                  <span className="block text-sm font-bold uppercase tracking-wider mb-1 opacity-80">Explore Catalog</span>
                  <span className="block text-2xl font-serif">View All Sexual Problems</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-background/20 flex items-center justify-center group-hover:bg-background/30 transition-colors">
                  <ArrowRight className="w-6 h-6" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
