"use client";

import { motion } from "framer-motion";

export function TrustIndicators() {
  const logoItemClass = "flex items-center justify-center px-8 py-5 rounded-2xl border border-transparent hover:border-white/60 hover:bg-white/40 hover:backdrop-blur-xl hover:shadow-xl hover:text-primary transition-all duration-300 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 cursor-pointer";

  const logos = (
    <>
      <motion.div whileHover={{ scale: 1.15, y: -5 }} className={logoItemClass}>
        <span className="text-2xl font-black tracking-tighter">GQ</span>
      </motion.div>
      <motion.div whileHover={{ scale: 1.15, y: -5 }} className={logoItemClass}>
        <span className="text-xl font-serif italic font-bold">Men'sHealth</span>
      </motion.div>
      <motion.div whileHover={{ scale: 1.15, y: -5 }} className={logoItemClass}>
        <span className="text-xl font-bold uppercase tracking-widest border-b-2 border-current pb-0.5">Forbes</span>
      </motion.div>
      <motion.div whileHover={{ scale: 1.15, y: -5 }} className={logoItemClass}>
        <span className="text-lg font-bold font-serif">The Economic Times</span>
      </motion.div>
      <motion.div whileHover={{ scale: 1.15, y: -5 }} className={`${logoItemClass} hidden lg:flex`}>
        <span className="text-xl font-black tracking-tight">VOGUE</span>
        <span className="text-xs ml-1 uppercase tracking-widest font-normal">Wellness</span>
      </motion.div>
    </>
  );

  return (
    <section className="pb-16 pt-8 bg-transparent relative z-10 border-b border-border/40 overflow-hidden">
      <div className="container mx-auto px-6 lg:px-12 relative">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-8">
          Trusted By Experts & Featured In
        </p>
        
        {/* Gradient fades for the edges */}
        <div className="absolute top-12 left-0 w-16 md:w-32 h-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-12 right-0 w-16 md:w-32 h-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>

        {/* Scrolling marquee container using Framer Motion */}
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex w-max items-center py-4"
        >
          {/* First set of logos */}
          <div className="flex items-center gap-6 md:gap-16 mx-4 md:mx-8">
            {logos}
          </div>
          {/* Second set of logos for seamless loop */}
          <div className="flex items-center gap-6 md:gap-16 mx-4 md:mx-8">
            {logos}
          </div>
          {/* Third set to ensure it fills ultra-wide screens smoothly */}
          <div className="flex items-center gap-6 md:gap-16 mx-4 md:mx-8">
            {logos}
          </div>
          {/* Fourth set to ensure smooth looping since we use a fixed pixel distance */}
          <div className="flex items-center gap-6 md:gap-16 mx-4 md:mx-8">
            {logos}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
