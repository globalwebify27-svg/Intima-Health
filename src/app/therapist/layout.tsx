"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, Users, Calendar, Clock, HeartHandshake } from "lucide-react";

const therapistLinks = [
  { title: "Dashboard", href: "/therapist/dashboard", icon: LayoutDashboard },
  { title: "Sessions", href: "/therapist/sessions", icon: Calendar },
  { title: "My Patients", href: "/therapist/patients", icon: Users },
  { title: "Availability", href: "/therapist/availability", icon: Clock },
];

export default function TherapistLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout links={therapistLinks} roleName="Therapist" basePath="/therapist">
      {children}
    </DashboardLayout>
  );
}
