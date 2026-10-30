const mongoose = require("mongoose");
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/intima-health";

const PageSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  deletedAt: { type: Date, default: null }
}, { collection: "pages", timestamps: true });

const Page = mongoose.model("Page", PageSchema);

const htmlContent = `
<p class="text-muted-foreground mb-8">
  For immediate assistance regarding medical emergencies, please dial your local emergency number. For all other inquiries, reach out below.
</p>
<div class="space-y-8">
  <div class="flex items-start gap-4">
    <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
      <span class="text-xl">📞</span>
    </div>
    <div>
      <h4 class="font-semibold text-lg mb-1">Mobile Numbers</h4>
      <p class="text-muted-foreground text-sm mb-1">Appointment / Contact</p>
      <div class="flex flex-col gap-1 mt-2">
        <a href="tel:+918484931874" class="text-primary font-medium hover:underline text-lg">📞 +91 8484931874</a>
        <a href="tel:+917028088838" class="text-primary font-medium hover:underline text-lg">📞 +91 7028088838</a>
      </div>
    </div>
  </div>
  <div class="flex items-start gap-4">
    <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
      <span class="text-xl">✉️</span>
    </div>
    <div>
      <h4 class="font-semibold text-lg mb-1">Connect With Us</h4>
      <div class="flex flex-col gap-2 mt-2">
        <a href="https://www.youtube.com/@deepakkelkar736" target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-primary text-sm">YouTube: @deepakkelkar736</a>
        <a href="https://www.instagram.com/dr_kelkar_sexologist" target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-primary text-sm">Instagram: dr.deepak.kelkar</a>
        <p class="text-muted-foreground text-sm">Twitter/X: Dr. Deepak Kelkar / Kelkar Hospital</p>
        <a href="https://kelkarhospital.in/" target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-primary text-sm">Website: https://kelkarhospital.in/</a>
        <a href="https://share.google/lOTkT4usjPYR8eKv8" target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-primary text-sm">Google Maps</a>
        <a href="https://g.page/r/CR-i3bCCuZXuEBM/review" target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-primary text-sm">Google Reviews</a>
      </div>
    </div>
  </div>
  <div class="flex items-start gap-4 bg-muted/50 p-6 rounded-2xl border border-border">
    <span class="text-3xl shrink-0">🛡️</span>
    <div>
      <h4 class="font-semibold text-base mb-1 text-emerald-700">100% Confidential</h4>
      <p class="text-muted-foreground text-sm">
        All communications are securely encrypted and protected under strict HIPAA compliance standards.
      </p>
    </div>
  </div>
</div>
`;

async function seed() {
  await mongoose.connect(uri);
  const existing = await Page.findOne({ slug: "contact" });
  if (existing) {
    existing.content = htmlContent;
    await existing.save();
    console.log("Contact page updated in DB.");
  } else {
    console.log("Contact page not found.");
  }
  process.exit(0);
}

seed().catch(console.error);
