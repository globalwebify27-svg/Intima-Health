"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Shield, Sparkles, Users, ArrowRight, CheckCircle2, Star } from "lucide-react";
import Link from "next/link";
import React from "react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const floatAnimation = {
  y: ["-10px", "10px", "-10px"],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

export default function AboutPage() {
  const [aboutData, setAboutData] = React.useState<any>(null);

  // We are hardcoding the data as requested by the user instead of fetching from the database.
  // React.useEffect(() => {
  //   fetch("/api/public/content/pages/about")
  //     .then(res => res.json())
  //     .then(json => {
  //       if (json.success && json.data.content) {
  //         try {
  //           setAboutData(JSON.parse(json.data.content));
  //         } catch (e) {
  //           console.error("Failed to parse about content JSON");
  //         }
  //       }
  //     })
  //     .catch(err => console.error(err));
  // }, []);

  const data = {
    heroTitle1: "Leading Psychiatric &",
    heroTitle2: "Mental Health Care.",
    heroSubtitle: "Founded by Dr. Deepak Kelkar, Dr. Kelkar Hospital in Akola & Nagpur provides pioneer psychiatric treatment, de-addiction rehabilitation, and the Happiness 20 – Mind Gym program.",
    valuesTitle: "What Drives Us Forward",
    valuesDescription: "Everything we do at Kelkar Hospital is guided by four core principles that ensure we deliver the best possible care.",
    values: [
      { icon: "Shield", title: "Clinical Excellence", description: "Backed by rigorous research and leading medical professionals." },
      { icon: "Heart", title: "Compassionate Care", description: "Empathy and understanding at the heart of every interaction." },
      { icon: "Sparkles", title: "Innovation", description: "Continuously pushing boundaries in intimate health solutions." },
      { icon: "Users", title: "Inclusivity", description: "Accessible, judgment-free care designed for every body." }
    ],
    expertsTitle: "Meet Our Medical Experts",
    expertsDescription: "Our products and protocols are developed by leading specialists in psychiatry and de-addiction.",
    experts: [
      { img: "/images/dr_kelkar_hero_nobg.png", name: "Dr. Deepak Kelkar", role: "Senior Psychiatrist & Founder", spec: "MD Psychiatry, Mind Gym Pioneer" },
      { img: "/images/doctor_2.png", name: "Dr. Amol Kelkar", role: "Consultant Psychiatrist", spec: "De-Addiction Specialist" },
      { img: "/images/doctor_3.png", name: "Dr. Radhika Kelkar", role: "Specialist in Child Psychiatry", spec: "DPM, Child Development" }
    ],
    aboutContent: "Kelkar Hospital, Akola, has been providing comprehensive treatment for all types of mental health and psychiatric disorders in Akola for the past 44 years.<br/><br/>The hospital is led by qualified and experienced psychiatrists, offering scientific and compassionate care for a wide range of mental health conditions.<br/><br/>Associated with Kelkar Hospital is Sanmitra Hospital, where treatment for various mental health conditions is provided free of cost to eligible patients under government health schemes.<br/><br/>Patients who come with the PM-JAY (Ayushman Bharat) Card or are eligible under the Mahatma Jyotiba Phule Jan Arogya Yojana (MJPJAY) can receive treatment free of cost, as per scheme eligibility and approved packages.<br/><br/>The covered services may include psychiatric consultation, medicines, hospitalization, food and accommodation, and ECT (electroconvulsive therapy/shock treatment), as applicable under the government scheme.<br/><br/>Our aim is to ensure that financial difficulties do not become a barrier to receiving appropriate and timely mental healthcare."
  };

  const aboutContent = data.aboutContent;

  const getIcon = (name: string) => {
    if (name === "Shield") return Shield;
    if (name === "Heart") return Heart;
    if (name === "Sparkles") return Sparkles;
    return Users;
  };
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Redesigned Clean Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 overflow-hidden bg-background">
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full bg-muted/40 -z-10 lg:rounded-bl-[120px]" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            
            {/* Left Content */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="w-full lg:w-1/2"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-12 bg-primary"></div>
                <span className="text-sm font-bold tracking-widest text-primary uppercase">About Dr. Kelkar Manas Hospital</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-foreground leading-[1.1] mb-6">
                {data.heroTitle1} <br/>
                <span className="text-primary italic">{data.heroTitle2}</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed border-l-2 border-primary/20 pl-6 max-w-lg">
                {data.heroSubtitle}
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/services" className="group inline-flex items-center justify-center px-8 py-4 text-sm font-bold uppercase tracking-wider text-primary-foreground bg-foreground rounded-none hover:bg-primary transition-colors">
                  Explore Services
                  <ArrowRight className="ml-3 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full lg:w-1/2 relative"
            >
              <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-background z-10 bg-gradient-to-t from-primary/20 via-primary/5 to-background">
                <Image
                  src="/images/dr_kelkar_hero_nobg.png"
                  alt="Dr. Deepak Kelkar"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-color-burn" />
              </div>
              {/* Decorative block behind image */}
              <div className="absolute -bottom-6 -right-6 w-2/3 h-2/3 bg-secondary/20 rounded-[2rem] -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="order-2 lg:order-1 relative rounded-[2rem] overflow-hidden aspect-[4/3] shadow-xl border border-border"
            >
              <Image
                src="/images/clinical_abstract.png"
                alt="KELKAR MANAS HEALTH CLINIC Clinical Research"
                fill
                className="object-cover"
               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
            </motion.div>
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="order-1 lg:order-2"
            >
              {aboutContent ? (
                <div 
                  className="space-y-4 text-lg text-muted-foreground prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: aboutContent }}
                />
              ) : (
                <div className="space-y-4 text-lg text-muted-foreground animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Our Values</h2>
            <h3 className="text-3xl md:text-4xl font-serif text-foreground mb-4">{data.valuesTitle}</h3>
            <p className="text-lg text-muted-foreground">
              {data.valuesDescription}
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {data.values.map((value: any, idx: number) => {
              const IconComp = getIcon(value.icon);
              return (
                <motion.div 
                  key={idx}
                  variants={fadeIn}
                  className="bg-card p-8 rounded-2xl shadow-sm border border-border hover:shadow-md transition-shadow group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-semibold text-foreground mb-3">{value.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Meet the Experts */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">{data.expertsTitle}</h2>
            <p className="text-lg text-muted-foreground">
              {data.expertsDescription}
            </p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {data.experts.map((doc: any, idx: number) => (
              <motion.div key={idx} variants={fadeIn} className="group cursor-pointer">
                <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 bg-muted/50 border border-border">
                  <Image
                    src={doc.img}
                    alt={doc.name}
                    fill
                    className={`object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${doc.name === 'Dr. Deepak Kelkar' ? 'object-top' : ''}`}
                   sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                  {/* Subtle overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <h4 className="text-2xl font-serif text-foreground mb-1">{doc.name}</h4>
                <p className="text-primary font-medium mb-2">{doc.role}</p>
                <p className="text-muted-foreground text-sm">{doc.spec}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lifestyle Section */}
      <section className="py-24 bg-foreground text-background overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              className="max-w-xl"
            >
              <h2 className="text-3xl md:text-5xl font-serif mb-6 leading-tight">
                Embrace Life with Confidence
              </h2>
              <p className="text-lg text-background/80 mb-8 leading-relaxed">
                Intimate health is not just about avoiding discomfort; it's about embracing vitality, pleasure, and confidence in every stage of life. Our clinic is dedicated to providing compassionate, personalized care to help you thrive.
              </p>
              <Link href="/doctors" className="inline-flex items-center text-primary-foreground font-medium hover:text-primary-foreground/80 transition-colors">
                Meet our experts
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative w-full aspect-video lg:aspect-square rounded-[2rem] overflow-hidden shadow-2xl border border-background/10"
            >
              <Image
                src="/images/lifestyle_couple.png"
                alt="Confident lifestyle"
                fill
                className="object-cover"
               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 bg-muted/50 overflow-hidden">
        <div className="absolute inset-0 z-0 mix-blend-luminosity">
          <Image
            src="/images/cta_bg.png"
            alt="Background pattern"
            fill
            className="object-cover opacity-10"
           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl md:text-5xl font-serif text-foreground mb-6">
              Ready to prioritize your intimate health?
            </h2>
            <p className="text-xl text-muted-foreground mb-10">
              Discover our range of expertly formulated products designed for your unique needs.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
