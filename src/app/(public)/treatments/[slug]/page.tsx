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
  causes: { icon: any; title: string; description?: string; points?: string[] }[];
  treatments: { title: string; description: string }[];
  cta?: { headline: string; subtext: string; buttonText: string };
}

const serviceDataMap: Record<string, ServiceDetails> = {
  "treatment-of-depression": {
    title: "Depression",
    badge: "Clinical Psychiatry & Mind Wellness",
    doctor: "Clinical Team",
    leadDoctorRole: "Psychiatrists & Specialists",
    heroHeadline: "Depression",
    heroSubtext: "Depression is a common and treatable mental health condition that affects mood, thoughts, behaviour, sleep, energy, relationships and daily functioning. It is more than temporary sadness.",
    description: "When symptoms persist and interfere with personal, professional or social life, professional assessment is important. Depression can occur after stress, loss, illness or major life changes, but sometimes there is no obvious trigger. It can affect anyone and is not a sign of weakness. With appropriate treatment, many people recover and regain a fulfilling life.",
    causes: [
      {
        icon: BrainCircuit,
        title: "Emotional & Cognitive Symptoms",
        points: [
          "Persistent sadness or low mood",
          "Loss of interest or pleasure",
          "Difficulty concentrating or making decisions",
          "Feelings of guilt, worthlessness or hopelessness",
          "Irritability or social withdrawal",
          "Reduced motivation and self-confidence",
          "Thoughts of death or self-harm"
        ]
      },
      {
        icon: Activity,
        title: "Physical & Behavioural Symptoms",
        points: [
          "Low energy and fatigue",
          "Sleep problems",
          "Changes in appetite or weight",
          "Loss of sexual interest",
          "Unexplained physical complaints"
        ]
      },
      {
        icon: ShieldCheck,
        title: "When to Seek Help",
        description: "Consult a psychiatrist if symptoms persist, interfere with daily life, or are associated with severe hopelessness, substance use or thoughts of self-harm. If you have suicidal thoughts or feel unable to keep yourself safe, seek urgent medical or emergency help immediately and stay with a trusted person."
      }
    ],
    treatments: [
      { title: "Modern Medicines", description: "Antidepressant medicines, including SSRIs, SNRIs and other newer medications, may be prescribed when clinically indicated." },
      { title: "Psychotherapy & CBT", description: "Treatment is personalised according to the severity and individual needs of the patient. Cognitive Behaviour Therapy (CBT) helps patients reframe negative thought patterns." },
      { title: "Counselling", description: "Counselling provides a confidential and supportive environment to address emotional difficulties, relationship problems, grief, stress and major life changes." },
      { title: "Clinical Hypnotherapy & Lifestyle Support", description: "Used alongside personalised care as part of a comprehensive and holistic recovery approach." }
    ],
    cta: {
      headline: "Start Your Treatment",
      subtext: "Consult a Psychiatrist. With appropriate treatment, many people recover and regain a fulfilling life.",
      buttonText: "Book an Appointment"
    }
  },
  "treatment-of-anxiety": {
    title: "Anxiety",
    badge: "Anxiety Care",
    doctor: "Clinical Team",
    leadDoctorRole: "Psychiatrists & Specialists",
    heroHeadline: "Anxiety",
    heroSubtext: "Anxiety is a normal emotional response to stress, uncertainty or perceived danger. However, when excessive fear, worry or nervousness becomes persistent and starts interfering with daily life, relationships, sleep or work, it may indicate an anxiety disorder.",
    description: "Anxiety disorders are common and treatable. With proper diagnosis and an individualised treatment plan, many people can achieve significant improvement and regain confidence and quality of life. Symptoms vary from person to person and may occur occasionally or persist for months.",
    causes: [
      {
        icon: BrainCircuit,
        title: "Emotional & Cognitive Symptoms",
        points: [
          "Excessive or uncontrollable worry",
          "Persistent fear or nervousness",
          "Restlessness and feeling constantly “on edge”",
          "Difficulty concentrating",
          "Irritability"
        ]
      },
      {
        icon: Activity,
        title: "Physical Symptoms",
        points: [
          "Rapid heartbeat or palpitations",
          "Sweating or trembling",
          "Shortness of breath",
          "Muscle tension",
          "Dizziness or stomach discomfort",
          "Fatigue"
        ]
      },
      {
        icon: ShieldCheck,
        title: "Behavioural & Severe Symptoms",
        points: [
          "Sleep disturbances",
          "Panic attacks",
          "Avoidance of situations due to fear"
        ]
      }
    ],
    treatments: [
      { title: "Modern Medicines", description: "Anti-anxiety medicines and antidepressants may be prescribed when clinically indicated. SSRIs and SNRIs are commonly used for several anxiety disorders, while other medicines may be considered in specific situations." },
      { title: "Cognitive Behaviour Therapy (CBT)", description: "CBT is an established psychological treatment for anxiety. It helps identify unhelpful thoughts and behaviours that maintain anxiety and gradually develop more balanced thinking and healthier responses. CBT may include exposure-based techniques, relaxation strategies, behavioural exercises and problem-solving." },
      { title: "Psychotherapy, Counselling & Clinical Hypnotherapy", description: "Additional psychological approaches used alongside CBT to help address specific fears, manage emotional distress, and promote relaxation." },
      { title: "RTMS", description: "Repetitive Transcranial Magnetic Stimulation (rTMS) is a non-invasive brain stimulation treatment. It uses magnetic pulses to stimulate specific areas of the brain. rTMS is primarily established for certain conditions such as depression, while its use in anxiety may be considered in selected cases depending on the clinical situation and available evidence. A psychiatrist should determine whether it is appropriate." }
    ],
    cta: {
      headline: "Start Your Treatment",
      subtext: "Consult a Psychiatrist. With proper diagnosis and an individualised treatment plan, you can regain your confidence and quality of life.",
      buttonText: "Book an Appointment"
    }
  },
  "treatment-of-ocd": {
    title: "OCD",
    badge: "Obsessive-Compulsive Disorder",
    doctor: "Clinical Team",
    leadDoctorRole: "Psychiatrists & Specialists",
    heroHeadline: "OCD Obsessive-Compulsive Disorder",
    heroSubtext: "OCD is a common and treatable mental health condition characterised by obsessions, compulsions, or both. Obsessions are unwanted, intrusive and repetitive thoughts, images or urges that cause anxiety or distress.",
    description: "Compulsions are repetitive behaviours or mental acts that a person feels driven to perform to reduce anxiety or prevent a feared event. Common examples include repeated checking, excessive washing or cleaning, arranging objects, seeking reassurance, counting, or repeatedly performing mental rituals.",
    causes: [
      {
        icon: BrainCircuit,
        title: "Obsessions",
        points: [
          "Fear of contamination or germs",
          "Fear of causing harm or making mistakes",
          "Repeated intrusive images or thoughts"
        ]
      },
      {
        icon: Activity,
        title: "Compulsions",
        points: [
          "Excessive washing or cleaning",
          "Repeated checking",
          "Counting or repeating actions",
          "Mental rituals or repeated prayers"
        ]
      },
      {
        icon: ShieldCheck,
        title: "Insight & Awareness",
        description: "The person usually recognises that these thoughts or behaviours are excessive or unreasonable, but may still find them extremely difficult to control."
      }
    ],
    treatments: [
      { title: "Modern Medicines", description: "SSRIs (Selective Serotonin Reuptake Inhibitors) are commonly used as first-line medications for OCD. In some patients, other medications or augmentation strategies may be considered by the psychiatrist. OCD may require adequate doses and a longer treatment duration than some other conditions. Medication should always be prescribed and monitored by a qualified psychiatrist." },
      { title: "Cognitive Behaviour Therapy (CBT) & ERP", description: "Exposure and Response Prevention (ERP) is a specialised form of CBT and one of the key evidence-based psychological treatments for OCD. Under professional guidance, the patient is gradually exposed to situations or thoughts that trigger anxiety while learning to resist performing the usual compulsion. Over time, this can help reduce anxiety and weaken the cycle of obsession and compulsion. ERP should be conducted gradually and according to the individual's clinical condition." },
      { title: "Psychotherapy, Counselling & Clinical Hypnotherapy", description: "Used as supportive therapies to address underlying anxiety and improve coping mechanisms." },
      { title: "rTMS", description: "Repetitive Transcranial Magnetic Stimulation (rTMS) is a non-invasive brain stimulation treatment that uses magnetic pulses to stimulate specific brain regions. rTMS may be considered in selected patients, particularly when OCD symptoms remain significant despite standard treatments. Suitability should be assessed by a psychiatrist." }
    ],
    cta: {
      headline: "Start OCD Treatment",
      subtext: "Consult a Psychiatrist. OCD is treatable, and treatment is usually most effective when it is structured and continued for an appropriate duration.",
      buttonText: "Book an Appointment"
    }
  },
  "treatment-of-alcohol-addiction": {
    title: "Alcohol Addiction",
    badge: "De-Addiction Specialists",
    doctor: "Clinical Team",
    leadDoctorRole: "Psychiatrists & Specialists",
    heroHeadline: "Alcohol Addiction",
    heroSubtext: "Alcohol addiction, clinically known as Alcohol Use Disorder (AUD), is a medical condition in which a person has difficulty controlling alcohol use despite its harmful effects on health, relationships, work or daily life.",
    description: "Alcohol withdrawal can sometimes be dangerous, with symptoms including tremors, sweating, agitation, seizures or delirium. People with significant dependence should not abruptly stop heavy alcohol use without medical assessment.",
    causes: [
      {
        icon: BrainCircuit,
        title: "Behavioural & Psychological",
        points: [
          "Strong craving or urge to drink",
          "Difficulty controlling the amount or frequency of drinking",
          "Repeated unsuccessful attempts to reduce or stop alcohol",
          "Spending significant time obtaining, drinking or recovering from alcohol"
        ]
      },
      {
        icon: Activity,
        title: "Physical Impacts",
        points: [
          "Increasing tolerance and needing more alcohol for the same effect",
          "Withdrawal symptoms when alcohol use is reduced or stopped",
          "Memory problems or blackouts",
          "Continuing to drink despite physical or psychological problems"
        ]
      },
      {
        icon: ShieldCheck,
        title: "Social & Lifestyle Impacts",
        points: [
          "Neglecting work, family or social responsibilities",
          "Loss of interest in previously enjoyable activities",
          "Relationship or financial problems related to drinking",
          "Drinking alone or hiding alcohol consumption"
        ]
      }
    ],
    treatments: [
      { title: "Supervised Medical Withdrawal", description: "Supervised withdrawal treatment may involve appropriate medicines, nutritional support, hydration and monitoring. Medicines such as naltrexone, acamprosate or disulfiram may be considered for relapse prevention in suitable patients." },
      { title: "Psychotherapy, CBT & Counselling", description: "Psychotherapy, Cognitive Behaviour Therapy (CBT), and Counselling form the foundation of psychological recovery, helping patients identify triggers and develop healthy coping mechanisms." },
      { title: "Clinical Hypnotherapy", description: "Clinical hypnotherapy may be used as a complementary intervention for selected patients to support relaxation, motivation and stress management. It should not replace medical treatment or evidence-based addiction therapy." },
      { title: "rTMS", description: "Repetitive Transcranial Magnetic Stimulation (rTMS) is a non-invasive brain stimulation technique. Research into its role in substance-use disorders is ongoing, and it may be considered only in selected clinical situations after specialist assessment. It is not a substitute for established alcohol-dependence treatment." }
    ],
    cta: {
      headline: "Alcohol De-addiction Treatment",
      subtext: "Consult a Psychiatrist. People with significant dependence should not abruptly stop heavy alcohol use without medical assessment.",
      buttonText: "Book an Appointment"
    }
  },
  "treatment-of-phobia": {
    title: "Phobia",
    badge: "Phobia Care",
    doctor: "Clinical Team",
    leadDoctorRole: "Psychiatrists & Specialists",
    heroHeadline: "Phobia Is Treatable",
    heroSubtext: "A phobia does not have to control your life. With appropriate professional assessment and structured treatment, fear and avoidance can often be significantly reduced.",
    description: "A phobia is an intense and persistent fear of a specific object, situation, animal or activity that is disproportionate to the actual danger. The fear can be so strong that a person may avoid situations that trigger it, even when they understand that the fear is excessive. Common examples include fear of heights, flying, insects, animals, blood or injections, enclosed spaces, driving, social situations and certain medical procedures.",
    causes: [
      {
        icon: BrainCircuit,
        title: "Emotional Symptoms",
        points: [
          "Intense fear or panic",
          "Persistent anxiety",
          "Feeling of losing control",
          "Strong urge to escape",
          "Excessive worry before facing the feared situation"
        ]
      },
      {
        icon: Activity,
        title: "Physical Symptoms",
        points: [
          "Rapid heartbeat or palpitations",
          "Sweating",
          "Trembling or shaking",
          "Shortness of breath",
          "Feeling faint or light-headed"
        ]
      },
      {
        icon: UserCheck,
        title: "Behavioural Symptoms",
        points: [
          "Avoiding the feared object or situation",
          "Seeking reassurance or support",
          "Changing daily activities to avoid triggers",
          "Difficulty travelling, working or participating socially"
        ]
      }
    ],
    treatments: [
      { title: "Modern Medicines", description: "Depending on the clinical situation, antidepressants or other medications may be prescribed. Medication should always be selected and monitored by a qualified psychiatrist." },
      { title: "Cognitive Behaviour Therapy (CBT)", description: "CBT is an established psychological treatment for phobias. It helps patients identify fearful thoughts, understand how avoidance maintains anxiety and develop healthier responses." },
      { title: "Exposure Therapy", description: "Gradual, structured exposure to the feared situation is one of the most effective psychological approaches for many phobias." },
      { title: "Psychotherapy, Counselling & Clinical Hypnotherapy", description: "Regular follow-up helps monitor progress and build confidence while reducing avoidance." },
      { title: "rTMS", description: "Repetitive Transcranial Magnetic Stimulation (rTMS) is a non-invasive brain stimulation technique that uses magnetic pulses to stimulate specific brain areas." }
    ],
    cta: {
      headline: "Overcome Your Fear",
      subtext: "Consult a Psychiatrist. A phobia does not have to control your life. With appropriate professional assessment and structured treatment, fear and avoidance can often be significantly reduced.",
      buttonText: "Book an Appointment"
    }
  },
  "treatment-of-panic-attacks": {
    title: "Panic Attacks",
    badge: "Panic Attack Management",
    doctor: "Clinical Team",
    leadDoctorRole: "Psychiatrists & Specialists",
    heroHeadline: "Panic Attacks",
    heroSubtext: "A panic attack usually reaches its peak within minutes and gradually settles. Some people experience occasional panic attacks, while recurrent unexpected attacks along with persistent worry or behavioural changes may indicate Panic Disorder.",
    description: "A panic attack is a sudden episode of intense fear or severe discomfort that can occur unexpectedly, sometimes even when there is no immediate danger. The symptoms can feel frightening and may make a person believe that something serious is happening.",
    causes: [
      {
        icon: Activity,
        title: "Physical Symptoms",
        points: [
          "Rapid heartbeat or palpitations",
          "Chest discomfort",
          "Shortness of breath or feeling unable to breathe",
          "Sweating",
          "Trembling or shaking"
        ]
      },
      {
        icon: BrainCircuit,
        title: "Psychological Symptoms",
        points: [
          "Sudden intense fear or sense of impending danger",
          "Fear of losing control or “going crazy”",
          "Fear of dying"
        ]
      },
      {
        icon: ShieldCheck,
        title: "Medical Evaluation",
        description: "Symptoms can be very intense, even though the attack itself is usually not physically dangerous. However, new or severe chest pain, breathing difficulty or fainting should receive appropriate medical evaluation to rule out other medical causes."
      }
    ],
    treatments: [
      { title: "Modern Medicines", description: "Medicines may be prescribed when clinically indicated. SSRIs and SNRIs are commonly used for Panic Disorder and other anxiety conditions." },
      { title: "Cognitive Behaviour Therapy (CBT)", description: "CBT is an established psychological treatment for panic attacks and Panic Disorder. It helps patients understand the connection between physical sensations, fearful thoughts and panic. CBT can teach individuals to challenge catastrophic interpretations and develop healthier responses to bodily sensations." },
      { title: "Psychotherapy, Counselling & Clinical Hypnotherapy", description: "Additional supportive therapies used as part of a comprehensive treatment plan." },
      { title: "rTMS", description: "Repetitive Transcranial Magnetic Stimulation (rTMS) is a non-invasive brain stimulation technique using magnetic pulses to stimulate specific brain regions." }
    ],
    cta: {
      headline: "Get Help for Panic Attacks",
      subtext: "Consult a Psychiatrist. Treatment depends on the frequency and severity of attacks and whether Panic Disorder or another condition is present.",
      buttonText: "Book an Appointment"
    }
  },
  "treatment-of-hysteria": {
    title: "Hysteria",
    badge: "Conversion Disorder Therapy",
    doctor: "Clinical Team",
    leadDoctorRole: "Psychiatrists & Specialists",
    heroHeadline: "Hysteria",
    heroSubtext: "Holistic care for severe emotional dysregulation and functional neurological symptoms.",
    description: "Symptoms can vary considerably from person to person. While previously known as 'hysteria', these symptoms are often related to severe emotional distress or underlying psychological conditions.",
    causes: [
      {
        icon: BrainCircuit,
        title: "Emotional & Psychological",
        points: [
          "Sudden emotional distress or intense anxiety",
          "Episodes of crying, fear or agitation",
          "Panic-like symptoms",
          "Memory gaps or feelings of detachment",
          "Sleep disturbances"
        ]
      },
      {
        icon: Activity,
        title: "Motor & Neurological",
        points: [
          "Trembling or shaking",
          "Fainting or episodes of unresponsiveness",
          "Difficulty speaking or swallowing",
          "Temporary weakness or difficulty moving a limb"
        ]
      },
      {
        icon: ShieldCheck,
        title: "Sensory & Somatic",
        points: [
          "Abnormal movements or sensations",
          "Numbness or altered sensation",
          "Breathing difficulties",
          "Physical symptoms that may worsen during emotional stress"
        ]
      }
    ],
    treatments: [
      { title: "Modern Medicines", description: "There is no specific medicine for “hysteria.” However, medicines may be prescribed when conditions such as anxiety, depression, panic disorder or other psychiatric conditions are present. Antidepressants or other appropriate medicines may be considered according to the individual's diagnosis and clinical needs. Medication should always be prescribed and monitored by a qualified psychiatrist." },
      { title: "Cognitive Behaviour Therapy (CBT)", description: "CBT can help identify unhelpful thoughts and behavioural patterns associated with anxiety and emotional distress. It may help patients develop healthier coping strategies and reduce symptom-related fear and avoidance." },
      { title: "Psychotherapy, Counselling & Clinical Hypnotherapy", description: "Additional supportive psychological therapies used to address emotional distress, build coping mechanisms, and manage functional symptoms." },
      { title: "rTMS", description: "Repetitive Transcranial Magnetic Stimulation (rTMS) may be considered as a non-invasive option when accompanying psychiatric conditions are present." }
    ],
    cta: {
      headline: "Get a Proper Assessment",
      subtext: "Consult a Psychiatrist. An accurate clinical diagnosis is the first step toward finding relief from these severe symptoms.",
      buttonText: "Book an Appointment"
    }
  },
  "sexual-health-problems": {
    title: "Sexual Health Problems",
    badge: "Sexual Health Care",
    doctor: "Clinical Team",
    leadDoctorRole: "Specialists",
    heroHeadline: "Available Treatments for Sexual Health Problems",
    heroSubtext: "Sexual health problems are common and can affect sexual desire, erection, ejaculation, orgasm, fertility, intimacy, and relationship satisfaction. Conditions such as erectile dysfunction, premature ejaculation, performance anxiety, painful intercourse, sexual desire disorders, and certain sexual infections can have physical, psychological, or relationship-related causes.",
    description: "At a comprehensive sexual-health clinic, treatment begins with confidential assessment and identification of the underlying cause. There is no single treatment that is suitable for every patient. A personalized combination of medical treatment, counselling, behavioural techniques, and selected procedures may be recommended.",
    causes: [
      {
        icon: Activity,
        title: "Male Sexual Health",
        points: [
          "Erectile Dysfunction",
          "Premature Ejaculation",
          "Precum"
        ]
      },
      {
        icon: BrainCircuit,
        title: "Concerns & Habits",
        points: [
          "Sexual Performance Anxiety",
          "Nocturnal Emissions (Nightfall)",
          "Masturbation Habit"
        ]
      },
      {
        icon: ShieldCheck,
        title: "Health & Counseling",
        points: [
          "Sexually Transmitted Infections (STIs)",
          "Infertility",
          "Homosexuality Is Not a Disease (Counseling & Awareness)"
        ]
      }
    ],
    treatments: [
      { title: "Modern Medicines", description: "Evidence-based medicines are available for several sexual health conditions. For erectile dysfunction, doctors may prescribe PDE5 inhibitors such as sildenafil or tadalafil when medically appropriate. Selected medicines or topical treatments may also be used for premature ejaculation. Treating underlying problems like anxiety or hormonal disorders is also an important part of recovery." },
      { title: "Sex Counselling & Sex Therapy", description: "Sex counselling provides scientific information about sexual function and addresses misconceptions, performance anxiety, communication difficulties, and behavioural patterns. Therapy may incorporate CBT, behavioural techniques, sensate-focus exercises, relaxation strategies, and structured sexual exercises." },
      { title: "Marital & Couples Counselling", description: "Sexual difficulties can affect both partners. Counselling helps partners communicate openly about intimacy, expectations, sexual concerns, and relationship conflicts to reduce blame and improve emotional connection and mutual satisfaction." },
      { title: "Vacuum Erection Therapy", description: "A vacuum erection device (VED) is a non-invasive treatment primarily used for erectile dysfunction, useful for selected patients who cannot take or do not respond adequately to oral medicines." },
      { title: "Shock Wave Therapy", description: "Low-intensity extracorporeal shock wave therapy (Li-ESWT) is used or studied particularly for selected cases of erectile dysfunction associated with impaired penile blood flow." },
      { title: "Papaverine Injections", description: "Intracavernosal papaverine is an injectable medicine that can produce an erection and may be considered for selected patients with erectile dysfunction. Must be prescribed and administered under proper specialist instruction." },
      { title: "P-Shot / PRP Therapy", description: "Platelet-rich plasma (PRP) injections are promoted for several male sexual concerns. Patients should discuss the potential benefits, uncertainties, risks, and costs before choosing this procedure." },
      { title: "Pelvic-Floor (Kegel) Exercises", description: "Exercises that can strengthen muscles involved in urinary and sexual function. They may be useful for selected patients with erectile or ejaculation-related concerns when using the correct technique." }
    ],
    cta: {
      headline: "Confidential Assessment",
      subtext: "Seeking professional help is a sign of responsible healthcare—not something to be ashamed of.",
      buttonText: "Book an Appointment"
    }
  },
  "erectile-dysfunction": {
    title: "Erectile Dysfunction (ED)",
    badge: "Male Sexual Health",
    doctor: "Clinical Team",
    leadDoctorRole: "Specialists",
    heroHeadline: "Erectile Dysfunction (ED)",
    heroSubtext: "Erectile Dysfunction (ED) is a common male sexual health condition in which a man has difficulty achieving or maintaining an erection sufficient for satisfactory sexual activity.",
    description: "ED can occur at any age and may be temporary or persistent. It is a treatable medical condition and should not be considered a sign of weakness, lack of masculinity, or personal failure. Persistent ED may sometimes be an early indicator of underlying health problems, particularly cardiovascular or metabolic conditions, so proper medical assessment is important.",
    causes: [
      {
        icon: Activity,
        title: "Common Symptoms",
        points: [
          "Difficulty getting an erection during sexual activity",
          "Difficulty maintaining an erection until completion of intercourse",
          "Erections that are not firm enough for penetration",
          "Reduced frequency or firmness of morning erections",
          "Reduced sexual confidence or performance anxiety",
          "Decreased sexual satisfaction and avoidance of intimacy"
        ]
      },
      {
        icon: Stethoscope,
        title: "Physical Causes",
        points: [
          "Diabetes, high blood pressure, and cardiovascular disease",
          "Obesity, high cholesterol, and hormonal abnormalities",
          "Neurological disorders or pelvic surgery/injury",
          "Certain medications",
          "Smoking, excessive alcohol, and inadequate physical activity",
          "Poor sleep habits"
        ]
      },
      {
        icon: BrainCircuit,
        title: "Psychological Factors",
        points: [
          "Stress and daily anxiety",
          "Depression",
          "Sexual performance anxiety",
          "Relationship difficulties",
          "Previous negative sexual experiences"
        ]
      }
    ],
    treatments: [
      { title: "Modern Medicines", description: "PDE5 inhibitors, such as sildenafil, tadalafil, vardenafil, and avanafil, are commonly prescribed to improve penile blood flow. They should be taken only after medical evaluation as they may interact with certain medications. Treating associated conditions like diabetes or anxiety is also key." },
      { title: "Vacuum Pump Therapy", description: "A Vacuum Pump Therapy uses controlled negative pressure to draw blood into the penis and produce an erection. A constriction ring may be used to help maintain the erection. It is a non-invasive option for selected patients." },
      { title: "Sex Counselling", description: "Useful when anxiety, performance concerns, misconceptions, or sexual communication difficulties contribute to ED. Behavioural and psychological interventions complement medical treatment." },
      { title: "Marital Counselling", description: "Relationship stress can significantly affect sexual performance. Marital counselling can improve communication, reduce pressure, and help couples develop a supportive approach to treatment." },
      { title: "Low-Intensity Shock Wave Therapy", description: "Low-intensity extracorporeal shock wave therapy (Li-ESWT) is used for some forms of vasculogenic ED. It may be considered for selected patients after medical evaluation." },
      { title: "Papaverine Injections", description: "Intracavernosal papaverine can produce an erection by relaxing penile smooth muscle. It may be used under specialist supervision. Self-injection without proper training should be avoided." },
      { title: "P-Shot / PRP Therapy", description: "Platelet-rich plasma (PRP) injection into penile tissue is marketed for erectile problems. Patients should discuss benefits, risks, costs, and alternatives with a specialist before considering it." },
      { title: "Pelvic-Floor (Kegel) Exercises", description: "Kegel exercises strengthen muscles involved in erectile function and ejaculation control. Regular, correctly performed exercises may provide additional benefit in selected men." }
    ],
    cta: { 
      headline: "Confidential Assessment", 
      subtext: "Erectile Dysfunction is common, treatable, and worth discussing openly. Consult a qualified specialist for a confidential assessment.", 
      buttonText: "Book an Appointment" 
    }
  },
  "premature-ejaculation": {
    title: "Premature Ejaculation (P.E.)",
    badge: "Male Sexual Health",
    doctor: "Clinical Team",
    leadDoctorRole: "Specialists",
    heroHeadline: "Premature Ejaculation (P.E.)",
    heroSubtext: "Premature Ejaculation (P.E.) is one of the most common male sexual concerns. It refers to ejaculation that occurs sooner than desired, often with limited control and associated distress.",
    description: "P.E. is a common and treatable sexual health condition and should not be considered a sign of weakness or lack of masculinity. A proper clinical assessment is important because sexual difficulties may occur alone or along with erectile dysfunction, anxiety, relationship problems, prostatitis, hormonal abnormalities, or other medical conditions.",
    causes: [
      {
        icon: Activity,
        title: "Common Symptoms",
        points: [
          "Ejaculation that occurs sooner than the person or couple desires",
          "Difficulty delaying ejaculation during sexual activity",
          "Reduced sense of control over ejaculation",
          "Anxiety or excessive focus on sexual performance",
          "Frustration, embarrassment, or reduced sexual confidence",
          "Avoidance of sexual intimacy and marital stress"
        ]
      },
      {
        icon: BrainCircuit,
        title: "Psychological Causes",
        points: [
          "Performance anxiety and stress",
          "Depression",
          "Relationship conflict",
          "Previous negative sexual experiences",
          "Inadequate sexual communication"
        ]
      },
      {
        icon: Stethoscope,
        title: "Biological Causes",
        points: [
          "Altered sensitivity",
          "Abnormalities involving serotonin pathways",
          "Erectile difficulties",
          "Inflammation or prostate-related problems",
          "Certain medical conditions"
        ]
      }
    ],
    treatments: [
      { title: "Modern Medicines", description: "Evidence-based treatment may include prescription medicines such as selective serotonin reuptake inhibitors (SSRIs), appropriately selected on-demand medications, or topical local anaesthetic preparations. These should be used only under medical supervision because suitability and side effects vary." },
      { title: "Sex Counselling", description: "Sex counselling and sex therapy can help patients understand sexual responses, reduce performance anxiety, improve arousal control, and develop healthier sexual communication. Behavioural techniques may be incorporated according to individual needs." },
      { title: "Marital Counselling", description: "When relationship stress, communication difficulties, or sexual expectations contribute to the problem, marital counselling can help couples communicate openly and work together toward improved intimacy and satisfaction." },
      { title: "Pelvic-Floor Exercises", description: "Pelvic-floor muscle training, commonly known as Kegel exercises, may help some men improve awareness and control of the muscles involved in ejaculation. Correct technique and regular practice are important." }
    ],
    cta: { 
      headline: "Confidential Assessment", 
      subtext: "Treatment is individualized according to your age, symptoms, medical history, and sexual goals. Consult a qualified specialist today.", 
      buttonText: "Book an Appointment" 
    }
  },
  "sexual-performance-anxiety": {
    title: "Sexual Performance Anxiety",
    badge: "Psychosexual Care",
    doctor: "Clinical Team",
    leadDoctorRole: "Specialists",
    heroHeadline: "Sexual Performance Anxiety",
    heroSubtext: "Sexual performance anxiety is a common problem in which fear, worry, or excessive concern about sexual performance interferes with sexual activity.",
    description: "A person may worry about getting or maintaining an erection, ejaculating too quickly, satisfying a partner, or being judged during intimacy. It can become a self-reinforcing cycle of anxiety affecting normal sexual response. It is highly treatable with appropriate medical, psychological, and relationship-based support.",
    causes: [
      {
        icon: Activity,
        title: "Physical & Behavioral Symptoms",
        points: [
          "Difficulty achieving or maintaining an erection",
          "Reduced sexual desire during stressful situations",
          "Premature ejaculation or difficulty controlling ejaculation",
          "Excessive worry before or during sexual activity",
          "Rapid heartbeat, sweating, trembling, or muscle tension",
          "Repeated checking of erection or sexual performance"
        ]
      },
      {
        icon: BrainCircuit,
        title: "Mental & Relationship Impact",
        points: [
          "Difficulty concentrating on pleasurable sensations",
          "Fear of disappointing or being judged by a partner",
          "Avoidance of sexual intimacy",
          "Reduced sexual confidence",
          "A self-reinforcing cycle of anxiety and sexual difficulty"
        ]
      },
      {
        icon: ShieldCheck,
        title: "Underlying Causes",
        points: [
          "Previous sexual difficulties and fear of failure",
          "Relationship conflict and unrealistic expectations",
          "Pornography-related expectations and body-image concerns",
          "Stress, depression, and generalized anxiety",
          "Medical conditions like diabetes, hypertension, or hormonal disorders"
        ]
      }
    ],
    treatments: [
      { title: "Sex Counselling and Sex Therapy", description: "Sex counselling is an important component of treatment. It provides scientific sexual education, corrects misconceptions, reduces performance pressure, and teaches strategies for improving communication, arousal, and sexual confidence. CBT-based approaches, relaxation techniques, and gradual behavioural exercises may also be useful." },
      { title: "Marital or Couples Counselling", description: "When relationship tension contributes to anxiety, marital counselling can help couples communicate openly, reduce blame and performance pressure, and rebuild emotional and sexual intimacy." },
      { title: "Modern Medicines", description: "If erectile dysfunction is contributing to performance anxiety, a doctor may prescribe appropriate medicines such as PDE5 inhibitors after assessing cardiovascular health. If clinically significant anxiety or depression is present, appropriate psychiatric treatment may also be considered." }
    ],
    cta: { 
      headline: "Break the Cycle of Anxiety", 
      subtext: "Performance anxiety is highly treatable. Consult a qualified specialist today to regain confidence and improve your intimate relationships.", 
      buttonText: "Book an Appointment" 
    }
  },
  "sexually-transmitted-infections": {
    title: "Sexually Transmitted Infections (STIs)",
    badge: "Sexual Health",
    doctor: "Clinical Team",
    leadDoctorRole: "Specialists",
    heroHeadline: "Sexually Transmitted Infections (STIs)",
    heroSubtext: "STIs are infections that can be transmitted primarily through sexual contact, including vaginal, anal, and oral sex.",
    description: "STIs are common medical conditions that can affect people of any age. Many are preventable and treatable, while some viral infections can be managed effectively. Early diagnosis and appropriate treatment can prevent complications and reduce transmission to sexual partners.",
    causes: [
      {
        icon: Activity,
        title: "Common Symptoms",
        points: [
          "Unusual penile, vaginal, or rectal discharge",
          "Burning or pain during urination",
          "Genital itching, irritation, ulcers, sores, or blisters",
          "Warts or unusual skin growths around the genitals",
          "Pelvic, lower abdominal, or testicular pain",
          "Pain during intercourse or bleeding between periods"
        ]
      },
      {
        icon: ShieldCheck,
        title: "Causes & Risk Factors",
        points: [
          "Caused by bacteria, viruses, or parasites",
          "Common STIs: chlamydia, gonorrhea, syphilis, herpes, HPV, HIV",
          "Unprotected sexual contact or multiple partners",
          "Having a partner with an untreated STI",
          "Sharing contaminated needles"
        ]
      },
      {
        icon: FlaskConical,
        title: "Diagnosis & Testing",
        points: [
          "Comprehensive physical examination",
          "Urine and blood tests",
          "Genital, vaginal, or urethral swab tests",
          "Sexual partners may also require evaluation",
          "Avoid sexual contact until advised it is safe"
        ]
      }
    ],
    treatments: [
      { title: "Modern Medicines", description: "Antibiotics are used for bacterial infections such as chlamydia, gonorrhea, and syphilis. Antiviral medicines may be prescribed for conditions such as genital herpes and HIV. Certain parasitic infections require specific antiparasitic medicines. The correct medicine and duration depend on the diagnosis. Self-medication and incomplete treatment should be avoided, particularly because antibiotic-resistant infections are an increasing concern." }
    ],
    cta: { 
      headline: "Confidential STI Testing & Treatment", 
      subtext: "Early diagnosis and appropriate treatment are crucial for your health and your partner's health. Schedule a confidential assessment today.", 
      buttonText: "Book an Appointment" 
    }
  },
  "precum": {
    title: "Precum (Pre-Ejaculate) & Guilt",
    badge: "Sexual Health & Education",
    doctor: "Clinical Team",
    leadDoctorRole: "Specialists",
    heroHeadline: "Precum (Pre-Ejaculate) & Guilt",
    heroSubtext: "Precum, medically known as pre-ejaculate, is a clear fluid that may be released from the penis during sexual arousal, before ejaculation.",
    description: "It is a normal physiological response and is not, by itself, a disease or sexual weakness. The amount varies between individuals. While normal pre-ejaculate doesn't require treatment, persistent discharge without arousal or accompanied by pain or itching should be medically evaluated.",
    causes: [
      {
        icon: Activity,
        title: "Symptoms & Common Concerns",
        points: [
          "Clear or transparent fluid appearing during sexual arousal",
          "Moisture at the tip of the penis before ejaculation",
          "Anxiety about frequent pre-ejaculate",
          "Fear that fluid loss causes physical weakness",
          "Guilt or embarrassment related to sexual arousal",
          "Worry that pre-ejaculate indicates a sexual disease"
        ]
      },
      {
        icon: FlaskConical,
        title: "Causes & Mechanisms",
        points: [
          "Primarily associated with sexual arousal and stimulation",
          "Can occur during kissing, touching, or sexual thoughts",
          "Amount varies based on the individual and degree of arousal",
          "Different from semen, though sperm may sometimes be present",
          "Produced mainly by the bulbourethral (Cowper's) glands"
        ]
      },
      {
        icon: BrainCircuit,
        title: "Guilt and Anxiety",
        points: [
          "Worry that releasing pre-ejaculate means losing vital energy",
          "Guilt associated with misinformation or cultural beliefs",
          "Sexual anxiety and compulsive checking behaviors",
          "Fear about sexual health not supported by medical evidence"
        ]
      }
    ],
    treatments: [
      { title: "Medical Reassurance & Education", description: "Normal pre-ejaculate is a healthy physiological response and does not require medical treatment. Understanding that it does not cause weakness or loss of vital energy is an important step in alleviating anxiety." },
      { title: "Psychological Counseling", description: "For persistent guilt, sexual anxiety, or compulsive checking, counseling can address misinformation, cultural beliefs, and fears, replacing them with healthy sexual education." },
      { title: "Clinical Evaluation for Infection", description: "If discharge occurs without sexual arousal, or is accompanied by burning urination, pain, itching, foul smell, or genital lesions, it should be clinically evaluated to rule out infections or other underlying conditions." }
    ],
    cta: { 
      headline: "Expert Reassurance & Guidance", 
      subtext: "If you have concerns about sexual health, pre-ejaculate, or related anxiety, a confidential consultation can provide clarity and peace of mind.", 
      buttonText: "Book an Appointment" 
    }
  },
  "nocturnal-emissions": {
    title: "Nocturnal Emissions (Nightfall)",
    badge: "Sexual Health & Education",
    doctor: "Clinical Team",
    leadDoctorRole: "Specialists",
    heroHeadline: "Nocturnal Emissions (Nightfall)",
    heroSubtext: "Nocturnal emission, commonly called 'nightfall' or wet dreams, is the involuntary release of semen during sleep.",
    description: "It is a normal physiological phenomenon, particularly common during adolescence and young adulthood. Nocturnal emissions are not a disease and do not usually cause weakness, infertility, erectile dysfunction, or loss of sexual capacity.",
    causes: [
      {
        icon: Activity,
        title: "Symptoms & Experiences",
        points: [
          "Involuntary ejaculation during sleep",
          "Semen or a wet stain noticed on waking",
          "Sexual dreams, although not always remembered",
          "Increase in frequency during sexual abstinence",
          "Anxiety or guilt about semen loss",
          "Excessive worry about weakness or reduced sexual ability"
        ]
      },
      {
        icon: FlaskConical,
        title: "Normal Physiological Causes",
        points: [
          "Related to normal sexual physiology and hormonal activity",
          "Spontaneous erections and ejaculation during sleep",
          "Periods without ejaculation or sexual activity",
          "Sexual arousal or frequent thoughts about sexual activity"
        ]
      },
      {
        icon: BrainCircuit,
        title: "Myths & Psychological Impact",
        points: [
          "Not caused by loss of vital energy or toxins",
          "Frequency varies considerably between individuals",
          "Persistent anxiety can become more troublesome than the emission",
          "Treatment is generally not required unless causing distress"
        ]
      }
    ],
    treatments: [
      { title: "Sex Counselling", description: "Sex counselling can correct myths about semen loss, explain normal sexual physiology, and reduce unnecessary fear, guilt, and anxiety. Education is often the most useful intervention." },
      { title: "Psychological Counselling", description: "If excessive worry, health anxiety, obsessive thoughts, or sleep-related anxiety is present, counselling or CBT-based therapy may help. Relaxation, mindfulness, and healthy sleep practices may also be beneficial." }
    ],
    cta: { 
      headline: "Clear Your Doubts with Expert Advice", 
      subtext: "If excessive worry, guilt, or health anxiety regarding nocturnal emissions is affecting your peace of mind, consult our specialists for reassurance and proper guidance.", 
      buttonText: "Book an Appointment" 
    }
  },
  "masturbation-habit": {
    title: "Masturbation Habit & Guilt",
    badge: "Psychosexual Care",
    doctor: "Clinical Team",
    leadDoctorRole: "Specialists",
    heroHeadline: "Masturbation Habit, Excessive Masturbation & Guilt",
    heroSubtext: "Masturbation is a normal and common form of sexual behaviour. In itself, it does not cause physical weakness, infertility, erectile dysfunction, or mental illness.",
    description: "However, some individuals may experience excessive or difficult-to-control behaviour, compulsive pornography use, or persistent guilt. When the behaviour begins to interfere with daily life, relationships, work, sleep, or emotional wellbeing, professional guidance may be helpful.",
    causes: [
      {
        icon: Activity,
        title: "Symptoms & Concerns",
        points: [
          "Frequent masturbation that feels difficult to control",
          "Spending excessive time thinking about sexual activity",
          "Repeated unsuccessful attempts to reduce the behaviour",
          "Excessive pornography use associated with masturbation",
          "Guilt, shame, fear, or anxiety after masturbation",
          "Reduced concentration or interference with work and studies"
        ]
      },
      {
        icon: ShieldCheck,
        title: "Physical & Relational Impact",
        points: [
          "Avoidance of relationships or intimacy",
          "Temporary genital soreness or skin irritation due to friction",
          "Sexual difficulties incorrectly attributed to masturbation",
          "Frequency alone does not determine if it is a problem",
          "Key factors are loss of control, distress, and physical discomfort"
        ]
      },
      {
        icon: BrainCircuit,
        title: "Causes of Guilt & Anxiety",
        points: [
          "Misinformation, cultural or family beliefs",
          "Fear of physical harm or religious/moral conflicts",
          "Cycle of urge → masturbation → guilt → anxiety → preoccupation",
          "Underlying anxiety, depression, or obsessive thoughts"
        ]
      }
    ],
    treatments: [
      { title: "Sex Counselling", description: "Sex counselling and sex therapy can correct sexual myths, provide scientifically accurate information, reduce unnecessary guilt, and develop healthier sexual habits. Behavioural strategies can help patients manage triggers and regain a sense of control." },
      { title: "Psychological Counselling", description: "CBT-based approaches may be useful when anxiety, obsessive thoughts, compulsive behaviour, or negative beliefs are involved. Mindfulness, stress management, and habit-reversal strategies may also be incorporated." },
      { title: "Marital Counselling", description: "When sexual concerns are affecting a relationship, marital counselling can improve communication, intimacy, expectations, and mutual understanding between partners." },
      { title: "Modern Medicines", description: "There is no specific medicine required simply because a person masturbates. Medication may be considered when an underlying condition such as anxiety, depression, obsessive-compulsive symptoms, or another clinically significant problem is identified." }
    ],
    cta: { 
      headline: "Confidential Support & Education", 
      subtext: "If masturbation habits or associated guilt are causing distress or interfering with your life, consult a professional for supportive and accurate guidance.", 
      buttonText: "Book an Appointment" 
    }
  },
  "infertility": {
    title: "Infertility",
    badge: "Fertility & Sexual Health",
    doctor: "Clinical Team",
    leadDoctorRole: "Specialists",
    heroHeadline: "Infertility",
    heroSubtext: "Infertility is the inability to achieve pregnancy despite regular, unprotected sexual intercourse for a defined period.",
    description: "It can affect either partner or both partners and is a medical condition—not a matter of blame, weakness, or personal failure. Many causes are treatable, and an appropriate clinical evaluation of both partners is the first step.",
    causes: [
      {
        icon: Activity,
        title: "Symptoms & Associated Signs",
        points: [
          "Difficulty conceiving despite regular unprotected intercourse",
          "Erectile or ejaculation difficulties and reduced sexual desire",
          "Testicular pain, swelling, or a history of testicular problems",
          "Hormonal symptoms such as reduced body or facial hair",
          "History of genital infection or surgery",
          "Recurrent pregnancy loss requiring evaluation of both partners"
        ]
      },
      {
        icon: FlaskConical,
        title: "Male Infertility Causes",
        points: [
          "Low sperm production, poor movement, or abnormal shape",
          "Varicocele, infections, or testicular injury",
          "Hormonal abnormalities or genetic conditions",
          "Lifestyle factors: obesity, smoking, alcohol, heat exposure",
          "Sexual dysfunction (e.g., ED or premature ejaculation)"
        ]
      },
      {
        icon: ShieldCheck,
        title: "Female Infertility Causes",
        points: [
          "Ovulation problems or hormonal disorders",
          "Age-related reduction in fertility",
          "Blocked fallopian tubes or endometriosis",
          "Uterine conditions",
          "Couples should ideally undergo evaluation together"
        ]
      }
    ],
    treatments: [
      { title: "Medical Evaluation & Testing", description: "A comprehensive assessment of both partners is the essential first step, which may include semen analysis, hormone testing, physical examination, and other relevant diagnostic tests to identify underlying causes." },
      { title: "Lifestyle & Health Optimization", description: "Expert guidance on weight management, nutrition, stress reduction, and avoiding harmful habits (such as smoking, excessive alcohol, or excessive heat exposure) to improve overall and reproductive health." },
      { title: "Treatment of Underlying Conditions", description: "Targeted medical management for underlying issues such as infections, hormonal imbalances, or sexual dysfunction (like erectile dysfunction or premature ejaculation) that may be hindering natural conception." }
    ],
    cta: { 
      headline: "Start Your Journey Together", 
      subtext: "A couple should ideally undergo evaluation together. Consult a specialist for a supportive, structured, and confidential fertility evaluation.", 
      buttonText: "Book an Appointment" 
    }
  },
  "homosexuality-counseling": {
    title: "Homosexuality Is Not a Disease",
    badge: "Psychosexual Care & Support",
    doctor: "Clinical Team",
    leadDoctorRole: "Specialists",
    heroHeadline: "Homosexuality Is Not a Disease",
    heroSubtext: "Understanding Mental Health and Sexual Wellbeing. Homosexuality is not a disease, mental disorder, or sexual illness. Same-sex sexual orientation is a natural variation of human sexuality.",
    description: "Major medical organizations do not consider homosexuality a condition requiring treatment. However, individuals may experience emotional distress related to social stigma, family pressure, or relationship difficulties. These concerns deserve confidential, compassionate, and scientifically appropriate professional support.",
    causes: [
      {
        icon: Activity,
        title: "Symptoms of Emotional Distress",
        points: [
          "Persistent sadness, loss of interest, or excessive anxiety",
          "Low self-esteem, feelings of shame, or social withdrawal",
          "Sleep or appetite changes and difficulty concentrating",
          "Relationship or family conflicts",
          "Sexual performance concerns and recurrent negative thoughts",
          "Significant distress related to stigma or rejection"
        ]
      },
      {
        icon: ShieldCheck,
        title: "Causes of Anxiety or Depression",
        points: [
          "Social stigma, bullying, or discrimination",
          "Family or cultural pressure and fear of disclosure",
          "Relationship problems and social isolation",
          "Internalized negative beliefs",
          "General anxiety or depression unrelated to sexual orientation"
        ]
      },
      {
        icon: HeartHandshake,
        title: "Confidential & Respectful Care",
        points: [
          "The goal is better mental health and sexual wellbeing",
          "Treatment addresses genuine clinical concerns, not orientation",
          "Professional care never attempts to “cure” homosexuality",
          "Non-judgmental evaluation by qualified professionals",
          "Focus on healthy relationships and quality of life"
        ]
      }
    ],
    treatments: [
      { title: "Psychological Counselling", description: "Supportive counselling can help individuals manage anxiety, depression, stress, self-esteem concerns, family difficulties, and relationship challenges. Evidence-based approaches such as CBT and other appropriate psychotherapies may be used." },
      { title: "Sex Counselling", description: "Sex counselling can provide accurate information about sexual health, intimacy, safer-sex practices, sexual functioning, and relationship concerns. The objective is improved wellbeing—not changing sexual orientation." },
      { title: "Marital or Relationship Counselling", description: "For individuals in relationships, couples or marital counselling may help improve communication, emotional intimacy, sexual expectations, and conflict resolution." },
      { title: "Modern Medicines", description: "When clinically diagnosed anxiety or depression is present, a psychiatrist may consider evidence-based medicines such as antidepressants or anti-anxiety treatment, depending on symptoms. Medication should always be prescribed after proper assessment." },
      { title: "Treatment of Sexual Problems", description: "Some individuals may experience a separate sexual-functioning problem such as erectile dysfunction. Treatments may include appropriately prescribed modern medicines, vacuum erection therapy, or selected specialist procedures like Papaverine injections when medically indicated." },
      { title: "Shock Wave Therapy", description: "Low-intensity shock wave therapy is being studied and used in selected cases of erectile dysfunction, particularly some forms related to penile blood flow. It is not a treatment for homosexuality, anxiety, or depression." },
      { title: "P-Shot / PRP Therapy", description: "The P-Shot is promoted for certain male sexual concerns. Evidence remains limited, and it is not an established treatment for sexual orientation or associated emotional distress." },
      { title: "Pelvic-Floor Exercises", description: "Pelvic-floor or Kegel exercises may benefit selected men with urinary or sexual-function concerns. They do not change sexual orientation and are not required simply because someone is homosexual." }
    ],
    cta: { 
      headline: "Confidential, Respectful Sexual Healthcare", 
      subtext: "If you are experiencing anxiety, depression, sexual difficulties, or relationship concerns, confidential and non-judgmental professional counselling can help.", 
      buttonText: "Book an Appointment" 
    }
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
    title: "Ganja & Brown Sugar Addiction",
    badge: "De-addiction & Rehabilitation",
    doctor: "Clinical Team",
    leadDoctorRole: "De-addiction Specialists",
    heroHeadline: "Ganja and Brown Sugar Addiction",
    heroSubtext: "Ganja (cannabis) and brown sugar (a street term for illicit opioids) can lead to severe substance use disorders.",
    description: "These addictions cause significant physical, psychological, and social problems. Medical intervention combined with therapy provides a structured pathway to recovery, helping individuals manage cravings, withdrawal symptoms, and prevent relapse.",
    causes: [
      {
        icon: Activity,
        title: "General Addiction Symptoms",
        points: [
          "Strong craving, urge, and loss of control over use",
          "Neglect of family, work, education, and social withdrawal",
          "Sleep and appetite disturbances with reduced motivation",
          "Financial or relationship problems",
          "Increased tolerance and continuing use despite harm"
        ]
      },
      {
        icon: BrainCircuit,
        title: "Ganja-Related Symptoms",
        points: [
          "Impaired attention, memory, and slowed reaction time",
          "Anxiety, altered perception, and reduced motivation",
          "Paranoia or psychotic symptoms in some individuals",
          "Withdrawal involves irritability, anxiety, and cravings",
          "Sleep disturbance and reduced appetite during withdrawal"
        ]
      },
      {
        icon: Pill,
        title: "Brown Sugar (Opioid) Symptoms",
        points: [
          "Drowsiness, constipation, pinpoint pupils, and reduced alertness",
          "Strong, severe withdrawal symptoms when use is stopped",
          "Opioid overdose can be life-threatening (slowed breathing)",
          "Naloxone can rapidly reverse opioid overdose in emergencies",
          "Requires medically supervised dependence treatment"
        ]
      }
    ],
    treatments: [
      { title: "Modern Medicines & Detox", description: "Crucial for opioid dependence using evidence-based medications like buprenorphine or methadone under medical supervision. Medicines also manage withdrawal symptoms and co-existing psychiatric conditions." },
      { title: "Psychotherapy & Counselling", description: "Cognitive Behaviour Therapy (CBT) and counseling are core components of addiction recovery, helping individuals manage triggers and develop healthy coping mechanisms." },
      { title: "Clinical Hypnotherapy", description: "Used as a complementary intervention for selected patients to support relaxation, stress management, and behavioural change (does not replace medical treatment)." },
      { title: "rTMS (Repetitive Transcranial Magnetic Stimulation)", description: "May be utilized in selected cases as a specialized adjunctive treatment for addiction and co-occurring disorders." }
    ],
    cta: { 
      headline: "Start the Journey to Recovery", 
      subtext: "Substance addiction is a medical condition, not a personal failure. Consult a Psychiatrist for professional, confidential de-addiction treatment.", 
      buttonText: "Book an Appointment" 
    }
  },
  "child-and-adolescent-psychiatry": {
    title: "Children's Psychological Illnesses",
    badge: "Child & Adolescent Care",
    doctor: "Clinical Team",
    leadDoctorRole: "Child Psychiatry Specialists",
    heroHeadline: "Children's Psychological Illnesses",
    heroSubtext: "Children can experience emotional, behavioural, developmental and psychological difficulties that affect their learning, relationships, and wellbeing.",
    description: "Problems such as anxiety, depression, ADHD, behavioural difficulties, learning problems, sleep disturbances, and developmental concerns can occur at different stages of childhood. Treatment is age-appropriate and personalized to support the child.",
    causes: [
      {
        icon: Activity,
        title: "Emotional & Anxiety Symptoms",
        points: [
          "Persistent sadness, irritability or frequent crying",
          "Excessive fear, worry or separation anxiety",
          "Frequent temper tantrums or anger outbursts",
          "Social withdrawal or difficulty making friends",
          "Repetitive behaviours or unusual fears"
        ]
      },
      {
        icon: BrainCircuit,
        title: "Behavioural & Learning Symptoms",
        points: [
          "Hyperactivity, impulsivity or difficulty sitting still",
          "Poor concentration, forgetfulness or declining grades",
          "Learning difficulties or loss of acquired skills",
          "Aggressive or oppositional behaviour",
          "Excessive screen use or abrupt behavioural changes"
        ]
      },
      {
        icon: ShieldCheck,
        title: "Physical & Developmental Signs",
        points: [
          "Changes in sleep patterns or appetite",
          "Frequent physical complaints without medical cause",
          "Developmental delays or concerns",
          "Child symptoms present differently than adults",
          "Early assessment identifies the underlying difficulty"
        ]
      }
    ],
    treatments: [
      { title: "Modern Medicines", description: "Medication may be recommended for conditions like ADHD, anxiety, or depression when clinically indicated. Dosage is carefully adjusted to age and weight, and prescribed by a qualified child psychiatrist." },
      { title: "Psychotherapy & CBT", description: "Cognitive Behaviour Therapy is effective for anxiety and depression, teaching children to recognise unhelpful thoughts, manage emotions and develop healthier behavioural responses." },
      { title: "Parental Counselling & Family Care", description: "Parents play a crucial role in recovery. Treatment includes parent guidance, behavioural strategies, and school coordination to support the child at home and in academic settings." },
      { title: "Clinical Hypnotherapy & rTMS", description: "In specific cases, adjunctive therapies like Clinical Hypnotherapy or rTMS may be considered under specialist supervision." },
      { title: "Lifestyle & Routine Interventions", description: "Good sleep, regular physical activity, balanced nutrition, supportive parenting and healthy routines strongly complement professional treatment." }
    ],
    cta: { 
      headline: "Child Behaviour Assessment", 
      subtext: "Childhood problems should not be dismissed as 'bad behaviour.' Consult a Child Psychiatrist for appropriate early support.", 
      buttonText: "Book an Appointment" 
    }
  },
  "geriatric-psychiatry": {
    title: "Dementia & Geriatric Psychiatry",
    badge: "Senior Mental Health & Memory Care",
    doctor: "Clinical Team",
    leadDoctorRole: "Geriatric Psychiatry Specialists",
    heroHeadline: "Dementia & Geriatric Psychiatry",
    heroSubtext: "Geriatric psychiatry focuses on the mental health and emotional wellbeing of older adults, including conditions like dementia, depression, and anxiety.",
    description: "Dementia is a group of conditions causing progressive changes in memory, thinking, and behaviour. Alzheimer’s is the most common, but vascular, Lewy body, and frontotemporal dementia also occur. Emotional and cognitive difficulties in later life may sometimes be overlooked or mistaken for normal ageing.",
    causes: [
      {
        icon: BrainCircuit,
        title: "Memory & Cognitive Changes",
        points: [
          "Increasing forgetfulness and repeated questions",
          "Difficulty finding words or communicating",
          "Problems with concentration and decision-making",
          "Difficulty managing familiar tasks",
          "Getting confused about time or place"
        ]
      },
      {
        icon: Activity,
        title: "Behavioural & Emotional Symptoms",
        points: [
          "Changes in personality or behaviour",
          "Irritability, anxiety, apathy, or sleep disturbances",
          "Suspiciousness or hallucinations in some conditions",
          "Misplacing objects frequently",
          "Symptoms are often mistaken for normal aging"
        ]
      },
      {
        icon: ShieldCheck,
        title: "Daily Functioning Impacts",
        points: [
          "Difficulty managing finances or medications",
          "Loss of independence in daily activities",
          "Safety concerns at home or while outdoors",
          "Memory loss should not automatically be considered normal",
          "Early evaluation can identify treatable causes"
        ]
      }
    ],
    treatments: [
      { title: "Modern Medicines", description: "Depending on the diagnosis, cholinesterase inhibitors, memantine, or medications for depression, anxiety, and sleep may be prescribed. Older adults are sensitive to side effects, requiring careful monitoring by a psychiatrist." },
      { title: "Psychotherapy, Counselling & CBT", description: "Cognitive Behaviour Therapy (CBT) and counselling may be useful for depression, anxiety, or excessive worry, adapted to the person's cognitive abilities." },
      { title: "Family and Caregiver Support", description: "Dementia affects the entire family. Treatment includes education for caregivers regarding communication, medication, safety, sleep, and maintaining independence." },
      { title: "Clinical Hypnotherapy & rTMS", description: "Selected brain-stimulation treatments such as rTMS or Clinical Hypnotherapy may be utilized when clinically appropriate." },
      { title: "Comprehensive Geriatric Care", description: "Regular follow-ups help monitor cognitive and behavioural symptoms, adjust treatment as conditions progress, and assist families in planning long-term care." }
    ],
    cta: { 
      headline: "Early Assessment Matters", 
      subtext: "Memory loss and behavioural changes are not always a normal part of ageing. Consult a Geriatric Psychiatrist for a comprehensive evaluation.", 
      buttonText: "Book an Appointment" 
    }
  },
  "ibs": {
    title: "Irritable Bowel Syndrome (IBS)",
    badge: "Gut-Brain Care",
    doctor: "Clinical Team",
    leadDoctorRole: "Specialists",
    heroHeadline: "Irritable Bowel Syndrome (IBS)",
    heroSubtext: "IBS is a common disorder of the gut-brain interaction that can cause recurring abdominal pain and changes in bowel habits.",
    description: "Symptoms may include diarrhoea, constipation, or alternating between both. Effective treatment often involves a combination of medical, psychological, and lifestyle interventions.",
    causes: [
      {
        icon: Activity,
        title: "Pain & Discomfort",
        points: [
          "Recurrent abdominal pain or cramps",
          "Bloating and abdominal fullness",
          "Excessive gas and discomfort",
          "Symptoms that may worsen during periods of stress"
        ]
      },
      {
        icon: BrainCircuit,
        title: "Bowel Habit Changes",
        points: [
          "Constipation or difficulty passing stools",
          "Loose stools or diarrhoea",
          "Alternating constipation and diarrhoea",
          "Changes in bowel frequency or stool consistency"
        ]
      },
      {
        icon: ShieldCheck,
        title: "Urgency & Sensation",
        points: [
          "Urgency to pass stools",
          "Feeling of incomplete bowel evacuation",
          "Distress related to bowel symptoms",
          "Impact on daily activities and quality of life"
        ]
      }
    ],
    treatments: [
      { title: "Modern Medicines", description: "Depending on symptoms, doctors may recommend medicines to manage abdominal pain, constipation, diarrhoea, or bloating (e.g., antispasmodic medicines, fibre, laxatives) based on your medical history." },
      { title: "Psychotherapy & CBT", description: "Cognitive Behaviour Therapy (CBT) helps individuals identify thoughts and behaviors that increase stress and worsen symptoms, improving coping strategies and reducing anxiety related to bowel symptoms." },
      { title: "Clinical Hypnotherapy", description: "Gut-directed hypnotherapy uses relaxation techniques to improve the interaction between the brain and digestive system, reducing symptom-related distress for selected patients." },
      { title: "Lifestyle and Dietary Support", description: "Healthy habits like regular physical activity, sleep, hydration, stress management, and identifying personal food triggers (e.g., a low-FODMAP diet) with professional guidance." },
      { title: "rTMS", description: "Repetitive Transcranial Magnetic Stimulation is not a standard treatment for IBS and is only considered for co-existing psychiatric conditions under specialist assessment." }
    ],
    cta: { 
      headline: "Expert Care for IBS", 
      subtext: "If recurring abdominal pain and changes in bowel habits are affecting your quality of life, consult our specialists for a comprehensive evaluation.", 
      buttonText: "Book an Appointment" 
    }
  },
  "mania": {
    title: "Mania (Bipolar Disorder)",
    badge: "Psychiatric Care",
    doctor: "Clinical Team",
    leadDoctorRole: "Psychiatric Specialists",
    heroHeadline: "Mania",
    heroSubtext: "Mania is a distinct period of abnormally elevated, expansive or irritable mood accompanied by increased energy and activity.",
    description: "Most commonly associated with Bipolar I Disorder, mania significantly affects judgement, behaviour, relationships, and finances. Early psychiatric assessment is essential, as untreated mania can lead to severe personal and social consequences.",
    causes: [
      {
        icon: Activity,
        title: "Mood & Energy Levels",
        points: [
          "Abnormally elevated, expansive or irritable mood",
          "Increased energy and goal-directed activity",
          "Reduced need for sleep without feeling tired",
          "Increased confidence, grandiose ideas, or feeling unusually powerful",
          "In severe cases, psychotic symptoms (delusions/hallucinations)"
        ]
      },
      {
        icon: BrainCircuit,
        title: "Cognitive & Speech Changes",
        points: [
          "Excessive talking or speaking very rapidly",
          "Racing thoughts and flight of ideas",
          "Easily distracted and unable to focus",
          "Poor judgement and reduced awareness of consequences"
        ]
      },
      {
        icon: ShieldCheck,
        title: "Behavioural & Social Impact",
        points: [
          "Impulsive or risky behaviour",
          "Excessive spending or reckless financial decisions",
          "Increased sexual activity or inappropriate behaviour",
          "Increased social activity and over-involvement",
          "Substantial interference with work and relationships"
        ]
      }
    ],
    treatments: [
      { title: "Modern Medicines", description: "Mood stabilisers (e.g., Lithium, Valproate) and antipsychotic medicines are commonly used in the treatment of acute mania depending on the clinical situation." },
      { title: "Hospital-Based Treatment", description: "Severe mania may require psychiatric hospitalisation to provide a structured, safe environment for sleep regulation, medication management, and close psychiatric monitoring." },
      { title: "Long-Term Maintenance", description: "For individuals with bipolar disorder, treatment often continues after the acute episode improves. Regular follow-up helps reduce the risk of future manic or depressive episodes." }
    ],
    cta: { 
      headline: "Bipolar Disorder Care & Mania Treatment", 
      subtext: "Untreated mania can lead to significant consequences. Consult a Psychiatrist for a safe, structured assessment and effective management plan.", 
      buttonText: "Book an Appointment" 
    }
  },
  "schizophrenia": {
    title: "Schizophrenia",
    badge: "Psychiatric Care",
    doctor: "Clinical Team",
    leadDoctorRole: "Psychiatric Specialists",
    heroHeadline: "Schizophrenia",
    heroSubtext: "Schizophrenia is a serious but treatable mental health disorder that can affect a person's thoughts, perceptions, emotions, and behaviour.",
    description: "It may involve difficulties distinguishing internal experiences from external reality. Chronic schizophrenia is treatable, and early diagnosis with modern psychiatric care can significantly improve quality of life.",
    causes: [
      {
        icon: BrainCircuit,
        title: "Positive Symptoms",
        points: [
          "Hallucinations, particularly hearing voices",
          "Delusions or strongly held false beliefs",
          "Suspiciousness or paranoia",
          "Disorganised speech"
        ]
      },
      {
        icon: Activity,
        title: "Behavioural Symptoms",
        points: [
          "Disorganised or unusual behaviour",
          "Aggressive or assaultive behaviour",
          "Difficulty distinguishing internal experiences from external reality",
          "Extreme behavioural changes and confusion"
        ]
      },
      {
        icon: ShieldCheck,
        title: "Negative Symptoms",
        points: [
          "Reduced motivation and social withdrawal",
          "Loss of interest and difficulty experiencing pleasure",
          "Reduced speech or communication",
          "Difficulty maintaining everyday activities"
        ]
      }
    ],
    treatments: [
      { title: "Modern Antipsychotic Medicines", description: "The main medical treatment for schizophrenia, including both first-generation and second-generation antipsychotics, to reduce hallucinations, delusions, and disorganized thinking." },
      { title: "Long-Acting Injectable Medicines", description: "Useful for patients who find it difficult to remember daily tablets. They provide medication at regular intervals and are assessed individually by a psychiatrist." },
      { title: "Electroconvulsive Therapy (ECT)", description: "Electroconvulsive therapy is helpful in resistant cases where other treatments have not been sufficiently effective." },
      { title: "Psychosocial and Family Support", description: "Early diagnosis, regular psychiatric care, rehabilitation, and family support are critical for improving symptom control and overall quality of life." }
    ],
    cta: { 
      headline: "Urgent Psychiatric Assessment", 
      subtext: "If a person develops hallucinations, severe suspiciousness, extreme behavioural changes, or confusion, urgent assessment is recommended.", 
      buttonText: "Book an Appointment" 
    }
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

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className={cn(
              "grid grid-cols-1 gap-8",
              data.causes.length === 2 ? "md:grid-cols-2 max-w-4xl mx-auto" : "md:grid-cols-3"
            )}
          >
            {data.causes.map((cause, idx) => (
              <motion.div key={idx} variants={fadeIn} className="bg-muted/30 p-8 rounded-[2rem] border border-border h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-6 shrink-0">
                  <cause.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif font-medium mb-3">{cause.title}</h3>
                {cause.description && (
                  <p className="text-muted-foreground text-sm leading-relaxed">{cause.description}</p>
                )}
                {cause.points && (
                  <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-2 marker:text-primary/70">
                    {cause.points.map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                )}
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
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              {data.cta?.headline || "Start Your Journey to Recovery"}
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              {data.cta?.subtext || "Consult with Dr. Deepak Kelkar and our senior clinical team. 100% private and confidential."}
            </p>
            <BookNowButton className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "rounded-full px-10 py-5 text-base font-bold shadow-xl hover:scale-105 transition-transform")}>
              {data.cta?.buttonText || "Book Consultation Now"}
            </BookNowButton>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
