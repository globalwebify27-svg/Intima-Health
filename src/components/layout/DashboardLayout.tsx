"use client";

import { useEffect, useState } from "react";
import { Sidebar, SidebarLink } from "./Sidebar";
import { Bell, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
  links: SidebarLink[];
  roleName: string;
  basePath: string;
}

export function DashboardLayout({ children, links, roleName, basePath }: DashboardLayoutProps) {
  const [clinicName, setClinicName] = useState("");
  const [clinicLocation, setClinicLocation] = useState("");

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meJson = await meRes.json();
        if (meJson.success && meJson.user.clinicId) {
          const clinicRes = await fetch(`/api/clinics/${meJson.user.clinicId}`);
          const clinicJson = await clinicRes.json();
          if (clinicJson.success) {
            setClinicName(clinicJson.data.name);
            setClinicLocation(clinicJson.data.city);
          }
        }
      } catch (err) {
        console.error("Failed to load clinic header details:", err);
      }
    };
    fetchClinic();
  }, []);

  return (
    <div className="min-h-screen bg-muted/20">
      <Sidebar links={links} roleName={roleName} basePath={basePath} />
      
      <div className="flex flex-col lg:pl-72">
        {/* Top Header */}
        <header className="hidden lg:flex h-16 items-center justify-between px-8 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2 text-sm bg-muted/60 border border-border px-3.5 py-1.5 rounded-2xl shadow-sm">
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <span className="text-foreground font-bold">{clinicName || "Pune Intimacy Clinic"}</span>
              <span className="text-xs font-bold text-muted-foreground bg-card border border-border px-2 py-0.5 rounded-full">
                {clinicLocation || "Pune"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
            </Button>
            <div className="h-8 w-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
              <User className="h-4 w-4" />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-24 lg:pt-8 min-h-screen">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
