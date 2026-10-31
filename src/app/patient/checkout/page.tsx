"use client";

import { Suspense } from "react";
import { CheckoutForm } from "@/components/pharmacy/CheckoutForm";
import { Loader2 } from "lucide-react";

function CheckoutLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-muted-foreground p-8">
      <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
      <p className="text-sm font-medium">Loading checkout & prescription details...</p>
    </div>
  );
}

export default function PatientCheckoutPage() {
  return (
    <Suspense fallback={<CheckoutLoading />}>
      <CheckoutForm isDashboard={true} />
    </Suspense>
  );
}

