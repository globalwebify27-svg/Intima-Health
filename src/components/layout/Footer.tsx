import Link from "next/link";
import { Mail, MessageCircle, Globe, MapPin, ArrowRight, Phone } from "lucide-react";
import { NewsletterForm } from "@/components/ui/newsletter-form";

export function Footer() {
  return (
    <footer className="relative flex flex-col w-full">
      
      {/* Top Tone: Light Section for Newsletter */}
      <div className="bg-[#FCFBFC] text-foreground py-20 border-t border-border/40 relative z-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            
            <div className="max-w-xl text-center lg:text-left">
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-[#4A154B]">
                Stay ahead of your health.
              </h3>
              <p className="text-muted-foreground text-lg font-medium">
                Join our private newsletter for clinical insights, mental well-being guidance, and hospital updates.
              </p>
            </div>
            
            <NewsletterForm />
            
          </div>
        </div>
      </div>

      {/* Bottom Tone: Deep Burgundy Section for Links & Contact */}
      <div className="bg-[#3d113e] text-white pt-20 pb-12 relative overflow-hidden z-10">
        
        {/* Soft radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-white/5 rounded-[100%] blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          
          <div className="grid grid-cols-2 md:grid-cols-12 gap-12 mb-16">
            
            {/* Hospital Contact Info Column */}
            <div className="col-span-2 md:col-span-5 lg:col-span-5">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-1 block">
                KELKAR MANAS <span className="text-white/60 font-semibold text-lg block sm:inline">HEALTH CARE</span>
              </span>
              <p className="text-xs font-semibold text-white/70 mb-4 tracking-wider uppercase">
                Expert Care for Mental Health, Emotional Well-being &amp; Addiction Recovery
              </p>
              
              <div className="text-sm text-white/80 leading-relaxed font-medium mb-4 space-y-1">
                <p>
                  <strong>Address:</strong> 101, 102, 103, &amp; 104, Gulmohar Heights, Behind Fatema Church, Ghodbandar Road, Majiwada, Thane
                </p>
                <p>
                  <strong>Phone:</strong>{" "}
                  <a href="tel:+917030414140" className="underline hover:text-white transition-colors">
                    +91 7030414140
                  </a>
                </p>
                <p>
                  <strong>Consultation Hours:</strong> 10 AM to 6 PM
                </p>
                <p>
                  <strong>Email:</strong>{" "}
                  <a href="mailto:kelkarmanashealthcare@gmail.com" className="underline hover:text-white transition-colors">
                    kelkarmanashealthcare@gmail.com
                  </a>
                </p>
              </div>

              {/* Action Buttons: Get Directions & Contact Us */}
              <div className="flex flex-wrap gap-3 mb-6">
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Durga+Devi+Mandir+Rd,+Majiwada+Village,+Tirumala+Society,+Sainath+Nagar,+Majiwada,+Thane,+Maharashtra+400601"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-xs font-bold text-white transition-all shadow-xs"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-xs font-bold text-white transition-all shadow-xs"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Contact Us</span>
                </Link>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <a 
                  href="tel:+917030414140" 
                  aria-label="Call Hospital"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all hover:-translate-y-1"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a 
                  href="https://api.whatsapp.com/send?phone=917030414140" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="WhatsApp"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all hover:-translate-y-1"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a 
                  href="mailto:kelkarmanashealthcare@gmail.com" 
                  aria-label="Email"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all hover:-translate-y-1"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a 
                  href="https://www.facebook.com/deepak.kelkar.5832" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all hover:-translate-y-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a 
                  href="https://www.instagram.com/dr.deepak.kelkar" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all hover:-translate-y-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a 
                  href="https://x.com/DeepakKelk47743" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Twitter / X"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all hover:-translate-y-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
                </a>
              </div>
            </div>
            
            <div className="col-span-1 md:col-span-2 lg:col-span-2 md:col-start-6">
              <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-white/40">Treatments</h4>
              <ul className="space-y-4 text-sm font-semibold text-white/80">
                <li><Link href="/treatments" className="hover:text-white transition-colors">All Treatments</Link></li>
                <li><Link href="/treatments/treatment-of-depression" className="hover:text-white transition-colors">Depression</Link></li>
                <li><Link href="/treatments/treatment-of-anxiety" className="hover:text-white transition-colors">Anxiety &amp; Panic</Link></li>
                <li><Link href="/treatments/treatment-of-ocd" className="hover:text-white transition-colors">OCD Care</Link></li>
                <li><Link href="/treatments/treatment-of-alcohol-addiction" className="hover:text-white transition-colors">De-Addiction</Link></li>
                <li><Link href="/sexual-problems" className="hover:text-white transition-colors">Sexual Problems</Link></li>
              </ul>
            </div>
            
            <div className="col-span-1 md:col-span-2 lg:col-span-2">
              <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-white/40">Hospital</h4>
              <ul className="space-y-4 text-sm font-semibold text-white/80">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/products" className="hover:text-white transition-colors">Pharmacy</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            
            <div className="col-span-2 md:col-span-3 lg:col-span-3">
              <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-white/40">Legal &amp; Policy</h4>
              <ul className="space-y-4 text-sm font-semibold text-white/80">
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/hipaa" className="hover:text-white transition-colors">Confidentiality &amp; HIPAA</Link></li>
                <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund &amp; Cancellation Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Important Medical Disclaimer */}
          <div className="pt-8 pb-8 border-t border-white/10 text-xs text-white/70 leading-relaxed w-full">
            <p className="font-bold text-white/90 mb-2 tracking-wider uppercase text-[11px]">
              Important Medical Disclaimer
            </p>
            <p className="w-full font-normal text-white/60 leading-relaxed">
              The information on this website is for general educational purposes and is not a substitute for professional medical advice, diagnosis or treatment. Treatment decisions should be made with a qualified healthcare professional after an appropriate assessment. In a medical emergency, contact local emergency services or visit the nearest emergency department.
            </p>
          </div>

          {/* Copyright Line */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-white/10 text-xs font-bold text-white/40 uppercase tracking-widest">
            <p>&copy; {new Date().getFullYear()} KELKAR MANAS HEALTH CARE. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <span>Compassionate Care</span>
              <span>Professional Guidance</span>
            </div>
          </div>
        </div>

        {/* Massive Typography Watermark */}
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none overflow-hidden flex justify-center">
          <span className="text-[18vw] font-black tracking-tighter text-white/[0.03] whitespace-nowrap leading-none">
            KELKAR MANAS
          </span>
        </div>
        
      </div>
    </footer>
  );
}
