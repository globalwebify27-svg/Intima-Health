"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, Calendar, FileText, Pill, ShoppingBag, Settings, UserCircle } from "lucide-react";

const patientLinks = [
  { title: "Dashboard", href: "/patient/dashboard", icon: LayoutDashboard },
  { title: "My Profile", href: "/patient/profile", icon: UserCircle },
  { title: "Appointments", href: "/patient/appointments", icon: Calendar },
  { title: "Medical Records", href: "/patient/records", icon: FileText },
  { title: "Prescriptions", href: "/patient/prescriptions", icon: Pill },
  { title: "Orders", href: "/patient/orders", icon: ShoppingBag },
];

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout links={patientLinks} roleName="Patient" basePath="/patient">
      {children}
    </DashboardLayout>
  );
}
