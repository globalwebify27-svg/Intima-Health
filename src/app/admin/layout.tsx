"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, Users, Building2, ShoppingBag, Settings, FileText, BarChart3, Activity, Mail, MessageSquare } from "lucide-react";

const adminLinks = [
  { title: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Clinics", href: "/admin/clinics", icon: Building2 },
  { title: "De-Addiction Hospitals", href: "/admin/hospitals", icon: Building2 },
  { title: "Staff Directory", href: "/admin/staff", icon: Users },
  { title: "Platform Services", href: "/admin/services", icon: Activity },
  { title: "Medicine Orders", href: "/admin/orders", icon: ShoppingBag },
  { title: "Pharmacy Catalog", href: "/admin/store", icon: ShoppingBag },
  { title: "Payments", href: "/admin/payments", icon: Activity },
  { title: "Content", href: "/admin/content", icon: FileText },
  { title: "Reports", href: "/admin/reports", icon: BarChart3 },
  { title: "Settings & Coverage", href: "/admin/settings", icon: Settings },
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
