"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, Calendar, Users, Pill, CreditCard, Activity } from "lucide-react";

const clinicManagerLinks = [
  { title: "Dashboard", href: "/clinic-manager/dashboard", icon: LayoutDashboard },
  { title: "Appointments", href: "/clinic-manager/appointments", icon: Calendar },
  { title: "Patients", href: "/clinic-manager/patients", icon: Users },
  { title: "Prescriptions", href: "/clinic-manager/prescriptions", icon: Pill },
  { title: "Payments", href: "/clinic-manager/payments", icon: CreditCard },
  { title: "Therapies Offered", href: "/clinic-manager/services", icon: Activity },
];

export default function ClinicManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout links={clinicManagerLinks} roleName="Clinic Manager" basePath="/clinic-manager">
      {children}
    </DashboardLayout>
  );
}
