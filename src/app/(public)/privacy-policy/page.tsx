import { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  FileText,
  Calendar,
  Building2,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  HeartHandshake,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | Kelkar Manas Health Care",
  description:
    "Read the official Privacy Policy of Kelkar Manas Health Care. Learn how we collect, use, store, disclose, and protect your personal, psychiatric, and sexual health information.",
  keywords: [
    "Privacy Policy",
    "Kelkar Manas Health Care",
    "Patient confidentiality",
    "Mental health privacy",
    "Sexual health privacy",
    "Thane psychiatric clinic privacy",
  ],
};

const SECTIONS = [
  { id: "section-1", title: "1. Introduction" },
  { id: "section-2", title: "2. Information We May Collect" },
  { id: "section-3", title: "3. How We Use Your Information" },
  { id: "section-4", title: "4. Confidentiality of Medical & Sexual Health" },
  { id: "section-5", title: "5. Cookies & Website Technologies" },
  { id: "section-6", title: "6. Communication Channels" },
  { id: "section-7", title: "7. Sharing & Disclosure of Information" },
  { id: "section-8", title: "8. Data Storage, Security & Retention" },
  { id: "section-9", title: "9. Your Privacy Rights" },
  { id: "section-10", title: "10. Privacy of Children & Adolescents" },
  { id: "section-11", title: "11. Third-Party Websites & Services" },
  { id: "section-12", title: "12. Online Consultations" },
  { id: "section-13", title: "13. Marketing & Promotional Communications" },
  { id: "section-14", title: "14. Data Breaches & Security Incidents" },
  { id: "section-15", title: "15. Changes to This Privacy Policy" },
  { id: "section-16", title: "16. Contact Us" },
];

export default function PrivacyPolicyPage() {
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
            <span className="text-white">Privacy Policy</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-purple-100 text-xs md:text-sm font-medium mb-5 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Official Policy Document · Kelkar Manas Health Care</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight mb-4">
            Privacy Policy
          </h1>

          <p className="text-purple-100/90 text-base md:text-lg max-w-3xl leading-relaxed mb-8">
            We are committed to maintaining the highest clinical confidentiality and protecting the personal and health-related information you entrust with us.
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
                    <p className="font-semibold text-[#4A154B] mb-1">Need Clarification?</p>
                    <p className="text-gray-600 mb-2">Our privacy grievance officer is available to answer any questions.</p>
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

            {/* Privacy Policy Detailed Body */}
            <main className="lg:col-span-8 space-y-12 text-gray-800 leading-relaxed text-base">
              
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
                    Welcome to <strong>Kelkar Manas Health Care</strong> (“we,” “our,” or “us”). We respect your privacy and are committed to protecting the personal and health-related information you share with us through our website, appointment forms, communication channels, and healthcare services.
                  </p>
                  <p>
                    This Privacy Policy explains how we collect, use, store, disclose, and protect your information when you visit our website, contact us, request an appointment, or use our services.
                  </p>
                  <p>
                    By using our website or providing your information to us, you acknowledge that you have read this Privacy Policy. Where consent is legally required, we will seek it separately.
                  </p>
                </div>
              </div>

              {/* 2. Information We May Collect */}
              <div id="section-2" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    02
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    2. Information We May Collect
                  </h2>
                </div>
                <p className="text-gray-700 mb-6">
                  Depending on the services you use and the information you provide, we may collect the following categories of information:
                </p>

                <div className="space-y-5">
                  {/* Category A */}
                  <div className="border border-gray-200/80 rounded-xl p-5 bg-[#FAF9F6]">
                    <h3 className="font-bold text-gray-900 text-base mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-purple-100 text-[#4A154B] text-xs font-bold inline-flex items-center justify-center">A</span>
                      Personal Information
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                        Full name
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                        Age or date of birth
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                        Contact number
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                        Email address
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                        City or general location
                      </li>
                      <li className="flex items-center gap-2 sm:col-span-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                        Other information voluntarily provided through forms or communications
                      </li>
                    </ul>
                  </div>

                  {/* Category B */}
                  <div className="border border-purple-200 rounded-xl p-5 bg-purple-50/40">
                    <h3 className="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-purple-700 text-white text-xs font-bold inline-flex items-center justify-center">B</span>
                      Health-Related Information
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">
                      When necessary for providing healthcare services, we may collect information such as:
                    </p>
                    <ul className="space-y-1.5 text-sm text-gray-700 mb-3">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4A154B] mt-2 flex-shrink-0" />
                        <span>Medical history and reported symptoms</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4A154B] mt-2 flex-shrink-0" />
                        <span>Mental health or sexual health concerns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4A154B] mt-2 flex-shrink-0" />
                        <span>Previous diagnoses and treatment information</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4A154B] mt-2 flex-shrink-0" />
                        <span>Medication details and relevant medical reports</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4A154B] mt-2 flex-shrink-0" />
                        <span>Consultation notes and follow-up information</span>
                      </li>
                    </ul>
                    <div className="p-2.5 rounded-lg bg-white/80 border border-purple-100 text-xs font-medium text-purple-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>We aim to collect only information that is reasonably necessary for the relevant purpose.</span>
                    </div>
                  </div>

                  {/* Category C */}
                  <div className="border border-gray-200/80 rounded-xl p-5 bg-[#FAF9F6]">
                    <h3 className="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-purple-100 text-[#4A154B] text-xs font-bold inline-flex items-center justify-center">C</span>
                      Appointment and Transaction Information
                    </h3>
                    <p className="text-sm text-gray-700 mb-2.5">
                      We may collect appointment preferences, booking details, consultation status, payment confirmations, receipts, and relevant transaction references.
                    </p>
                    <p className="text-xs text-gray-600 bg-white p-3 rounded-lg border border-gray-200/60">
                      Payments may be processed through third-party payment providers. We do not intend to collect or store complete card details, UPI PINs, passwords, or other payment authentication credentials through our website.
                    </p>
                  </div>

                  {/* Category D */}
                  <div className="border border-gray-200/80 rounded-xl p-5 bg-[#FAF9F6]">
                    <h3 className="font-bold text-gray-900 text-base mb-2 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-purple-100 text-[#4A154B] text-xs font-bold inline-flex items-center justify-center">D</span>
                      Technical Information
                    </h3>
                    <p className="text-sm text-gray-700">
                      When you access our website, certain technical information may be collected, depending on the website configuration. This may include IP address, browser type, device information, pages visited, access times, and cookies or similar technologies.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. How We Use Your Information */}
              <div id="section-3" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    03
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    3. How We Use Your Information
                  </h2>
                </div>
                <p className="text-gray-700 mb-4">
                  We may use your information for the following purposes:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                  {[
                    "To respond to enquiries and requests",
                    "To schedule, confirm, reschedule, or manage appointments",
                    "To provide healthcare consultations and related services",
                    "To maintain relevant medical and administrative records",
                    "To communicate appointment reminders and service updates",
                    "To process payments and issue receipts",
                    "To improve website functionality, security, and user experience",
                    "To comply with applicable legal, regulatory, and professional obligations",
                    "To protect patients, staff, and the public where legally appropriate",
                  ].map((purpose, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-50/30 border border-purple-100/60 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-purple-700 mt-0.5 flex-shrink-0" />
                      <span>{purpose}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 italic">
                  We will not use your personal information for an unrelated purpose where additional notice or consent is required without meeting that requirement.
                </p>
              </div>

              {/* 4. Confidentiality of Medical and Sexual Health Information */}
              <div id="section-4" className="scroll-mt-28 bg-gradient-to-br from-purple-50 via-white to-purple-50/60 rounded-2xl border-2 border-purple-200 p-6 md:p-8 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4A154B] text-white font-bold text-sm">
                    04
                  </span>
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-purple-700" />
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                      4. Confidentiality of Medical and Sexual Health Information
                    </h2>
                  </div>
                </div>

                <div className="space-y-4 text-gray-700">
                  <div className="p-4 rounded-xl bg-purple-100/60 border border-purple-200 text-[#4A154B] font-medium text-sm md:text-base">
                    We understand that mental health, psychiatric, and sexual health information is particularly personal.
                  </div>

                  <p>
                    Access to patient information should be limited to authorised personnel who need it for healthcare, administration, or other legitimate purposes. We take reasonable steps to maintain confidentiality in accordance with applicable laws and professional obligations.
                  </p>

                  <p>
                    Information may be disclosed where required or permitted by law, for legitimate healthcare purposes, or in other circumstances recognised by applicable law. Any such disclosure should be limited to what is appropriate for the relevant purpose.
                  </p>

                  <p className="text-xs text-gray-500 bg-white/80 p-3 rounded-lg border border-gray-200/80">
                    <strong>Note:</strong> Please note that no website, electronic communication method, or storage system can be guaranteed to be completely secure.
                  </p>
                </div>
              </div>

              {/* 5. Cookies and Website Technologies */}
              <div id="section-5" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    05
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    5. Cookies and Website Technologies
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700 text-sm md:text-base">
                  <p>
                    Our website may use cookies or similar technologies to support essential functionality, understand website usage, and improve performance.
                  </p>
                  <p>
                    If analytics, advertising, or other non-essential tracking technologies are used, we will provide appropriate notices and obtain consent where required by applicable law.
                  </p>
                  <p>
                    You may be able to manage cookies through your browser settings. Disabling certain cookies may affect some website features.
                  </p>
                </div>
              </div>

              {/* 6. Communication Channels */}
              <div id="section-6" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    06
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    6. WhatsApp, Phone, Email, and Other Communication Channels
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700 text-sm md:text-base">
                  <p>
                    If you contact us by phone, email, WhatsApp, or another communication platform, we may use the information you provide to respond to your enquiry and manage your appointment.
                  </p>
                  <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-sm">
                    <strong>Important Clinical Guidance:</strong> Please avoid sending highly sensitive medical information through channels that may not be suitable for confidential clinical communication. Where available, ask our team about the appropriate method for sharing medical records.
                  </div>
                  <p className="text-xs text-gray-500">
                    Third-party communication platforms operate under their own privacy policies and terms.
                  </p>
                </div>
              </div>

              {/* 7. Sharing and Disclosure of Information */}
              <div id="section-7" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    07
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    7. Sharing and Disclosure of Information
                  </h2>
                </div>
                <div className="p-3.5 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold text-sm">
                  We do not sell your personal information to third parties.
                </div>
                <p className="text-gray-700 mb-3 text-sm md:text-base">
                  We may share relevant information, where necessary and lawful, with:
                </p>
                <ul className="space-y-2 mb-4 text-sm text-gray-700">
                  {[
                    "Authorised healthcare professionals involved in your care",
                    "Staff who support appointment management and healthcare administration",
                    "Technology, hosting, communication, and payment service providers acting on our behalf",
                    "Professional advisers, auditors, or insurers where appropriate",
                    "Government authorities, courts, or regulators when legally required",
                    "Other parties where you have provided valid consent or disclosure is otherwise permitted by applicable law",
                  ].map((party, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                      <span>{party}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500">
                  We expect service providers handling information on our behalf to apply appropriate confidentiality and security measures.
                </p>
              </div>

              {/* 8. Data Storage, Security, and Retention */}
              <div id="section-8" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    08
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    8. Data Storage, Security, and Retention
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700 text-sm md:text-base">
                  <p>
                    We take reasonable technical, organisational, and administrative measures to protect information against unauthorised access, loss, misuse, alteration, or disclosure.
                  </p>
                  <p>
                    These measures may include access restrictions, secure systems, staff procedures, and appropriate safeguards provided by our service providers.
                  </p>
                  <p>
                    We retain information only for as long as reasonably necessary for the purpose for which it was collected, including healthcare continuity, recordkeeping, legal compliance, dispute resolution, and other legitimate requirements.
                  </p>
                  <p className="text-xs text-gray-600 bg-gray-50 p-3.5 rounded-xl border border-gray-200/80">
                    <strong>Medical Record Retention:</strong> Medical records may need to be retained for periods prescribed by applicable law or professional standards. Therefore, requests to delete information may be subject to legal and clinical recordkeeping obligations.
                  </p>
                </div>
              </div>

              {/* 9. Your Privacy Rights */}
              <div id="section-9" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    09
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    9. Your Privacy Rights
                  </h2>
                </div>
                <p className="text-gray-700 mb-3 text-sm md:text-base">
                  Subject to applicable law, you may have the right to:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-4">
                  {[
                    "Request access to personal information held about you",
                    "Ask for correction of inaccurate or incomplete information",
                    "Withdraw consent where processing is based on consent",
                    "Request deletion of information where legally applicable",
                    "Raise a concern or grievance regarding the handling of your information",
                    "Exercise any additional rights available under applicable data protection laws",
                  ].map((right, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-[#FAF9F6] border border-gray-200/70 text-xs text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-700 mt-1.5 flex-shrink-0" />
                      <span>{right}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  To make a request, contact us using the details in the Contact Us section. We may need to verify your identity before acting on a request.
                </p>
                <p className="text-xs text-gray-500">
                  Withdrawing consent may affect our ability to provide certain services where the relevant information is necessary for that service. It does not affect processing already lawfully carried out before withdrawal.
                </p>
              </div>

              {/* 10. Privacy of Children and Adolescents */}
              <div id="section-10" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    10
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    10. Privacy of Children and Adolescents
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700 text-sm md:text-base">
                  <p>
                    When healthcare services involve children or adolescents, we handle their information in accordance with applicable laws and relevant consent requirements.
                  </p>
                  <p>
                    Where required, we will seek consent from a parent or lawful guardian and take appropriate steps to protect the child&apos;s privacy and welfare.
                  </p>
                </div>
              </div>

              {/* 11. Third-Party Websites and Services */}
              <div id="section-11" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    11
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    11. Third-Party Websites and Services
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700 text-sm md:text-base">
                  <p>
                    Our website may contain links to third-party websites, appointment systems, video consultation platforms, payment gateways, or messaging services.
                  </p>
                  <p>
                    We do not control the privacy practices of independent third parties. We encourage you to review their privacy policies before sharing information or using their services.
                  </p>
                </div>
              </div>

              {/* 12. Online Consultations */}
              <div id="section-12" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    12
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    12. Online Consultations
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700 text-sm md:text-base">
                  <p>
                    If online or video consultations are offered, relevant personal and medical information may be processed to arrange and conduct the consultation.
                  </p>
                  <p>
                    Please use a private location and a secure device where possible. The use of third-party video or communication services may also be subject to the privacy terms of those providers.
                  </p>
                  <p className="text-xs text-purple-900 bg-purple-50/70 p-3 rounded-lg border border-purple-100">
                    Consultations will not be recorded by us unless there is an appropriate reason and the necessary notice, consent, or other legal basis has been established.
                  </p>
                </div>
              </div>

              {/* 13. Marketing and Promotional Communications */}
              <div id="section-13" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    13
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    13. Marketing and Promotional Communications
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700 text-sm md:text-base">
                  <p>
                    We may send service-related messages, such as appointment confirmations, reminders, and important updates.
                  </p>
                  <p>
                    We will send promotional communications only where permitted by applicable law and, where required, after obtaining your consent. You may opt out of promotional communications by following the instructions provided in the message or contacting us.
                  </p>
                  <p className="text-xs text-gray-500">
                    Opting out of promotional messages will not necessarily stop essential communications relating to an appointment or service you have requested.
                  </p>
                </div>
              </div>

              {/* 14. Data Breaches and Security Incidents */}
              <div id="section-14" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    14
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    14. Data Breaches and Security Incidents
                  </h2>
                </div>
                <p className="text-gray-700 text-sm md:text-base">
                  If we become aware of a personal data breach affecting information under our control, we will assess and respond to it in accordance with applicable legal requirements, including any required notifications to affected individuals or authorities.
                </p>
              </div>

              {/* 15. Changes to This Privacy Policy */}
              <div id="section-15" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    15
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    15. Changes to This Privacy Policy
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700 text-sm md:text-base">
                  <p>
                    We may update this Privacy Policy to reflect changes in our services, website functionality, data-handling practices, or applicable laws.
                  </p>
                  <p>
                    The revised version will be published on this page with an updated “Last Updated” date. Where required, we will provide additional notice or seek consent for material changes.
                  </p>
                </div>
              </div>

              {/* 16. Contact Us */}
              <div id="section-16" className="scroll-mt-28 bg-white rounded-2xl border-2 border-purple-200/90 p-6 md:p-8 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4A154B] text-white font-bold text-sm">
                    16
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    16. Contact Us
                  </h2>
                </div>
                <p className="text-gray-700 mb-6 text-sm md:text-base">
                  If you have questions about this Privacy Policy, wish to exercise your privacy rights, or want to raise a privacy-related concern, please contact us:
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

                  {/* Grievance Contact */}
                  <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200 md:col-span-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-800 mb-1.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Privacy Grievance Contact</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-800 mb-1">
                      Designated Grievance Officer, Kelkar Manas Health Care
                    </p>
                    <p className="text-xs text-gray-600 flex flex-wrap items-center gap-3">
                      <span>Email: <a href="mailto:kelkarmanashealthcare@gmail.com" className="text-purple-700 font-semibold hover:underline">kelkarmanashealthcare@gmail.com</a></span>
                      <span>•</span>
                      <span>Phone: <a href="tel:+917030414140" className="text-purple-700 font-semibold hover:underline">+91 7030414140</a></span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  We will review privacy-related requests and respond in accordance with applicable legal requirements.
                </p>
              </div>

              {/* Important Legal Disclaimer Banner */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 text-xs md:text-sm text-amber-900 leading-relaxed shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-amber-950 block mb-1">Important Notice:</strong>
                    This Privacy Policy is a general draft for website use and does not constitute legal advice. It should be reviewed against the actual data collected by Kelkar Manas Health Care, the website&apos;s technical configuration, the clinic&apos;s recordkeeping practices, and applicable Indian data protection and healthcare requirements before publication.
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
