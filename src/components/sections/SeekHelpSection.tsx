"use client";

import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, HeartPulse } from "lucide-react";

const indicators = [
  "Persistent sadness, hopelessness or loss of interest.",
  "Excessive worry, recurring panic attacks or intense fear.",
  "Difficulty sleeping or managing everyday responsibilities.",
  "Repeated unwanted thoughts or compulsive behaviours.",
  "Alcohol or substance use that is affecting health, work or relationships.",
  "Significant mood changes, confusion or unusual experiences.",
  "Sexual health concerns causing distress or affecting relationships.",
  "Emotional or behavioural difficulties in children or adolescents.",
];

export function SeekHelpSection() {
  return (
    <section className="py-20 lg:py-28 bg-[#FAF8FA] border-y border-border/40 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/[0.03] rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="max-w-4xl mx-auto">
          
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary mb-3 block">
              Guidance &amp; Early Intervention
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-6 leading-[1.15]">
              When Should You Seek <br />
              <span className="text-primary">Professional Help?</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed max-w-2xl mx-auto">
              Consider speaking with a qualified mental health professional if you or someone you care about experiences:
            </p>
          </motion.div>

          {/* 8 Indicators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mb-10">
            {indicators.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -2 }}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-primary/10 shadow-xs hover:shadow-card hover:border-primary/25 transition-all flex items-start gap-4"
              >
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
                </div>
                <p className="text-foreground/90 font-medium text-base sm:text-lg leading-snug">
                  {item}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Bottom Reassurance Banner */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl bg-white p-6 sm:p-7 border border-primary/20 shadow-xs text-center max-w-2xl mx-auto"
          >
            <p className="text-base sm:text-lg font-semibold text-primary leading-relaxed">
              Seeking help early can make it easier to understand the problem and explore appropriate treatment options.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
