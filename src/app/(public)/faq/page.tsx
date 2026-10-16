"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  MessageCircleQuestion, 
  HelpCircle, 
  Mail, 
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

interface FaqItem {
  q: string;
  a: string;
  category: string;
}

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
  const [faqs, setFaqs] = useState<FaqItem[]>(() => {
    return DEFAULT_GENERAL_FAQS.flatMap(cat => 
      cat.questions.map(q => ({ q: q.q, a: q.a, category: cat.category }))
    );
  });
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/public/content/faqs")
      .then(res => res.json())
      .then(json => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const loaded: FaqItem[] = json.data.map((item: any) => ({
            q: item.question,
            a: item.answer,
            category: item.category || "General"
          }));
          setFaqs(loaded);
        }
      })
      .catch(() => {
        // Fallback to initial state
      })
      .finally(() => setLoading(false));
  }, []);

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

  // Split into 2 columns for compact, side-by-side display without huge vertical scroll
  const [leftColFaqs, rightColFaqs] = useMemo(() => {
    const left: FaqItem[] = [];
    const right: FaqItem[] = [];
    filteredFaqs.forEach((faq, index) => {
      if (index % 2 === 0) {
        left.push(faq);
      } else {
        right.push(faq);
      }
    });
    return [left, right];
  }, [filteredFaqs]);

  const getCategoryIcon = (category: string) => {
    if (category.includes("Hospital") || category.includes("Consultation")) {
      return <Building2 className="w-3.5 h-3.5" />;
    }
    if (category.includes("Fees") || category.includes("Privacy") || category.includes("Policy")) {
      return <ShieldCheck className="w-3.5 h-3.5" />;
    }
    return <Stethoscope className="w-3.5 h-3.5" />;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Compact, Modern Hero Section */}
      <section className="relative pt-12 pb-12 lg:pt-16 lg:pb-16 bg-muted/30 border-b border-border/50 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs tracking-wide uppercase mb-4 border border-primary/20">
              <MessageCircleQuestion className="w-3.5 h-3.5" />
              Kelkar Manas Knowledge Base
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium mb-4 leading-tight">
              Frequently Asked <span className="text-primary italic">Questions</span>
            </h1>
            
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              Find fast, verified answers to questions about hospital timings, consultations, privacy standards, and medical services.
            </p>

            {/* Live Search Input */}
            <div className="relative max-w-xl mx-auto">
              <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by keyword (e.g., fees, timings, appointment, privacy)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-11 pr-10 rounded-full border border-border bg-card shadow-sm text-sm outline-none focus:ring-2 focus:ring-primary/25 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content: Category Filter Bar & Dual-Column Compact FAQ Grid */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          
          {/* Quick-Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            <button
              onClick={() => setActiveCategory("ALL")}
              className={cn(
                "px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 border",
                activeCategory === "ALL"
                  ? "bg-primary text-white border-primary shadow-sm"
                  : "bg-card text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              All Questions ({faqs.length})
            </button>

            {categoriesWithCounts.map(cat => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 border",
                  activeCategory === cat.name
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-card text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {getCategoryIcon(cat.name)}
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>

          {/* Search Result Counter & Clear */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-6 px-1">
            <span>
              Showing <strong className="text-foreground">{filteredFaqs.length}</strong> of {faqs.length} questions
              {activeCategory !== "ALL" && ` in ${activeCategory}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </span>
            {(activeCategory !== "ALL" || searchQuery) && (
              <button
                onClick={() => { setActiveCategory("ALL"); setSearchQuery(""); }}
                className="text-primary font-bold hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Compact 2-Column Grid to Prevent Excessive Scrolling */}
          {loading ? (
            <div className="text-center py-16 text-muted-foreground">Loading FAQs...</div>
          ) : filteredFaqs.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 border border-border rounded-2xl p-8 max-w-md mx-auto">
              <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-60" />
              <h3 className="font-semibold text-foreground mb-1">No questions found</h3>
              <p className="text-xs text-muted-foreground mb-4">Try searching with a different keyword or view all categories.</p>
              <button
                onClick={() => { setActiveCategory("ALL"); setSearchQuery(""); }}
                className="px-4 py-2 rounded-full bg-primary text-white text-xs font-bold"
              >
                Clear Search & Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              {/* Left Column */}
              <Accordion className="space-y-4">
                {leftColFaqs.map((faq, idx) => (
                  <AccordionItem 
                    key={`left-${idx}`} 
                    value={`left-${idx}`}
                    className="border border-border/80 bg-card rounded-2xl px-5 py-1 data-[state=open]:shadow-md data-[state=open]:border-primary/30 transition-all"
                  >
                    <AccordionTrigger className="text-left font-semibold text-base hover:no-underline py-4 gap-3">
                      <span className="flex-1 leading-snug">{faq.q}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1 border-t border-border/40">
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary mb-2">
                        {getCategoryIcon(faq.category)}
                        {faq.category}
                      </div>
                      <p>{faq.a}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {/* Right Column */}
              <Accordion className="space-y-4">
                {rightColFaqs.map((faq, idx) => (
                  <AccordionItem 
                    key={`right-${idx}`} 
                    value={`right-${idx}`}
                    className="border border-border/80 bg-card rounded-2xl px-5 py-1 data-[state=open]:shadow-md data-[state=open]:border-primary/30 transition-all"
                  >
                    <AccordionTrigger className="text-left font-semibold text-base hover:no-underline py-4 gap-3">
                      <span className="flex-1 leading-snug">{faq.q}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-4 pt-1 border-t border-border/40">
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary mb-2">
                        {getCategoryIcon(faq.category)}
                        {faq.category}
                      </div>
                      <p>{faq.a}</p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          )}

        </div>
      </section>

      {/* Redesigned Clean Contact Card - Only Contact Us */}
      <section className="py-16 bg-muted/20 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto bg-card p-8 sm:p-10 rounded-3xl shadow-lg border border-border"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-6 h-6" />
            </div>

            <h3 className="text-2xl sm:text-3xl font-serif font-medium mb-3">Still have questions?</h3>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6 max-w-md mx-auto">
              Our team is available to assist you with any questions regarding our hospital services, appointments, or medical care.
            </p>
            
            <div className="flex justify-center">
              <Link
                href="/contact"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-full px-8 py-6 text-sm sm:text-base font-semibold shadow-md hover:shadow-xl hover:scale-[1.02] transition-all gap-2"
                )}
              >
                <Mail className="w-4 h-4" />
                Contact Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
