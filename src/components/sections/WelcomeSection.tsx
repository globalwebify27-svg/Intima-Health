"use client";

import { motion } from "framer-motion";
import { Sparkles, HeartHandshake } from "lucide-react";

export function WelcomeSection() {
  return (
    <section className="py-20 lg:py-28 bg-[#FCFBFC] border-y border-border/40 relative overflow-hidden">
      {/* Ambient background glows matching Hero & WhyChooseUs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/[0.05] rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">

          {/* Left Column: Brand & Tagline Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5"
          >
            <div className="relative rounded-[2.5rem] bg-gradient-to-br from-primary/15 via-primary/5 to-secondary/20 p-[1.5px] shadow-lg shadow-primary/[0.04]">
              <div className="rounded-[2.4rem] bg-white p-8 sm:p-10 relative overflow-hidden">
                {/* Glow accent */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none" />

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-6 border border-primary/15">
                  <HeartHandshake className="w-3.5 h-3.5 text-primary" />
                  <span>Welcome to</span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground leading-[1.15] mb-4">
                  KELKAR MANAS <br />
                  <span className="text-primary">HEALTH CARE</span>
                </h2>

                <div className="h-1 w-14 bg-gradient-to-r from-primary to-secondary rounded-full mb-6" />

                <p className="text-xl sm:text-2xl font-bold text-foreground leading-snug tracking-tight">
                  Compassionate Care. <br />
                  <span className="text-primary">Professional Guidance.</span> <br />
                  <span className="text-muted-foreground font-serif italic font-normal">
                    A Better Tomorrow.
                  </span>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: The 3 Paragraphs */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Paragraph 1: Lead */}
            <p className="text-lg sm:text-xl text-foreground/90 font-medium leading-relaxed">
              Mental health concerns can affect thoughts, emotions, relationships, work and everyday life. With appropriate assessment, professional guidance and an individualized treatment plan, many people can improve their quality of life.
            </p>

            {/* Paragraph 2: Highlight Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-primary/15 shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
              <p className="text-base sm:text-lg text-foreground/90 font-medium leading-relaxed pl-2">
                <strong className="text-foreground font-bold">KELKAR MANAS HEALTH CARE</strong>{" "}
                aims to offer a supportive environment where patients and their families can seek help without fear of judgment. We focus on understanding each patient&apos;s concerns and guiding them towards suitable care.
              </p>
            </div>

            {/* Paragraph 3: Closing Reassurance */}
            <p className="text-base sm:text-lg text-muted-foreground font-medium leading-relaxed">
              Whether you are seeking help for anxiety, depression, addiction, sleep difficulties or other psychological concerns, our team can help you understand the next steps.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
