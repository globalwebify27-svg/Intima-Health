import mongoose from "mongoose";
import dotenv from "dotenv";
import { TreatmentModel } from "../src/modules/cms/schema";

dotenv.config({ path: ".env.local" });

const serviceDataMap: Record<string, any> = {
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
        icon: "BrainCircuit",
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
        icon: "Activity",
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
        icon: "ShieldCheck",
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
        icon: "BrainCircuit",
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
        icon: "Activity",
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
        icon: "ShieldCheck",
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
        icon: "BrainCircuit",
        title: "Obsessions",
        points: [
          "Fear of contamination or germs",
          "Fear of causing harm or making mistakes",
          "Repeated intrusive images or thoughts"
        ]
      },
      {
        icon: "Activity",
        title: "Compulsions",
        points: [
          "Excessive washing or cleaning",
          "Repeated checking",
          "Counting or repeating actions",
          "Mental rituals or repeated prayers"
        ]
      },
      {
        icon: "ShieldCheck",
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
        icon: "BrainCircuit",
        title: "Behavioural & Psychological",
        points: [
          "Strong craving or urge to drink",
          "Difficulty controlling the amount or frequency of drinking",
          "Repeated unsuccessful attempts to reduce or stop alcohol",
          "Spending significant time obtaining, drinking or recovering from alcohol"
        ]
      },
      {
        icon: "Activity",
        title: "Physical Impacts",
        points: [
          "Increasing tolerance and needing more alcohol for the same effect",
          "Withdrawal symptoms when alcohol use is reduced or stopped",
          "Memory problems or blackouts",
          "Continuing to drink despite physical or psychological problems"
        ]
      },
      {
        icon: "ShieldCheck",
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
        icon: "BrainCircuit",
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
        icon: "Activity",
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
        icon: "UserCheck",
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
        icon: "Activity",
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
        icon: "BrainCircuit",
        title: "Psychological Symptoms",
        points: [
          "Sudden intense fear or sense of impending danger",
          "Fear of losing control or “going crazy”",
          "Fear of dying"
        ]
      },
      {
        icon: "ShieldCheck",
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
        icon: "BrainCircuit",
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
        icon: "Activity",
        title: "Motor & Neurological",
        points: [
          "Trembling or shaking",
          "Fainting or episodes of unresponsiveness",
          "Difficulty speaking or swallowing",
          "Temporary weakness or difficulty moving a limb"
        ]
      },
      {
        icon: "ShieldCheck",
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
      { title: "Modern Medicines", description: "There is no specific medicine for “hysteria.” However, medicines may be prescribed when conditions such as anxiety, depression, panic disorder or other psychiatric conditions are present. Antidepressants or other appropriate medicines may be considered according to the individual's diagnosis and clinical needs. Medication process is necessary." },
      { title: "Cognitive Behaviour Therapy (CBT)", description: "CBT can help identify unhelpful thoughts and behavioural patterns associated with anxiety and emotional distress." },
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
        icon: "Activity",
        title: "Male Sexual Health",
        points: [
          "Erectile Dysfunction",
          "Premature Ejaculation",
          "Precum"
        ]
      },
      {
        icon: "BrainCircuit",
        title: "Concerns & Habits",
        points: [
          "Sexual Performance Anxiety",
          "Nocturnal Emissions (Nightfall)",
          "Masturbation Habit"
        ]
      },
      {
        icon: "ShieldCheck",
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
      { title: "P-Shot / PRP Therapy", description: "Platelet-rich plasma (PRP) injections are promoted for several male sexual concerns. Patients should discuss the potential benefits, risks, and costs before choosing this procedure." },
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
        icon: "Activity",
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
        icon: "Stethoscope",
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
        icon: "BrainCircuit",
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
        icon: "Activity",
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
        icon: "BrainCircuit",
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
        icon: "Stethoscope",
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
        icon: "Activity",
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
        icon: "BrainCircuit",
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
        icon: "ShieldCheck",
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
        icon: "Activity",
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
        icon: "ShieldCheck",
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
        icon: "FlaskConical",
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
        icon: "Activity",
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
        icon: "FlaskConical",
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
        icon: "BrainCircuit",
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
    heroSubtext: "Nocturnal emissions, commonly referred to as nightfall or wet dreams, involve the involuntary ejaculation of semen during sleep.",
    description: "It is a normal physiological occurrence, especially during adolescence and early adulthood, but it can occur at any age. It is a natural way for the body to release built-up semen and is not a disease. Many people experience unnecessary anxiety and guilt due to myths and misconceptions regarding nightfall.",
    causes: [
      {
        icon: "Activity",
        title: "Symptoms & Common Concerns",
        points: [
          "Involuntary ejaculation during sleep",
          "Often accompanied by erotic dreams",
          "Excessive worry or guilt upon waking",
          "Fear of losing physical strength or vital energy",
          "Anxiety that it may cause future sexual problems or infertility"
        ]
      },
      {
        icon: "FlaskConical",
        title: "Causes & Mechanisms",
        points: [
          "A natural physiological response to hormonal changes and semen accumulation",
          "More frequent during puberty and periods of sexual abstinence",
          "Erotic dreams and sexual arousal during sleep",
          "Not caused by a physical illness or weakness"
        ]
      },
      {
        icon: "BrainCircuit",
        title: "Psychological Impact",
        points: [
          "Significant distress due to cultural myths and misinformation",
          "Unnecessary feelings of shame and loss of self-confidence",
          "Compulsive checking or anxiety about sleep",
          "Fear of relationship problems or future infertility not supported by medical science"
        ]
      }
    ],
    treatments: [
      { title: "Medical Education & Reassurance", description: "The most important intervention is proper scientific education. Understanding that nocturnal emissions are a sign of a normally functioning reproductive system, rather than an illness, is essential for reducing anxiety." },
      { title: "Psychological Counseling", description: "Counseling helps individuals address deep-rooted cultural myths, reduce unnecessary guilt, and manage the anxiety related to sleep and sexual health." },
      { title: "Lifestyle Support", description: "Maintaining a balanced lifestyle, managing stress, and engaging in healthy physical activities can help reduce overall anxiety and improve well-being." },
      { title: "Clinical Evaluation", description: "While nocturnal emissions do not require medical treatment, if the anxiety is severe or if there are other accompanying physical symptoms like pain during urination, a clinical evaluation is recommended to provide complete reassurance." }
    ],
    cta: { 
      headline: "Confidential Education & Support", 
      subtext: "Don't let myths and misinformation cause unnecessary stress. Consult a specialist to get accurate scientific information and peace of mind.", 
      buttonText: "Book an Appointment" 
    }
  },
  "masturbation-habit": {
    title: "Masturbation Habit & Guilt",
    badge: "Psychosexual Care",
    doctor: "Clinical Team",
    leadDoctorRole: "Specialists",
    heroHeadline: "Masturbation Habit & Guilt",
    heroSubtext: "Masturbation is a common and normal sexual behavior for people of all ages and genders. From a medical perspective, it is considered a healthy way to explore one’s body and experience sexual pleasure.",
    description: "However, deep-rooted cultural myths, misinformation, and moral beliefs often lead to significant guilt, anxiety, and distress regarding this practice. While masturbation itself is not physically harmful, when it becomes compulsive or is associated with severe guilt, it can negatively impact a person's mental health and quality of life.",
    causes: [
      {
        icon: "BrainCircuit",
        title: "Psychological Symptoms & Guilt",
        points: [
          "Intense feelings of guilt, shame, or regret after masturbating",
          "Fear that it causes physical weakness, hair loss, or poor vision (common myths)",
          "Anxiety that it will lead to future sexual dysfunction or infertility",
          "Loss of self-esteem and confidence",
          "Distress related to breaking personal, religious, or cultural rules"
        ]
      },
      {
        icon: "Activity",
        title: "Compulsive Behavior (When to Seek Help)",
        points: [
          "Masturbating excessively to cope with stress, anxiety, or depression",
          "Difficulty controlling the urge, even when it causes physical soreness",
          "When the habit interferes with work, studies, or social responsibilities",
          "When it replaces or severely damages intimate relationships",
          "Spending excessive time viewing pornography"
        ]
      },
      {
        icon: "ShieldCheck",
        title: "Common Myths vs. Medical Facts",
        points: [
          "Myth: It causes physical weakness or loss of vitality. Fact: Semen is naturally replenished by the body.",
          "Myth: It causes erectile dysfunction or premature ejaculation. Fact: There is no direct medical link.",
          "Myth: It causes infertility. Fact: It does not permanently affect sperm count or fertility."
        ]
      }
    ],
    treatments: [
      { title: "Scientific Education & Reassurance", description: "The foundation of treatment is providing accurate medical information. Dispelling common myths helps significantly reduce unnecessary guilt and fear regarding future health and sexual function." },
      { title: "Psychological Counseling & CBT", description: "Cognitive Behavioral Therapy (CBT) helps individuals challenge irrational fears and guilt. If the behavior is compulsive and used to cope with stress, counseling helps identify triggers and develop healthier coping mechanisms." },
      { title: "Addressing Underlying Conditions", description: "If compulsive masturbation or excessive pornography use is driven by underlying depression, severe anxiety, or relationship dissatisfaction, treating these primary conditions is essential for recovery." },
      { title: "Relationship Counseling", description: "For individuals whose habits are affecting their partner or marital intimacy, couples counseling can facilitate open communication and help rebuild mutual sexual connection." }
    ],
    cta: { 
      headline: "Overcome Guilt & Reclaim Your Confidence", 
      subtext: "If guilt, anxiety, or compulsive habits are affecting your life, professional counseling can provide clarity and support in a non-judgmental environment.", 
      buttonText: "Book an Appointment" 
    }
  },
  "homosexuality-counseling": {
    title: "Homosexuality Is Not a Disease",
    badge: "Psychosexual Counseling & Support",
    doctor: "Clinical Team",
    leadDoctorRole: "Specialists",
    heroHeadline: "Homosexuality Is Not a Disease",
    heroSubtext: "It is important to clearly understand that homosexuality, bisexuality, and other diverse sexual orientations are natural variations of human sexuality.",
    description: "Major medical and psychiatric organizations worldwide, including the World Health Organization (WHO) and the Indian Psychiatric Society (IPS), have long established that homosexuality is not a mental disorder or a disease. It does not require a “cure,” and attempts to change a person’s sexual orientation (often called “conversion therapy”) are unscientific, unethical, and psychologically harmful.",
    causes: [
      {
        icon: "BrainCircuit",
        title: "Challenges & Psychological Impact",
        points: [
          "Internalized stigma and guilt due to societal or family expectations",
          "Anxiety, depression, or distress related to sexual identity",
          "Fear of rejection, discrimination, or bullying",
          "Pressure to marry against one's orientation",
          "Confusion or difficulty in coming out to family and friends"
        ]
      },
      {
        icon: "ShieldCheck",
        title: "Medical Consensus",
        points: [
          "Homosexuality is a natural variation of human sexuality.",
          "It is not an illness, disorder, or a result of hormonal imbalance.",
          "It cannot and should not be 'cured' or changed.",
          "Conversion therapies cause severe psychological harm and are medically condemned."
        ]
      },
      {
        icon: "Activity",
        title: "Role of Psychiatric Counseling",
        points: [
          "Psychiatrists do not 'treat' homosexuality.",
          "Counseling is offered to help individuals manage societal stress, anxiety, and depression.",
          "Support for self-acceptance and healthy identity development.",
          "Guidance for families to understand and support their loved ones."
        ]
      }
    ],
    treatments: [
      { title: "Affirmative Counseling", description: "Affirmative therapy focuses on validating and accepting an individual's sexual orientation. It provides a safe, non-judgmental space to explore identity, reduce internalized stigma, and build self-esteem." },
      { title: "Treatment for Associated Distress", description: "While the sexual orientation itself is not treated, individuals may experience significant depression, anxiety, or stress due to discrimination or family pressure. These associated mental health concerns are treated using evidence-based psychotherapy and, if necessary, medication." },
      { title: "Family & Relationship Counseling", description: "Counseling can help families and partners navigate the challenges of coming out. It provides scientific education to parents and helps build a supportive and accepting home environment." },
      { title: "Support Groups and Peer Counseling", description: "Connecting with supportive communities and peer groups can significantly reduce feelings of isolation and provide practical guidance for navigating social challenges." }
    ],
    cta: { 
      headline: "Affirmative Support & Guidance", 
      subtext: "You deserve respect, acceptance, and a safe space. Consult our specialists for affirmative counseling and support for you or your family.", 
      buttonText: "Book an Appointment" 
    }
  },
  "infertility": {
    title: "Infertility",
    badge: "Reproductive Health",
    doctor: "Clinical Team",
    leadDoctorRole: "Specialists",
    heroHeadline: "Infertility",
    heroSubtext: "Infertility is a medical condition defined by the inability to conceive after a year (or longer) of regular, unprotected intercourse.",
    description: "It is a common issue affecting many couples and can result from factors in either or both partners. Infertility is not a personal failure and is often highly treatable. A comprehensive medical assessment of both partners is the essential first step toward building a successful treatment plan.",
    causes: [
      {
        icon: "Activity",
        title: "Male Factors",
        points: [
          "Low sperm count (Oligospermia) or absence of sperm (Azoospermia)",
          "Poor sperm motility or abnormal sperm morphology",
          "Erectile dysfunction or ejaculation problems",
          "Hormonal imbalances (e.g., low testosterone)",
          "Varicocele (enlarged veins in the scrotum)",
          "Previous infections, testicular injury, or genetic factors"
        ]
      },
      {
        icon: "FlaskConical",
        title: "Female Factors",
        points: [
          "Ovulation disorders (e.g., PCOS, hormonal imbalances)",
          "Blocked or damaged fallopian tubes",
          "Endometriosis or uterine fibroids",
          "Age-related decline in egg quality and quantity",
          "Pelvic inflammatory disease or structural abnormalities"
        ]
      },
      {
        icon: "BrainCircuit",
        title: "Shared & Lifestyle Factors",
        points: [
          "Unexplained infertility (when routine tests are normal)",
          "Advanced age in either partner",
          "Excessive stress, severe anxiety, or depression",
          "Obesity or being significantly underweight",
          "Smoking, excessive alcohol, or exposure to environmental toxins"
        ]
      }
    ],
    treatments: [
      { title: "Medical Therapy", description: "For men, hormone treatments or medications to treat infections may improve sperm parameters. For women, ovulation-inducing medications (like clomiphene or letrozole) are often prescribed to stimulate egg production." },
      { title: "Surgical Interventions", description: "Surgery may be required to correct anatomical problems. In men, repairing a varicocele or retrieving sperm directly from the testicles may be performed. In women, surgery can remove polyps, fibroids, or clear blocked fallopian tubes." },
      { title: "Intrauterine Insemination (IUI)", description: "A procedure where specially prepared, healthy sperm are placed directly into the uterus around the time of ovulation, increasing the chances of fertilization." },
      { title: "In Vitro Fertilization (IVF)", description: "A widely used assisted reproductive technology (ART). Eggs are retrieved from the ovaries, fertilized with sperm in a laboratory, and the resulting embryo is transferred into the uterus." },
      { title: "Intracytoplasmic Sperm Injection (ICSI)", description: "Often used alongside IVF for severe male infertility. A single healthy sperm is injected directly into a mature egg to facilitate fertilization." },
      { title: "Psychological Support & Counseling", description: "Infertility treatments can be emotionally demanding and stressful for a couple. Counseling provides emotional support, helps manage expectations, and improves communication between partners during the treatment process." }
    ],
    cta: { 
      headline: "Comprehensive Fertility Assessment", 
      subtext: "Many causes of infertility are treatable. Start your journey with a compassionate and comprehensive clinical evaluation for both partners.", 
      buttonText: "Book an Appointment" 
    }
  }
};

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/intima-health");
    console.log("Connected to DB.");

    const slugs = Object.keys(serviceDataMap);
    for (const slug of slugs) {
      const existing = await TreatmentModel.findOne({ slug });
      if (!existing) {
        const data = serviceDataMap[slug];
        await TreatmentModel.create({ ...data, slug });
        console.log(`Created: ${slug}`);
      } else {
        console.log(`Skipped (already exists): ${slug}`);
      }
    }
    console.log("Seeding done.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
