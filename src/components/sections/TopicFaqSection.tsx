"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, MessageCircleQuestion, PhoneCall, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getTopicFaqs, TopicFaqItem } from "@/constants/topicFaqs";
import { BookNowButton } from "@/components/ui/book-now-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TopicFaqSectionProps {
  slug: string;
  title: string;
  faqs?: TopicFaqItem[];
}

export function TopicFaqSection({ slug, title, faqs: cmsFaqs }: TopicFaqSectionProps) {
  const faqs = useMemo(() => {
    return getTopicFaqs(slug, title, cmsFaqs);
  }, [slug, title, cmsFaqs]);

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <section className="py-20 lg:py-24 bg-background border-t border-border/60 relative overflow-hidden">
      {/* Subtle ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs tracking-wide uppercase mb-4 border border-primary/20">
            <MessageCircleQuestion className="w-3.5 h-3.5" />
            Frequently Asked Questions
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium tracking-tight mb-4 text-foreground">
            Questions About <span className="text-primary italic">{title}</span>
          </h2>
          
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Clear, clinical answers about diagnosis, treatment protocols, and recovery for {title}.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="max-w-3xl mx-auto">
          <Accordion className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <AccordionItem
                  value={`topic-faq-${index}`}
                  className="border border-border/80 bg-card rounded-2xl px-6 py-1 data-[state=open]:shadow-md data-[state=open]:border-primary/40 transition-all duration-200"
                >
                  <AccordionTrigger className="text-left font-semibold text-base md:text-lg text-foreground hover:text-primary py-5 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm md:text-base leading-relaxed pb-5 pr-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>

          {/* Quick Help Box */}
          <div className="mt-12 p-6 md:p-8 rounded-2xl bg-muted/40 border border-border flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-base text-foreground">Have specific questions about {title}?</h4>
                <p className="text-xs md:text-sm text-muted-foreground">Our senior medical team is here to guide you confidentially.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <BookNowButton className={cn(buttonVariants({ size: "default" }), "w-full sm:w-auto rounded-full font-semibold shadow-md")}>
                Book Consultation
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </BookNowButton>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
