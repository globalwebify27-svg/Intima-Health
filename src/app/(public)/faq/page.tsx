"use client";

import { motion } from "framer-motion";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircleQuestion, HelpCircle, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
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
        q: "Can I consult a doctor online?",
        a: "Online consultation availability depends on the doctor, type of concern, and services currently offered. Please contact our team to enquire about online consultations and appointment procedures."
      },
      {
        q: "Where is Kelkar Manas Health Care Clinic located?",
        a: "Please refer to the Contact Us section of our website for the hospital's verified address, directions, and location details. You may contact our team if you need assistance finding the clinic."
      },
      {
        q: "How can I contact Kelkar Manas Health Care Clinic?",
        a: "You can use the official contact number, email address, or appointment enquiry options displayed on our website. Please check the Contact Us page for the latest contact information."
      },
      {
        q: "What should I bring to my appointment?",
        a: "Patients are advised to bring any relevant previous medical reports, prescriptions, investigation results, a list of current medications, and identification documents if required for registration."
      },
      {
        q: "What happens during the first consultation?",
        a: "During the first consultation, the doctor may ask about your symptoms, medical history, current medications, lifestyle, and concerns. Depending on your needs, the doctor may recommend further assessment, treatment options, counselling, or follow-up visits."
      }
    ]
  },
  {
    category: "Fees, Privacy & Policies",
    questions: [
      {
        q: "Is my medical information confidential?",
        a: "Patient privacy and confidentiality are important. Medical information is handled according to applicable laws and professional requirements. Information may be shared when legally required or necessary under applicable exceptions to confidentiality."
      },
      {
        q: "What are the consultation fees?",
        a: "Consultation fees may vary depending on the doctor, type of consultation, and services required. Please contact the Clinic to confirm the current consultation charges before booking."
      },
      {
        q: "Which payment methods are accepted?",
        a: "Available payment methods may vary. Please contact the hospital to confirm whether cash, UPI, debit or credit cards, bank transfers, or other payment options are accepted."
      },
      {
        q: "Can I reschedule or cancel my appointment?",
        a: "If you need to change or cancel your appointment, please contact the hospital as early as possible. Ask our team about the applicable rescheduling, cancellation, and refund policies."
      },
      {
        q: "Can I bring a family member to my appointment?",
        a: "Yes. You may bring a trusted family member or caregiver if you wish. For certain consultations, the doctor may recommend involving a family member with your consent, while respecting your privacy and individual needs."
      }
    ]
  },
  {
    category: "Medical Care & Services",
    questions: [
      {
        q: "What should I do if I am taking medication prescribed by another doctor?",
        a: "Bring your current prescriptions and medication details to your appointment. Do not stop, change, or combine prescribed medications without consulting a qualified healthcare professional."
      },
      {
        q: "Does the hospital provide emergency psychiatric services?",
        a: "Please contact the hospital directly to confirm emergency service availability. If someone is experiencing a life-threatening medical emergency, severe breathing difficulties, an overdose, or an immediate risk of harm, call India's emergency number, 112, or go to the nearest emergency department."
      },
      {
        q: "How often will I need follow-up consultations?",
        a: "Follow-up frequency depends on your condition, treatment plan, response to treatment, and the doctor's recommendations. Your doctor will advise you when to return and whether any additional assessments are needed."
      },
      {
        q: "Can I receive a medical certificate or consultation summary?",
        a: "Depending on the circumstances and applicable professional requirements, the treating doctor may provide appropriate medical documentation following an assessment. Please discuss your specific requirements during the consultation."
      },
      {
        q: "Is treatment available for patients of all age groups?",
        a: "Services depend on the patient's age, clinical needs, and specialist availability. Please contact Kelkar Manas Health Care Clinic to confirm whether consultations are available for children, adolescents, adults, or older adults."
      },
      {
        q: "How can I get more information about hospital services?",
        a: "For details about doctors, available treatments, consultation fees, timings, and appointments, please contact Kelkar Manas Health Care Clinic using the official contact information provided on our website."
      }
    ]
  }
];

export default function FAQPage() {
  const [groupedFaqs, setGroupedFaqs] = React.useState<{category: string, questions: {q: string, a: string}[]}[]>(DEFAULT_GENERAL_FAQS);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/public/content/faqs")
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data && json.data.length > 0) {
          const map = new Map<string, {q: string, a: string}[]>();
          json.data.forEach((faq: any) => {
            const cat = faq.category || "General";
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat)?.push({ q: faq.question, a: faq.answer });
          });
          const grouped = Array.from(map.entries()).map(([category, questions]) => ({ category, questions }));
          setGroupedFaqs(grouped);
        } else {
          setGroupedFaqs(DEFAULT_GENERAL_FAQS);
        }
      })
      .catch(() => {
        setGroupedFaqs(DEFAULT_GENERAL_FAQS);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 bg-muted/30 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
              <MessageCircleQuestion className="w-8 h-8" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium mb-6">
              Frequently Asked <span className="text-primary italic">Questions</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Find answers to common questions about our clinical process, privacy standards, and treatment plans.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading FAQs...</div>
            ) : groupedFaqs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No FAQs available yet.</div>
            ) : (
              groupedFaqs.map((category, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="mb-12"
                >
                  <h2 className="text-2xl font-serif font-medium text-foreground mb-6 flex items-center">
                    {category.category}
                  </h2>
                  
                  <Accordion className="w-full space-y-4">
                    {category.questions.map((faq, i) => (
                      <AccordionItem 
                        key={i} 
                        value={`item-${index}-${i}`}
                        className="border border-border bg-card rounded-2xl px-6 data-[state=open]:shadow-md transition-all"
                      >
                        <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline py-6">
                          {faq.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-base leading-relaxed pb-6 pr-8">
                          {faq.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Contact Support Banner */}
      <section className="py-20 bg-primary/5 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto bg-card p-10 md:p-12 rounded-[2.5rem] shadow-xl border border-border"
          >
            <HelpCircle className="w-12 h-12 text-primary mx-auto mb-6" />
            <h3 className="text-3xl font-serif mb-4">Still have questions?</h3>
            <p className="text-muted-foreground mb-8 text-lg">
              Our patient support team is available to help clarify any doubts regarding our services, platform, or your privacy.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8")}>
                <Mail className="w-4 h-4 mr-2" />
                Contact Us
              </Link>
              <Link href="/contact" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-8")}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Chat with Support
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
