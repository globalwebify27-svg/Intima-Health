"use client";

import { useEffect, useState } from "react";
import { Sidebar, SidebarLink } from "./Sidebar";
import { Bell, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookingModal } from "@/store/useBookingModal";

interface DashboardLayoutProps {
  children: React.ReactNode;
  links: SidebarLink[];
  roleName: string;
  basePath: string;
}

export function DashboardLayout({ children, links, roleName, basePath }: DashboardLayoutProps) {
  const [clinicName, setClinicName] = useState("");
  const [clinicLocation, setClinicLocation] = useState("");
  const { openBooking } = useBookingModal();

  useEffect(() => {
    const fetchClinic = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meJson = await meRes.json();
        
        let clinicIdToFetch = null;

        if (meJson.success && meJson.user.clinicId) {
          clinicIdToFetch = meJson.user.clinicId;
        } else if (meJson.success && meJson.user.role === 'PATIENT' && meJson.user.patientId) {
          // If patient doesn't have a direct clinicId, get it from their latest appointment
          const aptRes = await fetch(`/api/appointments?patientId=${meJson.user.patientId}`);
          const aptJson = await aptRes.json();
          if (aptJson.success && aptJson.data.length > 0) {
            // Sort to get most recent
            const sorted = aptJson.data.sort((a: any, b: any) => 
              new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()
            );
            const latestApt = sorted[0];
            if (latestApt.doctorId && latestApt.doctorId.clinicId) {
              clinicIdToFetch = latestApt.doctorId.clinicId;
            }
          }
        }

        if (clinicIdToFetch) {
          const clinicRes = await fetch(`/api/clinics/${clinicIdToFetch}`);
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
      <Sidebar links={links} roleName={roleName} basePath={basePath} clinicName={clinicName} clinicLocation={clinicLocation} />
      
      <div className="flex flex-col lg:pl-72">
        {/* Top Header */}
        <header className="hidden lg:flex h-16 items-center justify-between px-8 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2 text-sm bg-muted/60 border border-border px-3.5 py-1.5 rounded-2xl shadow-sm">
              <Building2 className="w-4 h-4 text-primary shrink-0" />
              <span className="text-foreground font-bold">{clinicName || "Intima Health"}</span>
              <span className="text-xs font-bold text-muted-foreground bg-card border border-border px-2 py-0.5 rounded-full">
                {clinicLocation || "Global"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {roleName === "Patient" && (
              <Button onClick={openBooking} className="hidden sm:flex rounded-full px-5 font-bold bg-primary hover:bg-primary/90 text-white shadow-sm text-xs">
                Book Appointment
              </Button>
            )}
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
