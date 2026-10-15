require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const GENERAL_FAQS = [
  // Category: Hospital & Consultations (Q1 - Q9)
  {
    category: "Hospital & Consultations",
    question: "What are the hospital and clinic timings?",
    answer: "Hospital and outpatient consultation timings may vary depending on the doctor, department, and type of appointment. Please contact Kelkar Manas Health Care Clinic to confirm the latest timings before visiting."
  },
  {
    category: "Hospital & Consultations",
    question: "What services are available at Kelkar Manas Health Care Clinic?",
    answer: "Kelkar Manas Health Care Clinic provides mental health and psychiatric care. Depending on service availability, patients may enquire about consultations for anxiety, depression, panic attacks, phobias, OCD, schizophrenia, bipolar disorder, addiction-related concerns, and sexual health problems.\n\nPlease contact the hospital to confirm the availability of a specific treatment or specialist."
  },
  {
    category: "Hospital & Consultations",
    question: "How can I book an appointment?",
    answer: "You can contact Kelkar Manas Health Care Clinic using the phone number or appointment details listed on our website. Our team can guide you through the booking process and help you confirm an available consultation slot."
  },
  {
    category: "Hospital & Consultations",
    question: "Do I need an appointment before visiting the Clinic?",
    answer: "Booking an appointment in advance is recommended to help reduce waiting time and confirm the doctor's availability. Please contact the Clinic to ask walk-in consultations."
  },
  {
    category: "Hospital & Consultations",
    question: "Can I consult a doctor online?",
    answer: "Online consultation availability depends on the doctor, type of concern, and services currently offered. Please contact our team to enquire about online consultations and appointment procedures."
  },
  {
    category: "Hospital & Consultations",
    question: "Where is Kelkar Manas Health Care Clinic located?",
    answer: "Please refer to the Contact Us section of our website for the hospital's verified address, directions, and location details. You may contact our team if you need assistance finding the clinic."
  },
  {
    category: "Hospital & Consultations",
    question: "How can I contact Kelkar Manas Health Care Clinic?",
    answer: "You can use the official contact number, email address, or appointment enquiry options displayed on our website. Please check the Contact Us page for the latest contact information."
  },
  {
    category: "Hospital & Consultations",
    question: "What should I bring to my appointment?",
    answer: "Patients are advised to bring any relevant previous medical reports, prescriptions, investigation results, a list of current medications, and identification documents if required for registration."
  },
  {
    category: "Hospital & Consultations",
    question: "What happens during the first consultation?",
    answer: "During the first consultation, the doctor may ask about your symptoms, medical history, current medications, lifestyle, and concerns. Depending on your needs, the doctor may recommend further assessment, treatment options, counselling, or follow-up visits."
  },

  // Category: Fees, Privacy & Policies (Q10 - Q14)
  {
    category: "Fees, Privacy & Policies",
    question: "Is my medical information confidential?",
    answer: "Patient privacy and confidentiality are important. Medical information is handled according to applicable laws and professional requirements. Information may be shared when legally required or necessary under applicable exceptions to confidentiality."
  },
  {
    category: "Fees, Privacy & Policies",
    question: "What are the consultation fees?",
    answer: "Consultation fees may vary depending on the doctor, type of consultation, and services required. Please contact the Clinic to confirm the current consultation charges before booking."
  },
  {
    category: "Fees, Privacy & Policies",
    question: "Which payment methods are accepted?",
    answer: "Available payment methods may vary. Please contact the hospital to confirm whether cash, UPI, debit or credit cards, bank transfers, or other payment options are accepted."
  },
  {
    category: "Fees, Privacy & Policies",
    question: "Can I reschedule or cancel my appointment?",
    answer: "If you need to change or cancel your appointment, please contact the hospital as early as possible. Ask our team about the applicable rescheduling, cancellation, and refund policies."
  },
  {
    category: "Fees, Privacy & Policies",
    question: "Can I bring a family member to my appointment?",
    answer: "Yes. You may bring a trusted family member or caregiver if you wish. For certain consultations, the doctor may recommend involving a family member with your consent, while respecting your privacy and individual needs."
  },

  // Category: Medical Care & Services (Q15 - Q20)
  {
    category: "Medical Care & Services",
    question: "What should I do if I am taking medication prescribed by another doctor?",
    answer: "Bring your current prescriptions and medication details to your appointment. Do not stop, change, or combine prescribed medications without consulting a qualified healthcare professional."
  },
  {
    category: "Medical Care & Services",
    question: "Does the hospital provide emergency psychiatric services?",
    answer: "Please contact the hospital directly to confirm emergency service availability. If someone is experiencing a life-threatening medical emergency, severe breathing difficulties, an overdose, or an immediate risk of harm, call India's emergency number, 112, or go to the nearest emergency department."
  },
  {
    category: "Medical Care & Services",
    question: "How often will I need follow-up consultations?",
    answer: "Follow-up frequency depends on your condition, treatment plan, response to treatment, and the doctor's recommendations. Your doctor will advise you when to return and whether any additional assessments are needed."
  },
  {
    category: "Medical Care & Services",
    question: "Can I receive a medical certificate or consultation summary?",
    answer: "Depending on the circumstances and applicable professional requirements, the treating doctor may provide appropriate medical documentation following an assessment. Please discuss your specific requirements during the consultation."
  },
  {
    category: "Medical Care & Services",
    question: "Is treatment available for patients of all age groups?",
    answer: "Services depend on the patient's age, clinical needs, and specialist availability. Please contact Kelkar Manas Health Care Clinic to confirm whether consultations are available for children, adolescents, adults, or older adults."
  },
  {
    category: "Medical Care & Services",
    question: "How can I get more information about hospital services?",
    answer: "For details about doctors, available treatments, consultation fees, timings, and appointments, please contact Kelkar Manas Health Care Clinic using the official contact information provided on our website."
  }
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const collection = mongoose.connection.collection('faqs');

  // Remove old generic placeholder FAQs
  await collection.deleteMany({});
  console.log("Cleared old generic FAQs");

  // Insert the 20 official FAQs from the PDF
  const docs = GENERAL_FAQS.map(faq => ({
    question: faq.question,
    answer: faq.answer,
    category: faq.category,
    createdBy: "System",
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date()
  }));

  const res = await collection.insertMany(docs);
  console.log(`Successfully seeded ${res.insertedCount} official General FAQs from PDF.`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
