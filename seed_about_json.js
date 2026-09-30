const mongoose = require("mongoose");
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/intima-health";

const PageSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  deletedAt: { type: Date, default: null }
}, { collection: "pages", timestamps: true });

const Page = mongoose.model("Page", PageSchema);

const aboutData = {
  heroTitle1: "Leading Psychiatric &",
  heroTitle2: "Mental Health Care.",
  heroSubtitle: "Founded by Dr. Deepak Kelkar, Dr. Kelkar Hospital in Akola & Nagpur provides pioneer psychiatric treatment, de-addiction rehabilitation, and the Happiness 20 – Mind Gym program.",
  valuesTitle: "What Drives Us Forward",
  valuesDescription: "Everything we do at KELKAR MANAS HEALTH CLINIC is guided by four core principles that ensure we deliver the best possible care and products.",
  values: [
    { icon: "Shield", title: "Clinical Excellence", description: "Backed by rigorous research and leading medical professionals." },
    { icon: "Heart", title: "Compassionate Care", description: "Empathy and understanding at the heart of every interaction." },
    { icon: "Sparkles", title: "Innovation", description: "Continuously pushing boundaries in intimate health solutions." },
    { icon: "Users", title: "Inclusivity", description: "Accessible, judgment-free care designed for every body." }
  ],
  expertsTitle: "Meet Our Medical Experts",
  expertsDescription: "Our products and protocols are developed by leading specialists in psychiatry and de-addiction.",
  experts: [
    { img: "/images/doctor_1.png", name: "Dr. Deepak Kelkar", role: "Senior Psychiatrist & Founder", spec: "MD Psychiatry, Mind Gym Pioneer" },
    { img: "/images/doctor_2.png", name: "Dr. Amol Kelkar", role: "Consultant Psychiatrist", spec: "De-Addiction Specialist" },
    { img: "/images/doctor_3.png", name: "Dr. Radhika Kelkar", role: "Specialist in Child Psychiatry", spec: "DPM, Child Development" }
  ]
};

async function seed() {
  await mongoose.connect(uri);
  
  const contentStr = JSON.stringify(aboutData, null, 2);
  
  let existing = await Page.findOne({ slug: "about" });
  if (existing) {
    existing.content = contentStr;
    await existing.save();
    console.log("Updated about page");
  } else {
    await Page.create({ title: "About Us", slug: "about", content: contentStr });
    console.log("Created about page");
  }
  
  process.exit(0);
}

seed().catch(console.error);
