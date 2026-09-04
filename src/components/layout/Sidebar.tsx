"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, LogOut, Settings } from "lucide-react";
import { useBookingModal } from "@/store/useBookingModal";

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

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-card">
      <div className="flex h-16 items-center px-6 border-b border-border">
        <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-foreground">
          Intima<span className="font-sans text-primary font-semibold">Health</span>
        </Link>
      </div>
      <div className="px-6 py-4">
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
          {roleName} Portal
        </div>
      </div>
      <ScrollArea className="flex-1 px-4">
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
      </ScrollArea>
      <div className="p-4 mt-auto border-t border-border">
        <div className="flex flex-col gap-2">
          {roleName === "Patient" && (
            <Button onClick={() => openBooking()} className="w-full rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-sm h-11 mb-2">
              Book Appointment
            </Button>
          )}
          {roleName !== "Patient" && (
            <Link
              href={`${basePath}/settings`}
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
      <div className="lg:hidden flex h-16 items-center px-4 border-b border-border bg-card fixed top-0 w-full z-40 shadow-sm justify-between">
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="mr-1" />}>
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">Access your dashboard links here</SheetDescription>
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <Link href="/" className="font-serif text-lg font-bold tracking-tight text-foreground ml-1">
            Intima<span className="font-sans text-primary font-semibold">Health</span>
          </Link>
        </div>

        {(clinicName || clinicLocation) && (
          <div className="flex items-center gap-1.5 text-[10px] bg-muted/60 border border-border px-2 py-1 rounded-xl shadow-sm">
            <span className="text-foreground font-bold max-w-[80px] sm:max-w-[120px] truncate">{clinicName || "Intima Health"}</span>
            <span className="text-[9px] font-bold text-muted-foreground bg-card border border-border px-1.5 py-0.5 rounded-full shrink-0">
              {clinicLocation || "Global"}
            </span>
          </div>
        )}
      </div>
    </>
  );
}
