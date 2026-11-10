"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, LogOut, Settings } from "lucide-react";
import { useBookingModal } from "@/store/useBookingModal";
import { NotificationBell } from "./NotificationBell";

export interface SidebarLink {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  links: SidebarLink[];
  roleName: string;
  basePath: string;
  clinicName?: string;
  clinicLocation?: string;
}

export function Sidebar({ links, roleName, basePath, clinicName, clinicLocation }: SidebarProps) {
  const pathname = usePathname();
  const { openBooking } = useBookingModal();
  const [logoUrl, setLogoUrl] = useState("/logo.png");
  const [openMobile, setOpenMobile] = useState(false);

  // Automatically close mobile sidebar whenever route changes
  useEffect(() => {
    setOpenMobile(false);
  }, [pathname]);

  useEffect(() => {
    fetch("/api/public/settings/branding")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.logoUrl) {
          setLogoUrl(json.data.logoUrl);
        }
      })
      .catch(() => {});

    const handleBranding = (e: any) => {
      if (e.detail?.logoUrl) {
        setLogoUrl(e.detail.logoUrl);
      }
    };
    window.addEventListener("branding_updated", handleBranding);
    return () => window.removeEventListener("branding_updated", handleBranding);
  }, []);

  const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="flex h-full flex-col bg-card overflow-hidden">
      <div className="flex py-6 items-center justify-center border-b border-border shrink-0">
        <Link href="/" className="flex items-center" onClick={onNavigate}>
          <Image src={logoUrl || "/logo.png"} alt="Kelkar Manas Health Clinic" width={180} height={50} className="object-contain" priority />
        </Link>
      </div>
      <div className="px-6 py-4 shrink-0">
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
          {roleName} Portal
        </div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 px-4 pb-8">
        <nav className="flex flex-col gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            // Strict match for dashboard home, startsWith for subpages
            const isActive = link.href === basePath
              ? pathname === link.href
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {link.title}
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-8 pt-4 border-t border-border flex flex-col gap-2">
          {roleName === "Patient" && (
            <Button 
              onClick={() => {
                if (onNavigate) onNavigate();
                openBooking();
              }} 
              className="w-full rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-sm h-11 mb-2"
            >
              Book Appointment
            </Button>
          )}
          {roleName !== "Patient" && !links.some((l) => l.href === `${basePath}/settings` || l.href.startsWith(`${basePath}/settings`)) && (
            <Link
              href={`${basePath}/settings`}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                pathname.startsWith(`${basePath}/settings`)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>
          )}
          <button
            onClick={async () => {
              if (onNavigate) onNavigate();
              try {
                await fetch("/api/auth/logout", { method: "POST" });
                window.location.href = roleName === "Patient" ? "/" : "/staff-login";
              } catch (err) {
                console.error("Logout failed", err);
              }
            }}
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex h-screen w-72 flex-col fixed inset-y-0 left-0 z-50 bg-card border-r border-border shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <div className="lg:hidden flex h-16 items-center px-3 sm:px-4 border-b border-border bg-card fixed top-0 inset-x-0 z-40 shadow-sm justify-between gap-2 max-w-full overflow-hidden">
        <div className="flex items-center min-w-0">
          <Sheet open={openMobile} onOpenChange={setOpenMobile}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="mr-1 shrink-0" />}>
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">Access your dashboard links here</SheetDescription>
              <SidebarContent onNavigate={() => setOpenMobile(false)} />
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center ml-1 sm:ml-2 shrink-0">
            <Image src={logoUrl || "/logo.png"} alt="Kelkar Manas Health Clinic" width={120} height={30} className="h-8 w-auto object-contain" priority />
          </Link>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 min-w-0">
          {(clinicName || clinicLocation) && (
            <div className="hidden xs:flex sm:flex items-center gap-1.5 text-[10px] bg-muted/60 border border-border px-2 py-1 rounded-xl shadow-sm max-w-[140px]">
              <span className="text-foreground font-bold truncate">{clinicName || "KELKAR MANAS"}</span>
              <span className="text-[9px] font-bold text-muted-foreground bg-card border border-border px-1.5 py-0.5 rounded-full shrink-0">
                {clinicLocation || "Global"}
              </span>
            </div>
          )}
          <NotificationBell />
        </div>
      </div>
    </>
  );
}
