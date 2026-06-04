"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, ArrowRight, ShieldCheck, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const clinics = [
  {
    city: "New Delhi",
    address: "124 Premium Clinic Row, Vasant Vihar, New Delhi 110057",
    hours: "Mon-Sat: 9:00 AM - 7:00 PM",
    phone: "+91 11 4567 8900"
  },
  {
    city: "Mumbai",
    address: "Unit 8, Flagship Center, Bandra West, Mumbai 400050",
    hours: "Mon-Sat: 10:00 AM - 8:00 PM",
    phone: "+91 22 6789 0123"
  },
  {
    city: "Bangalore",
    address: "4th Floor, Tech Hub Building, Indiranagar, Bangalore 560038",
    hours: "Mon-Sun: 9:00 AM - 9:00 PM",
    phone: "+91 80 2345 6789"
  }
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 bg-muted/30 overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20">
              <MessageSquare className="w-4 h-4" />
              We're here to help
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium mb-6">
              Get in <span className="text-primary italic">touch.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Whether you have a clinical question, need support with an order, or want to book an in-person visit, our dedicated care team is ready.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Contact Info (Left) */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="lg:col-span-5 space-y-10"
            >
              <div>
                <h2 className="text-3xl font-serif mb-6">Direct Channels</h2>
                <p className="text-muted-foreground mb-8">
                  For immediate assistance regarding medical emergencies, please dial your local emergency number. For all other inquiries, reach out below.
                </p>
              </div>
              
              <div className="space-y-8">
                <motion.div variants={fadeIn} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Phone Support</h4>
                    <p className="text-muted-foreground text-sm mb-1">Mon-Sat, 9AM to 8PM</p>
                    <a href="tel:18001234567" className="text-primary font-medium hover:underline text-lg">1-800-123-4567</a>
                  </div>
                </motion.div>
                
                <motion.div variants={fadeIn} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Email Us</h4>
                    <p className="text-muted-foreground text-sm mb-1">We typically reply within 2 hours</p>
                    <a href="mailto:care@intimahealth.com" className="text-primary font-medium hover:underline text-lg">care@intimahealth.com</a>
                  </div>
                </motion.div>

                <motion.div variants={fadeIn} className="flex items-start gap-4 bg-muted/50 p-6 rounded-2xl border border-border">
                  <ShieldCheck className="w-8 h-8 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-base mb-1 text-emerald-700">100% Confidential</h4>
                    <p className="text-muted-foreground text-sm">
                      All communications are securely encrypted and protected under strict HIPAA compliance standards.
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Contact Form (Right) */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 bg-card p-8 md:p-12 rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden"
            >
              {/* Decorative blur */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
              
              <h3 className="text-2xl font-serif mb-8 relative z-10">Send a Secure Message</h3>
              
              <form className="relative z-10 space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-semibold">First Name</label>
                    <input 
                      type="text" 
                      id="firstName" 
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                      placeholder="e.g. John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-semibold">Last Name</label>
                    <input 
                      type="text" 
                      id="lastName" 
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                      placeholder="e.g. Doe"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold">Email Address</label>
                  <input 
                    type="email" 
                    id="email" 
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    placeholder="you@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-semibold">Subject</label>
                  <select 
                    id="subject" 
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow appearance-none cursor-pointer"
                  >
                    <option value="">Select a topic...</option>
                    <option value="consultation">Book a Consultation</option>
                    <option value="pharmacy">Pharmacy & Orders</option>
                    <option value="medical">Medical Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-semibold">Message</label>
                  <textarea 
                    id="message" 
                    rows={5}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none"
                    placeholder="How can we help you?"
                  />
                </div>
                
                <Button className="w-full rounded-xl py-6 text-base font-semibold shadow-lg group">
                  Submit Message
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </motion.div>
            
          </div>
        </div>
      </section>

      {/* Clinics Section */}
      <section className="py-24 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Our Clinics</h2>
            <p className="text-muted-foreground text-lg">
              Prefer an in-person visit? We operate premium clinical centers in select cities. Walk-ins are not accepted; please book an appointment prior to your visit.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {clinics.map((clinic, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-card p-8 rounded-3xl border border-border hover:border-primary/30 transition-colors shadow-sm hover:shadow-xl"
              >
                <h3 className="text-2xl font-serif mb-6 text-foreground">{clinic.city}</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-primary mr-3 shrink-0 mt-0.5" />
                    <p className="text-muted-foreground text-sm leading-relaxed">{clinic.address}</p>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-primary mr-3 shrink-0" />
                    <p className="text-muted-foreground text-sm">{clinic.hours}</p>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-primary mr-3 shrink-0" />
                    <p className="text-muted-foreground text-sm font-medium">{clinic.phone}</p>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full rounded-full">
                  Get Directions
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
