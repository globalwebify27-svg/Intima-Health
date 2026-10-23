"use client";

import { motion } from "framer-motion";
import { ArrowRight, PhoneCall, Calendar } from "lucide-react";
import { useBookingModal } from "@/store/useBookingModal";
import { Button } from "@/components/ui/button";

export function SelfAssessmentCTA() {
  const { openBooking } = useBookingModal();

  return (
    <section className="py-20 lg:py-28 bg-background px-6 lg:px-12 relative overflow-hidden">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden bg-gradient-to-br from-[#4A154B] via-[#5c1a5d] to-[#3d113e] text-white p-8 sm:p-14 lg:p-18 shadow-2xl shadow-primary/20 border border-white/10"
        >
          {/* Subtle glowing ambient lights */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            {/* Eyebrow badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs font-bold tracking-wider uppercase mb-6 backdrop-blur-md border border-white/15"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Support &amp; Recovery</span>
            </motion.div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 leading-[1.15]">
              Take the First Step Towards <br />
              <span className="text-purple-200">Better Well-being</span>
            </h2>

            {/* Paragraph 1 */}
            <p className="text-base sm:text-lg lg:text-xl text-white/90 font-medium leading-relaxed max-w-2xl mx-auto mb-4">
              You do not have to navigate mental health challenges alone. Understanding your concerns and seeking appropriate professional support can be an important step towards recovery.
            </p>

            {/* Paragraph 2 */}
            <p className="text-sm sm:text-base text-white/75 font-medium leading-relaxed max-w-xl mx-auto mb-10">
              Contact KELKAR MANAS HEALTH CARE to learn about available services and appointment options.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => openBooking()}
                className="rounded-2xl px-8 py-7 text-base font-bold bg-white text-[#4A154B] hover:bg-white/95 shadow-xl hover:shadow-2xl transition-all cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 group border-none"
              >
                <span>Book an Appointment</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>

              <a href="tel:+917030414140" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-2xl px-8 py-7 text-base font-bold bg-white/10 text-white hover:bg-white/20 border-2 border-white/25 hover:border-white shadow-xs transition-all cursor-pointer w-full sm:w-auto flex items-center justify-center gap-2 backdrop-blur-md"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Call the Hospital</span>
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
