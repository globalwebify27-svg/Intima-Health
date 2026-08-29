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

// Hardcoded fallback or removed entirely. We'll fetch from API.

export default function FAQPage() {
  const [groupedFaqs, setGroupedFaqs] = React.useState<{category: string, questions: {q: string, a: string}[]}[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/public/content/faqs")
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          const map = new Map<string, {q: string, a: string}[]>();
          json.data.forEach((faq: any) => {
            const cat = faq.category || "General";
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat)?.push({ q: faq.question, a: faq.answer });
          });
          const grouped = Array.from(map.entries()).map(([category, questions]) => ({ category, questions }));
          setGroupedFaqs(grouped);
        }
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
