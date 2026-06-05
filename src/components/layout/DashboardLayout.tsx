"use client";

import { Sidebar, SidebarLink } from "./Sidebar";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: React.ReactNode;
  links: SidebarLink[];
  roleName: string;
  basePath: string;
}

export function DashboardLayout({ children, links, roleName, basePath }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/20">
      <Sidebar links={links} roleName={roleName} basePath={basePath} />
      
      <div className="flex flex-col lg:pl-72">
        {/* Top Header */}
        <header className="hidden lg:flex h-16 items-center justify-end px-8 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
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
