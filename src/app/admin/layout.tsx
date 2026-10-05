"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, Users, Building2, Calendar, ShoppingBag, Settings, FileText, BarChart3, Activity, Mail, MessageSquare } from "lucide-react";

const adminLinks = [
  { title: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Clinics", href: "/admin/clinics", icon: Building2 },
  { title: "Staff Directory", href: "/admin/staff", icon: Users },
  { title: "Platform Services", href: "/admin/services", icon: Activity },
  // { title: "Pharmacy Store", href: "/admin/store", icon: ShoppingBag },
  { title: "Content", href: "/admin/content", icon: FileText },
  { title: "Reports", href: "/admin/reports", icon: BarChart3 },
  { title: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { title: "Contact Form", href: "/admin/contact", icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout links={adminLinks} roleName="Admin" basePath="/admin">
      {children}
    </DashboardLayout>
  );
}
