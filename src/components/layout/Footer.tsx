import Link from "next/link";
import { Mail, MessageCircle, Globe } from "lucide-react";
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
                Join our private newsletter for clinical insights, longevity protocols, and exclusive access.
              </p>
            </div>
            
            <NewsletterForm />
            
          </div>
        </div>
      </div>

      {/* Bottom Tone: Deep Burgundy Section for Links */}
      <div className="bg-[#3d113e] text-white pt-24 pb-12 relative overflow-hidden z-10">
        
        {/* Soft radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-white/5 rounded-[100%] blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          
          <div className="grid grid-cols-2 md:grid-cols-12 gap-12 mb-20">
            
            <div className="col-span-2 md:col-span-4 lg:col-span-5">
               <span className="text-3xl font-black tracking-tighter text-white mb-4 block">
                Dr. Kelkar<span className="text-white/50"> Hospital</span>
              </span>
              <p className="text-sm text-white/70 leading-relaxed max-w-xs font-medium mb-4">
                P294+H8J, Ramdas Peth, Akola, Maharashtra 444001
              </p>
              <p className="text-sm text-white/70 font-medium mb-6">
                Direct Appointment: <a href="tel:9822570101" className="underline hover:text-white">+91 9822570101</a><br />
                WhatsApp: <a href="https://api.whatsapp.com/send?phone=919049993104" target="_blank" className="underline hover:text-white">+91 9049993104</a><br />
                Email: kelkarhospitalpvt@gmail.com
              </p>
              
              <div className="flex gap-4">
                <a href="tel:9822570101" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all hover:-translate-y-1">
                  <Globe className="w-4 h-4" />
                </a>
                <a href="https://api.whatsapp.com/send?phone=919049993104" target="_blank" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all hover:-translate-y-1">
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a href="mailto:kelkarhospitalpvt@gmail.com" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-all hover:-translate-y-1">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
            
            <div className="col-span-1 md:col-span-2 lg:col-span-2 md:col-start-6">
              <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-white/40">Services</h4>
              <ul className="space-y-4 text-sm font-semibold text-white/80">
                <li><Link href="/services" className="hover:text-white transition-colors">All Services</Link></li>
                <li><Link href="/conditions" className="hover:text-white transition-colors">Conditions</Link></li>
                <li><Link href="/consultations" className="hover:text-white transition-colors">Consultations</Link></li>
                <li><Link href="/products" className="hover:text-white transition-colors">Pharmacy</Link></li>
                <li><Link href="/doctors" className="hover:text-white transition-colors">Our Doctors</Link></li>
              </ul>
            </div>
            
            <div className="col-span-1 md:col-span-2 lg:col-span-2">
              <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-white/40">Company</h4>
              <ul className="space-y-4 text-sm font-semibold text-white/80">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Journal</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            
            <div className="col-span-2 md:col-span-2 lg:col-span-2">
              <h4 className="mb-6 text-xs font-bold uppercase tracking-widest text-white/40">Legal</h4>
              <ul className="space-y-4 text-sm font-semibold text-white/80">
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/hipaa" className="hover:text-white transition-colors">HIPAA</Link></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/10 text-xs font-bold text-white/40 uppercase tracking-widest">
            <p>&copy; {new Date().getFullYear()} Intima Health.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <span>Built with Care</span>
              <span>Built for Privacy</span>
            </div>
          </div>
        </div>

        {/* Massive Typography Watermark */}
        <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-full text-center pointer-events-none select-none overflow-hidden flex justify-center">
          <span className="text-[18vw] font-black tracking-tighter text-white/[0.03] whitespace-nowrap leading-none">
            INTIMA
          </span>
        </div>
        
      </div>
    </footer>
  );
}
