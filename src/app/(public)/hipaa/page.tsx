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
  Shield,
  FileSpreadsheet,
  KeyRound,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "HIPAA & Patient Health Information Privacy Policy | Kelkar Manas Health Care",
  description:
    "Read the official HIPAA & Patient Health Information Privacy Policy of Kelkar Manas Health Care. Learn how we safeguard confidential psychiatric, sexual health, and clinical records.",
  keywords: [
    "HIPAA policy",
    "Patient Health Information Privacy",
    "Kelkar Manas Health Care HIPAA",
    "Mental health privacy Thane",
    "Sexual health records confidentiality",
    "PHI safeguards",
  ],
};

const SECTIONS = [
  { id: "section-1", title: "1. Purpose of This Policy" },
  { id: "section-2", title: "2. What Is Protected Health Information?" },
  { id: "section-3", title: "3. How We Collect Health Information" },
  { id: "section-4", title: "4. How We Use Patient Information" },
  { id: "section-5", title: "5. Confidentiality & Access Controls" },
  { id: "section-6", title: "6. When Information May Be Shared" },
  { id: "section-7", title: "7. Patient Privacy Rights" },
  { id: "section-8", title: "8. Electronic Communications & Online Consultations" },
  { id: "section-9", title: "9. Data Security & Breach Response" },
  { id: "section-10", title: "10. Record Retention & Disposal" },
  { id: "section-11", title: "11. Staff Responsibilities" },
  { id: "section-12", title: "12. Questions & Privacy Complaints" },
  { id: "section-13", title: "13. Policy Updates" },
];

export default function HIPAAPage() {
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
            <span className="text-white">HIPAA &amp; Health Privacy Policy</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-purple-100 text-xs md:text-sm font-medium mb-5 shadow-sm">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Health Information Safeguards · Kelkar Manas Health Care</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight mb-4">
            HIPAA &amp; Patient Health Information Privacy Policy
          </h1>

          <p className="text-purple-100/90 text-base md:text-lg max-w-3xl leading-relaxed mb-8">
            Our comprehensive approach to protecting patient health information, limiting unauthorised access, and maintaining strict clinical confidentiality across mental health and sexual health services.
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
                    <p className="font-semibold text-[#4A154B] mb-1">Health Privacy Concerns?</p>
                    <p className="text-gray-600 mb-2">Contact our designated Privacy &amp; Grievance Officer.</p>
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

            {/* Detailed Policy Body */}
            <main className="lg:col-span-8 space-y-10 text-gray-800 leading-relaxed text-base">

              {/* 1. Purpose of This Policy */}
              <div id="section-1" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    01
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    1. Purpose of This Policy
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700">
                  <p>
                    <strong>Kelkar Manas Health Care</strong> is committed to respecting patient privacy and protecting confidential health information collected in connection with healthcare services, appointments, consultations, and related administrative activities.
                  </p>
                  <p>
                    This policy describes our approach to protecting patient health information, limiting unauthorised access, and maintaining appropriate confidentiality and security safeguards.
                  </p>
                  <p className="text-sm text-gray-600">
                    The Health Insurance Portability and Accountability Act of 1996 (HIPAA) is a United States federal law governing the privacy and security of protected health information (PHI) for covered entities and their business associates. HIPAA applies only where its legal requirements are met.
                  </p>
                  <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 text-xs md:text-sm text-purple-900 font-medium">
                    References to HIPAA in this policy do not constitute a representation that Kelkar Manas Health Care is a HIPAA-covered entity or business associate.
                  </div>
                </div>
              </div>

              {/* 2. What Is Protected Health Information? */}
              <div id="section-2" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    02
                  </span>
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-purple-700" />
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                      2. What Is Protected Health Information?
                    </h2>
                  </div>
                </div>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Under HIPAA, Protected Health Information (PHI) generally means individually identifiable health information created, received, maintained, or transmitted by a covered entity or business associate, subject to the law&apos;s definitions and exclusions.
                  </p>
                  <p className="font-semibold text-gray-900 text-sm">
                    Depending on the applicable legal framework, confidential health information may include:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                    {[
                      "Patient names and contact details linked to healthcare services",
                      "Medical histories, diagnoses, symptoms, and treatment records",
                      "Psychiatric and mental health consultation information",
                      "Sexual health information and related clinical records",
                      "Prescriptions, laboratory reports, and medical assessments",
                      "Appointment records and billing information associated with healthcare",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-[#FAF9F6] border border-gray-200/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="p-4 rounded-xl bg-purple-50 border-2 border-purple-200 text-[#4A154B] text-sm font-medium flex items-start gap-2.5">
                    <Lock className="w-4 h-4 text-purple-700 mt-0.5 flex-shrink-0" />
                    <span>
                      We recognise that mental health and sexual health information can be particularly sensitive and should be handled with appropriate confidentiality.
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. How We Collect Health Information */}
              <div id="section-3" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    03
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    3. How We Collect Health Information
                  </h2>
                </div>
                <p className="text-gray-700 mb-3 text-sm md:text-base">
                  We may collect personal and health-related information when you:
                </p>
                <div className="space-y-2 mb-4">
                  {[
                    "Request or schedule an appointment",
                    "Visit our clinic for a consultation",
                    "Complete a patient registration or enquiry form",
                    "Participate in an online consultation, where available",
                    "Provide medical records, prescriptions, or investigation reports",
                    "Communicate with our authorised team regarding your care",
                  ].map((action, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#FAF9F6] border border-gray-200/70 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-purple-700 flex-shrink-0" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-600">
                  We aim to collect information that is reasonably necessary for the relevant healthcare or administrative purpose.
                </p>
              </div>

              {/* 4. How We Use Patient Information */}
              <div id="section-4" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    04
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    4. How We Use Patient Information
                  </h2>
                </div>
                <p className="text-gray-700 mb-3 text-sm md:text-base">
                  Subject to applicable law and any necessary consent or other lawful basis, patient information may be used for:
                </p>
                <ul className="space-y-2 mb-5 text-sm text-gray-700">
                  {[
                    "Providing consultations and coordinating patient care",
                    "Maintaining clinical and administrative records",
                    "Managing appointments and follow-up visits",
                    "Processing payments and issuing receipts",
                    "Communicating important healthcare-related information",
                    "Meeting legal, regulatory, and professional recordkeeping requirements",
                    "Maintaining the security and proper operation of our systems",
                  ].map((use, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
                      <span>{use}</span>
                    </li>
                  ))}
                </ul>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold text-sm">
                  We do not sell personal information to third parties.
                </div>
              </div>

              {/* 5. Confidentiality and Access Controls */}
              <div id="section-5" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    05
                  </span>
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-purple-700" />
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                      5. Confidentiality and Access Controls
                    </h2>
                  </div>
                </div>
                <div className="space-y-3.5 text-gray-700">
                  <p>
                    Access to patient information should be limited to authorised healthcare professionals and personnel who need the information for their assigned responsibilities.
                  </p>
                  <p className="font-semibold text-gray-900 text-sm">
                    Appropriate safeguards may include:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                    {[
                      "Role-based access permissions",
                      "Password protection and account security",
                      "Secure handling and storage of records",
                      "Staff confidentiality procedures",
                      "Appropriate monitoring and review of access, where supported",
                      "Secure disposal or deletion when records are no longer required and deletion is legally permitted",
                    ].map((safeguard, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-[#FAF9F6] border border-gray-200/70 text-xs text-gray-800 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-700 mt-0.5 flex-shrink-0" />
                        <span>{safeguard}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 italic">
                    Safeguards implemented by Kelkar Manas Health Care will depend on the systems and services actually used by the organisation.
                  </p>
                </div>
              </div>

              {/* 6. When Information May Be Shared */}
              <div id="section-6" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    06
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    6. When Information May Be Shared
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700 text-sm md:text-base">
                  <p>
                    Patient information may be shared when reasonably necessary and legally permitted for healthcare delivery, administration, payment processing, or other legitimate purposes.
                  </p>
                  <p>
                    Information may also be disclosed where required or permitted by applicable law, including certain regulatory, legal, or safety-related circumstances.
                  </p>
                  <p>
                    Third-party service providers may process relevant information on our behalf, such as providers supporting website hosting, appointment management, communication, video consultations, or payment processing.
                  </p>
                  <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                    Appropriate contractual and security safeguards should be considered based on the information involved and the applicable legal requirements.
                  </p>
                </div>
              </div>

              {/* 7. Patient Privacy Rights */}
              <div id="section-7" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    07
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    7. Patient Privacy Rights
                  </h2>
                </div>
                <p className="text-gray-700 mb-3 text-sm md:text-base">
                  Depending on the laws applicable to the organisation and the relevant records, patients may have rights to:
                </p>
                <div className="space-y-2 mb-4">
                  {[
                    "Request access to their personal or health information",
                    "Ask for correction of inaccurate information",
                    "Request deletion where legally permitted",
                    "Withdraw consent where processing relies on consent",
                    "Raise concerns about privacy or information security",
                    "Exercise additional rights available under applicable data protection laws",
                  ].map((right, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#FAF9F6] border border-gray-200/70 text-sm text-gray-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-700 mt-2 flex-shrink-0" />
                      <span>{right}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  HIPAA provides specific rights to individuals whose information is governed by HIPAA. Those rights do not automatically apply to every healthcare organisation or every patient record.
                </p>
                <p className="text-xs text-gray-600 bg-purple-50/50 p-3 rounded-lg border border-purple-100 font-medium">
                  Requests can be submitted through the contact details listed below. Identity verification may be necessary before information is released or amended.
                </p>
              </div>

              {/* 8. Electronic Communications and Online Consultations */}
              <div id="section-8" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    08
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    8. Electronic Communications and Online Consultations
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700 text-sm md:text-base">
                  <p>
                    If electronic appointment systems, messaging platforms, email, or video consultations are available, relevant personal or health information may be processed through those systems.
                  </p>
                  <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-sm">
                    Patients should use private devices and secure internet connections where possible and avoid sending highly sensitive records through channels that are not intended for confidential clinical communication.
                  </div>
                  <p className="text-xs text-gray-500">
                    Third-party platforms may have their own privacy policies and security arrangements. Their use does not, by itself, establish HIPAA compliance.
                  </p>
                </div>
              </div>

              {/* 9. Data Security and Breach Response */}
              <div id="section-9" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    09
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    9. Data Security and Breach Response
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700 text-sm md:text-base">
                  <p>
                    We aim to use reasonable technical, organisational, and administrative safeguards to protect information against unauthorised access, loss, misuse, alteration, or disclosure.
                  </p>
                  <p>
                    If a data security incident occurs, it should be assessed promptly and handled in accordance with applicable legal obligations and the organisation&apos;s incident-response procedures. Required notifications will be made where applicable law requires them.
                  </p>
                  <p className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-lg border border-gray-200">
                    No electronic system or communication method can be guaranteed to be completely secure.
                  </p>
                </div>
              </div>

              {/* 10. Record Retention and Disposal */}
              <div id="section-10" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    10
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    10. Record Retention and Disposal
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700 text-sm md:text-base">
                  <p>
                    Patient records are retained in accordance with applicable legal requirements, professional obligations, healthcare needs, and legitimate administrative purposes.
                  </p>
                  <p>
                    Information will be securely disposed of when retention is no longer necessary and disposal is legally permitted. Requests for deletion may be limited by medical-record retention requirements or other applicable laws.
                  </p>
                </div>
              </div>

              {/* 11. Staff Responsibilities */}
              <div id="section-11" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    11
                  </span>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-700" />
                    <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                      11. Staff Responsibilities
                    </h2>
                  </div>
                </div>
                <p className="text-gray-700 mb-3 text-sm md:text-base">
                  Personnel authorised to access patient information are expected to:
                </p>
                <div className="space-y-2 mb-4">
                  {[
                    "Access records only for authorised purposes",
                    "Maintain patient confidentiality",
                    "Avoid sharing credentials or leaving records accessible to unauthorised persons",
                    "Follow applicable data protection and information security procedures",
                    "Report suspected privacy breaches or unauthorised access promptly",
                  ].map((resp, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-purple-50/40 border border-purple-100 text-sm text-gray-800">
                      <CheckCircle2 className="w-4 h-4 text-purple-700 mt-0.5 flex-shrink-0" />
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Training, access reviews, and written procedures should be implemented as appropriate to the organisation&apos;s size, systems, and legal obligations.
                </p>
              </div>

              {/* 12. Questions and Privacy Complaints */}
              <div id="section-12" className="scroll-mt-28 bg-white rounded-2xl border-2 border-purple-200/90 p-6 md:p-8 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#4A154B] text-white font-bold text-sm">
                    12
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    12. Questions and Privacy Complaints
                  </h2>
                </div>
                <p className="text-gray-700 mb-6 text-sm md:text-base">
                  Patients who have questions about the handling of their personal or health information, or who wish to raise a privacy concern, may contact:
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

                  {/* Privacy Contact */}
                  <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200 md:col-span-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-800 mb-1.5">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Privacy Contact</span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-800 mb-1">
                      Designated Privacy &amp; Grievance Officer, Kelkar Manas Health Care
                    </p>
                    <p className="text-xs text-gray-600 flex flex-wrap items-center gap-3">
                      <span>Email: <a href="mailto:kelkarmanashealthcare@gmail.com" className="text-purple-700 font-semibold hover:underline">kelkarmanashealthcare@gmail.com</a></span>
                      <span>•</span>
                      <span>Phone: <a href="tel:+917030414140" className="text-purple-700 font-semibold hover:underline">+91 7030414140</a></span>
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  We will review privacy concerns and respond in accordance with applicable legal requirements.
                </p>
              </div>

              {/* 13. Policy Updates */}
              <div id="section-13" className="scroll-mt-28 bg-white rounded-2xl border border-gray-200/70 p-6 md:p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-[#4A154B] font-bold text-sm">
                    13
                  </span>
                  <h2 className="text-xl md:text-2xl font-serif font-bold text-[#4A154B]">
                    13. Policy Updates
                  </h2>
                </div>
                <div className="space-y-3.5 text-gray-700 text-sm md:text-base">
                  <p>
                    This policy may be updated to reflect changes in our services, information-handling practices, security measures, or legal obligations.
                  </p>
                  <p>
                    The latest version will be published on this page with an updated revision date.
                  </p>
                </div>
              </div>

              {/* Important Legal Notice Banner */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-6 text-xs md:text-sm text-amber-900 leading-relaxed shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-amber-950 block mb-1">Important Legal Notice:</strong>
                    This policy is a general template and does not certify that Kelkar Manas Health Care is HIPAA-compliant. HIPAA obligations depend on the organisation&apos;s legal status and activities. The policy should be reviewed by a qualified legal or privacy professional and aligned with the organisation&apos;s actual systems, contracts, and applicable Indian data protection and healthcare requirements before publication.
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
