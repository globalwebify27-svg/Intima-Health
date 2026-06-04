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

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const faqs = [
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

export default function FAQPage() {
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
            {faqs.map((category, index) => (
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
            ))}
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
