import { connectDB } from "@/db/connect";
import { FaqModel } from "@/modules/cms/schema";
import FaqClient, { FaqItem } from "./FaqClient";
import { Metadata } from "next";

export const revalidate = 120; // Revalidate every 2 minutes

export const metadata: Metadata = {
  title: "Frequently Asked Questions (FAQs) | KELKAR MANAS HEALTH CLINIC",
  description:
    "Find answers to common questions about psychiatric care, consultation timings, appointments, government schemes (MJPJAY, PM-JAY), and hospital facilities.",
};

const DEFAULT_GENERAL_FAQS: { category: string; questions: { q: string; a: string }[] }[] = [
  {
    category: "Hospital & Consultations",
    questions: [
      {
        q: "What are the hospital and clinic timings?",
        a: "Hospital and outpatient consultation timings may vary depending on the doctor, department, and type of appointment. Please contact Kelkar Manas Health Care Clinic to confirm the latest timings before visiting."
      },
      {
        q: "What services are available at Kelkar Manas Health Care Clinic?",
        a: "Kelkar Manas Health Care Clinic provides mental health and psychiatric care. Depending on service availability, patients may enquire about consultations for anxiety, depression, panic attacks, phobias, OCD, schizophrenia, bipolar disorder, addiction-related concerns, and sexual health problems. Please contact the hospital to confirm the availability of a specific treatment or specialist."
      },
      {
        q: "How can I book an appointment?",
        a: "You can contact Kelkar Manas Health Care Clinic using the phone number or appointment details listed on our website. Our team can guide you through the booking process and help you confirm an available consultation slot."
      },
      {
        q: "Do I need an appointment before visiting the Clinic?",
        a: "Booking an appointment in advance is recommended to help reduce waiting time and confirm the doctor's availability. Please contact the Clinic to ask walk-in consultations."
      },
      {
        q: "Can I consult for common emotional or stress-related problems?",
        a: "Yes. In addition to severe psychiatric illnesses, consultations are available for stress, adjustment difficulties, relationship concerns, sleep disturbances, anxiety, and general emotional well-being."
      }
    ]
  },
  {
    category: "Treatments & Procedures",
    questions: [
      {
        q: "What types of mental health conditions are treated?",
        a: "Care is available for a wide variety of psychiatric conditions, including major depression, generalized anxiety, panic disorder, obsessive-compulsive disorder (OCD), schizophrenia, bipolar disorder, de-addiction (alcohol and substance dependence), and child and adolescent behavioral difficulties."
      },
      {
        q: "Is counselling or therapy available in addition to medication?",
        a: "Yes. Psychological assessment, counselling, and psychotherapy may be recommended alongside medical treatments depending on each patient's clinical needs."
      },
      {
        q: "What is rTMS therapy and is it offered?",
        a: "Repetitive Transcranial Magnetic Stimulation (rTMS) is a non-invasive neuromodulation technique used in selected patients with treatment-resistant depression, OCD, and other indications. Please check directly with the hospital regarding current rTMS availability and clinical suitability."
      },
      {
        q: "Are de-addiction and rehabilitation services provided?",
        a: "Yes. Outpatient and inpatient de-addiction care for alcohol, nicotine, and other substances is offered across our hospital network, including Sanmitra Manas Hospital and Ashakiran Rehabilitation Centre."
      }
    ]
  },
  {
    category: "Government Schemes & Cashless",
    questions: [
      {
        q: "Is treatment covered under government health schemes?",
        a: "Yes. Free/cashless inpatient psychiatric treatment is provided to eligible patients under the Mahatma Jyotiba Phule Jan Arogya Yojana (MJPJAY) and Ayushman Bharat PM-JAY at Sanmitra Hospital, Akola, subject to scheme guidelines and approved package limits."
      },
      {
        q: "What documents are required to avail cashless scheme treatment?",
        a: "Eligible beneficiaries typically require an active Ration Card (Orange or Yellow / Antyodaya), Aadhaar Card, or valid PM-JAY card. Our hospital scheme desk helps families complete the necessary documentation upon arrival."
      },
      {
        q: "What does the cashless scheme cover?",
        a: "Approved packages under MJPJAY / PM-JAY can cover hospital admission, psychiatric consultations, prescribed medications during the stay, routine nursing care, food, and ECT where medically indicated."
      }
    ]
  },
  {
    category: "Privacy & Confidentiality",
    questions: [
      {
        q: "Is my consultation kept confidential?",
        a: "Yes. Confidentiality is a core pillar of mental health treatment. Medical records and consultation details are protected and shared only in accordance with clinical and legal standards."
      },
      {
        q: "Can a family member accompany the patient during consultation?",
        a: "Yes. Family involvement is often helpful in psychiatric assessments, especially for comprehensive history-taking. However, patients are also provided private time to discuss personal concerns with their doctor."
      }
    ]
  }
];

export default async function FAQPage() {
  await connectDB();

  let faqs: FaqItem[] = DEFAULT_GENERAL_FAQS.flatMap(cat => 
    cat.questions.map(q => ({ q: q.q, a: q.a, category: cat.category }))
  );

  try {
    const dbFaqs = await FaqModel.find({ deletedAt: null }).lean();
    if (dbFaqs && dbFaqs.length > 0) {
      faqs = dbFaqs.map((item: any) => ({
        q: item.question,
        a: item.answer,
        category: item.category || "General",
      }));
    }
  } catch (error) {
    console.error("Error loading FAQs on server:", error);
  }

  return <FaqClient initialFaqs={faqs} />;
}
