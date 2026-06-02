"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";

const reasons = [
  {
    title: "100% Confidential & Secure",
    description: "Your medical history and consultations are secured with enterprise-grade encryption and strict HIPAA compliance. No one knows why you're here but you and your doctor."
  },
  {
    title: "Board-Certified Specialists",
    description: "Our medical team isn't just general practitioners. They are specialized experts in sexual wellness, urology, and reproductive health with years of dedicated experience."
  },
  {
    title: "Seamless Convenience",
    description: "Skip the awkward waiting room. Get diagnosed, prescribed, and treated entirely online through our secure patient portal."
  },
  {
    title: "Discreet Delivery",
    description: "If prescribed, medications are shipped directly to your door in completely unbranded, discreet packaging. Fast, free, and completely private."
  }
];

export function WhyChooseUs() {
  return (
    <section className="py-32 bg-[#FCFBFC] border-y border-border/40 overflow-hidden relative">
      
      {/* Soft decorative background elements */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/[0.03] via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/[0.04] via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24 items-center">
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, x: -30 }}
            whileInView={{ opacity: 1, scale: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, type: "spring", stiffness: 50 }}
            className="lg:col-span-5 relative order-2 lg:order-1"
          >
            <div className="relative aspect-[4/5] rounded-[3rem] bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 p-1 shadow-2xl shadow-primary/[0.05]">
                <div className="w-full h-full rounded-[2.9rem] bg-white border border-white/50 flex items-center justify-center p-12 relative overflow-hidden">
                     
                     {/* Inner glowing orb */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-[40px] pointer-events-none" />

                     <div className="text-center z-10">
                        <motion.div 
                          whileHover={{ scale: 1.05, rotate: 5 }}
                          className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/5 text-primary mb-10 ring-8 ring-primary/5 shadow-sm"
                        >
                            <span className="font-black text-4xl tracking-tighter">IH</span>
                        </motion.div>
                        <h3 className="text-3xl font-bold text-foreground mb-5 tracking-tight">The Intima Standard</h3>
                        <p className="text-muted-foreground font-medium leading-relaxed max-w-xs mx-auto">
                          We believe that accessing world-class sexual healthcare should be as private and effortless as checking your email.
                        </p>
                     </div>
                </div>
            </div>
          </motion.div>
          
          <div className="lg:col-span-7 order-1 lg:order-2">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-8 leading-[1.1]"
            >
              Healthcare that respects your privacy.
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg text-muted-foreground mb-16 font-medium leading-relaxed max-w-2xl"
            >
              We understand that intimate health requires a highly sensitive and professional approach. Here is how we ensure you get the best care possible, without the stigma.
            </motion.p>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                visible: { transition: { staggerChildren: 0.15 } }
              }}
              className="space-y-10"
            >
              {reasons.map((reason, index) => (
                <motion.div 
                  key={index} 
                  variants={{
                    hidden: { opacity: 0, x: 20 },
                    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 80 } }
                  }}
                  className="flex gap-6 group cursor-default"
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-border/50 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:border-primary group-hover:shadow-lg transition-all duration-300">
                      <Check className="h-6 w-6" strokeWidth={3} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">{reason.title}</h3>
                    <p className="text-muted-foreground font-medium leading-relaxed">
                      {reason.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
