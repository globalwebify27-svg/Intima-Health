"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Activity, CalendarDays, User, VenusAndMars } from "lucide-react";
import { cn } from "@/lib/utils";
import { useBookingModal } from "@/store/useBookingModal";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Treatments",
    href: "/treatments",
    icon: Activity,
  },
  {
    label: "Book",
    href: "/booking",
    icon: CalendarDays,
  },
  {
    label: "Sexual Problems",
    href: "/sexual-problems",
    icon: VenusAndMars,
  },
  {
    label: "Log in",
    href: "/login",
    icon: User,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { openBooking } = useBookingModal();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-border/50 pb-safe pt-1.5 px-2 sm:px-4 shadow-[0_-10px_40px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          if (item.label === "Book") {
            return (
              <button
                key={item.href}
                onClick={() => openBooking()}
                className="relative flex flex-col items-center justify-end pb-0.5 w-14 h-14 transition-all duration-200 border-none bg-transparent outline-none cursor-pointer"
              >
                <div className="absolute -top-5 flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transform hover:scale-105 active:scale-95 transition-all duration-300">
                  <Icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <span className="text-[10px] font-bold text-primary tracking-tight whitespace-nowrap">
                  Book Now
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-start pt-1 w-14 min-h-[56px] rounded-xl transition-all duration-200",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 shrink-0",
                isActive ? "bg-primary/10" : "bg-transparent"
              )}>
                <Icon 
                  className={cn("w-5 h-5", isActive && "fill-primary/20")} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
              </div>
              <span className={cn(
                "text-[9px] font-semibold text-center leading-[1.1] tracking-tight line-clamp-2 px-0.5",
                isActive ? "text-primary font-bold" : "font-medium"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
