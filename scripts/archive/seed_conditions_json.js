const mongoose = require("mongoose");
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/intima-health";

const PageSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  deletedAt: { type: Date, default: null }
}, { collection: "pages", timestamps: true });

const Page = mongoose.model("Page", PageSchema);

const conditionsData = {
  heroTitle1: "Treatments for your",
  heroTitle2: "toughest challenges.",
  heroSubtitle: "From psychosexual concerns to complex mood disorders, our multidisciplinary clinical team provides specialized care to help you reclaim your life.",
  conditionsTitle: "Conditions We Treat",
  conditionsDescription: "Specialized clinical pathways for comprehensive wellness.",
  conditions: [
    {
      icon: "HeartPulse",
      title: "Sex For Happiness",
      description: "Holistic psychosexual wellness and counseling to enhance intimacy, emotional connection, and personal fulfillment.",
      treatments: ["Intimacy Counseling", "Relationship Guidance", "Mind-Body Integration"],
      color: "bg-rose-50 text-rose-600",
      slug: "/conditions/sex-for-happiness"
    },
    {
      icon: "Activity",
      title: "Premature Ejaculation",
      description: "Clinical and psychological treatment protocols to improve endurance, control, and sexual confidence.",
      treatments: ["Medical Therapy", "Behavioral Exercises", "Sensitivity Control"],
      color: "bg-indigo-50 text-indigo-600",
      slug: "/conditions/premature-ejaculation"
    },
    {
      icon: "Zap",
      title: "Erectile Dysfunction",
      description: "Advanced medical evaluation and effective treatment plans tailored by our senior specialists.",
      treatments: ["Pharmacotherapy", "Vascular Assessment", "Psychological Counseling"],
      color: "bg-blue-50 text-blue-600",
      slug: "/conditions/erectile-dysfunction"
    },
    {
      icon: "ShieldCheck",
      title: "Masturbation Counseling",
      description: "Confidential behavioral guidance, myth-busting, and psychological counseling for compulsion or anxiety.",
      treatments: ["Behavioral Therapy", "Psychoeducation", "Anxiety Reduction"],
      color: "bg-emerald-50 text-emerald-600",
      slug: "/conditions/masturbation-counseling"
    },
    {
      icon: "ShieldAlert",
      title: "Homosexual Anxiety",
      description: "Private, judgment-free psychological support and counseling for identity, relationship, or performance anxiety.",
      treatments: ["Affirmative Therapy", "Stress Management", "Individual Counseling"],
      color: "bg-purple-50 text-purple-600",
      slug: "/conditions/homosexual-anxiety"
    },
    {
      icon: "Heart",
      title: "Depression & Mood Disorders",
      description: "Depression and mood disorders can deeply impact every aspect of life. We offer evidence-based interventions including medication management and psychotherapy tailored to your unique needs.",
      treatments: ["Medication Management", "Cognitive Behavioral Therapy (CBT)", "Lifestyle Interventions"],
      color: "bg-rose-50 text-rose-600",
      slug: "/conditions/depression"
    },
    {
      icon: "ShieldAlert",
      title: "Anxiety & OCD Treatment",
      description: "Anxiety and Obsessive-Compulsive Disorder (OCD) can be overwhelming. Our targeted approach combines medication and specialized therapeutic techniques to restore your peace of mind.",
      treatments: ["Exposure and Response Prevention (ERP)", "Targeted Pharmacotherapy", "Mindfulness-Based Techniques"],
      color: "bg-indigo-50 text-indigo-600",
      slug: "/conditions/anxiety"
    },
    {
      icon: "Activity",
      title: "Alcohol & Drug De-Addiction",
      description: "Substance use disorders require compassionate, medically supervised care. We provide safe detoxification, rehabilitation, and long-term relapse prevention strategies.",
      treatments: ["Medically Supervised Detox", "Inpatient Rehabilitation", "Relapse Prevention Therapy"],
      color: "bg-emerald-50 text-emerald-600",
      slug: "/conditions/de-addiction"
    }
  ]
};

async function seed() {
  await mongoose.connect(uri);
  
  const contentStr = JSON.stringify(conditionsData, null, 2);
  
  let existing = await Page.findOne({ slug: "conditions" });
  if (existing) {
    existing.content = contentStr;
    await existing.save();
    console.log("Updated conditions page");
  } else {
    await Page.create({ title: "Conditions", slug: "conditions", content: contentStr });
    console.log("Created conditions page");
  }
  
  process.exit(0);
}

seed().catch(console.error);
