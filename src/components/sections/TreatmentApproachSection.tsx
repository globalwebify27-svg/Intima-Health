"use client";

import { motion } from "framer-motion";
import { MessageSquare, Stethoscope, FileText, CalendarCheck } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Initial Consultation",
    description: "Discuss your concerns, symptoms and relevant history with a qualified professional.",
    icon: MessageSquare,
  },
  {
    step: "02",
    title: "Clinical Assessment",
    description: "The clinician evaluates your needs and considers possible causes and contributing factors.",
    icon: Stethoscope,
  },
  {
    step: "03",
    title: "Individualized Treatment Plan",
    description: "Depending on the assessment, care may involve medication, psychotherapy, counselling, lifestyle guidance or referral for additional evaluation.",
    icon: FileText,
  },
  {
    step: "04",
    title: "Follow-Up & Progress Review",
    description: "Follow-up visits help review progress, address concerns and adjust the treatment plan when appropriate.",
    icon: CalendarCheck,
  },
];

export function TreatmentApproachSection() {
  return (
    <section className="py-24 lg:py-32 bg-background border-b border-border/40 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-primary/[0.03] rounded-full blur-[140px] pointer-events-none" />

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
            Care Pathway
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
            Our Approach to <span className="text-primary">Treatment</span>
          </h2>
        </motion.div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-card rounded-[2rem] p-7 sm:p-8 border border-border/70 shadow-xs hover:shadow-card hover:border-primary/30 transition-all duration-300 flex flex-col relative overflow-hidden group"
              >
                {/* Step Number Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/15">
                    Step {item.step}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>
                </div>

                {/* Step Title */}
                <h3 className="text-xl font-bold text-foreground mb-3 leading-snug group-hover:text-primary transition-colors">
                  {item.title}
                </h3>

                {/* Step Description */}
                <p className="text-muted-foreground font-medium text-sm sm:text-base leading-relaxed flex-grow">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
