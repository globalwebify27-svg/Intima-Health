require('dotenv').config({ path: '.env.local' });
const mongoose = require("mongoose");
const uri = process.env.MONGODB_URI;

const PageSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  deletedAt: { type: Date, default: null }
}, { collection: "pages", timestamps: true });

const Page = mongoose.model("Page", PageSchema);

const contactData = {
  heroTitle: "Get in <span class=\"text-primary italic\">touch.</span>",
  heroSubtitle: "Whether you have a clinical question, need support with an order, or want to book an walk-in visit, our dedicated care team is ready.",
  description: "For immediate assistance regarding medical emergencies, please dial your local emergency number. For all other inquiries, reach out below.",
  phone1: "8888915555",
  phone2: "9224326555",
  youtube: "https://youtube.com/@intimahealth",
  instagram: "https://instagram.com/dr.deepak.kelkar",
  twitter: "@drdeepakkelkar",
  website: "https://intimahealth.in",
  googleMaps: "https://maps.app.goo.gl/intima",
  googleReviews: "https://g.page/intima/review",
  hospitalsTitle: "Our Hospitals",
  hospitalsDesc: "We are proud to be associated with a network of four hospitals, providing comprehensive healthcare services with a strong focus on quality, compassion, and patient-centered care.",
  hospitalNames: "Kelkar Hospital Akola, Sanmitra Hospital Akola, Ashakiran Hospital, City Multispeciality Hospital Akola"
};

async function run() {
  await mongoose.connect(uri);
  const content = JSON.stringify(contactData, null, 2);
  const dbSlug = `contact`;
  let page = await Page.findOne({ slug: dbSlug });
  if (page) {
    page.content = content;
    await page.save();
    console.log(`Updated ${dbSlug}`);
  } else {
    await Page.create({ title: "Contact", slug: dbSlug, content });
    console.log(`Created ${dbSlug}`);
  }
  process.exit(0);
}

run().catch(console.error);
