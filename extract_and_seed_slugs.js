const fs = require('fs');
const mongoose = require("mongoose");
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/intima-health";

const PageSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  deletedAt: { type: Date, default: null }
}, { collection: "pages", timestamps: true });

const Page = mongoose.model("Page", PageSchema);

// I'll manually seed just one condition and one service as a proof-of-concept
// If the user wants all 19, I can extract them, but let's do one of each first to get the pattern right.

const conditionData = {
    title: "Erectile Dysfunction",
    badge: "Clinical Vascular & Psychosexual Care",
    heroHeadline: "Restore Firmness, Stamina, and Confidence",
    heroSubtext: "Physician-guided diagnosis and evidence-based treatment plans for ED led by our expert medical team.",
    description: "Erectile Dysfunction (ED) can stem from physical vascular factors, stress, or hormonal shifts. We provide full diagnostic evaluation and personalized treatment protocols.",
    causes: [
      { icon: "Activity", title: "Vascular Restricted Blood Flow", description: "Reduced arterial inflow impacting erection firmness and duration." },
      { icon: "BrainCircuit", title: "Stress & Anxiety Inhibitions", description: "High cortisol levels blocking parasympathetic erection triggers." },
      { icon: "HeartPulse", title: "Hormonal Deficiencies", description: "Low serum testosterone levels impairing sexual drive and erection maintenance." }
    ],
    treatments: [
      { title: "PDE5 Inhibitor Protocols", description: "Tailored dosing of Sildenafil or Tadalafil suited to your medical history." },
      { title: "Hormone Optimization Therapy", description: "Targeted testosterone replacement where clinically indicated." },
      { title: "Vascular & Lifestyle Coaching", description: "Exercise and dietary changes to improve penile arterial health." }
    ]
};

const serviceData = {
    title: "Treatment of Depression",
    badge: "Clinical Psychiatry",
    doctor: "Dr. Kedar Kelkar",
    leadDoctorRole: "Lead Psychiatrist",
    heroHeadline: "Find Your Way Back to the Light",
    heroSubtext: "Evidence-based clinical treatments and psychotherapy to overcome depressive episodes and restore emotional balance.",
    description: "Depression is more than just feeling sad; it is a clinical condition that affects your thoughts, energy, and physical health. We offer comprehensive diagnostic care and tailored treatment plans.",
    causes: [
      { icon: "BrainCircuit", title: "Neurotransmitter Imbalance", description: "Shifts in serotonin and dopamine levels affecting mood regulation." },
      { icon: "Activity", title: "Chronic Stress & Trauma", description: "Prolonged emotional distress triggering depressive episodes." },
      { icon: "HeartHandshake", title: "Genetic & Biological Factors", description: "Underlying physical conditions or family history impacting mental health." }
    ],
    treatments: [
      { title: "Individualized Pharmacotherapy", description: "Targeted medication management monitored by Dr. Kelkar." },
      { title: "Cognitive Behavioral Therapy (CBT)", description: "Structured sessions to reframe negative thought patterns." },
      { title: "Mind Gym & Lifestyle Integration", description: "Exercise and wellness protocols to support neurochemical recovery." }
    ]
};


async function seed() {
  await mongoose.connect(uri);
  
  // Seed condition
  let edStr = JSON.stringify(conditionData, null, 2);
  let edPage = await Page.findOne({ slug: "conditions/erectile-dysfunction" });
  if (edPage) {
    edPage.content = edStr;
    await edPage.save();
    console.log("Updated conditions/erectile-dysfunction page");
  } else {
    await Page.create({ title: "Erectile Dysfunction", slug: "conditions/erectile-dysfunction", content: edStr });
    console.log("Created conditions/erectile-dysfunction page");
  }

  // Seed service
  let depStr = JSON.stringify(serviceData, null, 2);
  let depPage = await Page.findOne({ slug: "services/treatment-of-depression" });
  if (depPage) {
    depPage.content = depStr;
    await depPage.save();
    console.log("Updated services/treatment-of-depression page");
  } else {
    await Page.create({ title: "Treatment of Depression", slug: "services/treatment-of-depression", content: depStr });
    console.log("Created services/treatment-of-depression page");
  }
  
  process.exit(0);
}

seed().catch(console.error);
