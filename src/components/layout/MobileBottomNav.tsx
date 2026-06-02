"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Activity, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Conditions",
    href: "/conditions",
    icon: Activity,
  },
  {
    label: "Specialists",
    href: "/specialists",
    icon: Users,
  },
  {
    label: "Log in",
    href: "/login",
    icon: User,
  },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-border/50 pb-safe pt-2 px-4 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
                isActive ? "bg-primary/10" : "bg-transparent"
              )}>
                <Icon 
                  className={cn("w-5 h-5", isActive && "fill-primary/20")} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
              </div>
              <span className={cn(
                "text-[10px] font-semibold tracking-wide",
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
