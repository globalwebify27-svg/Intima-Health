"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    question: "What services are available at KELKAR MANAS HEALTH CARE?",
    answer:
      "The hospital's website can provide an overview of its services. Please contact the hospital to confirm the currently available consultations and treatment options.",
  },
  {
    question: "How can I book an appointment?",
    answer:
      "Use the appointment booking option on this website or contact the hospital directly for booking assistance.",
  },
  {
    question: "Do I need an appointment before visiting?",
    answer:
      "Please contact the hospital to confirm its current appointment and walk-in policies.",
  },
  {
    question: "Is mental health treatment confidential?",
    answer:
      "Patient information is handled with appropriate confidentiality, subject to applicable laws and necessary safety exceptions.",
  },
  {
    question: "Does the hospital provide addiction treatment?",
    answer:
      "Contact the hospital to confirm available assessment, treatment and rehabilitation options for your specific needs.",
  },
  {
    question: "Can I consult a professional about sexual health concerns?",
    answer:
      "You can contact the hospital to confirm the availability of consultations for your concern.",
  },
  {
    question: "What should I bring to my consultation?",
    answer:
      "If available, bring previous medical records, current medication details, relevant investigation reports and a list of your main concerns.",
  },
  {
    question: "How can I find the hospital's location and timings?",
    answer:
      "Please visit the Contact Us page or contact the hospital directly for its current address, directions and consultation timings.",
  },
];

export function HomeFaqSection() {
  return (
    <section className="py-24 lg:py-32 bg-[#FCFBFC] border-b border-border/40 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/[0.03] rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary mb-3 block">
            Common Questions
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
        </motion.div>

        {/* FAQs Accordion */}
        <div className="max-w-3xl mx-auto mb-12">
          <Accordion className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <AccordionItem
                  value={`home-faq-${index}`}
                  className="border border-border/70 bg-white rounded-2xl px-6 py-1.5 shadow-xs transition-all duration-200"
                >
                  <AccordionTrigger className="text-left font-bold text-base sm:text-lg text-foreground hover:text-primary py-5 hover:no-underline cursor-pointer">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground font-medium text-sm sm:text-base leading-relaxed pb-5 pr-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>

        {/* View All FAQs Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Link href="/faq">
            <Button
              size="lg"
              variant="outline"
              className="rounded-2xl px-8 py-6 text-base font-bold transition-all bg-white hover:bg-primary/5 text-foreground border-2 border-primary/20 hover:border-primary shadow-xs cursor-pointer inline-flex items-center gap-2 group"
            >
              <span>View All FAQs</span>
              <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
