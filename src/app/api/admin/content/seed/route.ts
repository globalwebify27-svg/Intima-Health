import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { FaqModel, PageModel } from "@/modules/cms/schema";
import mongoose from "mongoose";

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
        a: "Absolutely. Intima Health is fully HIPAA-compliant. We use bank-level encryption (AES-256) to protect your health records, consultation videos, and personal information. Your data is never sold to third parties."
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
        a: "Intima Health currently operates on a cash-pay basis to keep our services affordable, discreet, and fast. However, we can provide you with an itemized superbill that you can submit to your insurance for potential out-of-network reimbursement."
      },
      {
        q: "How long does shipping take?",
        a: "Once a doctor approves your prescription, the pharmacy typically processes and ships it within 24 hours. Standard shipping takes 2-3 business days. Expedited shipping is available at checkout."
      }
    ]
  }
];

const aboutContent = `
<h2>Our Story</h2>
<p>Founded by a team of visionary gynecologists, urologists, and wellness experts, Intima Health was born out of a simple observation: intimate health is too often ignored, misunderstood, or stigmatized.</p>
<p>We recognized the need for a sanctuary—a place where clinical excellence meets compassionate care. Since our inception, we have been dedicated to researching, developing, and providing solutions that are not only effective but beautifully designed and seamlessly integrated into your daily life.</p>
<ul>
  <li>Evidence-based clinical formulations</li>
  <li>Discreet, personalized care journeys</li>
  <li>Holistic approach to intimate wellness</li>
</ul>
`;

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
