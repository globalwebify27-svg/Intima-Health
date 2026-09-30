const mongoose = require("mongoose");
const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/intima-health";

const PageSchema = new mongoose.Schema({
  title: String,
  slug: String,
  content: String,
  deletedAt: { type: Date, default: null }
}, { collection: "pages", timestamps: true });

const Page = mongoose.model("Page", PageSchema);

const termsContent = `
<p class="font-medium text-lg">Last Updated: ${new Date().toLocaleDateString()}</p>
<h2 class="text-2xl font-bold mt-12 mb-4">1. Acceptance of Terms</h2>
<p>By accessing and using the KELKAR MANAS HEALTH CLINIC website and services, you accept and agree to be bound by the terms and provision of this agreement.</p>
<h2 class="text-2xl font-bold mt-12 mb-4">2. Medical Disclaimer</h2>
<p>The content on the KELKAR MANAS HEALTH CLINIC website is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>
<h2 class="text-2xl font-bold mt-12 mb-4">3. User Accounts</h2>
<p>When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
<h2 class="text-2xl font-bold mt-12 mb-4">4. Intellectual Property</h2>
<p>The Service and its original content, features, and functionality are and will remain the exclusive property of KELKAR MANAS HEALTH CLINIC and its licensors. The Service is protected by copyright, trademark, and other laws of both the country and foreign countries.</p>
<h2 class="text-2xl font-bold mt-12 mb-4">5. Changes to Terms</h2>
<p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion.</p>
`;

const privacyContent = `
<p class="font-medium text-lg">Last Updated: ${new Date().toLocaleDateString()}</p>
<h2 class="text-2xl font-bold mt-12 mb-4">1. Information We Collect</h2>
<p>At KELKAR MANAS HEALTH CLINIC, we take your privacy seriously. We collect information to provide better services to our users. This includes basic information like your IP address, as well as more complex information like the personal details you provide during registration or appointment booking.</p>
<h2 class="text-2xl font-bold mt-12 mb-4">2. How We Use Information</h2>
<p>The information we collect is used to:</p>
<ul class="list-disc pl-6 space-y-2 mb-6">
  <li>Provide, maintain, and improve our services.</li>
  <li>Process transactions and send related information, including confirmations and receipts.</li>
  <li>Send you technical notices, updates, security alerts, and support and administrative messages.</li>
  <li>Respond to your comments, questions, and requests, and provide customer service.</li>
</ul>
<h2 class="text-2xl font-bold mt-12 mb-4">3. Data Security</h2>
<p>We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information. We offer the use of a secure server. All supplied sensitive/credit information is transmitted via Secure Socket Layer (SSL) technology and then encrypted into our Payment gateway providers database only to be accessible by those authorized with special access rights to such systems.</p>
<h2 class="text-2xl font-bold mt-12 mb-4">4. Sharing of Information</h2>
<p>We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.</p>
<h2 class="text-2xl font-bold mt-12 mb-4">5. Contact Us</h2>
<p>If there are any questions regarding this privacy policy, you may contact us using the information on our Contact page.</p>
`;

const hipaaContent = `
<p class="font-medium text-lg">Last Updated: ${new Date().toLocaleDateString()}</p>
<h2 class="text-2xl font-bold mt-12 mb-4">1. Our Commitment to Your Privacy</h2>
<p>At KELKAR MANAS HEALTH CLINIC, we are dedicated to maintaining the privacy of your protected health information (PHI). In conducting our business, we will create records regarding you and the treatment and services we provide to you.</p>
<h2 class="text-2xl font-bold mt-12 mb-4">2. How We May Use and Disclose Your PHI</h2>
<p>We may use and disclose your PHI in the following ways:</p>
<ul class="list-disc pl-6 space-y-2 mb-6">
  <li><strong>Treatment:</strong> To provide, coordinate, or manage your health care and any related services.</li>
  <li><strong>Payment:</strong> To obtain payment for your health care services.</li>
  <li><strong>Health Care Operations:</strong> To support the business activities of our practice, such as quality assessment activities, employee review activities, and conducting or arranging for other business activities.</li>
</ul>
<h2 class="text-2xl font-bold mt-12 mb-4">3. Your Rights Regarding Your PHI</h2>
<p>You have the following rights regarding the PHI that we maintain about you:</p>
<ul class="list-disc pl-6 space-y-2 mb-6">
  <li><strong>Right to Inspect and Copy:</strong> You have the right to inspect and copy your PHI.</li>
  <li><strong>Right to Amend:</strong> You have the right to request that we amend your PHI if you believe it is incorrect or incomplete.</li>
  <li><strong>Right to an Accounting of Disclosures:</strong> You have the right to request a list of certain disclosures we have made of your PHI.</li>
  <li><strong>Right to Request Restrictions:</strong> You have the right to request a restriction or limitation on the PHI we use or disclose about you.</li>
</ul>
<h2 class="text-2xl font-bold mt-12 mb-4">4. Changes to This Notice</h2>
<p>We reserve the right to change this notice. We reserve the right to make the revised or changed notice effective for PHI we already have about you as well as any information we receive in the future.</p>
<h2 class="text-2xl font-bold mt-12 mb-4">5. Complaints</h2>
<p>If you believe your privacy rights have been violated, you may file a complaint with us or with the Secretary of the Department of Health and Human Services. All complaints must be submitted in writing.</p>
`;

async function seed() {
  await mongoose.connect(uri);
  
  const pages = [
    { title: "Terms of Service", slug: "terms", content: termsContent },
    { title: "Privacy Policy", slug: "privacy-policy", content: privacyContent },
    { title: "HIPAA Notice of Privacy Practices", slug: "hipaa", content: hipaaContent }
  ];

  for (const p of pages) {
    let existing = await Page.findOne({ slug: p.slug });
    if (existing) {
      existing.content = p.content;
      await existing.save();
      console.log(`Updated ${p.slug}`);
    } else {
      await Page.create(p);
      console.log(`Created ${p.slug}`);
    }
  }

  process.exit(0);
}

seed().catch(console.error);
