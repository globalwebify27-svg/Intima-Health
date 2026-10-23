const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const termsHtml = `
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
      Welcome to <strong>Kelkar Manas Health Care</strong> (“we,” “our,” or “us”). These Terms &amp; Conditions govern your access to and use of our website, appointment booking facilities, online communications, and healthcare-related services offered through our clinic.
    </p>
    <p class="mb-3">
      By accessing this website or using our services, you agree to these Terms &amp; Conditions. If you do not agree with any part of these terms, please discontinue use of the website.
    </p>
    <p>
      These terms should be read together with our <a href="/privacy-policy" class="text-purple-700 font-semibold hover:underline">Privacy Policy</a> and any additional terms communicated to you when booking a specific service.
    </p>
  </section>

  <section id="section-2" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">2. Purpose of the Website</h2>
    <p class="mb-3">
      This website is intended to provide general information about Kelkar Manas Health Care, its services, appointment procedures, and relevant healthcare information.
    </p>
    <p class="mb-3">
      Information published on this website is for educational and informational purposes. It is not a substitute for an individual medical consultation, professional assessment, diagnosis, or treatment.
    </p>
    <p>
      We make reasonable efforts to keep the information accurate and up to date but do not guarantee that every page will always be complete, current, or free from errors.
    </p>
  </section>

  <section id="section-3" class="scroll-mt-24 bg-red-50/50 border border-red-200 rounded-2xl p-6">
    <h2 class="text-2xl font-bold text-red-900 mb-4">3. Medical Disclaimer</h2>
    <p class="mb-3 text-gray-800">
      Medical information available on this website should not be used to diagnose or treat a medical condition without consulting a qualified healthcare professional.
    </p>
    <p class="mb-3 text-gray-800">
      Every patient is different. Treatment recommendations depend on individual circumstances, clinical assessment, medical history, and the professional judgment of the treating clinician.
    </p>
    <p class="mb-4 text-gray-800 font-medium">
      Do not start, stop, or change prescribed medication solely on the basis of information found on this website.
    </p>
    <div class="bg-white/90 border border-red-200 rounded-xl p-4 text-sm text-red-950 font-medium">
      <strong>Emergency situations:</strong> This website and routine appointment services are not substitutes for emergency medical care. If you or another person is at immediate risk of harm, has taken an overdose, or is experiencing a medical emergency, contact emergency services or visit the nearest emergency department. <strong>In India, call 112 for emergency assistance.</strong>
    </div>
  </section>

  <section id="section-4" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">4. Healthcare Services</h2>
    <p class="mb-3">
      The availability of consultations, treatments, specialists, and other services may vary by location, clinician availability, appointment schedule, and clinical suitability.
    </p>
    <p class="mb-3">
      Listing a service on this website does not guarantee that it will be suitable for every patient or available at every clinic location.
    </p>
    <p>
      We reserve the right to recommend an alternative consultation, further evaluation, referral, or a different treatment approach where clinically appropriate.
    </p>
  </section>

  <section id="section-5" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">5. Appointment Booking</h2>
    <p class="mb-3">
      Appointments may be requested through the contact details, booking forms, or other booking methods provided on our website.
    </p>
    <p class="mb-3">
      When requesting an appointment, you agree to provide accurate and complete information to the best of your knowledge.
    </p>
    <p class="mb-3">
      Submitting an appointment request does not automatically guarantee an appointment. Your booking is confirmed only when the clinic communicates confirmation through an authorised channel.
    </p>
    <p>
      Appointment availability may change due to clinician schedules, holidays, operational requirements, or unforeseen circumstances.
    </p>
  </section>

  <section id="section-6" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">6. Consultation Fees and Payments</h2>
    <p class="mb-3">
      Consultation fees and other service charges will be communicated through the relevant booking channel or by the clinic team.
    </p>
    <p class="mb-3">
      Depending on the service, payment may be required before the appointment or at another stage communicated during booking.
    </p>
    <p class="mb-3">
      You agree to pay the applicable charges using the payment methods authorised by the clinic.
    </p>
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900">
      Please retain your payment confirmation or receipt. <strong>Do not share your UPI PIN, banking password, one-time password (OTP), or other payment authentication credentials</strong> with anyone claiming to represent the clinic.
    </div>
  </section>

  <section id="section-7" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">7. Cancellation, Rescheduling, and Refunds</h2>
    <p class="mb-3">
      If you need to cancel or reschedule an appointment, please notify the clinic as early as reasonably possible.
    </p>
    <p class="mb-3">
      Rescheduling is subject to availability. Any cancellation charges, refund eligibility, processing timelines, or missed-appointment conditions will be communicated under the applicable booking or refund policy.
    </p>
    <p class="mb-3">
      Where a refund is due, it will be handled in accordance with the applicable policy and legal requirements.
    </p>
    <p class="text-sm text-gray-600">
      Nothing in these Terms &amp; Conditions is intended to exclude any consumer rights or other protections that cannot legally be excluded.
    </p>
  </section>

  <section id="section-8" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">8. Online and Video Consultations</h2>
    <p class="mb-3">
      If online consultations are offered, their availability will depend on the service, clinician, and clinical suitability of the patient’s concern.
    </p>
    <p class="mb-3">
      You are responsible for providing accurate information, using a suitable device and internet connection, and joining the session at the scheduled time.
    </p>
    <p class="mb-3">
      Online consultations may not be appropriate for every condition. The clinician may recommend an in-person assessment or emergency care where necessary.
    </p>
    <p>
      Technical interruptions may occasionally occur. If a session cannot proceed, contact the clinic for instructions regarding rescheduling or other arrangements.
    </p>
  </section>

  <section id="section-9" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">9. Patient Responsibilities</h2>
    <p class="mb-3">When using our website or healthcare services, you agree to:</p>
    <ul class="list-disc pl-5 space-y-2 text-gray-700 mb-4">
      <li>Provide accurate and relevant information.</li>
      <li>Share relevant medical history, current medications, and allergies with your treating clinician.</li>
      <li>Follow reasonable appointment and clinic instructions.</li>
      <li>Treat clinicians, staff, and other patients respectfully.</li>
      <li>Use the website lawfully and responsibly.</li>
      <li>Avoid submitting false, misleading, abusive, fraudulent, or unlawful content.</li>
      <li>Keep your appointment confirmation and access credentials secure, where applicable.</li>
    </ul>
    <p class="text-sm text-gray-600">
      You may ask questions about your proposed treatment, available alternatives, potential risks, and follow-up care.
    </p>
  </section>

  <section id="section-10" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">10. Privacy and Confidentiality</h2>
    <p class="mb-3">
      We respect patient privacy and handle personal and health-related information in accordance with our <a href="/privacy-policy" class="text-purple-700 font-semibold hover:underline">Privacy Policy</a>, applicable laws, and relevant professional obligations.
    </p>
    <p class="mb-3">
      Access to medical information is restricted as appropriate. Information may be disclosed where required or permitted by law or where another lawful basis applies.
    </p>
    <p>
      Please review our <a href="/privacy-policy" class="text-purple-700 font-semibold hover:underline">Privacy Policy</a> to understand how information may be collected, used, stored, and shared.
    </p>
  </section>

  <section id="section-11" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">11. Website Content and Intellectual Property</h2>
    <p class="mb-3">
      Unless otherwise stated, the website content, including text, graphics, logos, designs, photographs, videos, and other materials, is owned by Kelkar Manas Health Care or used with appropriate permission.
    </p>
    <p class="mb-3">
      You may access and use this content for personal, non-commercial informational purposes.
    </p>
    <p class="mb-3">
      You must not reproduce, republish, modify, distribute, commercially exploit, or misrepresent website content without prior permission, except where permitted by applicable law.
    </p>
    <p class="text-sm text-gray-600">
      All third-party names, logos, and materials remain the property of their respective owners.
    </p>
  </section>

  <section id="section-12" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">12. Prohibited Website Use</h2>
    <p class="mb-3">You must not:</p>
    <ul class="list-disc pl-5 space-y-2 text-gray-700 mb-4">
      <li>Use the website for any unlawful or fraudulent purpose.</li>
      <li>Attempt unauthorised access to our website, systems, or data.</li>
      <li>Introduce malicious software or interfere with website security.</li>
      <li>Submit false appointment information or impersonate another person.</li>
      <li>Copy or misuse website content in violation of applicable law.</li>
      <li>Use the website in a manner that disrupts services or infringes the rights of others.</li>
    </ul>
    <p class="text-sm text-gray-600">
      We may take reasonable and lawful steps to address misuse or protect the website and its users.
    </p>
  </section>

  <section id="section-13" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">13. Third-Party Links and Services</h2>
    <p class="mb-3">
      Our website may link to third-party websites, payment providers, communication platforms, video consultation tools, or other external services.
    </p>
    <p class="mb-3">
      These services may be governed by separate terms and privacy policies. We do not control all third-party systems and are not responsible for their independent content, policies, or availability.
    </p>
    <p>
      You should review the relevant third-party terms before using those services.
    </p>
  </section>

  <section id="section-14" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">14. Limitation of Liability</h2>
    <p class="mb-3">
      To the extent permitted by applicable law, Kelkar Manas Health Care will not be responsible for losses arising solely from reliance on general website information without obtaining appropriate professional advice, interruptions beyond our reasonable control, or the independent acts of third-party platforms.
    </p>
    <p class="mb-3">
      Nothing in these Terms &amp; Conditions excludes or limits liability where such exclusion or limitation is prohibited by applicable law, including any applicable consumer protections or professional obligations.
    </p>
    <p class="font-medium text-gray-800">
      Nothing in these terms guarantees a particular clinical outcome. Healthcare outcomes depend on multiple factors, including the patient&apos;s condition, individual circumstances, and response to treatment.
    </p>
  </section>

  <section id="section-15" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">15. Changes to Services or Terms</h2>
    <p class="mb-3">
      We may update website content, appointment procedures, available services, or these Terms &amp; Conditions from time to time.
    </p>
    <p class="mb-3">
      Changes will be published on this page with an updated “Last Updated” date. Where required by law, additional notice or consent will be provided.
    </p>
    <p>
      Your continued use of the website after revised terms are published will be subject to applicable legal requirements concerning notice and acceptance.
    </p>
  </section>

  <section id="section-16" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">16. Suspension or Restriction of Access</h2>
    <p class="mb-3">
      We may restrict or suspend access to website features where reasonably necessary for security, maintenance, prevention of misuse, legal compliance, or operational reasons.
    </p>
    <p>
      Any such action will be taken subject to applicable law and any contractual or consumer rights that apply.
    </p>
  </section>

  <section id="section-17" class="scroll-mt-24 bg-purple-50/50 border border-purple-100 rounded-2xl p-6">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">17. Governing Law and Jurisdiction</h2>
    <p class="mb-3">
      These Terms &amp; Conditions are governed by the laws of India.
    </p>
    <p class="mb-3">
      Subject to applicable law and the jurisdiction of competent courts, disputes arising from the use of this website or the relevant services will be subject to the jurisdiction of the competent courts in <strong>Akola, Maharashtra, India</strong>, where legally permissible.
    </p>
    <p class="text-sm text-gray-600">
      Nothing in this clause limits any right a consumer may have to seek remedies before a forum or authority that has jurisdiction under applicable law.
    </p>
  </section>

  <section id="section-18" class="scroll-mt-24 bg-gray-50 border border-gray-200 rounded-2xl p-8">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">18. Contact Information</h2>
    <p class="mb-6 text-gray-700">
      For questions about these Terms &amp; Conditions, appointment procedures, payments, cancellations, or website use, please contact us:
    </p>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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
    </div>
  </section>

  <div class="bg-amber-50/70 border border-amber-200 rounded-xl p-5 text-sm text-amber-900 leading-relaxed">
    <strong>Important Notice:</strong> These Terms &amp; Conditions are a general website draft and are not legal advice. Please have them reviewed by a qualified legal professional before publication, particularly the payment and refund provisions, medical-service terms, liability clauses, and jurisdiction clause.
  </div>
</div>
`;

async function updateTerms() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Page = mongoose.connection.collection("pages");

    const result = await Page.updateOne(
      { slug: "terms" },
      {
        $set: {
          title: "Terms & Conditions",
          slug: "terms",
          content: termsHtml,
          seoTitle: "Terms & Conditions | Kelkar Manas Health Care",
          seoDescription: "Read the official Terms & Conditions for Kelkar Manas Health Care. Information on appointment booking, medical disclaimers, consultations, and patient guidelines.",
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log("Terms & Conditions updated successfully in MongoDB:", result);
    process.exit(0);
  } catch (error) {
    console.error("Error updating Terms & Conditions:", error);
    process.exit(1);
  }
}

updateTerms();
