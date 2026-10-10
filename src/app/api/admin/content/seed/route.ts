import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { FaqModel, PageModel } from "@/modules/cms/schema";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';


const hardcodedFaqs = [
  {
    category: "Consultations & Appointments",
    questions: [
      {
        q: "How does a video consultation work?",
        a: "Once you book an appointment, you'll receive a secure, encrypted link. At your scheduled time, simply click the link from your phone or computer to speak directly with your specialist. The process is completely private and HIPAA-compliant."
      },
      {
        q: "Do I have to show my face on video?",
        a: "While video is highly recommended for a thorough clinical assessment, we understand that intimacy issues can be sensitive. Audio-only options and secure messaging are available depending on your state's telemedicine regulations."
      },
      {
        q: "How long do appointments usually take?",
        a: "Initial consultations typically last 15-20 minutes, which provides ample time for the doctor to review your medical history, discuss symptoms, and formulate a customized treatment plan."
      }
    ]
  },
  {
    category: "Privacy & Security",
    questions: [
      {
        q: "Is my medical data safe?",
        a: "Absolutely. KELKAR MANAS HEALTH CLINIC is fully HIPAA-compliant. We use bank-level encryption (AES-256) to protect your health records, consultation videos, and personal information. Your data is never sold to third parties."
      },
      {
        q: "How will the charge appear on my bank statement?",
        a: "To protect your privacy, all charges will appear under a discreet, neutral name (e.g., 'IH Medical Services') on your credit card or bank statement."
      },
      {
        q: "Is the medication packaging discreet?",
        a: "Yes. All treatments and diagnostic kits are shipped in plain, unbranded boxes. There is no external indication of the contents or our medical brand name on the outside."
      }
    ]
  },
  {
    category: "Treatments & Pharmacy",
    questions: [
      {
        q: "Are the medications FDA-approved?",
        a: "Yes. We only prescribe medications that are FDA-approved or compounded in strictly regulated, certified US pharmacies following the highest clinical standards."
      },
      {
        q: "Can I use my insurance?",
        a: "KELKAR MANAS HEALTH CLINIC currently operates on a cash-pay basis to keep our services affordable, discreet, and fast. However, we can provide you with an itemized superbill that you can submit to your insurance for potential out-of-network reimbursement."
      },
      {
        q: "How long does shipping take?",
        a: "Once a doctor approves your prescription, the pharmacy typically processes and ships it within 24 hours. Standard shipping takes 2-3 business days. Expedited shipping is available at checkout."
      }
    ]
  }
];

const aboutContent = JSON.stringify({
  heroTitle1: "Leading Psychiatric &",
  heroTitle2: "Mental Health Care.",
  heroSubtitle: "Founded by Dr. Deepak Kelkar, Dr. Kelkar Hospital in Akola & Nagpur provides pioneer psychiatric treatment, de-addiction rehabilitation, and the Happiness 20 – Mind Gym program.",
  valuesTitle: "What Drives Us Forward",
  valuesDescription: "Everything we do at Kelkar Hospital is guided by four core principles that ensure we deliver the best possible care.",
  values: [
    { icon: "Shield", title: "Clinical Excellence", description: "Backed by rigorous research and leading medical professionals." },
    { icon: "Heart", title: "Compassionate Care", description: "Empathy and understanding at the heart of every interaction." },
    { icon: "Sparkles", title: "Innovation", description: "Continuously pushing boundaries in intimate health solutions." },
    { icon: "Users", title: "Inclusivity", description: "Accessible, judgment-free care designed for every body." }
  ],
  expertsTitle: "Meet Our Medical Experts",
  expertsDescription: "Our products and protocols are developed by leading specialists in psychiatry and de-addiction.",
  experts: [
    { img: "/images/dr_kelkar_hero_nobg.png", name: "Dr. Deepak Kelkar", role: "Senior Psychiatrist & Founder", spec: "MD Psychiatry, Mind Gym Pioneer" },
    { img: "/images/doctor_2.png", name: "Dr. Amol Kelkar", role: "Consultant Psychiatrist", spec: "De-Addiction Specialist" },
    { img: "/images/doctor_3.png", name: "Dr. Radhika Kelkar", role: "Specialist in Child Psychiatry", spec: "DPM, Child Development" }
  ],
  aboutContent: "Kelkar Hospital, Akola, has been providing comprehensive treatment for all types of mental health and psychiatric disorders in Akola for the past 44 years.<br/><br/>The hospital is led by qualified and experienced psychiatrists, offering scientific and compassionate care for a wide range of mental health conditions.<br/><br/>Associated with Kelkar Hospital is Sanmitra Hospital, where treatment for various mental health conditions is provided free of cost to eligible patients under government health schemes.<br/><br/>Patients who come with the PM-JAY (Ayushman Bharat) Card or are eligible under the Mahatma Jyotiba Phule Jan Arogya Yojana (MJPJAY) can receive treatment free of cost, as per scheme eligibility and approved packages.<br/><br/>The covered services may include psychiatric consultation, medicines, hospitalization, food and accommodation, and ECT (electroconvulsive therapy/shock treatment), as applicable under the government scheme.<br/><br/>Our aim is to ensure that financial difficulties do not become a barrier to receiving appropriate and timely mental healthcare."
});

export async function GET() {
  try {
    await connectDB();

    // 1. Seed FAQs
    const faqCount = await FaqModel.countDocuments();
    if (faqCount === 0) {
      for (const cat of hardcodedFaqs) {
        for (const faq of cat.questions) {
          await new FaqModel({
            question: faq.q,
            answer: faq.a,
            category: cat.category,
            createdBy: "System"
          }).save();
        }
      }
    }

    // 2. Seed About Page
    const pageCount = await PageModel.countDocuments({ slug: "about" });
    if (pageCount === 0) {
      await new PageModel({
        title: "About Us",
        slug: "about",
        content: aboutContent,
        createdBy: "System"
      }).save();
    }

    return NextResponse.json({ success: true, message: "Database seeded with default content successfully." });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
