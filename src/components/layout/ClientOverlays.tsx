"use client";

import dynamic from "next/dynamic";

const BookingModal = dynamic(
  () => import("@/components/layout/BookingModal").then((mod) => mod.BookingModal),
  { ssr: false }
);

export function ClientOverlays() {
  return (
    <>
      <BookingModal />
    </>
  );
}

