"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, ArrowRight, ShieldCheck, MessageSquare, Globe, Map, Star } from "lucide-react";
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

const hospitals = [
  "Kelkar Hospital, Akola",
  "Sanmitra Hospital, Akola",
  "Ashakiran Hospital",
  "City Multispeciality Hospital, Akola"
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [contactContent, setContactContent] = useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/public/content/pages/contact")
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setContactContent(json.data.content);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const data = React.useMemo(() => {
    try {
      return JSON.parse(contactContent || "{}");
    } catch {
      return {};
    }
  }, [contactContent]);

  const parsedHospitals = (data.hospitalNames || "Kelkar Hospital, Akola, Sanmitra Hospital, Akola, Ashakiran Hospital, City Multispeciality Hospital, Akola")
    .split(",")
    .map((h: string) => h.trim())
    .filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const nameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName.trim() || formData.firstName.length < 2 || !nameRegex.test(formData.firstName)) {
      setError("Please enter a valid first name (letters only, min 2 chars).");
      return;
    }
    if (!formData.lastName.trim() || formData.lastName.length < 2 || !nameRegex.test(formData.lastName)) {
      setError("Please enter a valid last name (letters only, min 2 chars).");
      return;
    }
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!formData.subject) {
      setError("Please select a subject.");
      return;
    }
    if (formData.message.trim().length < 10) {
      setError("Message must be at least 10 characters long.");
      return;
    }

    setLoading(true);
    // Simulate API call for contact form
    setTimeout(() => {
      setLoading(false);
      setSuccess("Your message has been sent successfully. We will get back to you shortly.");
      setFormData({ firstName: "", lastName: "", email: "", subject: "", message: "" });
    }, 1000);
  };

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

            {data.heroTitle ? (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium mb-6" dangerouslySetInnerHTML={{ __html: data.heroTitle }} />
            ) : (
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium mb-6">
                Get in <span className="text-primary italic">touch.</span>
              </h1>
            )}

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed whitespace-pre-line">
              {data.heroSubtitle || "Whether you have a clinical question, need support with an order, or want to book an walk-in visit, our dedicated care team is ready."}
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
              <>
                <div>
                  <h2 className="text-3xl font-serif mb-6">Direct Channels</h2>
                  <p className="text-muted-foreground mb-8">
                    {data.description || "For immediate assistance regarding medical emergencies, please dial your local emergency number. For all other inquiries, reach out below."}
                  </p>
                </div>

                <div className="space-y-8">
                  <motion.div variants={fadeIn} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Mobile Numbers</h4>
                      <p className="text-muted-foreground text-sm mb-1">Appointment / Contact</p>
                      <div className="flex flex-col gap-1 mt-2">
                        <a href="tel:+918484931874" className="text-primary font-medium hover:underline text-lg">📞 +91 8484931874</a>
                        <a href="tel:+917028088838" className="text-primary font-medium hover:underline text-lg">📞 +91 7028088838</a>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={fadeIn} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-lg mb-1">Connect With Us</h4>
                      <div className="flex flex-col gap-3 mt-4">
                        <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary text-sm transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                          <span>Facebook</span>
                        </a>
                        <a href="https://www.instagram.com/dr_kelkar_sexologist/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary text-sm transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                          <span>Instagram</span>
                        </a>
                        <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary text-sm transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                          <span>Twitter / X</span>
                        </a>
                        <a href="https://www.youtube.com/@deepakkelkar736" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary text-sm transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                          <span>YouTube</span>
                        </a>
                        <a href="https://kelkarhospital.in/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary text-sm transition-colors">
                          <Globe className="w-4 h-4" />
                          <span>Website</span>
                        </a>
                        <a href="https://share.google/lOTkT4usjPYR8eKv8" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary text-sm transition-colors">
                          <Map className="w-4 h-4" />
                          <span>Google Maps</span>
                        </a>
                        <a href="https://g.page/r/CR-i3bCCuZXuEBM/review" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-primary text-sm transition-colors">
                          <Star className="w-4 h-4" />
                          <span>Google Reviews</span>
                        </a>
                      </div>
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
              </>
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

              <form className="relative z-10 space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="p-3.5 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 flex items-center gap-2">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 flex items-center gap-2">
                    {success}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-semibold">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                      placeholder="e.g. John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-semibold">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-semibold">Subject</label>
                  <select
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
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
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <Button type="submit" disabled={loading} className="w-full rounded-xl py-6 text-base font-semibold shadow-lg group">
                  {loading ? "Sending..." : "Submit Message"}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Hospitals Section */}
      <section className="py-24 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">{data.hospitalsTitle || "Our Hospitals"}</h2>
            <p className="text-muted-foreground text-lg whitespace-pre-line">
              {data.hospitalsDesc || "We are proud to be associated with a network of four hospitals, providing comprehensive healthcare services with a strong focus on quality, compassion, and patient-centered care."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {parsedHospitals.map((hospitalName: string, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-card p-8 rounded-3xl border border-border hover:border-primary/30 transition-colors shadow-sm hover:shadow-xl flex items-center justify-center text-center h-full"
              >
                <h3 className="text-xl font-serif text-foreground">{hospitalName}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
