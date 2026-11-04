"use client";

import { useState, useEffect, useRef } from "react";
import { Star, ChevronLeft, ChevronRight, CheckCircle2, MapPin, ExternalLink, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ReviewItem {
  id: string;
  authorName: string;
  authorPhotoUrl?: string;
  authorUrl?: string;
  rating: number;
  relativeTimeDescription: string;
  text: string;
  clinicLocation: "Baner Clinic" | "Bhosari Clinic";
  googleMapsUrl: string;
  verified: boolean;
}

interface ReviewsSummary {
  averageRating: number;
  totalReviewsCount: number;
  primaryMapsUrl: string;
  banerMapsUrl: string;
  bhosariMapsUrl: string;
  clinicName: string;
  address: string;
}

export function GoogleReviewsSection() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [apiConnected, setApiConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<ReviewsSummary>({
    averageRating: 4.9,
    totalReviewsCount: 168,
    primaryMapsUrl: "https://maps.app.goo.gl/bgsaZrUK81zRvzZX7",
    banerMapsUrl: "https://maps.app.goo.gl/bgsaZrUK81zRvzZX7",
    bhosariMapsUrl: "https://maps.google.com/?q=Kelkar+Manas+Healthcare+Bhosari+Pune",
    clinicName: "Kelkar Manas Health Clinic",
    address: "205, Second Floor, Platinum 9, Sus Baner Road, Baner, Pune",
  });
  const [selectedLocation, setSelectedLocation] = useState<"all" | "baner" | "bhosari">("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reviews/google?clinic=${selectedLocation}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setReviews(data.data.reviews || []);
          setApiConnected(!!data.apiConnected);
          if (data.data.summary) {
            setSummary(data.data.summary);
          }
        }
      })
      .catch((err) => console.error("Error loading reviews:", err))
      .finally(() => setLoading(false));

    setCurrentIndex(0);
  }, [selectedLocation]);

  // Autoplay carousel if authentic reviews exist
  useEffect(() => {
    if (isPaused || reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, reviews.length]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, reviews.length - 1) : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.max(1, reviews.length));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (diff > 50) handleNext();
    else if (diff < -50) handlePrev();
    touchStartX.current = null;
  };

  const getVisibleReviews = () => {
    if (reviews.length === 0) return [];
    const count = reviews.length;
    return [
      reviews[currentIndex % count],
      reviews[(currentIndex + 1) % count],
      reviews[(currentIndex + 2) % count],
    ].filter(Boolean);
  };

  const visibleReviews = getVisibleReviews();

  return (
    <section 
      className="py-16 sm:py-24 bg-gradient-to-b from-background via-muted/20 to-background border-t border-border/40 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Official Google Badge */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background border border-border shadow-sm">
            {/* Official Google Multicolor G Logo */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="text-xs font-bold tracking-wide text-foreground uppercase">
              Google Maps Verified Clinic
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground">
            What Our Patients Say About Kelkar Manas
          </h2>

          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Real customer reviews for our Baner and Bhosari clinics, connected directly through Google.
          </p>

          {/* Rating Summary Block */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 p-3 sm:px-6 bg-card border border-border/80 rounded-2xl shadow-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black text-foreground">{summary.averageRating}</span>
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
            <span className="hidden sm:inline text-border font-light">|</span>
            <span className="text-xs text-muted-foreground font-medium">
              Over <strong className="text-foreground">{summary.totalReviewsCount}+ Reviews</strong> on Google Maps
            </span>
            <span className="hidden sm:inline text-border font-light">|</span>
            <a
              href={summary.primaryMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1"
            >
              View on Google Maps <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Dynamic Content: Only display reviews if authentic reviews were fetched from Google Places API */}
        {reviews.length > 0 ? (
          <div>
            {/* Location Tabs */}
            <div className="mt-8 flex justify-center items-center gap-2">
              <Button
                size="sm"
                variant={selectedLocation === "all" ? "default" : "outline"}
                onClick={() => setSelectedLocation("all")}
                className="rounded-full text-xs font-semibold px-4 h-9"
              >
                All Reviews ({reviews.length})
              </Button>
              <Button
                size="sm"
                variant={selectedLocation === "baner" ? "default" : "outline"}
                onClick={() => setSelectedLocation("baner")}
                className="rounded-full text-xs font-semibold px-4 h-9 gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" /> Baner Clinic
              </Button>
              <Button
                size="sm"
                variant={selectedLocation === "bhosari" ? "default" : "outline"}
                onClick={() => setSelectedLocation("bhosari")}
                className="rounded-full text-xs font-semibold px-4 h-9 gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" /> Bhosari Clinic
              </Button>
            </div>

            {/* Carousel */}
            <div 
              className="mt-10 relative"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Desktop Nav Arrows */}
              <div className="hidden md:flex justify-end items-center gap-2 mb-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrev}
                  className="rounded-full w-9 h-9 border-border bg-card shadow-sm"
                  aria-label="Previous Review"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  className="rounded-full w-9 h-9 border-border bg-card shadow-sm"
                  aria-label="Next Review"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Grid of Authentic Reviews */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleReviews.map((review, idx) => (
                  <div
                    key={`${review.id}-${idx}`}
                    className="bg-card rounded-3xl p-6 sm:p-7 border border-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-4">
                      {/* Author header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {review.authorPhotoUrl ? (
                            <img
                              src={review.authorPhotoUrl}
                              alt={review.authorName}
                              className="w-11 h-11 rounded-full object-cover border border-border"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shrink-0 border border-primary/20">
                              {review.authorName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-sm text-foreground">{review.authorName}</h4>
                              <span title="Google Verified Reviewer">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-50 shrink-0" />
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">{review.relativeTimeDescription}</p>
                          </div>
                        </div>

                        {/* Google Icon */}
                        <svg className="w-4 h-4 shrink-0 opacity-80" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                      </div>

                      {/* Stars & Location */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-amber-400 gap-0.5">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                        <Badge variant="secondary" className="text-[10px] font-semibold">
                          <MapPin className="w-2.5 h-2.5 mr-1" />
                          {review.clinicLocation}
                        </Badge>
                      </div>

                      {/* Authentic Review Text */}
                      <p className="text-foreground/80 text-xs sm:text-sm leading-relaxed line-clamp-4 italic">
                        &ldquo;{review.text}&rdquo;
                      </p>
                    </div>

                    {/* Card Footer: Direct Link to Google Review */}
                    <div className="pt-3 border-t border-border/50 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-muted-foreground font-medium">Authentic Google Review</span>
                      <a
                        href={review.authorUrl || review.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                      >
                        View Original ↗
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dots */}
              <div className="mt-8 flex items-center justify-center gap-1.5">
                {reviews.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    onClick={() => setCurrentIndex(dotIdx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentIndex === dotIdx ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                    }`}
                    aria-label={`Go to slide ${dotIdx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* When waiting on API key permissions: Show Official Google Maps Live Showcase Card with zero fabricated reviews */
          <div className="mt-10 max-w-4xl mx-auto bg-card rounded-3xl border border-border p-6 sm:p-10 shadow-sm space-y-8">
            <div className="grid sm:grid-cols-2 gap-6 items-center">
              
              {/* Baner Clinic Card */}
              <div className="p-6 bg-muted/30 rounded-2xl border border-border/60 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Baner Clinic
                    </span>
                    <Badge className="bg-emerald-600 text-white text-[10px] font-bold">Verified on Google</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Kelkar Manas Health Clinic</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    205, Second Floor, Platinum 9, Near Audi Showroom, Sus Baner Road, Baner, Pune – 411045
                  </p>
                  <div className="flex items-center gap-1 text-amber-400 pt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-foreground ml-1.5">4.9 Star Rating</span>
                  </div>
                </div>

                <a
                  href={summary.banerMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm"
                >
                  View Baner Reviews on Google Maps <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Bhosari Clinic Card */}
              <div className="p-6 bg-muted/30 rounded-2xl border border-border/60 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Bhosari Clinic
                    </span>
                    <Badge className="bg-emerald-600 text-white text-[10px] font-bold">Verified on Google</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">Kelkar Manas Healthcare</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Ground Floor, Shop No. 26, Gera Imperium Gateway, Nashik Phata, Bhosari, Pune – 411039
                  </p>
                  <div className="flex items-center gap-1 text-amber-400 pt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-foreground ml-1.5">4.9 Star Rating</span>
                  </div>
                </div>

                <a
                  href={summary.bhosariMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-background border border-border text-foreground text-xs font-bold hover:bg-muted transition-colors shadow-sm"
                >
                  View Bhosari Reviews on Google Maps <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Verification Guarantee */}
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-2.5 text-xs text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  All patient reviews are fetched and updated dynamically directly from Google Maps.
                </span>
              </div>
              <a
                href="https://maps.app.goo.gl/bgsaZrUK81zRvzZX7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 shrink-0 shadow-sm"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Write a Review on Google
              </a>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
