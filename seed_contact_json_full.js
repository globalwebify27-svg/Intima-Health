const mongoose = require("mongoose");
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/intima-health";

const PageSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  deletedAt: { type: Date, default: null }
}, { collection: "pages", timestamps: true });

const Page = mongoose.model("Page", PageSchema);

const jsonData = JSON.stringify({
  heroTitle: "", // leaving empty so it defaults to the rich text version with italics, or we could provide string. Let's leave it empty for rich text.
  heroSubtitle: "Whether you have a clinical question, need support with an order, or want to book an walk-in visit, our dedicated care team is ready.",
  description: "For immediate assistance regarding medical emergencies, please dial your local emergency number. For all other inquiries, reach out below.",
  phone1: "+91 8484931874",
  phone2: "+91 7028088838",
  youtube: "https://www.youtube.com/@deepakkelkar736",
  instagram: "https://www.instagram.com/dr_kelkar_sexologist",
  twitter: "Dr. Deepak Kelkar / Kelkar Hospital",
  website: "https://kelkarhospital.in/",
  googleMaps: "https://share.google/lOTkT4usjPYR8eKv8",
  googleReviews: "https://g.page/r/CR-i3bCCuZXuEBM/review",
  hospitalsTitle: "Our Hospitals",
  hospitalsDesc: "We are proud to be associated with a network of four hospitals, providing comprehensive healthcare services with a strong focus on quality, compassion, and patient-centered care.",
  hospitalNames: "Kelkar Hospital, Akola, Sanmitra Hospital, Akola, Ashakiran Hospital, City Multispeciality Hospital, Akola"
});

async function seed() {
  await mongoose.connect(uri);
  const existing = await Page.findOne({ slug: "contact" });
  if (existing) {
    existing.content = jsonData;
    await existing.save();
    console.log("Contact page full data updated in DB (JSON).");
  } else {
    console.log("Contact page not found.");
  }
  process.exit(0);
}

seed().catch(console.error);
