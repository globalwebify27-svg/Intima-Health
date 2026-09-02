"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { LayoutDashboard, Users, Calendar, Video, FileSignature, Clock, Settings } from "lucide-react";

const doctorLinks = [
  { title: "Dashboard", href: "/doctor/dashboard", icon: LayoutDashboard },
  { title: "My Patients", href: "/doctor/patients", icon: Users },
  { title: "Appointments", href: "/doctor/appointments", icon: Calendar },
  { title: "Prescriptions", href: "/doctor/prescriptions", icon: FileSignature },
  { title: "Availability", href: "/doctor/availability", icon: Clock },
];

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout links={doctorLinks} roleName="Doctor" basePath="/doctor">
      {children}
    </DashboardLayout>
  );
}
