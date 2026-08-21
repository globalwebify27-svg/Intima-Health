"use client";

import React from "react";
import { useBookingModal } from "@/store/useBookingModal";

interface BookNowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function BookNowButton({ children, className, ...props }: BookNowButtonProps) {
  const { openBooking } = useBookingModal();

  return (
    <button
      onClick={() => openBooking()}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}
