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
  description: "For immediate assistance regarding medical emergencies, please dial your local emergency number. For all other inquiries, reach out below.",
  phone1: "+91 8484931874",
  phone2: "+91 7028088838",
  youtube: "https://www.youtube.com/@deepakkelkar736",
  instagram: "https://www.instagram.com/dr_kelkar_sexologist",
  twitter: "Dr. Deepak Kelkar / Kelkar Hospital",
  website: "https://kelkarhospital.in/",
  googleMaps: "https://share.google/lOTkT4usjPYR8eKv8",
  googleReviews: "https://g.page/r/CR-i3bCCuZXuEBM/review"
});

async function seed() {
  await mongoose.connect(uri);
  const existing = await Page.findOne({ slug: "contact" });
  if (existing) {
    existing.content = jsonData;
    await existing.save();
    console.log("Contact page updated in DB (JSON).");
  } else {
    console.log("Contact page not found.");
  }
  process.exit(0);
}

seed().catch(console.error);
