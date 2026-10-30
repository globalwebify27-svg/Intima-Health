"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  HelpCircle, 
  Search, 
  X,
  Sparkles,
  Building2,
  ShieldCheck,
  Stethoscope
} from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FaqItem {
  q: string;
  a: string;
  category: string;
}

interface FaqClientProps {
  initialFaqs: FaqItem[];
}

export default function FaqClient({ initialFaqs }: FaqClientProps) {
  const [faqs] = useState<FaqItem[]>(initialFaqs);
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Distinct categories with counts
  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    faqs.forEach(f => {
      counts[f.category] = (counts[f.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [faqs]);

  // Filtered FAQs based on category and live search
  const filteredFaqs = useMemo(() => {
    return faqs.filter(faq => {
      if (activeCategory !== "ALL" && faq.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const qMatch = faq.q.toLowerCase().includes(query);
        const aMatch = faq.a.toLowerCase().includes(query);
        const catMatch = faq.category.toLowerCase().includes(query);
        if (!qMatch && !aMatch && !catMatch) return false;
      }
      return true;
    });
  }, [faqs, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden bg-gradient-to-b from-primary/[0.04] via-background to-background border-b border-border/40">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-secondary/[0.04] rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-6 border border-primary/15">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Help &amp; Patient Guidance</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-6">
            Frequently Asked <span className="text-primary">Questions</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10 font-medium">
            Clear, helpful information about psychiatric care, consultation timings, appointments, government schemes, and hospital facilities.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl mx-auto">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-muted-foreground absolute left-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search questions (e.g., appointment, timing, scheme, treatment)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-10 py-4 rounded-2xl bg-white border border-border shadow-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm sm:text-base font-medium transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-xs text-muted-foreground mt-2 text-left px-2">
                Showing {filteredFaqs.length} {filteredFaqs.length === 1 ? "result" : "results"} for &ldquo;{searchQuery}&rdquo;
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12 sm:mb-16">
            <button
              onClick={() => setActiveCategory("ALL")}
              className={cn(
                "px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border",
                activeCategory === "ALL"
                  ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                  : "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground"
              )}
            >
              All Questions ({faqs.length})
            </button>
            {categoriesWithCounts.map(({ name, count }) => (
              <button
                key={name}
                onClick={() => setActiveCategory(name)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border",
                  activeCategory === name
                    ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                    : "bg-muted/40 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground"
                )}
              >
                {name} ({count})
              </button>
            ))}
          </div>

          {/* FAQ Accordion List */}
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-16 px-4 bg-muted/20 rounded-3xl border border-dashed border-border max-w-xl mx-auto">
              <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-foreground mb-1">No Matching Questions Found</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Try searching with different keywords, or explore all questions.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("ALL");
                }}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full")}
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-border/60 p-4 sm:p-8 shadow-xs">
              <Accordion className="space-y-3">
                {filteredFaqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`faq-${index}`}
                    className="border border-border/50 rounded-2xl px-5 sm:px-6 py-1 data-[state=open]:bg-primary/[0.02] data-[state=open]:border-primary/25 transition-colors overflow-hidden"
                  >
                    <AccordionTrigger className="text-left font-bold text-base sm:text-lg text-foreground hover:text-primary transition-colors py-4">
                      <span className="flex items-start gap-3 pr-4">
                        <span className="text-primary font-mono text-sm sm:text-base font-extrabold mt-0.5">
                          {String(index + 1).padStart(2, "0")}.
                        </span>
                        <span>{faq.q}</span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-1 pb-5 pl-7 sm:pl-8 font-medium border-t border-border/30 mt-2">
                      <p className="whitespace-pre-line">{faq.a}</p>
                      {faq.category && activeCategory === "ALL" && (
                        <div className="mt-4 pt-3 border-t border-border/20 flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-primary/70 bg-primary/5 px-2.5 py-0.5 rounded-md">
                            {faq.category}
                          </span>
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

          {/* Quick Consultation & Help Banner */}
          <div className="mt-16 sm:mt-20 rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 border border-primary/20 p-8 sm:p-12 text-center relative overflow-hidden">
            <div className="max-w-2xl mx-auto relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center mx-auto mb-6 shadow-md shadow-primary/25">
                <Stethoscope className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
                Have a Specific Question About Care?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-8 leading-relaxed font-medium">
                Our care coordinators can assist with consultation schedules, doctor availability, hospitalization queries, and government cashless scheme eligibility.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <a
                  href="tel:+917030414140"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "rounded-full px-8 font-bold shadow-md shadow-primary/20"
                  )}
                >
                  Call +91 7030414140
                </a>
                <Link
                  href="/contact"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "rounded-full px-8 font-semibold bg-white"
                  )}
                >
                  Visit Contact Page
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
