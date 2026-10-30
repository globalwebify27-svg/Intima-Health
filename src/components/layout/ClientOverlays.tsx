"use client";

import dynamic from "next/dynamic";

const CartDrawer = dynamic(
  () => import("@/components/layout/CartDrawer").then((mod) => mod.CartDrawer),
  { ssr: false }
);

const BookingModal = dynamic(
  () => import("@/components/layout/BookingModal").then((mod) => mod.BookingModal),
  { ssr: false }
);

export function ClientOverlays() {
  return (
    <>
      <CartDrawer />
      <BookingModal />
    </>
  );
}

