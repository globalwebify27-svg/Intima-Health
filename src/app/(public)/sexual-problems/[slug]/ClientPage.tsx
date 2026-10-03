"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Stethoscope, ArrowRight, CheckCircle2, UserCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookNowButton } from "@/components/ui/book-now-button";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

import * as Icons from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ClientPage({ data }: { data: any }) {


  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden bg-muted/30">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -z-10 rounded-bl-[120px]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div initial="hidden" animate="visible" variants={fadeIn} className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
                <Stethoscope className="w-4 h-4" />
                {data.badge}
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-[1.1] mb-6">
                {data.heroHeadline}
              </h1>

              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-xl">
                {data.heroSubtext}
              </p>

              <div className="p-4 rounded-2xl bg-background border border-border/80 mb-8 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{data.doctor}</h4>
                  <p className="text-xs text-muted-foreground">{data.leadDoctorRole}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <BookNowButton className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 text-base font-semibold shadow-xl group")}>
                  Book Consultation
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </BookNowButton>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="lg:w-1/2 relative">
              <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border border-border bg-white flex items-center justify-center p-8">
                <Image
                  src="/images/doctor_1.png"
                  alt={data.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Understanding & Overview Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-6">Overview & Clinical Approach</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {data.description}
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className={cn(
              "grid grid-cols-1 gap-8",
              data.causes.length === 2 ? "md:grid-cols-2 max-w-4xl mx-auto" : "md:grid-cols-3"
            )}
          >
            {data.causes?.map((cause: any, idx: number) => (
              <motion.div key={idx} variants={fadeIn} className="bg-muted/30 p-8 rounded-[2rem] border border-border h-full flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-6 shrink-0">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {(() => { const Icon = (Icons as any)[cause.icon] || Icons.HelpCircle; return <Icon className="w-6 h-6" />; })()}
                </div>
                <h3 className="text-xl font-serif font-medium mb-3">{cause.title}</h3>
                {cause.description && (
                  <p className="text-muted-foreground text-sm leading-relaxed">{cause.description}</p>
                )}
                {cause.points && (
                  <ul className="list-disc pl-5 text-muted-foreground text-sm space-y-2 marker:text-primary/70">
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
      <section className="py-20 bg-muted/40 border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Our Specialized <span className="text-primary italic">Care Plan</span></h2>
            <p className="text-muted-foreground text-base">Comprehensive, confidential, and physician-guided treatment protocols.</p>
          </div>

          <div className="space-y-6">
            {data.treatments?.map((treatment: any, idx: number) => (
              <div key={idx} className="bg-background p-6 rounded-2xl border border-border flex gap-4 items-start shadow-sm">
                <div className="mt-1 shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-foreground mb-1">{treatment.title}</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">{treatment.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              {data.cta?.headline || "Start Your Journey to Recovery"}
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              {data.cta?.subtext || "Consult with Dr. Deepak Kelkar and our senior clinical team. 100% private and confidential."}
            </p>
            <BookNowButton className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "rounded-full px-10 py-5 text-base font-bold shadow-xl hover:scale-105 transition-transform")}>
              {data.cta?.buttonText || "Book Consultation Now"}
            </BookNowButton>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
