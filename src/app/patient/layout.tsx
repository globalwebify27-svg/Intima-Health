"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BookingModal } from "@/components/layout/BookingModal";
import { LayoutDashboard, Calendar, Pill, ShoppingBag, UserCircle } from "lucide-react";

const patientLinks = [
  { title: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
  { title: "My Profile", href: "/patient/profile", icon: UserCircle },
  { title: "Appointments", href: "/patient/appointments", icon: Calendar },
  { title: "Prescriptions & Medicines", href: "/patient/prescriptions", icon: Pill },
  { title: "Medicine Orders", href: "/patient/orders", icon: ShoppingBag },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout links={patientLinks} roleName="Patient" basePath="/patient">
      {children}
        <BookingModal />
    </DashboardLayout>
  );
}
