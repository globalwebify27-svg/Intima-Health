"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/useCart";
import { ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBookingModal } from "@/store/useBookingModal";
import { NAV_ITEMS } from "@/constants/navigation";

const ListItem = React.forwardRef<
  React.ElementRef<typeof Link>,
  React.ComponentPropsWithoutRef<typeof Link> & { title: string }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <Link
        ref={ref}
        href={href}
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary/5 hover:text-primary focus:bg-primary/5 focus:text-primary",
          className
        )}
        {...props}
      >
        <div className="text-sm font-semibold leading-none">{title}</div>
        {children && (
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
            {children}
          </p>
        )}
      </Link>
    </li>
  );
});
ListItem.displayName = "ListItem";

export function Header() {
  const router = useRouter();
  const { openCart, items } = useCart();
  const { openBooking } = useBookingModal();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
  const [isCheckingCartAuth, setIsCheckingCartAuth] = useState(false);
  const [navItems, setNavItems] = useState(NAV_ITEMS);

  useEffect(() => {
    const fetchDynamicNav = async () => {
      try {
        const [treatmentsRes, sexualRes] = await Promise.all([
          fetch("/api/admin/content/treatments?type=treatment"),
          fetch("/api/admin/content/treatments?type=sexual-problem")
        ]);
        
        const treatmentsJson = await treatmentsRes.json();
        const sexualJson = await sexualRes.json();
        
        if (treatmentsJson.success && sexualJson.success) {
          setNavItems(prev => prev.map(group => {
            if (group.title === "Treatments") {
              const dynamicItems = treatmentsJson.data.map((t: any) => ({
                title: t.title,
                href: `/treatments/${t.slug}`,
                description: t.heroSubtext || t.badge || "Clinical treatment care."
              }));
              const footerItems = group.items?.filter(i => i.isFooterLink) || [];
              return { ...group, items: [...dynamicItems, ...footerItems] };
            }
            if (group.title === "Sexual Problems") {
              const dynamicItems = sexualJson.data.map((t: any) => ({
                title: t.title,
                href: `/sexual-problems/${t.slug}`,
                description: t.heroSubtext || t.badge || "Medical advice and guidance."
              }));
              const footerItems = group.items?.filter(i => i.isFooterLink) || [];
              return { ...group, items: [...dynamicItems, ...footerItems] };
            }
            return group;
          }));
        }
      } catch (error) {
        console.error("Failed to fetch dynamic navigation", error);
      }
    };
    
    fetchDynamicNav();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <div className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <img src="/logo.png" alt="KELKAR MANAS HEALTH CLINIC" className="h-20 w-auto object-contain" />
            </Link>

            <NavigationMenu className="hidden xl:flex">
              <NavigationMenuList className="gap-1">
                {navItems.map((group) => {
                  if (!group.items || group.items.length === 0) {
                    return (
                      <NavigationMenuItem key={group.title}>
                        <Link
                          href={group.href || "#"}
                          className={cn(
                            navigationMenuTriggerStyle(),
                            "bg-transparent text-foreground/80 hover:text-primary font-semibold transition-colors"
                          )}
                        >
                          {group.title}
                        </Link>
                      </NavigationMenuItem>
                    );
                  }

                  const mainItems = group.items.filter((item) => !item.isFooterLink);
                  const footerItems = group.items.filter((item) => item.isFooterLink);

                  return (
                    <NavigationMenuItem key={group.title}>
                      <NavigationMenuTrigger
                        onClick={() => group.href && router.push(group.href)}
                        className="bg-transparent text-foreground/80 hover:text-primary font-semibold transition-colors cursor-pointer"
                      >
                        {group.title}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul
                          className={cn(
                            "grid gap-2 p-4",
                            group.widthClass || "w-[300px]",
                            group.gridCols || "grid-cols-1"
                          )}
                        >
                          {mainItems.map((sub) => (
                            <ListItem
                              key={sub.title}
                              href={sub.href}
                              title={sub.title}
                              onClick={
                                sub.actionKey === "openBooking"
                                  ? (e) => {
                                      e.preventDefault();
                                      openBooking();
                                    }
                                  : undefined
                              }
                              className={sub.className}
                            >
                              {sub.description}
                            </ListItem>
                          ))}

                          {footerItems.length > 0 && (
                            <div
                              className={cn(
                                "pt-3 mt-1 border-t border-border/50",
                                group.gridCols?.includes("cols-") ? "md:col-span-full text-center" : ""
                              )}
                            >
                              {footerItems.map((footerSub) => (
                                <div key={footerSub.title}>
                                  {footerSub.description ? (
                                    <ListItem
                                      href={footerSub.href}
                                      title={footerSub.title}
                                      className={footerSub.className}
                                    >
                                      {footerSub.description}
                                    </ListItem>
                                  ) : (
                                    <Link
                                      href={footerSub.href}
                                      className="inline-flex items-center text-sm font-semibold text-primary hover:underline transition-all"
                                    >
                                      {footerSub.title} <span className="ml-1">&rarr;</span>
                                    </Link>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              className="xl:hidden p-2 text-foreground/80 hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden sm:flex items-center gap-6">
              <Link href="/login" className="text-sm font-semibold text-foreground/80 hover:text-primary transition-colors">
                Log in
              </Link>
              <button
                onClick={() => openBooking()}
                className={cn(buttonVariants({ size: "lg" }), "rounded-full px-6 py-3 text-sm font-semibold shadow-sm hover:shadow-md transition-all")}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm xl:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[101] w-[85%] max-w-sm bg-background border-l border-border shadow-2xl flex flex-col xl:hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <img src="/logo.png" alt="KELKAR MANAS HEALTH CLINIC" className="h-20 w-auto object-contain" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2">
                <nav className="flex flex-col text-lg font-medium">
                  {navItems.map((group) => {
                    if (!group.items || group.items.length === 0) {
                      return (
                        <div key={group.title} className="border-b border-border/50">
                          <Link
                            href={group.href || "#"}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex py-4 text-lg font-medium hover:text-primary transition-colors"
                          >
                            {group.title}
                          </Link>
                        </div>
                      );
                    }

                    return (
                      <MobileNavGroup key={group.title} title={group.title}>
                        {group.items.map((sub) => {
                          if (sub.actionKey === "openBooking") {
                            return (
                              <button
                                key={sub.title}
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  openBooking();
                                }}
                                className="py-2 hover:text-primary text-left transition-colors"
                              >
                                {sub.title}
                              </button>
                            );
                          }

                          if (sub.isFooterLink) {
                            return (
                              <Link
                                key={sub.title}
                                href={sub.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="py-2 font-semibold text-primary hover:underline transition-colors mt-2 border-t border-border/30 pt-2"
                              >
                                {sub.title} &rarr;
                              </Link>
                            );
                          }

                          return (
                            <Link
                              key={sub.title}
                              href={sub.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="py-2 hover:text-primary transition-colors"
                            >
                              {sub.title}
                            </Link>
                          );
                        })}
                      </MobileNavGroup>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6 border-t border-border bg-muted/30 flex flex-col gap-4">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-full py-6 text-base">
                    Log In
                  </Button>
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openBooking();
                  }}
                  className={cn(buttonVariants(), "w-full rounded-full py-6 text-base font-semibold shadow-sm hover:shadow-md transition-all")}
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileNavGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-border/50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-lg font-medium hover:text-primary transition-colors"
      >
        {title}
        <ChevronDown className={cn("w-5 h-5 transition-transform duration-300", isOpen ? "rotate-180" : "")} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col py-2 pl-4 text-base text-muted-foreground border-l-2 border-border/30 ml-2 mb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
