"use client";

import { use } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  HeartHandshake, 
  ShieldCheck, 
  ClipboardList, 
  Activity, 
  Stethoscope, 
  Pill, 
  Clock, 
  FlaskConical, 
  ArrowRight, 
  CheckCircle2, 
  UserCheck, 
  BrainCircuit, 
  Building2 
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { BookNowButton } from "@/components/ui/book-now-button";
import { notFound } from "next/navigation";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

interface ServiceDetails {
  title: string;
  badge: string;
  doctor: string;
  leadDoctorRole: string;
  heroHeadline: string;
  heroSubtext: string;
  description: string;
  causes: { icon: any; title: string; description: string }[];
  treatments: { title: string; description: string }[];
}

const serviceDataMap: Record<string, ServiceDetails> = {
  "treatment-of-depression": {
    title: "Treatment of Depression",
    badge: "Clinical Psychiatry & Mind Wellness",
    doctor: "Dr. Deepak Kelkar",
    leadDoctorRole: "Senior Psychiatrist & Founder",
    heroHeadline: "Overcome Depression with Specialist Care",
    heroSubtext: "Depression is highly treatable. Under the expert guidance of Dr. Deepak Kelkar, we offer individual diagnosis, therapy, and the Happiness 20 – Mind Gym daily protocol.",
    description: "Depression impacts mood, energy, and overall quality of life. Our comprehensive approach combines medical treatment, psychotherapy, and mental gym routines to restore long-term emotional well-being.",
    causes: [
      { icon: BrainCircuit, title: "Neurochemical Factors", description: "Imbalance in neurotransmitters such as serotonin and dopamine affecting mood regulation." },
      { icon: Activity, title: "Psychosocial Stress", description: "Life events, prolonged stress, trauma, or relationship difficulties." },
      { icon: UserCheck, title: "Biological Factors", description: "Genetic vulnerability and physical illness impacting psychological health." }
    ],
    treatments: [
      { title: "Individual Psychotherapy & Counseling", description: "Personalized therapy sessions tailored to process thoughts, feelings, and behavioral patterns." },
      { title: "Happiness 20 – Mind Gym", description: "Daily 20-minute guided mental exercises designed to build psychological resilience." },
      { title: "Evidence-Based Pharmacotherapy", description: "Targeted antidepressant medication management supervised by senior psychiatrists." }
    ]
  },
  "treatment-of-anxiety": {
    title: "Treatment of Anxiety",
    badge: "Anxiety & Panic Disorder Care",
    doctor: "Dr. Amol Kelkar",
    leadDoctorRole: "Consultant Psychiatrist",
    heroHeadline: "Reclaim Calmness and Emotional Control",
    heroSubtext: "Effective clinical treatment for generalized anxiety, panic attacks, phobias, and chronic worry.",
    description: "Anxiety can cause persistent fear, restlessness, and physical symptoms. We provide evidence-based psychological and pharmacological care to reduce anxiety and rebuild peace of mind.",
    causes: [
      { icon: BrainCircuit, title: "Overactive Amygdala", description: "Heightened fear responses in the brain triggering false emergency alarms." },
      { icon: Activity, title: "Chronic Stress Response", description: "Prolonged exposure to physical or emotional stressors without adequate recovery." },
      { icon: UserCheck, title: "Environmental Triggers", description: "Work stress, relationship conflicts, or social evaluation pressure." }
    ],
    treatments: [
      { title: "Cognitive Restructuring", description: "Identify and replace catastrophic thoughts with rational, grounding mental patterns." },
      { title: "Relaxation & Biofeedback", description: "Controlled breathing and somatic relaxation techniques to calm the nervous system." },
      { title: "Targeted Pharmacotherapy", description: "Safe, non-habit forming medications to reduce acute anxiety and panic symptoms." }
    ]
  },
  "ocd-treatment": {
    title: "Treatment of OCD",
    badge: "Obsessive-Compulsive Disorder Care",
    doctor: "Dr. Deepak Kelkar",
    leadDoctorRole: "Senior Psychiatrist",
    heroHeadline: "Break the Cycle of Obsessions & Compulsions",
    heroSubtext: "Specialized clinical therapy combining Exposure & Response Prevention (ERP) and psychiatric care.",
    description: "Obsessive-Compulsive Disorder involves unwanted repetitive thoughts (obsessions) and behaviors (compulsions). Our specialized protocols help patients regain freedom from obsessive loops.",
    causes: [
      { icon: BrainCircuit, title: "Cortico-Striatal Circuitry", description: "Altered brain signaling between frontal lobes and deeper brain structures." },
      { icon: Activity, title: "Compulsive Relief Loops", description: "Temporary relief from compulsions reinforcing the obsessive cycle over time." },
      { icon: UserCheck, title: "Stress Vulnerability", description: "High-stress environments worsening compulsive rituals and intrusive thoughts." }
    ],
    treatments: [
      { title: "Exposure & Response Prevention (ERP)", description: "Gold-standard therapy to gradually confront fears without engaging in compulsions." },
      { title: "Cognitive Therapy for OCD", description: "Reframing the significance of intrusive thoughts to lower compulsive urgency." },
      { title: "Medical Management", description: "FDA-approved medications to normalize serotonin levels and lower obsession intensity." }
    ]
  },
  "alcohol-de-addiction": {
    title: "Alcohol De-Addiction",
    badge: "Sanmitra Manas & Ashakiran Rehab",
    doctor: "Dr. Amol Kelkar",
    leadDoctorRole: "De-Addiction Specialist",
    heroHeadline: "Safe Detoxification & Lasting Recovery",
    heroSubtext: "Comprehensive inpatient & outpatient alcohol rehabilitation with 24/7 medical supervision and family support.",
    description: "Alcohol dependence affects health, family, and future. Ashakiran Rehabilitation Centre & Sanmitra Manas Hospital provide structured medical detox, craving management, and long-term sobriety programs.",
    causes: [
      { icon: BrainCircuit, title: "Dopamine Rewiring", description: "Long-term alcohol intake altering reward pathways and creating strong chemical dependency." },
      { icon: Activity, title: "Physical Tolerance", description: "Physiological adaptation requiring increased consumption to avoid severe withdrawal." },
      { icon: Building2, title: "Social & Psychological Stress", description: "Using alcohol as a coping mechanism for emotional distress or social pressure." }
    ],
    treatments: [
      { title: "Medically Supervised Detoxification", description: "24/7 inpatient medical monitoring to manage alcohol withdrawal symptoms safely." },
      { title: "Relapse Prevention Therapy", description: "Behavioral strategies and trigger management to maintain lifelong sobriety." },
      { title: "Family Counseling & Support", description: "Rebuilding family relationships and creating a supportive home environment." }
    ]
  },
  "nicotine-de-addiction": {
    title: "Nicotine De-Addiction",
    badge: "Smoking & Tobacco Cessation",
    doctor: "Dr. Amol Kelkar",
    leadDoctorRole: "Consultant Psychiatrist",
    heroHeadline: "Breathe Free from Smoking & Tobacco",
    heroSubtext: "Structured medical & psychological cessation protocols to eliminate nicotine addiction for good.",
    description: "Nicotine is one of the most addictive substances, making unassisted quitting difficult. Our structured medical cessation programs combine behavioral counseling with medical support.",
    causes: [
      { icon: BrainCircuit, title: "Nicotinic Receptor Activation", description: "Rapid dopamine spikes creating powerful psychological habit loops." },
      { icon: Activity, title: "Routine & Cue Associations", description: "Behavioral triggers linked to stress relief, social habits, or post-meal routines." }
    ],
    treatments: [
      { title: "Nicotine Replacement Therapy (NRT)", description: "Gradual tapering using clinical NRT protocols to prevent severe withdrawal." },
      { title: "Behavioral Habit Replacement", description: "Coaching to replace tobacco cravings with healthy somatic habits." },
      { title: "Craving Suppression Medication", description: "Medications prescribed by psychiatrists to reduce nicotine urges." }
    ]
  },
  "brown-sugar-de-addiction": {
    title: "Brown Sugar & Opioid De-Addiction",
    badge: "Ashakiran Rehabilitation Centre",
    doctor: "Dr. Deepak Kelkar & Dr. Amol Kelkar",
    leadDoctorRole: "Senior Medical Board",
    heroHeadline: "Reclaim Your Life from Severe Dependence",
    heroSubtext: "Dedicated inpatient residential rehabilitation for Brown Sugar and opioid substance dependence.",
    description: "Heavy substance dependence requires intensive medical supervision and rehabilitation. Ashakiran Rehab offers full residential care, detox protocols, and comprehensive psychological rehabilitation.",
    causes: [
      { icon: BrainCircuit, title: "Severe Opioid Receptors Dependence", description: "Profound physiological dependency altering pain and pleasure signaling." },
      { icon: Building2, title: "Environmental Factors", description: "Peer influence, trauma, or easy access accelerating heavy substance reliance." }
    ],
    treatments: [
      { title: "Inpatient Clinical Detoxification", description: "Round-the-clock medical care to stabilize physical withdrawal safely." },
      { title: "Residential Rehabilitation Program", description: "Structured daily routines, group therapy, and psychological counseling." },
      { title: "Post-Rehab Aftercare & Monitoring", description: "Ongoing outpatient check-ins and community support to prevent relapse." }
    ]
  },
  "child-and-adolescent-psychiatry": {
    title: "Child & Adolescent Psychiatry",
    badge: "Pediatric Mental Health",
    doctor: "Dr. Radhika Kelkar",
    leadDoctorRole: "Specialist in Child Psychiatry",
    heroHeadline: "Nurturing Young Minds with Compassion",
    heroSubtext: "Expert care for ADHD, autism spectrum, anxiety, learning difficulties, and behavioral challenges in children and teenagers.",
    description: "Children experience mental health challenges differently than adults. Dr. Radhika Kelkar provides specialized pediatric psychiatric care to support healthy development, academic success, and family harmony.",
    causes: [
      { icon: BrainCircuit, title: "Neurodevelopmental Differences", description: "Variations in brain development affecting attention, impulse control, or social communication." },
      { icon: Activity, title: "Academic & Peer Stress", description: "School pressure, bullying, or social adjustment difficulties." }
    ],
    treatments: [
      { title: "ADHD & Autism Evaluation", description: "Comprehensive psychometric assessment and early intervention strategies." },
      { title: "Behavioral & Play Therapy", description: "Child-friendly therapeutic techniques to express emotions and manage impulses." },
      { title: "Parent Counseling & Guidance", description: "Empowering parents with effective home management protocols." }
    ]
  },
  "geriatric-psychiatry": {
    title: "Geriatric Psychiatry",
    badge: "Senior Mental Health & Memory Care",
    doctor: "Dr. Deepak Kelkar",
    leadDoctorRole: "Senior Psychiatrist",
    heroHeadline: "Compassionate Mental Healthcare for Seniors",
    heroSubtext: "Specialized psychiatric care for memory loss, dementia, late-life depression, and emotional wellness in older adults.",
    description: "Aging brings unique emotional and neurological shifts. We provide gentle, expert psychiatric care to support cognitive health, mood balance, and dignity for elderly patients.",
    causes: [
      { icon: BrainCircuit, title: "Neurodegenerative Changes", description: "Age-related neural shifts impacting memory, executive function, and mood." },
      { icon: UserCheck, title: "Late-Life Transitions", description: "Loneliness, grief, loss of independence, or chronic medical conditions." }
    ],
    treatments: [
      { title: "Memory & Cognitive Assessments", description: "Clinical screening for early-stage dementia and cognitive changes." },
      { title: "Geriatric Depression & Anxiety Treatment", description: "Safe, low-dose medical and therapeutic care tailored for senior physiology." },
      { title: "Caregiver Support & Guidance", description: "Supporting families with dementia behavioral management and home care strategies." }
    ]
  },
  "cognitive-behavioural-therapy": {
    title: "Cognitive Behavioural Therapy (CBT)",
    badge: "Evidence-Based Psychotherapy",
    doctor: "Dr. Deepak Kelkar & Clinical Team",
    leadDoctorRole: "Lead Psychotherapy Board",
    heroHeadline: "Transform Thoughts, Transform Life",
    heroSubtext: "Structured, goal-oriented psychological sessions to identify negative thinking patterns and build resilient behaviors.",
    description: "CBT is one of the most effective, research-proven forms of psychotherapy. It focuses on the connection between thoughts, feelings, and actions, giving patients practical tools to manage stress and anxiety.",
    causes: [
      { icon: BrainCircuit, title: "Cognitive Distortions", description: "Habitual negative thinking patterns like catastrophizing or all-or-nothing thinking." },
      { icon: Activity, title: "Maladaptive Behaviors", description: "Avoidance or coping strategies that reinforce emotional distress." }
    ],
    treatments: [
      { title: "Structured Session Framework", description: "Clear, step-by-step sessions focusing on current challenges and concrete solutions." },
      { title: "Thought Record & Reframing", description: "Practical tools to question irrational fears and cultivate balanced perspectives." },
      { title: "Behavioral Activation", description: "Action plans to re-engage in rewarding, healthy daily activities." }
    ]
  }
};

export default function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const data = serviceDataMap[resolvedParams.slug];

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden bg-muted/30">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -z-10 rounded-bl-[120px]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
                <Stethoscope className="w-4 h-4" />
                {data.badge}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.1] mb-6">
                {data.heroHeadline}
              </h1>

              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
                {data.heroSubtext}
              </p>

              <div className="p-4 rounded-2xl bg-background border border-border/80 mb-8 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{data.doctor}</h4>
                  <p className="text-xs text-muted-foreground">{data.leadDoctorRole}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <BookNowButton className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 text-base font-semibold shadow-xl group")}>
                  Book Consultation
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </BookNowButton>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="lg:w-1/2 relative">
              <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border border-border bg-white flex items-center justify-center p-8">
                <Image
                  src="/images/doctor_1.png"
                  alt={data.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Understanding & Overview Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-6">Overview & Clinical Approach</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {data.description}
            </p>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {data.causes.map((cause, idx) => (
              <motion.div key={idx} variants={fadeIn} className="bg-muted/30 p-8 rounded-[2rem] border border-border">
                <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-6">
                  <cause.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif font-medium mb-3">{cause.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{cause.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Treatment Plan Section */}
      <section className="py-20 bg-muted/40 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Our Specialized <span className="text-primary italic">Care Plan</span></h2>
            <p className="text-muted-foreground text-base">Comprehensive, confidential, and physician-guided treatment protocols.</p>
          </div>

          <div className="space-y-6">
            {data.treatments.map((treatment, idx) => (
              <div key={idx} className="bg-background p-6 rounded-2xl border border-border flex gap-4 items-start shadow-sm">
                <div className="mt-1 shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-1">{treatment.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{treatment.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Start Your Journey to Recovery</h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Consult with Dr. Deepak Kelkar and our senior clinical team. 100% private and confidential.
            </p>
            <BookNowButton className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "rounded-full px-10 py-5 text-base font-bold shadow-xl hover:scale-105 transition-transform")}>
              Book Consultation Now
            </BookNowButton>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
