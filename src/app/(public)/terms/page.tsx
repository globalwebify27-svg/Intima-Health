import { Metadata } from "next";
import Link from "next/link";
import {
  FileText,
  Calendar,
  Building2,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Scale,
  CreditCard,
  Video,
  Gavel,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | Kelkar Manas Health Care",
  description:
    "Read the official Terms & Conditions for Kelkar Manas Health Care. Understand appointment booking procedures, clinical disclaimers, fees, online consultations, and patient responsibilities.",
  keywords: [
    "Terms and Conditions",
    "Kelkar Manas Health Care terms",
    "Appointment booking terms",
    "Medical disclaimer",
    "Psychiatric consultation terms Thane",
  ],
};

const SECTIONS = [
  { id: "section-1", title: "1. Introduction" },
  { id: "section-2", title: "2. Purpose of the Website" },
  { id: "section-3", title: "3. Medical Disclaimer" },
  { id: "section-4", title: "4. Healthcare Services" },
  { id: "section-5", title: "5. Appointment Booking" },
  { id: "section-6", title: "6. Consultation Fees & Payments" },
  { id: "section-7", title: "7. Cancellation, Rescheduling & Refunds" },
  { id: "section-8", title: "8. Online & Video Consultations" },
  { id: "section-9", title: "9. Patient Responsibilities" },
  { id: "section-10", title: "10. Privacy & Confidentiality" },
  { id: "section-11", title: "11. Website Content & IP" },
  { id: "section-12", title: "12. Prohibited Website Use" },
  { id: "section-13", title: "13. Third-Party Links & Services" },
  { id: "section-14", title: "14. Limitation of Liability" },
  { id: "section-15", title: "15. Changes to Services or Terms" },
  { id: "section-16", title: "16. Suspension or Restriction of Access" },
  { id: "section-17", title: "17. Governing Law & Jurisdiction" },
  { id: "section-18", title: "18. Contact Information" },
];

export default function TermsPage() {
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
            <span className="text-white">Terms &amp; Conditions</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-purple-100 text-xs md:text-sm font-medium mb-5 shadow-sm">
            <Scale className="w-4 h-4 text-purple-300" />
            <span>Legal Agreement · Kelkar Manas Health Care</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight mb-4">
            Terms &amp; Conditions
          </h1>

          <p className="text-purple-100/90 text-base md:text-lg max-w-3xl leading-relaxed mb-8">
            Please read these terms and conditions carefully before accessing our website, booking appointments, or engaging our healthcare services.
          </p>

          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-purple-200">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10">
              <Calendar className="w-4 h-4 text-purple-300" />
              <span>Effective Date: <strong>October 2026</strong></span>
            </div>
            <div className="inline-flex items-center gap-2 bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10">
              <Calendar className="w-4 h-4 text-purple-300" />
              <span>Last Updated: <strong>October 2026</strong></span>
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
                    <p className="font-semibold text-[#4A154B] mb-1">Questions Regarding Terms?</p>
                    <p className="text-gray-600 mb-2">Our clinic administrative desk is available to assist you.</p>
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

            {/* Terms Detailed Body */}
            <main className="lg:col-span-8 space-y-10 text-gray-800 leading-relaxed text-base">

              {/* 1. Introduction */}
              <div id="section-1" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    01
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    1. Introduction
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700">
                  <p>
                    Welcome to <strong>Kelkar Manas Health Care</strong> (“we,” “our,” or “us”). These Terms &amp; Conditions govern your access to and use of our website, appointment booking facilities, online communications, and healthcare-related services offered through our clinic.
                  </p>
                  <p>
                    By accessing this website or using our services, you agree to these Terms &amp; Conditions. If you do not agree with any part of these terms, please discontinue use of the website.
                  </p>
                  <p>
                    These terms should be read together with our <Link href="/privacy-policy" className="text-purple-700 font-semibold hover:underline">Privacy Policy</Link> and any additional terms communicated to you when booking a specific service.
                  </p>
                </div>
              </div>

              {/* 2. Purpose of the Website */}
              <div id="section-2" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    02
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    2. Purpose of the Website
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700">
                  <p>
                    This website is intended to provide general information about Kelkar Manas Health Care, its services, appointment procedures, and relevant healthcare information.
                  </p>
                  <p>
                    Information published on this website is for educational and informational purposes. It is not a substitute for an individual medical consultation, professional assessment, diagnosis, or treatment.
                  </p>
                  <p className="text-sm text-gray-600">
                    We make reasonable efforts to keep the information accurate and up to date but do not guarantee that every page will always be complete, current, or free from errors.
                  </p>
                </div>
              </div>

              {/* 3. Medical Disclaimer */}
              <div id="section-3" className="scroll-mt-28 bg-gradient-to-br from-red-50/70 via-white to-red-50/30 rounded-2xl border-2 border-red-200 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-700 text-white font-bold text-sm">
                    03
                  </span>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-700" />
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-red-950">
                      3. Medical Disclaimer
                    </h2>
                  </div>
                </div>

                <div className="space-y-4 text-gray-700">
                  <p>
                    Medical information available on this website should not be used to diagnose or treat a medical condition without consulting a qualified healthcare professional.
                  </p>
                  <p>
                    Every patient is different. Treatment recommendations depend on individual circumstances, clinical assessment, medical history, and the professional judgment of the treating clinician.
                  </p>
                  <p className="font-semibold text-gray-900">
                    Do not start, stop, or change prescribed medication solely on the basis of information found on this website.
                  </p>

                  <div className="p-4 rounded-xl bg-red-100/70 border border-red-300 text-red-950 text-sm leading-relaxed">
                    <strong className="block text-red-900 font-bold mb-1">Emergency situations:</strong>
                    This website and routine appointment services are not substitutes for emergency medical care. If you or another person is at immediate risk of harm, has taken an overdose, or is experiencing a medical emergency, contact emergency services or visit the nearest emergency department. <strong>In India, call 112 for emergency assistance.</strong>
                  </div>
                </div>
              </div>

              {/* 4. Healthcare Services */}
              <div id="section-4" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    04
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    4. Healthcare Services
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700">
                  <p>
                    The availability of consultations, treatments, specialists, and other services may vary by location, clinician availability, appointment schedule, and clinical suitability.
                  </p>
                  <p>
                    Listing a service on this website does not guarantee that it will be suitable for every patient or available at every clinic location.
                  </p>
                  <p className="text-sm text-gray-600 bg-purple-50/50 p-3.5 rounded-xl border border-purple-100">
                    We reserve the right to recommend an alternative consultation, further evaluation, referral, or a different treatment approach where clinically appropriate.
                  </p>
                </div>
              </div>

              {/* 5. Appointment Booking */}
              <div id="section-5" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    05
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    5. Appointment Booking
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700">
                  <p>
                    Appointments may be requested through the contact details, booking forms, or other booking methods provided on our website.
                  </p>
                  <p>
                    When requesting an appointment, you agree to provide accurate and complete information to the best of your knowledge.
                  </p>
                  <p className="font-medium text-gray-900 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                    Submitting an appointment request does not automatically guarantee an appointment. Your booking is confirmed only when the clinic communicates confirmation through an authorised channel.
                  </p>
                  <p className="text-xs text-gray-500">
                    Appointment availability may change due to clinician schedules, holidays, operational requirements, or unforeseen circumstances.
                  </p>
                </div>
              </div>

              {/* 6. Consultation Fees and Payments */}
              <div id="section-6" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    06
                  </span>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-purple-700" />
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                      6. Consultation Fees and Payments
                    </h2>
                  </div>
                </div>
                <div className="space-y-3.5 text-gray-700">
                  <p>
                    Consultation fees and other service charges will be communicated through the relevant booking channel or by the clinic team.
                  </p>
                  <p>
                    Depending on the service, payment may be required before the appointment or at another stage communicated during booking.
                  </p>
                  <p>
                    You agree to pay the applicable charges using the payment methods authorised by the clinic.
                  </p>
                  <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-sm">
                    <strong>Payment Safety Warning:</strong> Please retain your payment confirmation or receipt. <strong>Do not share your UPI PIN, banking password, one-time password (OTP), or other payment authentication credentials</strong> with anyone claiming to represent the clinic.
                  </div>
                </div>
              </div>

              {/* 7. Cancellation, Rescheduling, and Refunds */}
              <div id="section-7" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    07
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    7. Cancellation, Rescheduling, and Refunds
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700">
                  <p>
                    If you need to cancel or reschedule an appointment, please notify the clinic as early as reasonably possible.
                  </p>
                  <p>
                    Rescheduling is subject to availability. Any cancellation charges, refund eligibility, processing timelines, or missed-appointment conditions will be communicated under the applicable booking or refund policy.
                  </p>
                  <p>
                    Where a refund is due, it will be handled in accordance with the applicable policy and legal requirements.
                  </p>
                  <p className="text-xs text-gray-500">
                    Nothing in these Terms &amp; Conditions is intended to exclude any consumer rights or other protections that cannot legally be excluded.
                  </p>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600 italic">
                    Before publishing: Insert a clear, verified cancellation and refund policy if online payments or prepaid appointments are accepted.
                  </div>
                </div>
              </div>

              {/* 8. Online and Video Consultations */}
              <div id="section-8" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    08
                  </span>
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-purple-700" />
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                      8. Online and Video Consultations
                    </h2>
                  </div>
                </div>
                <div className="space-y-3.5 text-gray-700">
                  <p>
                    If online consultations are offered, their availability will depend on the service, clinician, and clinical suitability of the patient’s concern.
                  </p>
                  <p>
                    You are responsible for providing accurate information, using a suitable device and internet connection, and joining the session at the scheduled time.
                  </p>
                  <p>
                    Online consultations may not be appropriate for every condition. The clinician may recommend an in-person assessment or emergency care where necessary.
                  </p>
                  <p className="text-sm text-gray-600 bg-[#FAF9F6] p-3.5 rounded-xl border border-gray-200">
                    Technical interruptions may occasionally occur. If a session cannot proceed, contact the clinic for instructions regarding rescheduling or other arrangements.
                  </p>
                </div>
              </div>

              {/* 9. Patient Responsibilities */}
              <div id="section-9" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    09
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    9. Patient Responsibilities
                  </h2>
                </div>
                <p className="text-gray-700 mb-4">
                  When using our website or healthcare services, you agree to:
                </p>
                <div className="space-y-2 mb-4">
                  {[
                    "Provide accurate and relevant information.",
                    "Share relevant medical history, current medications, and allergies with your treating clinician.",
                    "Follow reasonable appointment and clinic instructions.",
                    "Treat clinicians, staff, and other patients respectfully.",
                    "Use the website lawfully and responsibly.",
                    "Avoid submitting false, misleading, abusive, fraudulent, or unlawful content.",
                    "Keep your appointment confirmation and access credentials secure, where applicable.",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50/30 border border-purple-100/60 text-sm text-gray-800">
                      <CheckCircle2 className="w-4 h-4 text-purple-700 mt-0.5 flex-shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-purple-900 bg-purple-50/70 p-3 rounded-lg border border-purple-100">
                  You may ask questions about your proposed treatment, available alternatives, potential risks, and follow-up care.
                </p>
              </div>

              {/* 10. Privacy and Confidentiality */}
              <div id="section-10" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    10
                  </span>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-purple-700" />
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                      10. Privacy and Confidentiality
                    </h2>
                  </div>
                </div>
                <div className="space-y-3.5 text-gray-700">
                  <p>
                    We respect patient privacy and handle personal and health-related information in accordance with our <Link href="/privacy-policy" className="text-purple-700 font-semibold hover:underline">Privacy Policy</Link>, applicable laws, and relevant professional obligations.
                  </p>
                  <p>
                    Access to medical information is restricted as appropriate. Information may be disclosed where required or permitted by law or where another lawful basis applies.
                  </p>
                  <p className="text-sm text-gray-600">
                    Please review our <Link href="/privacy-policy" className="text-purple-700 font-semibold hover:underline">Privacy Policy</Link> to understand how information may be collected, used, stored, and shared.
                  </p>
                </div>
              </div>

              {/* 11. Website Content and Intellectual Property */}
              <div id="section-11" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    11
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    11. Website Content and Intellectual Property
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700">
                  <p>
                    Unless otherwise stated, the website content, including text, graphics, logos, designs, photographs, videos, and other materials, is owned by Kelkar Manas Health Care or used with appropriate permission.
                  </p>
                  <p>
                    You may access and use this content for personal, non-commercial informational purposes.
                  </p>
                  <p>
                    You must not reproduce, republish, modify, distribute, commercially exploit, or misrepresent website content without prior permission, except where permitted by applicable law.
                  </p>
                  <p className="text-xs text-gray-500">
                    All third-party names, logos, and materials remain the property of their respective owners.
                  </p>
                </div>
              </div>

              {/* 12. Prohibited Website Use */}
              <div id="section-12" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    12
                  </span>
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                      12. Prohibited Website Use
                    </h2>
                  </div>
                </div>
                <p className="text-gray-700 mb-3">You must not:</p>
                <ul className="space-y-2 mb-4 text-sm text-gray-700">
                  {[
                    "Use the website for any unlawful or fraudulent purpose.",
                    "Attempt unauthorised access to our website, systems, or data.",
                    "Introduce malicious software or interfere with website security.",
                    "Submit false appointment information or impersonate another person.",
                    "Copy or misuse website content in violation of applicable law.",
                    "Use the website in a manner that disrupts services or infringes the rights of others.",
                  ].map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-2 flex-shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500">
                  We may take reasonable and lawful steps to address misuse or protect the website and its users.
                </p>
              </div>

              {/* 13. Third-Party Links and Services */}
              <div id="section-13" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    13
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    13. Third-Party Links and Services
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700">
                  <p>
                    Our website may link to third-party websites, payment providers, communication platforms, video consultation tools, or other external services.
                  </p>
                  <p>
                    These services may be governed by separate terms and privacy policies. We do not control all third-party systems and are not responsible for their independent content, policies, or availability.
                  </p>
                  <p className="text-sm text-gray-600">
                    You should review the relevant third-party terms before using those services.
                  </p>
                </div>
              </div>

              {/* 14. Limitation of Liability */}
              <div id="section-14" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    14
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    14. Limitation of Liability
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700">
                  <p>
                    To the extent permitted by applicable law, Kelkar Manas Health Care will not be responsible for losses arising solely from reliance on general website information without obtaining appropriate professional advice, interruptions beyond our reasonable control, or the independent acts of third-party platforms.
                  </p>
                  <p>
                    Nothing in these Terms &amp; Conditions excludes or limits liability where such exclusion or limitation is prohibited by applicable law, including any applicable consumer protections or professional obligations.
                  </p>
                  <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 text-sm font-medium text-gray-800">
                    Nothing in these terms guarantees a particular clinical outcome. Healthcare outcomes depend on multiple factors, including the patient&apos;s condition, individual circumstances, and response to treatment.
                  </div>
                </div>
              </div>

              {/* 15. Changes to Services or Terms */}
              <div id="section-15" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    15
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    15. Changes to Services or Terms
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700">
                  <p>
                    We may update website content, appointment procedures, available services, or these Terms &amp; Conditions from time to time.
                  </p>
                  <p>
                    Changes will be published on this page with an updated “Last Updated” date. Where required by law, additional notice or consent will be provided.
                  </p>
                  <p className="text-sm text-gray-600">
                    Your continued use of the website after revised terms are published will be subject to applicable legal requirements concerning notice and acceptance.
                  </p>
                </div>
              </div>

              {/* 16. Suspension or Restriction of Access */}
              <div id="section-16" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    16
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    16. Suspension or Restriction of Access
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700">
                  <p>
                    We may restrict or suspend access to website features where reasonably necessary for security, maintenance, prevention of misuse, legal compliance, or operational reasons.
                  </p>
                  <p>
                    Any such action will be taken subject to applicable law and any contractual or consumer rights that apply.
                  </p>
                </div>
              </div>

              {/* 17. Governing Law and Jurisdiction */}
              <div id="section-17" className="scroll-mt-28 bg-purple-50/50 border border-purple-200 rounded-2xl p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4A154B] text-white font-bold text-sm">
                    17
                  </span>
                  <div className="flex items-center gap-2">
                    <Gavel className="w-5 h-5 text-purple-700" />
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                      17. Governing Law and Jurisdiction
                    </h2>
                  </div>
                </div>
                <div className="space-y-3.5 text-gray-800">
                  <p>
                    These Terms &amp; Conditions are governed by the laws of India.
                  </p>
                  <p className="p-3.5 rounded-xl bg-white border border-purple-100 font-medium">
                    Subject to applicable law and the jurisdiction of competent courts, disputes arising from the use of this website or the relevant services will be subject to the jurisdiction of the competent courts in <strong>Akola, Maharashtra, India</strong>, where legally permissible.
                  </p>
                  <p className="text-xs text-gray-600">
                    Nothing in this clause limits any right a consumer may have to seek remedies before a forum or authority that has jurisdiction under applicable law.
                  </p>
                </div>
              </div>

              {/* 18. Contact Information */}
              <div id="section-18" className="scroll-mt-28 bg-white rounded-2xl border-2 border-purple-200/90 p-6 md:p-8 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4A154B] text-white font-bold text-sm">
                    18
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    18. Contact Information
                  </h2>
                </div>
                <p className="text-gray-700 mb-6 text-sm md:text-base">
                  For questions about these Terms &amp; Conditions, appointment procedures, payments, cancellations, or website use, please contact us:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Organisation */}
                  <div className="bg-[#FAF9F6] p-4 rounded-xl border border-gray-200/80">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 mb-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Organisation</span>
                    </div>
                    <p className="text-base font-semibold text-gray-900">
                      Kelkar Manas Health Care
                    </p>
                  </div>

                  {/* Address */}
                  <div className="bg-[#FAF9F6] p-4 rounded-xl border border-gray-200/80">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 mb-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Address</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                      101, 102, 103 &amp; 104, Gulmohar Heights, Behind Fatema Church, Ghodbandar Road, Majiwada, Thane, Maharashtra 400601
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="bg-[#FAF9F6] p-4 rounded-xl border border-gray-200/80">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 mb-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span>Phone</span>
                    </div>
                    <a
                      href="tel:+917030414140"
                      className="text-sm font-semibold text-[#4A154B] hover:underline inline-flex items-center gap-1"
                    >
                      +91 7030414140
                    </a>
                  </div>

                  {/* Email */}
                  <div className="bg-[#FAF9F6] p-4 rounded-xl border border-gray-200/80">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 mb-1.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </div>
                    <a
                      href="mailto:kelkarmanashealthcare@gmail.com"
                      className="text-xs md:text-sm font-semibold text-[#4A154B] hover:underline break-all"
                    >
                      kelkarmanashealthcare@gmail.com
                    </a>
                  </div>
                </div>
              </div>

              {/* Important Legal Disclaimer Banner */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 text-xs md:text-sm text-amber-900 leading-relaxed shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-amber-950 block mb-1">Important Notice:</strong>
                    These Terms &amp; Conditions are a general website draft and are not legal advice. Please have them reviewed by a qualified legal professional before publication, particularly the payment and refund provisions, medical-service terms, liability clauses, and jurisdiction clause.
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
