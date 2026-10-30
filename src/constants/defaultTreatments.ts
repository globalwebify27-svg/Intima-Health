import { TOPIC_FAQS } from "./topicFaqs";

export interface TreatmentDetailData {
  title: string;
  slug: string;
  type: "treatment" | "sexual-problem";
  badge: string;
  doctor: string;
  leadDoctorRole: string;
  heroHeadline: string;
  heroSubtext: string;
  heroImage?: string;
  description: string;
  causes: {
    icon: string;
    title: string;
    description?: string;
    points?: string[];
  }[];
  treatments: {
    title: string;
    description: string;
  }[];
  faqs?: {
    question: string;
    answer: string;
  }[];
  cta?: {
    headline: string;
    subtext: string;
    buttonText: string;
  };
}

export const DEFAULT_TREATMENTS_MAP: Record<string, TreatmentDetailData> = {
  // 1. Depression
  "treatment-of-depression": {
    title: "Treatment of Depression",
    slug: "treatment-of-depression",
    type: "treatment",
    badge: "Clinical Psychiatry & Emotional Health",
    doctor: "Dr. Deepak Kelkar",
    leadDoctorRole: "Senior Psychiatrist & Founder",
    heroHeadline: "Clinical Care & Compassionate Support for Depression",
    heroSubtext: "Personalized psychiatric assessment, medical management, and evidence-based psychotherapy to restore emotional well-being and daily functioning.",
    heroImage: "/images/doctor_1.png",
    description: "Depression is a medical condition affecting mood, thoughts, energy levels, and physical health. With over 44 years of clinical experience, Dr. Kelkar Hospital provides comprehensive diagnostic evaluation, medical therapies, and counseling tailored to individual needs.",
    causes: [
      {
        icon: "BrainCircuit",
        title: "Neurochemical Factors",
        description: "Imbalances in key neurotransmitters like serotonin and dopamine affecting mood regulation and emotional resilience.",
      },
      {
        icon: "Activity",
        title: "Chronic Stress & Life Events",
        description: "Prolonged stress, bereavement, relationship conflicts, or trauma that overwhelm psychological coping mechanisms.",
      },
      {
        icon: "HeartPulse",
        title: "Biological & Medical Conditions",
        description: "Hormonal shifts, chronic medical illnesses, or genetic predisposition influencing emotional stability.",
      },
    ],
    treatments: [
      {
        title: "Medical Psychiatric Management",
        description: "Evidence-based pharmacotherapy selected and monitored by qualified psychiatrists to alleviate core depressive symptoms.",
      },
      {
        title: "Cognitive Behavioural Therapy (CBT)",
        description: "Structured psychological therapy to identify negative thinking patterns, improve coping strategies, and rebuild motivation.",
      },
      {
        title: "Neuromodulation & rTMS Evaluation",
        description: "Advanced non-invasive repetitive Transcranial Magnetic Stimulation where clinically indicated for persistent depression.",
      },
    ],
    cta: {
      headline: "Begin Your Path to Emotional Well-Being",
      subtext: "Speak with our compassionate psychiatric team today in complete medical confidentiality.",
      buttonText: "Book a Consultation",
    },
  },

  // 2. Mania
  "mania": {
    title: "Mania (Bipolar Disorder)",
    slug: "mania",
    type: "treatment",
    badge: "Mood Disorders & Bipolar Care",
    doctor: "Dr. Deepak Kelkar",
    leadDoctorRole: "Senior Psychiatrist",
    heroHeadline: "Specialized Clinical Management for Mania & Bipolar Disorder",
    heroSubtext: "Comprehensive psychiatric stabilization, mood-regulation therapies, and family counseling to maintain emotional balance.",
    heroImage: "/images/doctor_2.png",
    description: "Mania and bipolar disorder involve significant shifts in mood, energy, activity levels, and judgment. We provide rapid stabilization, maintenance therapy, and relapse prevention strategies.",
    causes: [
      {
        icon: "Activity",
        title: "Neurobiological Vulnerability",
        description: "Genetic and biochemical factors that regulate circadian rhythms, dopamine pathways, and neurological excitability.",
      },
      {
        icon: "Clock",
        title: "Sleep Disruption & Stress Triggers",
        description: "Irregular sleep patterns, high-stress milestones, or stimulant exposure precipitating manic episodes.",
      },
      {
        icon: "ShieldAlert",
        title: "Emotional & Environmental Pressures",
        description: "Significant life transitions or unmanaged psychological distress triggering mood elevation.",
      },
    ],
    treatments: [
      {
        title: "Mood Stabilization Therapy",
        description: "Targeted mood stabilizers and atypical antipsychotic medications carefully calibrated for stability.",
      },
      {
        title: "Psychoeducation & Relapse Prevention",
        description: "Helping patients and families recognize early warning signs and maintain regular sleep-wake cycles.",
      },
      {
        title: "Inpatient Stabilization When Needed",
        description: "Safe, supportive inpatient admission at Kelkar Hospital and Sanmitra Hospital under cashless schemes.",
      },
    ],
  },

  // 3. Anxiety
  "treatment-of-anxiety": {
    title: "Treatment of Anxiety",
    slug: "treatment-of-anxiety",
    type: "treatment",
    badge: "Anxiety Disorders & Stress Relief",
    doctor: "Dr. Deepak Kelkar",
    leadDoctorRole: "Senior Psychiatrist",
    heroHeadline: "Evidence-Based Treatment for Anxiety & Chronic Worry",
    heroSubtext: "Clinical therapies, relaxation protocols, and personalized psychiatric care to overcome debilitating tension and fear.",
    heroImage: "/images/doctor_3.png",
    description: "Generalized Anxiety Disorder (GAD) causes persistent, excessive worry about everyday events. Our treatment combines medical interventions with practical psychological tools to regain calm and confidence.",
    causes: [
      {
        icon: "BrainCircuit",
        title: "Autonomic Hyperarousal",
        description: "Overactive sympathetic nervous system triggering fight-or-flight responses, palpitations, and restlessness.",
      },
      {
        icon: "ShieldAlert",
        title: "Cognitive Overthinking",
        description: "Catastrophic thinking patterns and heightened sensitivity to perceived uncertainty or risk.",
      },
      {
        icon: "HeartPulse",
        title: "Lifestyle & Stress Overload",
        description: "Workplace burnout, chronic relationship tension, or lack of restorative rest amplifying anxiety.",
      },
    ],
    treatments: [
      {
        title: "Anxiolytic & Medical Therapy",
        description: "Judicious, non-habit forming medications to relieve physical tension, panic vulnerability, and insomnia.",
      },
      {
        title: "Cognitive Behavioural Therapy",
        description: "Targeted exercises to challenge catastrophic assumptions, manage worry, and practice progressive muscle relaxation.",
      },
      {
        title: "Mindfulness & Stress Management",
        description: "Actionable breathing techniques and sleep hygiene optimization for long-term nervous system resilience.",
      },
    ],
  },

  // 4. OCD
  "treatment-of-ocd": {
    title: "Treatment of OCD (Obsessive-Compulsive Disorder)",
    slug: "treatment-of-ocd",
    type: "treatment",
    badge: "Obsessive-Compulsive Disorder Care",
    doctor: "Dr. Deepak Kelkar",
    leadDoctorRole: "Senior Psychiatrist",
    heroHeadline: "Clinical Assessment & Evidence-Based Care for OCD",
    heroSubtext: "Specialized ERP therapy protocols, neuromodulation, and psychiatric management for persistent obsessive thoughts and compulsions.",
    heroImage: "/images/doctor_1.png",
    description: "OCD is characterized by intrusive, distressing thoughts (obsessions) and repetitive behaviors (compulsions). We provide structured, time-tested psychiatric protocols to break the obsessive-compulsive cycle.",
    causes: [
      {
        icon: "BrainCircuit",
        title: "Cortico-Striato-Thalamo-Cortical Loop",
        description: "Neurobiological variations in brain circuitry responsible for error detection and behavioral habituation.",
      },
      {
        icon: "ClipboardList",
        title: "Compulsive Habit Reinforcement",
        description: "Temporary anxiety relief from compulsions inadvertently reinforcing intrusive thoughts over time.",
      },
      {
        icon: "ShieldAlert",
        title: "Genetic & Neurochemical Factors",
        description: "Family history and serotonin receptor sensitivity contributing to obsessive vulnerability.",
      },
    ],
    treatments: [
      {
        title: "Exposure & Response Prevention (ERP)",
        description: "Gold-standard behavioral therapy helping patients face triggers gradually without performing compulsions.",
      },
      {
        title: "Serotonergic Pharmacotherapy",
        description: "High-efficacy psychiatric medications tailored to decrease intrusive thought intensity.",
      },
      {
        title: "Advanced rTMS Therapy",
        description: "Repetitive Transcranial Magnetic Stimulation targeting specific brain regions for treatment-resistant OCD.",
      },
    ],
  },

  // 5. Phobia
  "treatment-of-phobia": {
    title: "Treatment of Phobia",
    slug: "treatment-of-phobia",
    type: "treatment",
    badge: "Phobia & Specific Anxiety",
    doctor: "Dr. Deepak Kelkar",
    leadDoctorRole: "Senior Psychiatrist",
    heroHeadline: "Overcome Debilitating Phobias with Structured Desensitization",
    heroSubtext: "Guided exposure therapy, cognitive reframing, and supportive care to conquer irrational fears and live freely.",
    heroImage: "/images/doctor_2.png",
    description: "Phobias involve an intense, irrational fear of specific objects, situations, or environments. We provide structured desensitization protocols to help you regain freedom of movement and emotional peace.",
    causes: [
      {
        icon: "ShieldAlert",
        title: "Conditioned Fear Response",
        description: "Learned associations between specific stimuli and overwhelming emotional panic.",
      },
      {
        icon: "Activity",
        title: "Traumatic Past Experiences",
        description: "Prior adverse events involving heights, animals, medical procedures, or social humiliation.",
      },
      {
        icon: "BrainCircuit",
        title: "Genetic Anxiety Predisposition",
        description: "Heightened amygdala reactivity predisposing individuals to specific phobic triggers.",
      },
    ],
    treatments: [
      {
        title: "Systematic Desensitization",
        description: "Step-by-step gradual exposure to feared situations under safe, compassionate clinical supervision.",
      },
      {
        title: "Cognitive Restructuring",
        description: "Identifying and replacing irrational catastrophic beliefs with balanced, realistic appraisals.",
      },
      {
        title: "Supportive Pharmacotherapy",
        description: "Short-term medical relief for situational anxiety during necessary travel or unavoidable exposure.",
      },
    ],
  },

  // 6. Panic Attacks
  "treatment-of-panic-attacks": {
    title: "Treatment of Panic Attacks",
    slug: "treatment-of-panic-attacks",
    type: "treatment",
    badge: "Panic Disorder & Agoraphobia",
    doctor: "Dr. Deepak Kelkar",
    leadDoctorRole: "Senior Psychiatrist",
    heroHeadline: "Regain Control: Treatment for Panic Attacks & Disorder",
    heroSubtext: "Emergency coping skills, cognitive therapy, and medical stabilization to stop recurring panic episodes.",
    heroImage: "/images/doctor_3.png",
    description: "Panic attacks are sudden surges of overwhelming fear accompanied by rapid heartbeat, shortness of breath, and dizziness. Our clinical approach eliminates anticipatory fear and stops panic recurrence.",
    causes: [
      {
        icon: "HeartPulse",
        title: "Misinterpretation of Bodily Sensations",
        description: "Normal physiological sensations (like heart racing) misinterpreted as imminent catastrophe.",
      },
      {
        icon: "BrainCircuit",
        title: "Autonomic Surge",
        description: "Sudden release of stress hormones without an external threat, triggering intense fight-or-flight sensations.",
      },
      {
        icon: "ShieldAlert",
        title: "Anticipatory Fear & Avoidance",
        description: "Fear of having another attack causing behavioral avoidance of public places or driving.",
      },
    ],
    treatments: [
      {
        title: "Panic Control Therapy (PCT)",
        description: "Targeted psychological techniques to desensitize bodily sensations and break the panic escalation cycle.",
      },
      {
        title: "Stabilizing Pharmacotherapy",
        description: "Modern psychiatric medications to stabilize autonomic sensitivity and prevent recurring attacks.",
      },
      {
        title: "Interoceptive Exposure",
        description: "Controlled exercises to build tolerance for harmless physical sensations and remove terror.",
      },
    ],
  },

  // 7. Alcohol Addiction
  "treatment-of-alcohol-addiction": {
    title: "Treatment of Alcohol Addiction",
    slug: "treatment-of-alcohol-addiction",
    type: "treatment",
    badge: "Inpatient De-Addiction & Detoxification",
    doctor: "Dr. Deepak Kelkar",
    leadDoctorRole: "Medical Director & Addiction Specialist",
    heroHeadline: "Medical Detoxification & Comprehensive Alcohol Rehabilitation",
    heroSubtext: "Compassionate residential care at Ashakiran Rehabilitation Centre & Sanmitra Manas Hospital, with cashless government scheme coverage.",
    heroImage: "/images/ashakiran_center.jpg",
    description: "Alcohol dependence is a treatable chronic disease. Our network provides medically supervised detoxification, withdrawal management, psychological counseling, and long-term relapse prevention.",
    causes: [
      {
        icon: "FlaskConical",
        title: "Neurochemical Dependence",
        description: "Alcohol altering GABA and dopamine receptors, causing physical tolerance and withdrawal symptoms upon cessation.",
      },
      {
        icon: "Activity",
        title: "Psychological Self-Medication",
        description: "Using alcohol to cope with underlying anxiety, depression, trauma, or emotional pain.",
      },
      {
        icon: "Users",
        title: "Social & Environmental Factors",
        description: "Habitual patterns, peer dynamics, and chronic life stress reinforcing daily substance use.",
      },
    ],
    treatments: [
      {
        title: "Medically Supervised Detoxification",
        description: "Safe 24/7 medical management to prevent delirium tremens, seizures, and severe withdrawal distress.",
      },
      {
        title: "Residential Rehabilitation Programs",
        description: "Structured recovery environments at Ashakiran Centre and Sanmitra Hospital with group and individual counseling.",
      },
      {
        title: "Cashless Government Scheme Admission",
        description: "100% cashless treatment for eligible PM-JAY and MJPJAY card holders, covering bed, food, medicines, and doctors.",
      },
    ],
  },

  // 8. Schizophrenia
  "schizophrenia": {
    title: "Schizophrenia Treatment",
    slug: "schizophrenia",
    type: "treatment",
    badge: "Complex Psychiatric & Psychosis Care",
    doctor: "Dr. Deepak Kelkar",
    leadDoctorRole: "Senior Psychiatrist",
    heroHeadline: "Comprehensive Clinical Care & Support for Schizophrenia",
    heroSubtext: "Antipsychotic medication management, psychiatric rehabilitation, and family guidance for long-term stability and dignity.",
    heroImage: "/images/sanmitra_hospital.jpg",
    description: "Schizophrenia is a serious mental health condition that affects thinking, perception, emotional responsiveness, and social interactions. With modern medical care, structured therapy, and dedicated family support, individuals can experience significant symptom relief and meaningful recovery.",
    causes: [
      {
        icon: "BrainCircuit",
        title: "Neurochemical Dysregulation",
        description: "Altered dopamine and glutamate signaling pathways influencing thought clarity, hallucinations, and delusions.",
      },
      {
        icon: "Activity",
        title: "Genetic & Developmental Factors",
        description: "Hereditary predisposition combined with early neurodevelopmental influences.",
      },
      {
        icon: "ShieldAlert",
        title: "Environmental Stressors",
        description: "Significant life stress or substance exposure triggering initial psychotic episodes in vulnerable individuals.",
      },
    ],
    treatments: [
      {
        title: "Advanced Antipsychotic Management",
        description: "Modern second-generation medications and long-acting depot injections to resolve active symptoms with minimal side effects.",
      },
      {
        title: "Family Psychoeducation & Counseling",
        description: "Equipping family caregivers with practical skills to support their loved ones and reduce relapse risks.",
      },
      {
        title: "Psychiatric Hospitalization & Cashless Care",
        description: "Safe inpatient care under MJPJAY / Ayushman Bharat schemes at Sanmitra Hospital, Akola.",
      },
    ],
  },

  // 9. Erectile Dysfunction
  "erectile-dysfunction": {
    title: "Erectile Dysfunction",
    slug: "erectile-dysfunction",
    type: "sexual-problem",
    badge: "Clinical Vascular & Psychosexual Care",
    doctor: "Dr. Deepak Kelkar",
    leadDoctorRole: "Senior Specialist in Psychosexual Medicine",
    heroHeadline: "Restore Firmness, Stamina, and Intimate Confidence",
    heroSubtext: "Physician-guided diagnosis and evidence-based treatment plans for ED led by our expert medical team in total confidentiality.",
    heroImage: "/images/doctor_1.png",
    description: "Erectile Dysfunction (ED) is common and treatable. It can stem from physical vascular factors, neurological pathways, hormonal shifts, or performance anxiety. We provide comprehensive clinical evaluation and tailored medical therapy.",
    causes: [
      {
        icon: "Activity",
        title: "Vascular Restricted Blood Flow",
        description: "Reduced arterial inflow impacting erection firmness and duration.",
      },
      {
        icon: "BrainCircuit",
        title: "Stress & Performance Anxiety",
        description: "High cortisol and sympathetic adrenaline spikes blocking parasympathetic erection triggers.",
      },
      {
        icon: "HeartPulse",
        title: "Hormonal & Metabolic Factors",
        description: "Low serum testosterone, diabetes, or hypertension impacting erectile physiology.",
      },
    ],
    treatments: [
      {
        title: "Pharmacotherapy Protocols",
        description: "Tailored prescription medical protocols suited to your overall cardiovascular and medical history.",
      },
      {
        title: "Hormone Optimization Therapy",
        description: "Targeted hormonal assessment and medical replacement therapy where clinically indicated.",
      },
      {
        title: "Psychosexual Counseling",
        description: "Cognitive guidance to eliminate performance pressure, anxiety loops, and intimacy tension.",
      },
    ],
  },

  // 10. Premature Ejaculation
  "premature-ejaculation": {
    title: "Premature Ejaculation",
    slug: "premature-ejaculation",
    type: "sexual-problem",
    badge: "Endurance & Sensitivity Care",
    doctor: "Dr. Deepak Kelkar",
    leadDoctorRole: "Senior Specialist in Psychosexual Medicine",
    heroHeadline: "Clinical Treatment for Premature Ejaculation & Ejaculatory Control",
    heroSubtext: "Scientific therapies, sensitivity modulation, and behavioral techniques to improve endurance and sexual confidence.",
    heroImage: "/images/doctor_2.png",
    description: "Premature Ejaculation (PE) is the most frequent intimate concern among men. It involves difficulty controlling the timing of ejaculation. Our specialized clinical protocols restore natural endurance and mutual satisfaction.",
    causes: [
      {
        icon: "BrainCircuit",
        title: "Central Serotonergic Sensitivity",
        description: "Variations in central serotonin receptor pathways governing the ejaculatory reflex threshold.",
      },
      {
        icon: "Activity",
        title: "Performance Pressure & Anxiety",
        description: "Heightened nervous excitement or hurry conditioning during early sexual experiences.",
      },
      {
        icon: "ShieldCheck",
        title: "Penile Hypersensitivity",
        description: "Heightened nerve sensitivity in the glans penis triggering involuntary rapid reflex responses.",
      },
    ],
    treatments: [
      {
        title: "Evidence-Based Medical Therapy",
        description: "Clinically proven prescription treatments that prolong ejaculatory latency safely and effectively.",
      },
      {
        title: "Behavioral & Sensory Exercises",
        description: "Stop-start and squeeze techniques combined with sensate focus exercises for enhanced control.",
      },
      {
        title: "Couples & Intimacy Guidance",
        description: "Joint counseling to reduce relationship anxiety and build mutual intimacy satisfaction.",
      },
    ],
  },
};

export const TREATMENT_SLUGS = [
  "treatment-of-depression",
  "mania",
  "treatment-of-anxiety",
  "treatment-of-ocd",
  "treatment-of-phobia",
  "treatment-of-panic-attacks",
  "treatment-of-hysteria",
  "child-and-adolescent-psychiatry",
  "geriatric-psychiatry",
  "schizophrenia",
  "ibs",
  "cognitive-behavioural-therapy",
  "treatment-of-alcohol-addiction",
  "nicotine-de-addiction",
  "brown-sugar-de-addiction",
];

export const SEXUAL_PROBLEM_SLUGS = [
  "premature-ejaculation",
  "erectile-dysfunction",
  "sexual-performance-anxiety",
  "sexually-transmitted-infections",
  "precum",
  "nocturnal-emissions",
  "masturbation-habit",
  "infertility",
  "homosexuality-counseling",
  "couple-therapy",
];

export const ALL_CLINICAL_SLUGS = [...TREATMENT_SLUGS, ...SEXUAL_PROBLEM_SLUGS];

/**
 * Helper that returns fallback data if DB does not have the slug
 */
export function getFallbackTreatment(slug: string): TreatmentDetailData | null {
  const direct = DEFAULT_TREATMENTS_MAP[slug];
  if (direct) {
    const faqs = TOPIC_FAQS[slug] || [];
    return {
      ...direct,
      faqs: faqs.length > 0 ? faqs : direct.faqs,
    };
  }

  // If slug is not a recognized treatment, sexual problem, or topic with FAQs, return null
  const isKnown = ALL_CLINICAL_SLUGS.includes(slug) || slug in TOPIC_FAQS;
  if (!isKnown) {
    return null;
  }

  // Generalized fallback for known clinical topics
  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const faqs = TOPIC_FAQS[slug] || [];

  return {
    title,
    slug,
    type: slug.includes("sexual") || slug.includes("ejaculation") || slug.includes("erectile") ? "sexual-problem" : "treatment",
    badge: "Specialized Clinical Care",
    doctor: "Dr. Deepak Kelkar",
    leadDoctorRole: "Senior Specialist & Founder",
    heroHeadline: `Comprehensive Clinical Care for ${title}`,
    heroSubtext: `Individualized psychiatric assessment, medical therapies, and counseling protocols led by experienced clinicians at KELKAR MANAS HEALTH CARE.`,
    heroImage: "/images/doctor_1.png",
    description: `Professional clinical evaluation and evidence-based treatment plans for ${title}. We offer complete confidentiality and patient-centered healthcare.`,
    causes: [
      {
        icon: "BrainCircuit",
        title: "Neurochemical & Biological Factors",
        description: "Physiological and neurological pathways affecting emotional and clinical health.",
      },
      {
        icon: "Activity",
        title: "Stress & Environmental Triggers",
        description: "Lifestyle pressures, chronic stress, or psychological factors precipitating symptoms.",
      },
      {
        icon: "ShieldCheck",
        title: "Individual Clinical Sensitivity",
        description: "Unique genetic, emotional, and physical factors influencing disease progression.",
      },
    ],
    treatments: [
      {
        title: "Comprehensive Clinical Assessment",
        description: "Thorough diagnostic evaluation by qualified specialists to identify underlying causes.",
      },
      {
        title: "Personalized Evidence-Based Treatment",
        description: "Individualized medical management and therapeutic protocols tailored to your recovery goals.",
      },
      {
        title: "Follow-Up & Long-Term Care",
        description: "Ongoing guidance, relapse prevention strategies, and compassionate clinical support.",
      },
    ],
    faqs,
  };
}
