"use client";

import { Check, ShieldCheck, HeartHandshake, Lock, ClipboardList, Users, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

const reasons = [
  {
    title: "Patient-Centred Approach",
    description: "Care plans are developed around individual concerns and needs.",
    icon: HeartHandshake,
  },
  {
    title: "Respectful Environment",
    description: "Patients are treated with dignity and without judgment.",
    icon: ShieldCheck,
  },
  {
    title: "Confidential Discussions",
    description: "Personal concerns are handled with appropriate privacy, subject to applicable legal and safety requirements.",
    icon: Lock,
  },
  {
    title: "Individualized Treatment Planning",
    description: "Recommendations depend on clinical assessment and the patient's circumstances.",
    icon: ClipboardList,
  },
  {
    title: "Family Guidance",
    description: "Where appropriate and with suitable consent, family members can receive guidance on supporting recovery.",
    icon: Users,
  },
  {
    title: "Continuity of Care",
    description: "Follow-up recommendations can help patients monitor progress and discuss ongoing concerns.",
    icon: RefreshCw,
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-24 lg:py-32 bg-[#FCFBFC] border-y border-border/40 overflow-hidden relative">
      {/* Soft decorative background elements */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/[0.03] via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/[0.04] via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-20 items-center">
          
          {/* Left Visual Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: -20 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, type: "spring", stiffness: 60 }}
            className="lg:col-span-5 relative order-2 lg:order-1"
          >
            <div className="relative aspect-[4/5] max-w-md mx-auto rounded-[3rem] bg-gradient-to-br from-primary/15 via-primary/5 to-secondary/15 p-[2px] shadow-2xl shadow-primary/[0.06]">
              <div className="w-full h-full rounded-[2.9rem] bg-white border border-white/60 flex items-center justify-center p-8 sm:p-12 relative overflow-hidden">
                
                {/* Inner glowing orb */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[40px] pointer-events-none" />

                <div className="text-center z-10">
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 3 }}
                    className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-6 ring-8 ring-primary/5 shadow-xs"
                  >
                    <span className="font-black text-2xl tracking-wider">KM</span>
                  </motion.div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 tracking-tight">
                    KELKAR MANAS
                  </h3>
                  <span className="inline-block text-xs font-bold uppercase tracking-widest text-primary mb-4 bg-primary/10 px-3 py-1 rounded-full">
                    HEALTH CARE
                  </span>
                  <p className="text-muted-foreground font-medium leading-relaxed max-w-xs mx-auto text-sm sm:text-base">
                    Compassionate, confidential care and professional guidance for a better tomorrow.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Right Content */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6 }}
              className="mb-10"
            >
              <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary mb-3 block">
                Our Core Principles
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15]">
                Why Choose <br />
                <span className="text-primary">KELKAR MANAS HEALTH CARE?</span>
              </h2>
            </motion.div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={{
                visible: { transition: { staggerChildren: 0.1 } }
              }}
              className="space-y-6 sm:space-y-7"
            >
              {reasons.map((reason, index) => {
                const Icon = reason.icon;
                return (
                  <motion.div 
                    key={index} 
                    variants={{
                      hidden: { opacity: 0, x: 20 },
                      visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 80 } }
                    }}
                    className="flex gap-4 sm:gap-5 group cursor-default"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-xs border border-border/60 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:shadow-md transition-all duration-300">
                        <Icon className="h-5 w-5" strokeWidth={2} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-200">
                        {reason.title}
                      </h3>
                      <p className="text-muted-foreground font-medium text-sm sm:text-base leading-relaxed">
                        {reason.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
