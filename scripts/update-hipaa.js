const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const hipaaHtml = `
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
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">1. Purpose of This Policy</h2>
    <p class="mb-3">
      <strong>Kelkar Manas Health Care</strong> is committed to respecting patient privacy and protecting confidential health information collected in connection with healthcare services, appointments, consultations, and related administrative activities.
    </p>
    <p class="mb-3">
      This policy describes our approach to protecting patient health information, limiting unauthorised access, and maintaining appropriate confidentiality and security safeguards.
    </p>
    <p class="mb-3 text-sm text-gray-600">
      The Health Insurance Portability and Accountability Act of 1996 (HIPAA) is a United States federal law governing the privacy and security of protected health information (PHI) for covered entities and their business associates. HIPAA applies only where its legal requirements are met.
    </p>
    <p class="text-sm text-gray-600 bg-purple-50/50 p-3.5 rounded-xl border border-purple-100">
      References to HIPAA in this policy do not constitute a representation that Kelkar Manas Health Care is a HIPAA-covered entity or business associate.
    </p>
  </section>

  <section id="section-2" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">2. What Is Protected Health Information?</h2>
    <p class="mb-3">
      Under HIPAA, Protected Health Information (PHI) generally means individually identifiable health information created, received, maintained, or transmitted by a covered entity or business associate, subject to the law&apos;s definitions and exclusions.
    </p>
    <p class="mb-3 font-medium text-gray-900">
      Depending on the applicable legal framework, confidential health information may include:
    </p>
    <ul class="list-disc pl-5 space-y-2 text-gray-700 mb-4">
      <li>Patient names and contact details linked to healthcare services</li>
      <li>Medical histories, diagnoses, symptoms, and treatment records</li>
      <li>Psychiatric and mental health consultation information</li>
      <li>Sexual health information and related clinical records</li>
      <li>Prescriptions, laboratory reports, and medical assessments</li>
      <li>Appointment records and billing information associated with healthcare</li>
    </ul>
    <div class="p-4 rounded-xl bg-purple-50 border border-purple-200 text-[#4A154B] text-sm font-medium">
      We recognise that mental health and sexual health information can be particularly sensitive and should be handled with appropriate confidentiality.
    </div>
  </section>

  <section id="section-3" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">3. How We Collect Health Information</h2>
    <p class="mb-3">We may collect personal and health-related information when you:</p>
    <ul class="list-disc pl-5 space-y-2 text-gray-700 mb-4">
      <li>Request or schedule an appointment</li>
      <li>Visit our clinic for a consultation</li>
      <li>Complete a patient registration or enquiry form</li>
      <li>Participate in an online consultation, where available</li>
      <li>Provide medical records, prescriptions, or investigation reports</li>
      <li>Communicate with our authorised team regarding your care</li>
    </ul>
    <p class="text-sm text-gray-600">
      We aim to collect information that is reasonably necessary for the relevant healthcare or administrative purpose.
    </p>
  </section>

  <section id="section-4" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">4. How We Use Patient Information</h2>
    <p class="mb-3">
      Subject to applicable law and any necessary consent or other lawful basis, patient information may be used for:
    </p>
    <ul class="list-disc pl-5 space-y-2 text-gray-700 mb-4">
      <li>Providing consultations and coordinating patient care</li>
      <li>Maintaining clinical and administrative records</li>
      <li>Managing appointments and follow-up visits</li>
      <li>Processing payments and issuing receipts</li>
      <li>Communicating important healthcare-related information</li>
      <li>Meeting legal, regulatory, and professional recordkeeping requirements</li>
      <li>Maintaining the security and proper operation of our systems</li>
    </ul>
    <div class="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold text-sm">
      We do not sell personal information to third parties.
    </div>
  </section>

  <section id="section-5" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">5. Confidentiality and Access Controls</h2>
    <p class="mb-3">
      Access to patient information should be limited to authorised healthcare professionals and personnel who need the information for their assigned responsibilities.
    </p>
    <p class="mb-3 font-medium text-gray-900">Appropriate safeguards may include:</p>
    <ul class="list-disc pl-5 space-y-2 text-gray-700 mb-4">
      <li>Role-based access permissions</li>
      <li>Password protection and account security</li>
      <li>Secure handling and storage of records</li>
      <li>Staff confidentiality procedures</li>
      <li>Appropriate monitoring and review of access, where supported</li>
      <li>Secure disposal or deletion when records are no longer required and deletion is legally permitted</li>
    </ul>
    <p class="text-xs text-gray-500 italic">
      Safeguards implemented by Kelkar Manas Health Care will depend on the systems and services actually used by the organisation.
    </p>
  </section>

  <section id="section-6" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">6. When Information May Be Shared</h2>
    <p class="mb-3">
      Patient information may be shared when reasonably necessary and legally permitted for healthcare delivery, administration, payment processing, or other legitimate purposes.
    </p>
    <p class="mb-3">
      Information may also be disclosed where required or permitted by applicable law, including certain regulatory, legal, or safety-related circumstances.
    </p>
    <p class="mb-3 text-sm text-gray-700">
      Third-party service providers may process relevant information on our behalf, such as providers supporting website hosting, appointment management, communication, video consultations, or payment processing.
    </p>
    <p class="text-xs text-gray-500">
      Appropriate contractual and security safeguards should be considered based on the information involved and the applicable legal requirements.
    </p>
  </section>

  <section id="section-7" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">7. Patient Privacy Rights</h2>
    <p class="mb-3">
      Depending on the laws applicable to the organisation and the relevant records, patients may have rights to:
    </p>
    <ul class="list-disc pl-5 space-y-2 text-gray-700 mb-4">
      <li>Request access to their personal or health information</li>
      <li>Ask for correction of inaccurate information</li>
      <li>Request deletion where legally permitted</li>
      <li>Withdraw consent where processing relies on consent</li>
      <li>Raise concerns about privacy or information security</li>
      <li>Exercise additional rights available under applicable data protection laws</li>
    </ul>
    <p class="mb-3 text-sm text-gray-600">
      HIPAA provides specific rights to individuals whose information is governed by HIPAA. Those rights do not automatically apply to every healthcare organisation or every patient record.
    </p>
    <p class="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-200">
      Requests can be submitted through the contact details listed below. Identity verification may be necessary before information is released or amended.
    </p>
  </section>

  <section id="section-8" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">8. Electronic Communications and Online Consultations</h2>
    <p class="mb-3">
      If electronic appointment systems, messaging platforms, email, or video consultations are available, relevant personal or health information may be processed through those systems.
    </p>
    <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm mb-3">
      Patients should use private devices and secure internet connections where possible and avoid sending highly sensitive records through channels that are not intended for confidential clinical communication.
    </div>
    <p class="text-xs text-gray-500">
      Third-party platforms may have their own privacy policies and security arrangements. Their use does not, by itself, establish HIPAA compliance.
    </p>
  </section>

  <section id="section-9" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">9. Data Security and Breach Response</h2>
    <p class="mb-3">
      We aim to use reasonable technical, organisational, and administrative safeguards to protect information against unauthorised access, loss, misuse, alteration, or disclosure.
    </p>
    <p class="mb-3">
      If a data security incident occurs, it should be assessed promptly and handled in accordance with applicable legal obligations and the organisation&apos;s incident-response procedures. Required notifications will be made where applicable law requires them.
    </p>
    <p class="text-xs text-gray-500 italic">
      No electronic system or communication method can be guaranteed to be completely secure.
    </p>
  </section>

  <section id="section-10" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">10. Record Retention and Disposal</h2>
    <p class="mb-3">
      Patient records are retained in accordance with applicable legal requirements, professional obligations, healthcare needs, and legitimate administrative purposes.
    </p>
    <p class="text-sm text-gray-600">
      Information will be securely disposed of when retention is no longer necessary and disposal is legally permitted. Requests for deletion may be limited by medical-record retention requirements or other applicable laws.
    </p>
  </section>

  <section id="section-11" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">11. Staff Responsibilities</h2>
    <p class="mb-3">Personnel authorised to access patient information are expected to:</p>
    <ul class="list-disc pl-5 space-y-2 text-gray-700 mb-4">
      <li>Access records only for authorised purposes</li>
      <li>Maintain patient confidentiality</li>
      <li>Avoid sharing credentials or leaving records accessible to unauthorised persons</li>
      <li>Follow applicable data protection and information security procedures</li>
      <li>Report suspected privacy breaches or unauthorised access promptly</li>
    </ul>
    <p class="text-xs text-gray-500">
      Training, access reviews, and written procedures should be implemented as appropriate to the organisation&apos;s size, systems, and legal obligations.
    </p>
  </section>

  <section id="section-12" class="scroll-mt-24 bg-gray-50 border border-gray-200 rounded-2xl p-8">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">12. Questions and Privacy Complaints</h2>
    <p class="mb-6 text-gray-700">
      Patients who have questions about the handling of their personal or health information, or who wish to raise a privacy concern, may contact:
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

      <div class="bg-white p-5 rounded-xl border border-gray-100 shadow-sm md:col-span-2">
        <h4 class="text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">Privacy Contact</h4>
        <p class="text-sm text-gray-800">
          Designated Privacy &amp; Grievance Officer, Kelkar Manas Health Care<br />
          Email: <a href="mailto:kelkarmanashealthcare@gmail.com" class="text-purple-700 font-medium hover:underline">kelkarmanashealthcare@gmail.com</a> | Phone: <a href="tel:+917030414140" class="text-purple-700 font-medium hover:underline">+91 7030414140</a>
        </p>
      </div>
    </div>

    <p class="text-xs text-gray-600">
      We will review privacy concerns and respond in accordance with applicable legal requirements.
    </p>
  </section>

  <section id="section-13" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">13. Policy Updates</h2>
    <p class="mb-3">
      This policy may be updated to reflect changes in our services, information-handling practices, security measures, or legal obligations.
    </p>
    <p class="text-sm text-gray-600">
      The latest version will be published on this page with an updated revision date.
    </p>
  </section>

  <div class="bg-amber-50/70 border border-amber-200 rounded-xl p-5 text-sm text-amber-900 leading-relaxed">
    <strong>Important Legal Notice:</strong> This policy is a general template and does not certify that Kelkar Manas Health Care is HIPAA-compliant. HIPAA obligations depend on the organisation&apos;s legal status and activities. The policy should be reviewed by a qualified legal or privacy professional and aligned with the organisation&apos;s actual systems, contracts, and applicable Indian data protection and healthcare requirements before publication.
  </div>
</div>
`;

async function updateHipaa() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Page = mongoose.connection.collection("pages");

    const result = await Page.updateOne(
      { slug: "hipaa" },
      {
        $set: {
          title: "HIPAA & Patient Health Information Privacy Policy",
          slug: "hipaa",
          content: hipaaHtml,
          seoTitle: "HIPAA & Patient Health Information Privacy Policy | Kelkar Manas Health Care",
          seoDescription: "Read the official HIPAA & Patient Health Information Privacy Policy for Kelkar Manas Health Care. Learn about Protected Health Information (PHI) safeguards and confidentiality.",
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log("HIPAA Policy updated successfully in MongoDB:", result);
    process.exit(0);
  } catch (error) {
    console.error("Error updating HIPAA Policy:", error);
    process.exit(1);
  }
}

updateHipaa();
