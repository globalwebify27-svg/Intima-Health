export interface RehabCentre {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  image?: string;
  hidePdf?: boolean;
  shortDescription: string;
  fullAbout: string;
  founderInfo?: string;
  services: string[];
  servicesDisclaimer?: string;
  rtmsIntro?: string;
  rtmsConditions?: string[];
  rtmsBenefits?: string[];
  rtmsSummary?: string;
  requiredDocuments?: { title: string; list: string[]; note: string };
  closingWellnessNote?: string;
  whyChooseUs?: string[];
  address: string;
  phones: string[];
  googleMapQuery: string;
  googleMapEmbed: string;
  googleMapDirectionUrl: string;
  cashlessSchemeBadge: string;
  cashlessSchemeDetails: string;
  features: string[];
}

export const REHAB_CENTRES: RehabCentre[] = [
  {
    id: "ashakiran-rehabilitation-centre",
    slug: "ashakiran-rehabilitation-centre",
    name: "Ashakiran Rehabilitation Centre",
    tagline: "Dedicated Inpatient Care for Mental Health & Alcohol Addiction",
    hidePdf: true,
    shortDescription:
      "Ashakiran Rehabilitation Centre is dedicated to providing specialized care for patients struggling with mental health issues and alcohol addiction. Our facility offers a safe and supportive environment where patients can receive treatment without the need for a relative to accompany them. Our experienced medical staff ensures that every patient receives personalized care for their recovery journey.",
    fullAbout:
      "Ashakiran Rehabilitation Centre is dedicated to providing specialized care for patients struggling with mental health issues and alcohol addiction. Our facility offers a safe and supportive environment where patients can receive treatment without the need for a relative to accompany them. Our experienced medical staff ensures that every patient receives personalized care for their recovery journey.",
    services: [
      "Treatment for mental health conditions",
      "Alcohol and addiction rehabilitation",
      "Counselling and therapy sessions",
      "24/7 medical support and supervision",
      "Comprehensive care programs designed for long-term recovery"
    ],
    whyChooseUs: [
      "Expert team of mental health professionals",
      "Specialized treatment plans for addiction recovery",
      "Safe environment for patients without requiring a guardian's presence",
      "Focus on holistic healing and rehabilitation"
    ],
    address: "Near Kelkar Hospital, RAMDAS PETH, Akola",
    phones: ["+91 7030414140", "+91 8805097227"],
    googleMapQuery: "Ashakiran Hospital, Ramdas Peth, Akola, Maharashtra",
    googleMapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3732.381283679869!2d77.00192537525282!3d20.70014098086817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd7299c8f0f0001%3A0x6b8d279cf48c3b77!2sKelkar%20Hospital!5e0!3m2!1sen!2sin!4v1792666800000!5m2!1sen!2sin",
    googleMapDirectionUrl:
      "https://www.google.com/maps/dir/?api=1&destination=Kelkar+Hospital+Ramdas+Peth+Akola+Maharashtra",
    cashlessSchemeBadge: "Specialized Inpatient De-Addiction",
    cashlessSchemeDetails:
      "Inpatient rehabilitation and comprehensive de-addiction care at Ashakiran Rehabilitation Centre. Cashless treatment with Ayushman Card is available for eligible patients at participating centres, subject to current scheme rules and approval.",
    features: ["Inpatient Rehabilitation", "No Relative Required", "24/7 Medical Supervision", "Holistic Recovery"]
  },
  {
    id: "sanmitra-manas-hospital",
    slug: "sanmitra-manas-hospital",
    name: "Sanmitra Manas Hospital",
    tagline: "Free Mental Health Treatment | Advanced RTMS Technology for Depression, Anxiety & OCD",
    hidePdf: true,
    shortDescription:
      "Sanmitra Manas Hospital and Rehab Center in Akola provides free mental health treatments under the Mahatma Phule Jan Arogya Yojana. Founded by Dr. Deepak Kelkar and associated with Kelkar Hospital, this initiative ensures advanced mental health care is accessible to everyone, free of cost.",
    fullAbout:
      "Mental health is a growing concern in today’s world, and access to affordable, effective treatments remains a challenge for many. In a groundbreaking initiative, Sanmitra Manas Hospital and Rehab Center in Akola now provides free mental health treatments under the Mahatma Phule Jan Arogya Yojana. This initiative ensures that mental health care is available to everyone, particularly for those battling severe mental illnesses.",
    founderInfo:
      "Hospital Name: Kelkar Hospital. Founder: Dr. Deepak Kelkar. Location: Kelkar Hospital, Ramdas Peth, Akola, Maharashtra.",
    services: [
      "Depression (उदासीनता)",
      "Anxiety and Phobias (चिंता आणि भीती)",
      "Obsessive Compulsive Disorder (OCD)",
      "Seizures/Epilepsy (आकडीचे झटके)",
      "Migraine (डोकेदुखी)",
      "Delusions and Compulsions"
    ],
    servicesDisclaimer:
      "These treatments are completely free under the Mahatma Phule Jan Arogya Yojana, ensuring no financial burden on patients.",
    rtmsIntro:
      "Sanmitra Manas Hospital also provides cutting-edge treatments using Repetitive Transcranial Magnetic Stimulation (RTMS). This is a non-invasive procedure that effectively treats:",
    rtmsConditions: [
      "Depression (उदासीनता)",
      "Anxiety Disorders",
      "OCD (बार-बार हात धुण्याची सवय)",
      "Smoking Addiction"
    ],
    rtmsBenefits: [
      "Activates brain neurons for improved mental health.",
      "Achieves 50%-60% success rates in treatment-resistant depression.",
      "Provides long-term relief and reduces relapse chances.",
      "Approved by the American FDA, ensuring safety and reliability."
    ],
    rtmsSummary:
      "With RTMS technology, patients can experience effective recovery without invasive procedures or heavy medication.",
    requiredDocuments: {
      title: "How to Avail the Benefits",
      list: ["Aadhaar Card", "Ration Card"],
      note: "To benefit from the free treatments at Sanmitra Manas Hospital under the Mahatma Phule Yojana, patients must carry Aadhaar Card and Ration Card. This ensures eligibility verification for free healthcare services."
    },
    closingWellnessNote:
      "Mental health is just as important as physical health. Sanmitra Manas Hospital’s initiative under the Mahatma Phule Jan Arogya Yojana is a golden opportunity for individuals struggling with mental health conditions to receive advanced, effective treatments—free of cost.",
    address: "Near Kelkar Hospital, RAMDAS PETH, Akola",
    phones: ["+91 7030414140", "+91 8805097227"],
    googleMapQuery: "Sanmitra Hospital, Ramdas Peth, Akola, Maharashtra",
    googleMapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3732.381283679869!2d77.00192537525282!3d20.70014098086817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd7299c8f0f0001%3A0x6b8d279cf48c3b77!2sKelkar%20Hospital!5e0!3m2!1sen!2sin!4v1792666800000!5m2!1sen!2sin",
    googleMapDirectionUrl:
      "https://www.google.com/maps/dir/?api=1&destination=Kelkar+Hospital+Ramdas+Peth+Akola+Maharashtra",
    cashlessSchemeBadge: "Mahatma Jyotiba Phule Jan Arogya Yojana & PM-JAY",
    cashlessSchemeDetails:
      "Empanelled hospital for Mahatma Jyotiba Phule Jan Arogya Yojana & Pradhanmantri Jeevandayee Arogya Yojana. Free Mental Health Treatment under Mahatma Phule Yojana.",
    features: [
      "Mahatma Phule Jan Arogya Yojana",
      "Pradhanmantri Jeevandayee Yojana",
      "Advanced RTMS Technology",
      "Free Treatment"
    ]
  }
];

export function getRehabCentreBySlug(slug: string): RehabCentre | undefined {
  return REHAB_CENTRES.find(c => c.slug === slug || c.id === slug);
}
