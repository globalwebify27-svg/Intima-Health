"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useBookingModal } from "@/store/useBookingModal";

export default function BookingPage() {
  const router = useRouter();
  const { openBooking, isOpen } = useBookingModal();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      openBooking();
      initialized.current = true;
    }
  }, [openBooking]);

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
