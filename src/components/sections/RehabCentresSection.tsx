"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Building2, 
  MapPin, 
  Phone, 
  ExternalLink, 
  Navigation, 
  ShieldCheck, 
  CreditCard,
  ArrowRight
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { REHAB_CENTRES } from "@/constants/rehabCentres";

export function RehabCentresSection() {
  const router = useRouter();

  return (
    <section className="py-20 bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        
        {/* Subsection Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-xs sm:text-sm mb-4 border border-primary/20">
            <Building2 className="w-4 h-4" />
            Rehabilitation Network
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-medium mb-4">
            Alcohol & Drug De-addiction
          </h2>

          <p className="text-base sm:text-lg text-foreground/90 font-medium leading-relaxed mb-3">
            Inpatient rehabilitation and comprehensive de-addiction care at Ashakiran Rehabilitation Centre, Sanmitra Manas Hospital and Vyasanmukti Kendra.
          </p>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Cashless treatment with Ayushman Card is available for eligible patients at participating centres, subject to current scheme rules and approval.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {REHAB_CENTRES.map((centre) => (
            <div
              key={centre.id}
              onClick={() => router.push(`/hospitals/${centre.slug}`)}
              className="bg-card rounded-3xl border border-border p-6 sm:p-8 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col justify-between cursor-pointer group hover:-translate-y-1 relative"
            >
              <div>
                {/* Scheme & Feature Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                    <CreditCard className="w-3.5 h-3.5" />
                    {centre.cashlessSchemeBadge}
                  </span>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    24/7 Inpatient Care
                  </span>
                </div>

                {/* Image & Title Header */}
                <div className="flex flex-col sm:flex-row gap-5 mb-5 items-start">
                  {!centre.hidePdf && centre.image ? (
                    <div className="relative w-24 h-32 sm:w-28 sm:h-36 rounded-2xl overflow-hidden shrink-0 border border-border bg-muted/40 shadow-xs">
                      <Image
                        src={centre.image}
                        alt={centre.name}
                        fill
                        className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shrink-0 bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shadow-xs">
                      <Building2 className="w-8 h-8 sm:w-10 sm:h-10" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl sm:text-2xl font-serif font-medium leading-snug group-hover:text-primary transition-colors">
                      {centre.name}
                    </h3>
                    <p className="text-xs text-primary font-semibold mt-1">
                      {centre.tagline}
                    </p>
                  </div>
                </div>

                {/* Short Description */}
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  {centre.shortDescription}
                </p>

                {/* Address */}
                <div className="flex items-start gap-2.5 text-xs text-foreground/80 font-medium mb-4 pb-4 border-b border-border/40">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <span>{centre.address}</span>
                </div>

                {/* Contact Options */}
                <div className="space-y-2 mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    Contact Options
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {centre.phones.map((phone, pIdx) => (
                      <a
                        key={pIdx}
                        href={`tel:${phone.replace(/\s+/g, '')}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 hover:bg-primary hover:text-primary-foreground text-xs font-semibold text-foreground transition-colors border border-border/60"
                      >
                        <Phone className="w-3 h-3 text-primary group-hover:text-inherit" />
                        {phone}
                      </a>
                    ))}
                    <a
                      href={centre.googleMapDirectionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/60 hover:bg-muted text-xs font-semibold text-muted-foreground transition-colors border border-border/60"
                    >
                      <Navigation className="w-3 h-3 text-primary" />
                      Google Map
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Link Footer */}
              <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs font-bold text-primary group-hover:underline inline-flex items-center gap-1.5">
                  Open Hospital Info Page
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="text-xs text-muted-foreground">Click card for details</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
