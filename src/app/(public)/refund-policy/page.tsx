import { Metadata } from "next";
import Link from "next/link";
import {
  RotateCcw,
  Calendar,
  Building2,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Video,
  FileCheck2,
  Gavel,
  ShieldAlert,
  ArrowRight,
  FileText,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Refund and Cancellation Policy | Kelkar Manas Health Care",
  description:
    "Read the official Refund and Cancellation Policy of Kelkar Manas Health Care. Learn about consultation bookings, rescheduling guidelines, no-show terms, and technical issue policies.",
  keywords: [
    "Refund Policy",
    "Cancellation Policy",
    "Kelkar Manas Health Care refund",
    "Appointment rescheduling Thane",
    "Psychiatric consultation cancellation",
  ],
};

const SECTIONS = [
  { id: "section-1", title: "1. No-Refund Policy" },
  { id: "section-2", title: "2. Appointment Cancellation" },
  { id: "section-3", title: "3. Appointment Rescheduling" },
  { id: "section-4", title: "4. Missed Appointments & Late Arrivals" },
  { id: "section-5", title: "5. Cancellation by Clinic or Doctor" },
  { id: "section-6", title: "6. Online Consultation & Technical Issues" },
  { id: "section-7", title: "7. Services Already Provided" },
  { id: "section-8", title: "8. Courses, Packages & Other Services" },
  { id: "section-9", title: "9. How to Request Rescheduling" },
  { id: "section-10", title: "10. Policy Updates" },
  { id: "section-11", title: "11. Governing Law" },
];

export default function RefundPolicyPage() {
  return (
    <div className="bg-[#FAF9F6] min-h-screen text-[#1A1A1A]">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#4A154B] via-[#350d36] to-[#1E081F] text-white py-16 md:py-24">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs md:text-sm text-purple-200/80 mb-6 font-medium">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-purple-300/60" />
            <span className="text-white">Refund &amp; Cancellation Policy</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-purple-100 text-xs md:text-sm font-medium mb-5 shadow-sm">
            <RotateCcw className="w-4 h-4 text-purple-300" />
            <span>Booking &amp; Payment Terms · Kelkar Manas Health Care</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight mb-4">
            Refund and Cancellation Policy
          </h1>

          <p className="text-purple-100/90 text-base md:text-lg max-w-3xl leading-relaxed mb-8">
            At Kelkar Manas Health Care, appointments are scheduled in advance to ensure that patients receive timely and professional care. Please read our Refund and Cancellation Policy carefully before making a booking or payment.
          </p>

          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-purple-200">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10">
              <Calendar className="w-4 h-4 text-purple-300" />
              <span>Last Updated: <strong>19 October 2026</strong></span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10">
              <Building2 className="w-4 h-4 text-purple-300" />
              <span>Organisation: <strong>Kelkar Manas Health Care</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Table of Contents Sticky Sidebar (Desktop) */}
            <aside className="hidden lg:block lg:col-span-4">
              <div className="sticky top-28 bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm">
                <div className="flex items-center gap-2 text-[#4A154B] font-semibold text-sm mb-4 pb-3 border-b border-gray-100">
                  <FileText className="w-4 h-4" />
                  <span>Table of Contents</span>
                </div>
                <nav className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto pr-2 text-xs scrollbar-thin">
                  {SECTIONS.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className="block px-3 py-2 rounded-lg text-gray-600 hover:text-[#4A154B] hover:bg-purple-50/70 transition-colors truncate font-medium"
                    >
                      {sec.title}
                    </a>
                  ))}
                </nav>

                <div className="mt-6 pt-5 border-t border-gray-100">
                  <div className="bg-purple-50/70 rounded-xl p-3.5 border border-purple-100 text-xs">
                    <p className="font-semibold text-[#4A154B] mb-1">Need to Reschedule?</p>
                    <p className="text-gray-600 mb-2">Our support desk will assist you with available consultation slots.</p>
                    <a
                      href="tel:+917030414140"
                      className="inline-flex items-center gap-1.5 text-purple-700 font-bold hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" /> +91 7030414140
                    </a>
                  </div>
                </div>
              </div>
            </aside>

            {/* Policy Detailed Body */}
            <main className="lg:col-span-8 space-y-10 text-gray-800 leading-relaxed text-base">

              {/* 1. No-Refund Policy */}
              <div id="section-1" className="scroll-mt-28 bg-purple-50/50 rounded-2xl border-2 border-purple-200/90 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4A154B] text-white font-bold text-sm">
                    01
                  </span>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-purple-700" />
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                      1. No-Refund Policy
                    </h2>
                  </div>
                </div>
                <div className="space-y-3.5 text-gray-800">
                  <p className="font-semibold text-gray-900">
                    All consultation and appointment booking payments are non-refundable, except where a refund or other remedy is required under applicable law.
                  </p>
                  <p>
                    Once a booking has been paid for, the amount will not be refunded merely because a patient wishes to cancel the appointment, is unable to attend, or changes their mind.
                  </p>
                  <div className="p-3.5 rounded-xl bg-white border border-purple-200 text-sm font-medium text-purple-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Where eligible, patients may request to reschedule their appointment instead of receiving a monetary refund.</span>
                  </div>
                </div>
              </div>

              {/* 2. Appointment Cancellation */}
              <div id="section-2" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    02
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    2. Appointment Cancellation
                  </h2>
                </div>
                <ul className="space-y-2.5 text-sm md:text-base text-gray-700">
                  {[
                    "Patients may contact our support team to request cancellation of a booked appointment.",
                    "Cancellation of an appointment does not automatically entitle the patient to a monetary refund.",
                    "Where rescheduling is permitted, the patient may request an alternative appointment slot, subject to availability.",
                    "Any rescheduling conditions applicable to the booking will be communicated by our team.",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Appointment Rescheduling */}
              <div id="section-3" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    03
                  </span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-700" />
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                      3. Appointment Rescheduling
                    </h2>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  {[
                    "Patients may request to reschedule an appointment by contacting our support team.",
                    "Rescheduling is subject to the availability of the doctor, counsellor or clinic.",
                    "Patients are encouraged to request rescheduling at least 24 hours before the scheduled appointment.",
                    "The original payment may be carried forward to the rescheduled appointment where the request is approved.",
                    "Rescheduling is not guaranteed and must be confirmed by our team.",
                    "Any applicable time limits or restrictions on rescheduling will be communicated at the time of booking.",
                  ].map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF9F6] border border-gray-200/70 text-sm text-gray-800">
                      <CheckCircle2 className="w-4 h-4 text-purple-700 mt-0.5 flex-shrink-0" />
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Missed Appointments and Late Arrivals */}
              <div id="section-4" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    04
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    4. Missed Appointments and Late Arrivals
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700 text-sm md:text-base">
                  <p>
                    If a patient fails to attend a scheduled appointment without prior notice, the booking may be treated as a no-show.
                  </p>
                  <p>
                    No monetary refund will be provided for a missed appointment, except where required by applicable law. Rescheduling may be considered at the discretion of Kelkar Manas Health Care, subject to availability and the applicable booking terms.
                  </p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                    Patients arriving late may receive a shortened session or may need to request another appointment, depending on the doctor&apos;s availability.
                  </p>
                </div>
              </div>

              {/* 5. Cancellation by the Clinic or Doctor */}
              <div id="section-5" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    05
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    5. Cancellation by the Clinic or Doctor
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700 text-sm md:text-base">
                  <p>
                    If Kelkar Manas Health Care or the assigned doctor cancels an appointment, the patient will ordinarily be offered an alternative appointment without an additional consultation fee.
                  </p>
                  <p className="text-sm text-gray-600 bg-purple-50/50 p-3.5 rounded-xl border border-purple-100">
                    If rescheduling is not possible, or the service cannot be provided as agreed, the matter will be reviewed and an appropriate remedy, including a refund where required by applicable law, will be provided.
                  </p>
                </div>
              </div>

              {/* 6. Online Consultation and Technical Issues */}
              <div id="section-6" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    06
                  </span>
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-700" />
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                      6. Online Consultation and Technical Issues
                    </h2>
                  </div>
                </div>
                <div className="space-y-3.5 text-gray-700 text-sm md:text-base">
                  <p>
                    Patients are responsible for having a suitable device, a stable internet connection and an appropriate environment for online consultations.
                  </p>
                  <p>
                    If a session cannot proceed because of a verified technical failure attributable to our platform or service provider, we will make reasonable efforts to arrange a replacement appointment.
                  </p>
                  <p className="text-xs text-gray-500">
                    If the service cannot be provided as agreed, the patient will be offered an appropriate remedy in accordance with applicable law.
                  </p>
                </div>
              </div>

              {/* 7. Services Already Provided */}
              <div id="section-7" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    07
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    7. Services Already Provided
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700 text-sm md:text-base">
                  <p>
                    Payments for consultations or services that have already been provided are not refundable merely because the patient is dissatisfied with the outcome or did not achieve the expected result.
                  </p>
                  <p className="text-xs text-gray-500">
                    This provision does not limit any rights or remedies available to patients under applicable law.
                  </p>
                </div>
              </div>

              {/* 8. Courses, Packages and Other Services */}
              <div id="section-8" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    08
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    8. Courses, Packages and Other Services
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700 text-sm md:text-base">
                  <p>
                    Any courses, prepaid packages, therapy packages or other services purchased through the website may be subject to separate terms displayed before purchase.
                  </p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                    Unless a different policy is expressly stated, payments are non-refundable, and rescheduling or transfer of unused sessions may be considered only where the relevant service permits it and applicable law allows.
                  </p>
                </div>
              </div>

              {/* 9. How to Request Rescheduling */}
              <div id="section-9" className="scroll-mt-28 bg-white rounded-2xl border-2 border-purple-200/90 p-6 md:p-8 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4A154B] text-white font-bold text-sm">
                    09
                  </span>
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-purple-700" />
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                      9. How to Request Rescheduling
                    </h2>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 text-sm md:text-base">
                  To request an appointment change, please contact Kelkar Manas Health Care through the official contact details listed on our website.
                </p>

                <div className="bg-[#FAF9F6] p-5 rounded-xl border border-gray-200/80 mb-6">
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-800 mb-3">
                    Please provide the following details:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-800">
                    {[
                      "Patient name",
                      "Booking reference number",
                      "Registered phone number or email address",
                      "Original appointment date and time",
                      "Preferred alternative appointment slot",
                    ].map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-purple-700 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="text-sm font-medium text-purple-900 mb-6">
                  Our team will review the request and confirm whether rescheduling is possible.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                  <a
                    href="tel:+917030414140"
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#4A154B] text-white font-semibold text-sm hover:bg-[#3B113C] transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Support: +91 7030414140</span>
                  </a>
                  <a
                    href="mailto:kelkarmanashealthcare@gmail.com?subject=Appointment%20Rescheduling%20Request"
                    className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-100 text-[#4A154B] font-semibold text-sm hover:bg-purple-200/80 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Reschedule Request</span>
                  </a>
                </div>
              </div>

              {/* 10. Policy Updates */}
              <div id="section-10" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    10
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    10. Policy Updates
                  </h2>
                </div>
                <p className="text-gray-700 text-sm md:text-base">
                  Kelkar Manas Health Care may update this policy when necessary to reflect changes in services or applicable legal requirements. The latest version will be published on our website.
                </p>
              </div>

              {/* 11. Governing Law */}
              <div id="section-11" className="scroll-mt-28 bg-purple-50/50 border border-purple-200 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4A154B] text-white font-bold text-sm">
                    11
                  </span>
                  <div className="flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-purple-700" />
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                      11. Governing Law
                    </h2>
                  </div>
                </div>
                <div className="space-y-4 text-gray-800">
                  <p>
                    This policy is governed by the laws of India and is subject to applicable consumer-protection and other legal requirements.
                  </p>
                  <div className="p-5 rounded-xl bg-white border border-purple-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-serif font-bold text-[#4A154B] text-lg">
                        Kelkar Manas Health Care
                      </p>
                      <p className="text-xs text-gray-600">
                        Thank you for choosing our services.
                      </p>
                    </div>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:underline uppercase tracking-wider"
                    >
                      <span>Contact Clinic</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

            </main>
          </div>
        </div>
      </section>
    </div>
  );
}
