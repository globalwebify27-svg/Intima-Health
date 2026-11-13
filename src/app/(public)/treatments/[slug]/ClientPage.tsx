"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Stethoscope, ArrowRight, CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookNowButton } from "@/components/ui/book-now-button";
import { TopicFaqSection } from "@/components/sections/TopicFaqSection";
import { RehabCentresSection } from "@/components/sections/RehabCentresSection";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

import { CauseIcon } from "@/components/ui/cause-icon";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ClientPage({ data, hospitals }: { data: any; hospitals?: any[] }) {


  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-5 pb-8 sm:pt-10 sm:pb-12 lg:pt-12 lg:pb-14 overflow-hidden bg-muted/30">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -z-10 rounded-bl-[120px]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-6 sm:gap-10 lg:gap-20">
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="lg:w-1/2 w-full">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs sm:text-sm mb-3 sm:mb-6 border border-primary/20">
                <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {data.badge}
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.15] mb-3 sm:mb-6">
                {data.heroHeadline}
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-5 sm:mb-8 leading-relaxed max-w-xl">
                {data.heroSubtext}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <BookNowButton className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto rounded-full px-8 text-sm sm:text-base font-semibold shadow-xl group justify-center")}>
                  Book Consultation
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </BookNowButton>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.8 }} 
              className="lg:w-1/2 w-full max-w-xs sm:max-w-md lg:max-w-none mx-auto relative"
            >
              <div className="relative w-full aspect-[4/3] rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-lg sm:shadow-2xl border border-primary/15 bg-gradient-to-b from-white via-primary/[0.02] to-primary/5 dark:from-card dark:to-muted/30 flex items-center justify-center">
                <Image
                  src={data.heroImage || "/images/doctor_1.png"}
                  alt={data.title || "Treatment"}
                  fill
                  priority
                  className="object-cover scale-[1.55] sm:scale-100 origin-center transition-transform duration-500"
                  unoptimized={Boolean(data.heroImage?.startsWith("data:") || data.heroImage?.startsWith("http"))}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Understanding & Overview Section */}
      <section className="py-8 sm:py-10 lg:py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8 lg:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-3 sm:mb-6">Overview & Clinical Approach</h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed">
              {data.description}
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className={cn(
              "grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8",
              data.causes.length === 2 ? "md:grid-cols-2 max-w-4xl mx-auto" : "md:grid-cols-3"
            )}
          >
            {data.causes?.map((cause: any, idx: number) => (
              <motion.div key={idx} variants={fadeIn} className="bg-muted/30 p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-border h-full flex flex-col">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-4 sm:mb-6 shrink-0">
                  <CauseIcon name={cause.icon} className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-medium mb-2 sm:mb-3">{cause.title}</h3>
                {cause.description && (
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{cause.description}</p>
                )}
                {cause.points && (
                  <ul className="list-disc pl-5 text-muted-foreground text-xs sm:text-sm space-y-1.5 sm:space-y-2 marker:text-primary/70 mt-2">
                    {cause.points.map((point: string, i: number) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Treatment Plan Section */}
      <section className="py-8 sm:py-10 lg:py-12 bg-muted/40 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif mb-2 sm:mb-4">Our Specialized <span className="text-primary italic">Care Plan</span></h2>
            <p className="text-muted-foreground text-sm sm:text-base">Comprehensive, confidential, and physician-guided treatment protocols.</p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {data.treatments?.map((treatment: any, idx: number) => (
              <div key={idx} className="bg-background p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-border flex gap-3 sm:gap-4 items-start shadow-xs">
                <div className="mt-0.5 shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-base sm:text-lg font-semibold text-foreground mb-1">{treatment.title}</h4>
                  <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{treatment.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alcohol & Drug De-addiction Subsection (Ashakiran Rehabilitation Centre & Sanmitra Manas Hospital) */}
      {(data.slug === "treatment-of-alcohol-addiction" || data.slug === "brown-sugar-de-addiction") && (
        <RehabCentresSection initialCentres={hospitals} />
      )}

      {/* Topic-Specific FAQs Section */}
      <TopicFaqSection slug={data.slug} title={data.title} faqs={data.faqs} />

      {/* CTA Section */}
      <section className="py-10 lg:py-12 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              {data.cta?.headline || "Start Your Journey to Recovery"}
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              {data.cta?.subtext || "Consult with Dr. Deepak Kelkar and our senior clinical team. 100% private and confidential."}
            </p>
            <BookNowButton className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "w-full sm:w-auto rounded-full px-8 sm:px-10 py-3.5 sm:py-5 text-sm sm:text-base font-bold shadow-xl hover:scale-105 transition-transform justify-center")}>
              {data.cta?.buttonText || "Book Consultation Now"}
            </BookNowButton>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
