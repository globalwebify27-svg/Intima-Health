import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  Building2, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Navigation, 
  Clock, 
  CreditCard,
  ArrowLeft,
  Sparkles,
  FileText,
  Activity,
  HeartHandshake
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getRehabCentreBySlug, REHAB_CENTRES } from "@/constants/rehabCentres";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const resolved = await params;
  const centre = getRehabCentreBySlug(resolved.slug);
  if (!centre) return { title: "Hospital Not Found" };

  return {
    title: `${centre.name} | KELKAR MANAS HEALTH CARE`,
    description: centre.shortDescription,
  };
}

export default async function HospitalInfoPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const resolved = await params;
  const centre = getRehabCentreBySlug(resolved.slug);

  if (!centre) {
    notFound();
  }

  const isSanmitra = centre.id === "sanmitra-manas-hospital";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Breadcrumb & Return Banner */}
      <div className="bg-muted/40 border-b border-border/50 py-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/treatments" className="hover:text-foreground transition-colors">Treatments</Link>
            <span>/</span>
            <Link href="/treatments/treatment-of-alcohol-addiction" className="hover:text-foreground transition-colors">Alcohol Addiction</Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-none">{centre.name}</span>
          </div>

          <Link
            href="/treatments/treatment-of-alcohol-addiction"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Addiction Treatment
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <section className="relative pt-10 pb-16 lg:pt-14 lg:pb-20 bg-muted/20 border-b border-border/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs sm:text-sm mb-4 border border-primary/20">
            <Building2 className="w-4 h-4" />
            {centre.cashlessSchemeBadge}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium leading-tight mb-4">
            {centre.name}
          </h1>

          <p className="text-lg text-muted-foreground mb-8 max-w-3xl leading-relaxed">
            {centre.tagline}
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`tel:${centre.phones[0].replace(/\s+/g, '')}`}
              className={cn(buttonVariants({ size: "lg" }), "rounded-full font-semibold shadow-md gap-2")}
            >
              <Phone className="w-4 h-4" />
              Call {centre.phones[0]}
            </a>
            {centre.phones[1] && (
              <a
                href={`tel:${centre.phones[1].replace(/\s+/g, '')}`}
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full font-semibold gap-2")}
              >
                <Phone className="w-4 h-4" />
                Call {centre.phones[1]}
              </a>
            )}
            <a
              href={centre.googleMapDirectionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full font-semibold gap-2")}
            >
              <Navigation className="w-4 h-4" />
              Get Directions
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Details */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            
            {/* Left Column: Clean structured text (No PDF) */}
            <div className="lg:col-span-8 space-y-10">
              
              {/* Scheme Callout */}
              <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <CreditCard className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-serif font-bold text-foreground">
                    {isSanmitra ? "Empanelled Government Health Schemes" : "Inpatient Care & Financial Options"}
                  </h2>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  {centre.cashlessSchemeDetails}
                </p>
                {isSanmitra && (
                  <div className="mt-3 pt-3 border-t border-primary/10 flex flex-wrap gap-2 text-xs font-semibold text-primary">
                    <span className="px-3 py-1 rounded-full bg-primary/10">Mahatma Jyotiba Phule Jan Arogya Yojana</span>
                    <span className="px-3 py-1 rounded-full bg-primary/10">Pradhanmantri Jeevandayee Arogya Yojana</span>
                    <span className="px-3 py-1 rounded-full bg-primary/10">100% Free Treatment for Eligible Patients</span>
                  </div>
                )}
              </div>

              {/* About Us Section */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-medium mb-4">About Us:</h2>
                <div className="text-muted-foreground leading-relaxed space-y-4 text-base">
                  <p>{centre.fullAbout}</p>
                  {centre.founderInfo && (
                    <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 text-foreground text-sm font-medium">
                      {centre.founderInfo}
                    </div>
                  )}
                </div>
              </div>

              {/* Services Section */}
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-medium mb-3">
                  {isSanmitra ? "Available Services" : "Our Services:"}
                </h3>
                {isSanmitra && (
                  <p className="text-sm text-muted-foreground mb-4">
                    Sanmitra Manas Hospital offers specialized treatments for a wide range of mental health conditions, including:
                  </p>
                )}
                <div className={cn("grid gap-3", isSanmitra ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1")}>
                  {centre.services.map((service, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-muted/30 p-4 rounded-2xl border border-border/50">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm font-semibold text-foreground">{service}</span>
                    </div>
                  ))}
                </div>
                {centre.servicesDisclaimer && (
                  <div className="mt-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-medium">
                    {centre.servicesDisclaimer}
                  </div>
                )}
              </div>

              {/* Why Choose Us (For Ashakiran) */}
              {!isSanmitra && centre.whyChooseUs && (
                <div>
                  <h3 className="text-xl sm:text-2xl font-serif font-medium mb-4">Why Choose Us:</h3>
                  <div className="space-y-3">
                    {centre.whyChooseUs.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-card p-4 rounded-2xl border border-border shadow-xs">
                        <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground/90 font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced RTMS Technology Section (Specific to Sanmitra) */}
              {isSanmitra && (
                <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-sm space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-serif font-medium">Advanced RTMS Technology</h3>
                      <p className="text-xs text-muted-foreground">Repetitive Transcranial Magnetic Stimulation</p>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {centre.rtmsIntro}
                  </p>

                  {/* Conditions Treated by RTMS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {centre.rtmsConditions?.map((cond, i) => (
                      <div key={i} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-muted/50 border border-border/40 text-sm font-medium">
                        <Activity className="w-4 h-4 text-primary shrink-0" />
                        <span>{cond}</span>
                      </div>
                    ))}
                  </div>

                  {/* Benefits of RTMS */}
                  <div className="pt-2">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-3">Benefits of RTMS</h4>
                    <div className="space-y-2.5">
                      {centre.rtmsBenefits?.map((benefit, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-sm text-foreground/90">
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {centre.rtmsSummary && (
                    <p className="text-xs sm:text-sm font-medium text-foreground bg-primary/5 p-4 rounded-2xl border border-primary/15 leading-relaxed">
                      {centre.rtmsSummary}
                    </p>
                  )}
                </div>
              )}

              {/* How to Avail the Benefits (Specific to Sanmitra) */}
              {isSanmitra && centre.requiredDocuments && (
                <div className="bg-amber-50 dark:bg-amber-950/30 rounded-3xl p-6 sm:p-8 border border-amber-200 dark:border-amber-800/50 space-y-4">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-amber-700 dark:text-amber-400" />
                    <h3 className="text-xl font-serif font-bold text-amber-900 dark:text-amber-200">
                      {centre.requiredDocuments.title}
                    </h3>
                  </div>

                  <p className="text-sm text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
                    To benefit from the free treatments at Sanmitra Manas Hospital under the Mahatma Phule Yojana, patients must carry:
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {centre.requiredDocuments.list.map((doc, i) => (
                      <div key={i} className="px-5 py-2.5 rounded-full bg-white dark:bg-amber-900/40 border border-amber-300 dark:border-amber-700 font-bold text-sm text-amber-950 dark:text-amber-100 shadow-xs">
                        ✓ {doc}
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-amber-800 dark:text-amber-300 italic">
                    This ensures eligibility verification for free healthcare services.
                  </p>
                </div>
              )}

              {/* Take a Step Toward Mental Wellness (Closing Note) */}
              {isSanmitra && centre.closingWellnessNote && (
                <div className="bg-muted/40 rounded-3xl p-6 sm:p-8 border border-border space-y-3">
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <HeartHandshake className="w-5 h-5" />
                    Take a Step Toward Mental Wellness
                  </div>
                  <p className="text-sm sm:text-base text-foreground leading-relaxed">
                    {centre.closingWellnessNote}
                  </p>
                </div>
              )}

            </div>

            {/* Right Column: Location & Contact Information */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* Location & Contact Card */}
              <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-md space-y-6">
                <div>
                  <h3 className="text-xl font-serif font-bold">Location and Contact Information:</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {centre.name} is conveniently located:
                  </p>
                </div>

                <div className="flex items-start gap-3.5">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Address</h4>
                    <p className="text-sm font-semibold leading-relaxed">{centre.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Phone className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Contact Numbers:</h4>
                    <div className="space-y-1.5">
                      {centre.phones.map((phone, i) => (
                        <div key={i}>
                          <a
                            href={`tel:${phone.replace(/\s+/g, '')}`}
                            className="text-base font-bold text-primary hover:underline block"
                          >
                            {phone}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Clock className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Supervision</h4>
                    <p className="text-sm font-medium leading-relaxed">24/7 Medical Support & Inpatient Care</p>
                  </div>
                </div>

                {/* Google Maps Embed */}
                <div className="pt-2">
                  <div className="w-full h-48 rounded-2xl overflow-hidden border border-border">
                    <iframe
                      src={centre.googleMapEmbed}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title={centre.name}
                    />
                  </div>
                  <div className="mt-4">
                    <a
                      href={centre.googleMapDirectionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full rounded-full font-semibold text-sm")}
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions on Google Maps
                    </a>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Hospital Network Switcher */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-serif font-medium mb-2">Our Healthcare & Rehabilitation Network</h2>
            <p className="text-muted-foreground text-sm">Explore specialized inpatient de-addiction and psychiatric facilities affiliated with KELKAR MANAS HEALTH CARE.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {REHAB_CENTRES.map((other) => (
              <div 
                key={other.id} 
                className={cn(
                  "bg-card rounded-2xl p-6 border transition-all duration-200 flex flex-col justify-between",
                  other.id === centre.id ? "border-primary/50 shadow-md ring-1 ring-primary/20" : "border-border hover:shadow-lg"
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-primary">{other.cashlessSchemeBadge}</span>
                    {other.id === centre.id && (
                      <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-semibold">Currently Viewing</span>
                    )}
                  </div>
                  <h3 className="text-lg font-serif font-medium mb-2">{other.name}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-4">{other.shortDescription}</p>
                </div>

                <div className="pt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">{other.address}</span>
                  {other.id !== centre.id ? (
                    <Link
                      href={`/hospitals/${other.slug}`}
                      className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      View Details &rarr;
                    </Link>
                  ) : (
                    <span className="text-xs font-semibold text-muted-foreground">Active Page</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
