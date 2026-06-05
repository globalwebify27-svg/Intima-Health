"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, ShoppingBag, Pill, PackageSearch, Settings } from "lucide-react";

const pharmacyLinks = [
  { title: "Dashboard", href: "/pharmacy/dashboard", icon: LayoutDashboard },
  { title: "Active Orders", href: "/pharmacy/orders", icon: ShoppingBag },
  { title: "Prescriptions", href: "/pharmacy/prescriptions", icon: Pill },
  { title: "Inventory", href: "/pharmacy/inventory", icon: PackageSearch },
];

export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout links={pharmacyLinks} roleName="Pharmacy" basePath="/pharmacy">
      {children}
    </DashboardLayout>
  );
}
