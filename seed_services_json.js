const mongoose = require("mongoose");
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/intima-health";

const PageSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  deletedAt: { type: Date, default: null }
}, { collection: "pages", timestamps: true });

const Page = mongoose.model("Page", PageSchema);

const servicesData = {
  heroTitle1: "Comprehensive",
  heroTitle2: "Care Options",
  heroSubtitle: "From expert clinical psychiatry and de-addiction programs to innovative mind gym therapy, we provide complete mental healthcare under one roof.",
  servicesTitle: "Our Specialties",
  servicesDescription: "Explore our specialized treatment options tailored to your specific needs.",
  services: [
    {
      icon: "HeartHandshake",
      title: "Treatment of Depression",
      description: "Clinical diagnostic care, psychotherapy, and individual medication management to restore emotional balance.",
      features: ["Clinical Assessment", "Individualized Treatment", "Mind Gym Integration"],
      color: "bg-chart-1",
      slug: "treatment-of-depression"
    },
    {
      icon: "ShieldCheck",
      title: "Treatment of Anxiety",
      description: "Evidence-based therapy and care plans for generalized anxiety, panic disorders, and social anxiety.",
      features: ["Cognitive Restructuring", "Stress Management", "Pharmacotherapy"],
      color: "bg-chart-2",
      slug: "treatment-of-anxiety"
    },
    {
      icon: "ClipboardList",
      title: "Treatment of OCD",
      description: "Specialized ERP (Exposure & Response Prevention) therapy and clinical care for Obsessive-Compulsive Disorder.",
      features: ["Behavioral Therapy", "ERP Protocols", "Long-term Maintenance"],
      color: "bg-chart-4",
      slug: "ocd-treatment"
    },
    {
      icon: "Activity",
      title: "Alcohol De-Addiction",
      description: "Inpatient and outpatient detoxification, counseling, and relapse prevention at Ashakiran Rehab.",
      features: ["Medical Detoxification", "Relapse Prevention", "Family Counseling"],
      color: "bg-primary",
      slug: "alcohol-de-addiction"
    },
    {
      icon: "Stethoscope",
      title: "Nicotine De-Addiction",
      description: "Structured cessation programs, nicotine replacement guidance, and psychological support.",
      features: ["Cessation Protocols", "Craving Control", "Behavioral Support"],
      color: "bg-secondary",
      slug: "nicotine-de-addiction"
    },
    {
      icon: "Pill",
      title: "Brown Sugar De-Addiction",
      description: "Specialized clinical rehabilitation and medical recovery protocols for heavy substance dependence.",
      features: ["Medical Supervision", "24/7 Rehabilitation Support", "Aftercare Planning"],
      color: "bg-chart-3",
      slug: "brown-sugar-de-addiction"
    },
    {
      icon: "Clock",
      title: "Child & Adolescent Psychiatry",
      description: "Specialized care for pediatric mental health, ADHD, autism spectrum, and behavioral concerns led by Dr. Radhika Kelkar.",
      features: ["Developmental Evaluation", "Parent Guidance", "School Readiness"],
      color: "bg-chart-5",
      slug: "child-and-adolescent-psychiatry"
    },
    {
      icon: "HeartHandshake",
      title: "Geriatric Psychiatry",
      description: "Compassionate mental healthcare tailored for seniors, addressing dementia, memory loss, and mood changes.",
      features: ["Memory Assessments", "Dementia Care Support", "Senior Counseling"],
      color: "bg-chart-1",
      slug: "geriatric-psychiatry"
    }
  ]
};

async function seed() {
  await mongoose.connect(uri);
  
  const contentStr = JSON.stringify(servicesData, null, 2);
  
  let existing = await Page.findOne({ slug: "services" });
  if (existing) {
    existing.content = contentStr;
    await existing.save();
    console.log("Updated services page");
  } else {
    await Page.create({ title: "Services", slug: "services", content: contentStr });
    console.log("Created services page");
  }
  
  process.exit(0);
}

seed().catch(console.error);
