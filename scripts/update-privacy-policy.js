const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const privacyPolicyHtml = `
<div class="space-y-10 text-gray-700 leading-relaxed">
  <div class="border-b border-gray-200 pb-6 mb-8">
    <div class="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
      <span class="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
        Effective Date: October 2026
      </span>
      <span class="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
        Last Updated: October 2026
      </span>
    </div>
  </div>

  <section id="section-1" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">1. Introduction</h2>
    <p class="mb-3">
      Welcome to <strong>Kelkar Manas Health Care</strong> (“we,” “our,” or “us”). We respect your privacy and are committed to protecting the personal and health-related information you share with us through our website, appointment forms, communication channels, and healthcare services.
    </p>
    <p class="mb-3">
      This Privacy Policy explains how we collect, use, store, disclose, and protect your information when you visit our website, contact us, request an appointment, or use our services.
    </p>
    <p>
      By using our website or providing your information to us, you acknowledge that you have read this Privacy Policy. Where consent is legally required, we will seek it separately.
    </p>
  </section>

  <section id="section-2" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">2. Information We May Collect</h2>
    <p class="mb-4">
      Depending on the services you use and the information you provide, we may collect the following categories of information:
    </p>
    
    <div class="space-y-6">
      <div class="bg-gray-50 border border-gray-100 rounded-xl p-5">
        <h3 class="text-lg font-semibold text-gray-900 mb-3">A. Personal Information</h3>
        <ul class="list-disc pl-5 space-y-1.5 text-gray-600">
          <li>Full name</li>
          <li>Age or date of birth</li>
          <li>Contact number</li>
          <li>Email address</li>
          <li>City or general location</li>
          <li>Other information you voluntarily provide through our forms or communications</li>
        </ul>
      </div>

      <div class="bg-purple-50/50 border border-purple-100 rounded-xl p-5">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">B. Health-Related Information</h3>
        <p class="text-sm text-gray-600 mb-3">When necessary for providing healthcare services, we may collect information such as:</p>
        <ul class="list-disc pl-5 space-y-1.5 text-gray-600 mb-3">
          <li>Medical history and reported symptoms</li>
          <li>Mental health or sexual health concerns</li>
          <li>Previous diagnoses and treatment information</li>
          <li>Medication details and relevant medical reports</li>
          <li>Consultation notes and follow-up information</li>
        </ul>
        <p class="text-sm font-medium text-purple-900">We aim to collect only information that is reasonably necessary for the relevant purpose.</p>
      </div>

      <div class="bg-gray-50 border border-gray-100 rounded-xl p-5">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">C. Appointment and Transaction Information</h3>
        <p class="text-gray-600 mb-3">
          We may collect appointment preferences, booking details, consultation status, payment confirmations, receipts, and relevant transaction references.
        </p>
        <p class="text-sm text-gray-600">
          Payments may be processed through third-party payment providers. We do not intend to collect or store complete card details, UPI PINs, passwords, or other payment authentication credentials through our website.
        </p>
      </div>

      <div class="bg-gray-50 border border-gray-100 rounded-xl p-5">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">D. Technical Information</h3>
        <p class="text-gray-600">
          When you access our website, certain technical information may be collected, depending on the website configuration. This may include IP address, browser type, device information, pages visited, access times, and cookies or similar technologies.
        </p>
      </div>
    </div>
  </section>

  <section id="section-3" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">3. How We Use Your Information</h2>
    <p class="mb-3">We may use your information for the following purposes:</p>
    <ul class="list-disc pl-5 space-y-2 text-gray-600 mb-4">
      <li>To respond to enquiries and requests</li>
      <li>To schedule, confirm, reschedule, or manage appointments</li>
      <li>To provide healthcare consultations and related services</li>
      <li>To maintain relevant medical and administrative records</li>
      <li>To communicate appointment reminders and service updates</li>
      <li>To process payments and issue receipts</li>
      <li>To improve website functionality, security, and user experience</li>
      <li>To comply with applicable legal, regulatory, and professional obligations</li>
      <li>To protect patients, staff, and the public where legally appropriate</li>
    </ul>
    <p class="text-sm text-gray-600">
      We will not use your personal information for an unrelated purpose where additional notice or consent is required without meeting that requirement.
    </p>
  </section>

  <section id="section-4" class="scroll-mt-24 bg-gradient-to-r from-purple-50 via-white to-purple-50 p-6 rounded-2xl border border-purple-200">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">4. Confidentiality of Medical and Sexual Health Information</h2>
    <p class="mb-3 font-medium text-gray-800">
      We understand that mental health, psychiatric, and sexual health information is particularly personal.
    </p>
    <p class="mb-3 text-gray-600">
      Access to patient information should be limited to authorised personnel who need it for healthcare, administration, or other legitimate purposes. We take reasonable steps to maintain confidentiality in accordance with applicable laws and professional obligations.
    </p>
    <p class="mb-3 text-gray-600">
      Information may be disclosed where required or permitted by law, for legitimate healthcare purposes, or in other circumstances recognised by applicable law. Any such disclosure should be limited to what is appropriate for the relevant purpose.
    </p>
    <p class="text-sm text-gray-500 italic">
      Please note that no website, electronic communication method, or storage system can be guaranteed to be completely secure.
    </p>
  </section>

  <section id="section-5" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">5. Cookies and Website Technologies</h2>
    <p class="mb-3">
      Our website may use cookies or similar technologies to support essential functionality, understand website usage, and improve performance.
    </p>
    <p class="mb-3">
      If analytics, advertising, or other non-essential tracking technologies are used, we will provide appropriate notices and obtain consent where required by applicable law.
    </p>
    <p class="text-gray-600">
      You may be able to manage cookies through your browser settings. Disabling certain cookies may affect some website features.
    </p>
  </section>

  <section id="section-6" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">6. WhatsApp, Phone, Email, and Other Communication Channels</h2>
    <p class="mb-3">
      If you contact us by phone, email, WhatsApp, or another communication platform, we may use the information you provide to respond to your enquiry and manage your appointment.
    </p>
    <p class="mb-3">
      Please avoid sending highly sensitive medical information through channels that may not be suitable for confidential clinical communication. Where available, ask our team about the appropriate method for sharing medical records.
    </p>
    <p class="text-gray-600">
      Third-party communication platforms operate under their own privacy policies and terms.
    </p>
  </section>

  <section id="section-7" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">7. Sharing and Disclosure of Information</h2>
    <p class="mb-3 font-semibold text-gray-900">
      We do not sell your personal information to third parties.
    </p>
    <p class="mb-3">We may share relevant information, where necessary and lawful, with:</p>
    <ul class="list-disc pl-5 space-y-2 text-gray-600 mb-4">
      <li>Authorised healthcare professionals involved in your care</li>
      <li>Staff who support appointment management and healthcare administration</li>
      <li>Technology, hosting, communication, and payment service providers acting on our behalf</li>
      <li>Professional advisers, auditors, or insurers where appropriate</li>
      <li>Government authorities, courts, or regulators when legally required</li>
      <li>Other parties where you have provided valid consent or disclosure is otherwise permitted by applicable law</li>
    </ul>
    <p class="text-sm text-gray-600">
      We expect service providers handling information on our behalf to apply appropriate confidentiality and security measures.
    </p>
  </section>

  <section id="section-8" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">8. Data Storage, Security, and Retention</h2>
    <p class="mb-3">
      We take reasonable technical, organisational, and administrative measures to protect information against unauthorised access, loss, misuse, alteration, or disclosure.
    </p>
    <p class="mb-3">
      These measures may include access restrictions, secure systems, staff procedures, and appropriate safeguards provided by our service providers.
    </p>
    <p class="mb-3">
      We retain information only for as long as reasonably necessary for the purpose for which it was collected, including healthcare continuity, recordkeeping, legal compliance, dispute resolution, and other legitimate requirements.
    </p>
    <p class="text-gray-600">
      Medical records may need to be retained for periods prescribed by applicable law or professional standards. Therefore, requests to delete information may be subject to legal and clinical recordkeeping obligations.
    </p>
  </section>

  <section id="section-9" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">9. Your Privacy Rights</h2>
    <p class="mb-3">Subject to applicable law, you may have the right to:</p>
    <ul class="list-disc pl-5 space-y-2 text-gray-600 mb-4">
      <li>Request access to personal information held about you</li>
      <li>Ask for correction of inaccurate or incomplete information</li>
      <li>Withdraw consent where processing is based on consent</li>
      <li>Request deletion of information where legally applicable</li>
      <li>Raise a concern or grievance regarding the handling of your information</li>
      <li>Exercise any additional rights available under applicable data protection laws</li>
    </ul>
    <p class="mb-3">
      To make a request, contact us using the details in the Contact Us section. We may need to verify your identity before acting on a request.
    </p>
    <p class="text-sm text-gray-600">
      Withdrawing consent may affect our ability to provide certain services where the relevant information is necessary for that service. It does not affect processing already lawfully carried out before withdrawal.
    </p>
  </section>

  <section id="section-10" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">10. Privacy of Children and Adolescents</h2>
    <p class="mb-3">
      When healthcare services involve children or adolescents, we handle their information in accordance with applicable laws and relevant consent requirements.
    </p>
    <p class="text-gray-600">
      Where required, we will seek consent from a parent or lawful guardian and take appropriate steps to protect the child's privacy and welfare.
    </p>
  </section>

  <section id="section-11" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">11. Third-Party Websites and Services</h2>
    <p class="mb-3">
      Our website may contain links to third-party websites, appointment systems, video consultation platforms, payment gateways, or messaging services.
    </p>
    <p class="text-gray-600">
      We do not control the privacy practices of independent third parties. We encourage you to review their privacy policies before sharing information or using their services.
    </p>
  </section>

  <section id="section-12" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">12. Online Consultations</h2>
    <p class="mb-3">
      If online or video consultations are offered, relevant personal and medical information may be processed to arrange and conduct the consultation.
    </p>
    <p class="mb-3">
      Please use a private location and a secure device where possible. The use of third-party video or communication services may also be subject to the privacy terms of those providers.
    </p>
    <p class="text-gray-600">
      Consultations will not be recorded by us unless there is an appropriate reason and the necessary notice, consent, or other legal basis has been established.
    </p>
  </section>

  <section id="section-13" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">13. Marketing and Promotional Communications</h2>
    <p class="mb-3">
      We may send service-related messages, such as appointment confirmations, reminders, and important updates.
    </p>
    <p class="mb-3">
      We will send promotional communications only where permitted by applicable law and, where required, after obtaining your consent. You may opt out of promotional communications by following the instructions provided in the message or contacting us.
    </p>
    <p class="text-gray-600">
      Opting out of promotional messages will not necessarily stop essential communications relating to an appointment or service you have requested.
    </p>
  </section>

  <section id="section-14" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">14. Data Breaches and Security Incidents</h2>
    <p class="text-gray-600">
      If we become aware of a personal data breach affecting information under our control, we will assess and respond to it in accordance with applicable legal requirements, including any required notifications to affected individuals or authorities.
    </p>
  </section>

  <section id="section-15" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">15. Changes to This Privacy Policy</h2>
    <p class="mb-3">
      We may update this Privacy Policy to reflect changes in our services, website functionality, data-handling practices, or applicable laws.
    </p>
    <p class="text-gray-600">
      The revised version will be published on this page with an updated “Last Updated” date. Where required, we will provide additional notice or seek consent for material changes.
    </p>
  </section>

  <section id="section-16" class="scroll-mt-24 bg-gray-50 border border-gray-200 rounded-2xl p-8">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">16. Contact Us</h2>
    <p class="mb-6 text-gray-700">
      If you have questions about this Privacy Policy, wish to exercise your privacy rights, or want to raise a privacy-related concern, please contact us:
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <h4 class="text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">Organisation</h4>
        <p class="text-base font-semibold text-gray-900">Kelkar Manas Health Care</p>
      </div>

      <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <h4 class="text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">Address</h4>
        <p class="text-sm text-gray-700 leading-relaxed">
          101, 102, 103 &amp; 104, Gulmohar Heights, Behind Fatema Church, Ghodbandar Road, Majiwada, Thane, Maharashtra 400601
        </p>
      </div>

      <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <h4 class="text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">Phone</h4>
        <p class="text-sm">
          <a href="tel:+917030414140" class="text-purple-700 font-semibold hover:underline">+91 7030414140</a>
        </p>
      </div>

      <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
        <h4 class="text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">Email</h4>
        <p class="text-sm">
          <a href="mailto:kelkarmanashealthcare@gmail.com" class="text-purple-700 font-semibold hover:underline">kelkarmanashealthcare@gmail.com</a>
        </p>
      </div>

      <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm md:col-span-2">
        <h4 class="text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">Privacy Grievance Contact</h4>
        <p class="text-sm text-gray-700">
          Designated Grievance Officer, Kelkar Manas Health Care<br />
          Email: <a href="mailto:kelkarmanashealthcare@gmail.com" class="text-purple-700 font-medium hover:underline">kelkarmanashealthcare@gmail.com</a> | Phone: <a href="tel:+917030414140" class="text-purple-700 font-medium hover:underline">+91 7030414140</a>
        </p>
      </div>
    </div>

    <p class="text-sm text-gray-600">
      We will review privacy-related requests and respond in accordance with applicable legal requirements.
    </p>
  </section>

  <div class="bg-amber-50/70 border border-amber-200 rounded-xl p-5 text-sm text-amber-900 leading-relaxed">
    <strong>Important Notice:</strong> This Privacy Policy is a general draft for website use and does not constitute legal advice. It should be reviewed against the actual data collected by Kelkar Manas Health Care, the website's technical configuration, the clinic's recordkeeping practices, and applicable Indian data protection and healthcare requirements before publication.
  </div>
</div>
`;

async function updatePolicy() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Page = mongoose.connection.collection("pages");

    const result = await Page.updateOne(
      { slug: "privacy-policy" },
      {
        $set: {
          title: "Privacy Policy",
          slug: "privacy-policy",
          content: privacyPolicyHtml,
          seoTitle: "Privacy Policy | Kelkar Manas Health Care",
          seoDescription: "Read the Privacy Policy of Kelkar Manas Health Care. Learn how we collect, use, store, and protect your personal and health-related information.",
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log("Privacy Policy updated successfully in MongoDB:", result);
    process.exit(0);
  } catch (error) {
    console.error("Error updating Privacy Policy:", error);
    process.exit(1);
  }
}

updatePolicy();
