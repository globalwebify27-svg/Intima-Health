"use client";

import { use } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { 
  Zap, 
  Activity, 
  BrainCircuit, 
  ShieldCheck, 
  HeartPulse, 
  Pill, 
  ArrowRight, 
  CheckCircle2,
  ShieldAlert,
  UserCheck
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

interface ConditionDetails {
  title: string;
  badge: string;
  heroHeadline: string;
  heroSubtext: string;
  description: string;
  causes: { icon: any; title: string; description: string }[];
  treatments: { title: string; description: string }[];
}

const conditionDataMap: Record<string, ConditionDetails> = {
  "sex-for-happiness": {
    title: "Sex For Happiness & Intimacy",
    badge: "Psychosexual Wellness",
    heroHeadline: "Experience Intimacy as a Pathway to Emotional Joy",
    heroSubtext: "Holistic psychosexual wellness counseling focused on mutual fulfillment, emotional connection, and removing psychological barriers.",
    description: "Intimacy is an essential dimension of mental and emotional health. Sex for Happiness counseling helps individuals and couples dismantle performance fear, enhance emotional connection, and discover deep sexual satisfaction.",
    causes: [
      { icon: BrainCircuit, title: "Performance Pressure", description: "Anxiety regarding expectations, preventing relaxed emotional connection." },
      { icon: HeartPulse, title: "Emotional Disconnect", description: "Communication gaps between partners leading to unfulfilled sexual intimacy." },
      { icon: UserCheck, title: "Psychological Inhibitions", description: "Conditioned shame or stress suppressing natural sexual arousal." }
    ],
    treatments: [
      { title: "Psychosexual Couples Counseling", description: "Guided communication techniques to foster trust and intimacy." },
      { title: "Mindfulness & Somatic Exercises", description: "Sensate focus techniques to reconnect physical sensation with emotional joy." },
      { title: "Individual Wellness Coaching", description: "Private sessions to address personal inhibitions and build sexual confidence." }
    ]
  },
  "premature-ejaculation": {
    title: "Premature Ejaculation",
    badge: "Stamina & Endurance Care",
    heroHeadline: "Regain Endurance and Ejaculatory Control",
    heroSubtext: "Comprehensive medical and behavioral protocols to extend performance duration and build lasting confidence.",
    description: "Premature ejaculation is a highly common and manageable condition. We combine specialized medical therapy, topical interventions, and behavioral techniques to enhance endurance.",
    causes: [
      { icon: Activity, title: "Hypersensitivity", description: "Increased neurological sensitivity requiring targeted desensitization." },
      { icon: BrainCircuit, title: "Performance Anxiety", description: "Arousal spikes driven by nervousness or fear of early climax." },
      { icon: HeartPulse, title: "Neurochemical Sensitivity", description: "Serotoninergic receptor sensitivity in pathways controlling ejaculation timing." }
    ],
    treatments: [
      { title: "Targeted Medical Prescriptions", description: "Oral medications designed to regulate ejaculatory timing safely." },
      { title: "Behavioral Control Protocols", description: "Squeeze and start-stop techniques to increase physiological control." },
      { title: "Topical Endurance Solutions", description: "Prescription-grade desensitizing sprays and creams for immediate control." }
    ]
  },
  "erectile-dysfunction": {
    title: "Erectile Dysfunction",
    badge: "Clinical Vascular & Psychosexual Care",
    heroHeadline: "Restore Firmness, Stamina, and Confidence",
    heroSubtext: "Physician-guided diagnosis and evidence-based treatment plans for ED led by our expert medical team.",
    description: "Erectile Dysfunction (ED) can stem from physical vascular factors, stress, or hormonal shifts. We provide full diagnostic evaluation and personalized treatment protocols.",
    causes: [
      { icon: Activity, title: "Vascular Restricted Blood Flow", description: "Reduced arterial inflow impacting erection firmness and duration." },
      { icon: BrainCircuit, title: "Stress & Anxiety Inhibitions", description: "High cortisol levels blocking parasympathetic erection triggers." },
      { icon: HeartPulse, title: "Hormonal Deficiencies", description: "Low serum testosterone levels impairing sexual drive and erection maintenance." }
    ],
    treatments: [
      { title: "PDE5 Inhibitor Protocols", description: "Tailored dosing of Sildenafil or Tadalafil suited to your medical history." },
      { title: "Hormone Optimization Therapy", description: "Targeted testosterone replacement where clinically indicated." },
      { title: "Vascular & Lifestyle Coaching", description: "Exercise and dietary changes to improve penile arterial health." }
    ]
  },
  "masturbation-counseling": {
    title: "Masturbation Counseling & Guidance",
    badge: "Behavioral Counseling",
    heroHeadline: "Dispel Myths and Restore Healthy Habits",
    heroSubtext: "Confidential counseling for masturbation anxiety, guilt, compulsion, or physical concerns.",
    description: "Misinformation surrounding masturbation often causes severe guilt, anxiety, or compulsive habits. Our judgment-free counseling clears myths and promotes healthy psychosexual habits.",
    causes: [
      { icon: BrainCircuit, title: "Guilt & Conditioning", description: "Cultural or personal shame creating severe distress around natural sexual urges." },
      { icon: Activity, title: "Compulsive Habit Patterns", description: "Using masturbation as an unhelpful coping strategy for chronic stress or boredom." },
      { icon: ShieldAlert, title: "Desensitization Concerns", description: "Over-stimulation leading to temporary friction desensitization during partner intimacy." }
    ],
    treatments: [
      { title: "Psychoeducation & Myth Busting", description: "Scientific guidance on sexual anatomy and healthy physiological responses." },
      { title: "Habit Re-patterning", description: "Behavioral therapy to manage compulsion and reduce guilt." },
      { title: "Sensory Desensitization Recovery", description: "Protocols to restore normal nerve sensitivity for partner intimacy." }
    ]
  },
  "homosexual-anxiety": {
    title: "Homosexual Anxiety & Identity Care",
    badge: "Affirmative Psychosexual Therapy",
    heroHeadline: "Private, Affirmative Care for Sexual Identity & Anxiety",
    heroSubtext: "Empathetic, confidential counseling for gay, bisexual, and queer individuals experiencing identity stress or performance anxiety.",
    description: "Navigating sexual identity or relationship dynamics can sometimes involve social stress or internalized anxiety. We provide affirmative, private psychiatric and psychosexual care.",
    causes: [
      { icon: BrainCircuit, title: "Internalized Social Stress", description: "Anxiety stemming from societal prejudice, coming-out stress, or family pressure." },
      { icon: HeartPulse, title: "Performance & Intimacy Fear", description: "Anxiety interfering with comfortable physical and emotional expression." }
    ],
    treatments: [
      { title: "Affirmative Individual Therapy", description: "Supportive counseling centered on self-acceptance and emotional resilience." },
      { title: "Relationship & Intimacy Counseling", description: "Specialized care for same-sex couples navigating communication and intimacy." },
      { title: "Anxiety Reduction Protocols", description: "Therapeutic and medical options to relieve chronic panic or social fear." }
    ]
  },
  "depression": {
    title: "Depression & Mood Disorders",
    badge: "Psychiatric Care",
    heroHeadline: "Expert Care for Depression & Mood Disorders",
    heroSubtext: "Comprehensive diagnostic evaluation and clinical treatment plans by our senior specialists to help you regain your quality of life.",
    description: "Depression and mood disorders can deeply impact every aspect of life. We offer evidence-based interventions including medication management and psychotherapy tailored to your unique needs.",
    causes: [
      { icon: BrainCircuit, title: "Neurochemical Imbalance", description: "Imbalances in serotonin, dopamine, and norepinephrine affecting mood regulation." },
      { icon: HeartPulse, title: "Chronic Stress", description: "Prolonged emotional or physical stress altering brain chemistry." },
      { icon: ShieldAlert, title: "Genetic Factors", description: "Biological predispositions that make individuals more susceptible to mood disorders." }
    ],
    treatments: [
      { title: "Medication Management", description: "Targeted psychiatric medications to restore neurochemical balance." },
      { title: "Cognitive Behavioral Therapy (CBT)", description: "Structured counseling to identify and change negative thought patterns." },
      { title: "Lifestyle Interventions", description: "Guidance on sleep, nutrition, and exercise to support mental health recovery." }
    ]
  },
  "anxiety": {
    title: "Anxiety & OCD Treatment",
    badge: "Specialized Therapy",
    heroHeadline: "Overcome Anxiety and OCD",
    heroSubtext: "Comprehensive therapy and evidence-based medical care to help you break free from the cycle of anxiety and obsessive thoughts.",
    description: "Anxiety and Obsessive-Compulsive Disorder (OCD) can be overwhelming. Our targeted approach combines medication and specialized therapeutic techniques to restore your peace of mind.",
    causes: [
      { icon: BrainCircuit, title: "Overactive Amygdala", description: "Heightened fear response and hypervigilance in the brain's emotional center." },
      { icon: Activity, title: "Intrusive Thoughts", description: "Persistent, unwanted thoughts that drive compulsive behaviors." },
      { icon: ShieldAlert, title: "Environmental Triggers", description: "Stressful life events that precipitate or worsen anxiety symptoms." }
    ],
    treatments: [
      { title: "Exposure and Response Prevention (ERP)", description: "The gold standard psychological treatment for OCD." },
      { title: "Targeted Pharmacotherapy", description: "Use of SSRIs and other medications to reduce anxiety intensity." },
      { title: "Mindfulness-Based Techniques", description: "Skills training to anchor yourself in the present moment and reduce panic." }
    ]
  },
  "de-addiction": {
    title: "Alcohol & Drug De-Addiction",
    badge: "Rehabilitation Services",
    heroHeadline: "A New Beginning: Comprehensive De-Addiction",
    heroSubtext: "Inpatient rehabilitation and outpatient support at Ashakiran Rehabilitation Centre & Sanmitra Manas.",
    description: "Substance use disorders require compassionate, medically supervised care. We provide safe detoxification, rehabilitation, and long-term relapse prevention strategies.",
    causes: [
      { icon: BrainCircuit, title: "Dopamine Dysregulation", description: "Substances altering the brain's reward pathway leading to dependency." },
      { icon: ShieldAlert, title: "Self-Medication", description: "Using substances to cope with underlying trauma or psychiatric conditions." },
      { icon: Activity, title: "Physiological Dependence", description: "The body adapting to the substance, resulting in withdrawal symptoms." }
    ],
    treatments: [
      { title: "Medically Supervised Detox", description: "Safe and comfortable withdrawal management." },
      { title: "Inpatient Rehabilitation", description: "Structured residential programs for intensive recovery support." },
      { title: "Relapse Prevention Therapy", description: "Ongoing counseling and support groups to maintain long-term sobriety." }
    ]
  },
  "mind-gym": {
    title: "Happiness 20 – Mind Gym",
    badge: "Mental Fitness",
    heroHeadline: "Transform Your Stress in 20 Minutes a Day",
    heroSubtext: "A guided mental fitness program designed to build resilience, focus, and lasting emotional well-being.",
    description: "Physical fitness requires the gym, and mental fitness requires consistent practice. The Happiness 20 Mind Gym is a daily 20-minute protocol to optimize your psychological health.",
    causes: [
      { icon: BrainCircuit, title: "Mental Fatigue", description: "Exhaustion from constant decision-making and cognitive overload." },
      { icon: HeartPulse, title: "Burnout", description: "Emotional depletion from sustained professional or personal stress." },
      { icon: ShieldCheck, title: "Lack of Focus", description: "Difficulty concentrating due to a fragmented attention span." }
    ],
    treatments: [
      { title: "Guided Meditation", description: "Daily audio-guided sessions to calm the nervous system." },
      { title: "Cognitive Restructuring", description: "Quick exercises to reframe challenges and build optimism." },
      { title: "Resilience Training", description: "Techniques to recover faster from setbacks and maintain peak performance." }
    ]
  }
};

export default function ConditionDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  let slugKey = resolvedParams.slug;
  
  // Backwards compatibility for legacy short aliases
  if (slugKey === "ed") slugKey = "erectile-dysfunction";
  if (slugKey === "pe") slugKey = "premature-ejaculation";

  const data = conditionDataMap[slugKey];

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden bg-muted/30">
        <div className="absolute top-0 left-0 w-full lg:w-1/2 h-full bg-rose-500/5 -z-10 lg:rounded-br-[120px]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-700 font-semibold text-sm mb-6 border border-rose-200">
                <Zap className="w-4 h-4" />
                {data.badge}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.1] mb-6">
                {data.heroHeadline}
              </h1>

              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
                {data.heroSubtext}
              </p>

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
                  src="/images/lifestyle_couple.png"
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

      {/* Understanding Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-6">Understanding the Condition</h2>
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

      {/* Treatments Section */}
      <section className="py-20 bg-muted/40 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Targeted <span className="text-primary italic">Treatment Options</span></h2>
            <p className="text-muted-foreground text-base">Physician-guided medical and therapeutic protocols.</p>
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
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Confidential & Expert Care</h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Schedule a discrete consultation with our psychiatric and psychosexual medical team.
            </p>
            <BookNowButton className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "rounded-full px-10 py-5 text-base font-bold shadow-xl hover:scale-105 transition-transform")}>
              Get Started
            </BookNowButton>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
