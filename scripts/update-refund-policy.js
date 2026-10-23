const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const refundPolicyHtml = `
<div class="space-y-10 text-gray-700 leading-relaxed">
  <div class="border-b border-gray-200 pb-6 mb-8">
    <div class="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
      <span class="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
        Last Updated: 19 October 2026
      </span>
      <span class="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
        Organisation: Kelkar Manas Health Care
      </span>
    </div>
  </div>

  <p class="text-lg text-gray-800 font-medium leading-relaxed mb-6">
    At Kelkar Manas Health Care, appointments are scheduled in advance to ensure that patients receive timely and professional care. Please read our Refund and Cancellation Policy carefully before making a booking or payment.
  </p>

  <section id="section-1" class="scroll-mt-24 bg-purple-50/50 border border-purple-200 rounded-2xl p-6">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">1. No-Refund Policy</h2>
    <p class="mb-3 text-gray-800">
      All consultation and appointment booking payments are non-refundable, except where a refund or other remedy is required under applicable law.
    </p>
    <p class="mb-3 text-gray-800">
      Once a booking has been paid for, the amount will not be refunded merely because a patient wishes to cancel the appointment, is unable to attend, or changes their mind.
    </p>
    <p class="text-sm font-semibold text-purple-900">
      Where eligible, patients may request to reschedule their appointment instead of receiving a monetary refund.
    </p>
  </section>

  <section id="section-2" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">2. Appointment Cancellation</h2>
    <ul class="list-disc pl-5 space-y-2 text-gray-700 mb-4">
      <li>Patients may contact our support team to request cancellation of a booked appointment.</li>
      <li>Cancellation of an appointment does not automatically entitle the patient to a monetary refund.</li>
      <li>Where rescheduling is permitted, the patient may request an alternative appointment slot, subject to availability.</li>
      <li>Any rescheduling conditions applicable to the booking will be communicated by our team.</li>
    </ul>
  </section>

  <section id="section-3" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">3. Appointment Rescheduling</h2>
    <ul class="list-disc pl-5 space-y-2 text-gray-700 mb-4">
      <li>Patients may request to reschedule an appointment by contacting our support team.</li>
      <li>Rescheduling is subject to the availability of the doctor, counsellor or clinic.</li>
      <li>Patients are encouraged to request rescheduling at least 24 hours before the scheduled appointment.</li>
      <li>The original payment may be carried forward to the rescheduled appointment where the request is approved.</li>
      <li>Rescheduling is not guaranteed and must be confirmed by our team.</li>
      <li>Any applicable time limits or restrictions on rescheduling will be communicated at the time of booking.</li>
    </ul>
  </section>

  <section id="section-4" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">4. Missed Appointments and Late Arrivals</h2>
    <p class="mb-3">
      If a patient fails to attend a scheduled appointment without prior notice, the booking may be treated as a no-show.
    </p>
    <p class="mb-3">
      No monetary refund will be provided for a missed appointment, except where required by applicable law. Rescheduling may be considered at the discretion of Kelkar Manas Health Care, subject to availability and the applicable booking terms.
    </p>
    <p class="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
      Patients arriving late may receive a shortened session or may need to request another appointment, depending on the doctor&apos;s availability.
    </p>
  </section>

  <section id="section-5" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">5. Cancellation by the Clinic or Doctor</h2>
    <p class="mb-3">
      If Kelkar Manas Health Care or the assigned doctor cancels an appointment, the patient will ordinarily be offered an alternative appointment without an additional consultation fee.
    </p>
    <p class="text-sm text-gray-700">
      If rescheduling is not possible, or the service cannot be provided as agreed, the matter will be reviewed and an appropriate remedy, including a refund where required by applicable law, will be provided.
    </p>
  </section>

  <section id="section-6" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">6. Online Consultation and Technical Issues</h2>
    <p class="mb-3">
      Patients are responsible for having a suitable device, a stable internet connection and an appropriate environment for online consultations.
    </p>
    <p class="mb-3">
      If a session cannot proceed because of a verified technical failure attributable to our platform or service provider, we will make reasonable efforts to arrange a replacement appointment.
    </p>
    <p class="text-sm text-gray-600">
      If the service cannot be provided as agreed, the patient will be offered an appropriate remedy in accordance with applicable law.
    </p>
  </section>

  <section id="section-7" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">7. Services Already Provided</h2>
    <p class="mb-3">
      Payments for consultations or services that have already been provided are not refundable merely because the patient is dissatisfied with the outcome or did not achieve the expected result.
    </p>
    <p class="text-xs text-gray-500">
      This provision does not limit any rights or remedies available to patients under applicable law.
    </p>
  </section>

  <section id="section-8" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">8. Courses, Packages and Other Services</h2>
    <p class="mb-3">
      Any courses, prepaid packages, therapy packages or other services purchased through the website may be subject to separate terms displayed before purchase.
    </p>
    <p class="text-sm text-gray-600">
      Unless a different policy is expressly stated, payments are non-refundable, and rescheduling or transfer of unused sessions may be considered only where the relevant service permits it and applicable law allows.
    </p>
  </section>

  <section id="section-9" class="scroll-mt-24 bg-white border border-gray-200 rounded-2xl p-6">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">9. How to Request Rescheduling</h2>
    <p class="mb-3 text-gray-800">
      To request an appointment change, please contact Kelkar Manas Health Care through the official contact details listed on our website.
    </p>
    <p class="font-medium text-gray-900 mb-2">Please provide:</p>
    <ul class="list-disc pl-5 space-y-1.5 text-gray-700 mb-4">
      <li>Patient name.</li>
      <li>Booking reference number.</li>
      <li>Registered phone number or email address.</li>
      <li>Original appointment date and time.</li>
      <li>Preferred alternative appointment slot.</li>
    </ul>
    <p class="text-sm text-purple-900 font-medium">
      Our team will review the request and confirm whether rescheduling is possible.
    </p>
  </section>

  <section id="section-10" class="scroll-mt-24">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-4">10. Policy Updates</h2>
    <p class="text-gray-700">
      Kelkar Manas Health Care may update this policy when necessary to reflect changes in services or applicable legal requirements. The latest version will be published on our website.
    </p>
  </section>

  <section id="section-11" class="scroll-mt-24 bg-gray-50 border border-gray-200 rounded-2xl p-6">
    <h2 class="text-2xl font-bold text-[#4A154B] mb-3">11. Governing Law</h2>
    <p class="text-gray-700 mb-4">
      This policy is governed by the laws of India and is subject to applicable consumer-protection and other legal requirements.
    </p>
    <p class="font-bold text-[#4A154B]">
      Kelkar Manas Health Care<br />
      <span class="font-normal text-gray-600 text-sm">Thank you for choosing our services.</span>
    </p>
  </section>
</div>
`;

async function updateRefund() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Page = mongoose.connection.collection("pages");

    const result = await Page.updateOne(
      { slug: "refund-policy" },
      {
        $set: {
          title: "Refund and Cancellation Policy",
          slug: "refund-policy",
          content: refundPolicyHtml,
          seoTitle: "Refund and Cancellation Policy | Kelkar Manas Health Care",
          seoDescription: "Read the official Refund and Cancellation Policy of Kelkar Manas Health Care. Learn about consultation booking terms, rescheduling rules, and missed appointment guidelines.",
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log("Refund Policy updated successfully in MongoDB:", result);
    process.exit(0);
  } catch (error) {
    console.error("Error updating Refund Policy:", error);
    process.exit(1);
  }
}

updateRefund();
