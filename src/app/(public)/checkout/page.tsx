"use client";

import { Suspense, useEffect } from "react";
import { CheckoutForm } from "@/components/pharmacy/CheckoutForm";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
      <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
      <p className="text-sm text-muted-foreground font-medium">Loading secure checkout...</p>
    </div>
  );
}

function PublicCheckoutWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // If a logged-in patient accesses checkout, seamlessly guide them to their patient dashboard checkout
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && data.user.role === "PATIENT") {
          const qs = searchParams.toString();
          router.replace(`/patient/checkout${qs ? `?${qs}` : ""}`);
        }
      })
      .catch(() => {});
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-muted/20 pb-32 sm:pb-16">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        <CheckoutForm isDashboard={false} />
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <PublicCheckoutWrapper />
    </Suspense>
  );
}
