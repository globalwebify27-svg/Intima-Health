"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, Users, UserPlus, Calendar, ShoppingBag, Settings, FileText, BarChart3 } from "lucide-react";

const adminLinks = [
  { title: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Doctors", href: "/admin/doctors", icon: UserPlus },
  { title: "Patients", href: "/admin/patients", icon: Users },
  { title: "Appointments", href: "/admin/appointments", icon: Calendar },
  { title: "Pharmacy Orders", href: "/admin/orders", icon: ShoppingBag },
  { title: "Content", href: "/admin/content", icon: FileText },
  { title: "Reports", href: "/admin/reports", icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout links={adminLinks} roleName="Admin" basePath="/admin">
      {children}
    </DashboardLayout>
  );
}
