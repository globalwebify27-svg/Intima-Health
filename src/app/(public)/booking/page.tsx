"use client";

import { useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useBookingModal, AppointmentBookingType } from "@/store/useBookingModal";

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openBooking, isOpen } = useBookingModal();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      const typeParam = searchParams.get("type")?.toLowerCase();
      let appointmentType: AppointmentBookingType | undefined;
      if (typeParam === "online" || typeParam === "video") {
        appointmentType = "online";
      } else if (typeParam === "walk-in" || typeParam === "walkin" || typeParam === "physical") {
        appointmentType = "walk-in";
      }

      openBooking({ appointmentType });
      initialized.current = true;
    }
  }, [openBooking, searchParams]);

  useEffect(() => {
    // If modal is closed after being initialized, redirect to home
    if (initialized.current && !isOpen) {
      router.replace("/");
    }
  }, [isOpen, router]);

  return (
    <div className="min-h-screen bg-muted/20 text-foreground pt-24 pb-20 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">Opening booking wizard...</p>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-muted/20 text-foreground pt-24 pb-20 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground text-sm font-medium animate-pulse">Loading booking...</p>
          </div>
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}

