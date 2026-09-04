"use client";

import React from "react";
import { useBookingModal } from "@/store/useBookingModal";

interface BookNowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  prefilledData?: any;
}

export function BookNowButton({ children, className, prefilledData, ...props }: BookNowButtonProps) {
  const { openBooking } = useBookingModal();

  return (
    <button
      onClick={() => openBooking(prefilledData)}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}
