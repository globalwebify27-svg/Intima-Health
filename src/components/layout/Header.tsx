"use client";

import Link from "next/link";
import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, ChevronDown, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useBookingModal } from "@/store/useBookingModal";
import { NAV_ITEMS, NavSubItem } from "@/constants/navigation";

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

interface DynamicNavItem {
  slug: string;
  title: string;
  heroSubtext?: string;
  badge?: string;
}

interface DynamicNavData {
  treatments: DynamicNavItem[];
  sexualProblems: DynamicNavItem[];
  logoUrl?: string;
}

// Client-side in-memory cache for dynamic navigation to avoid re-fetching on every page transition
let cachedNavData: DynamicNavData | null = null;
let navFetchPromise: Promise<DynamicNavData | null> | null = null;

function mergeNavItems(defaultNav: typeof NAV_ITEMS, data: DynamicNavData) {
  const treatments = data.treatments || [];
  const sexualProblems = data.sexualProblems || [];

  return defaultNav.map(group => {
    if (group.title === "Treatments") {
      const defaultItems = defaultNav.find(g => g.title === "Treatments")?.items || [];
      const existingHrefs = new Set(defaultItems.map(item => item.href));
      const existingTitles = new Set(defaultItems.map(item => item.title.trim().toLowerCase()));
      const dynamicMap = new Map(treatments.map((t) => [`/treatments/${t.slug}`, t]));

      const mergedItems: NavSubItem[] = defaultItems.map(item => {
        const dynamic = dynamicMap.get(item.href);
        if (dynamic) {
          return {
            ...item,
            title: dynamic.title || item.title,
            description: dynamic.heroSubtext || item.description,
          };
        }
        return item;
      });

      const extraItems: NavSubItem[] = treatments
        .filter((t) => {
          const href = `/treatments/${t.slug}`;
          const titleLower = (t.title || "").trim().toLowerCase();
          if (existingHrefs.has(href) || existingTitles.has(titleLower)) return false;
          if (t.slug === "sexual-health-problems" || href === "/sexual-problems") return false;
          return true;
        })
        .map((t) => ({
          title: t.title,
          href: `/treatments/${t.slug}`,
          description: t.heroSubtext || t.badge || "Clinical treatment care.",
        }));

      return { ...group, items: [...mergedItems, ...extraItems] };
    }

    if (group.title === "Sexual Problems") {
      const defaultItems = defaultNav.find(g => g.title === "Sexual Problems")?.items || [];
      const existingHrefs = new Set(defaultItems.map(item => item.href));
      const existingTitles = new Set(defaultItems.map(item => item.title.trim().toLowerCase()));
      const dynamicMap = new Map(sexualProblems.map((t) => [`/sexual-problems/${t.slug}`, t]));

      const mergedItems: NavSubItem[] = defaultItems.map(item => {
        const dynamic = dynamicMap.get(item.href);
        if (dynamic) {
          return {
            ...item,
            title: dynamic.title || item.title,
            description: dynamic.heroSubtext || item.description,
          };
        }
        return item;
      });

      const extraItems: NavSubItem[] = sexualProblems
        .filter((t) => {
          const href = `/sexual-problems/${t.slug}`;
          const titleLower = (t.title || "").trim().toLowerCase();
          if (existingHrefs.has(href) || existingTitles.has(titleLower)) return false;
          return true;
        })
        .map((t) => ({
          title: t.title,
          href: `/sexual-problems/${t.slug}`,
          description: t.heroSubtext || t.badge || "Medical advice and guidance.",
        }));

      return { ...group, items: [...mergedItems, ...extraItems] };
    }

    return group;
  });
}

export function Header() {
  const router = useRouter();
  const { openBooking } = useBookingModal();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState(() => {
    return cachedNavData ? mergeNavItems(NAV_ITEMS, cachedNavData) : NAV_ITEMS;
  });
  const [logoUrl, setLogoUrl] = useState(() => cachedNavData?.logoUrl || "/logo.png");
  const [authUser, setAuthUser] = useState<{ name?: string; role?: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setAuthUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleBranding = (e: Event) => {
      const customEvent = e as CustomEvent<{ logoUrl?: string }>;
      if (customEvent.detail?.logoUrl) {
        setLogoUrl(customEvent.detail.logoUrl);
        if (cachedNavData) cachedNavData.logoUrl = customEvent.detail.logoUrl;
      }
    };
    window.addEventListener("branding_updated", handleBranding);
    return () => window.removeEventListener("branding_updated", handleBranding);
  }, []);

  useEffect(() => {
    if (cachedNavData) {
      return;
    }

    if (!navFetchPromise) {
      navFetchPromise = fetch("/api/public/navigation")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            cachedNavData = json.data;
            return json.data;
          }
          return null;
        })
        .catch((error) => {
          console.error("Failed to fetch dynamic navigation", error);
          navFetchPromise = null;
          return null;
        });
    }

    navFetchPromise.then((data) => {
      if (data) {
        setNavItems(mergeNavItems(NAV_ITEMS, data));
        if (data.logoUrl) {
          setLogoUrl(data.logoUrl);
        }
      }
    });
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
        <div className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src={logoUrl || "/logo.png"}
                alt="KELKAR MANAS HEALTH CLINIC"
                width={180}
                height={80}
                className="h-20 w-auto object-contain"
                priority
              />
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
                          {mainItems.map((sub, idx) => (
                            <ListItem
                              key={`${sub.href}-${sub.title}-${idx}`}
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
                              {footerItems.map((footerSub, idx) => (
                                <div key={`${footerSub.href}-${footerSub.title}-${idx}`}>
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
              className="xl:hidden p-2 text-foreground/80 hover:text-primary transition-colors cursor-pointer"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {authUser ? (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  href={
                    authUser.role === "ADMIN"
                      ? "/admin/dashboard"
                      : authUser.role === "DOCTOR"
                      ? "/doctor/dashboard"
                      : "/patient/dashboard"
                  }
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/15 transition-all text-xs font-bold border border-primary/20"
                >
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>{authUser.name ? authUser.name.split(" ")[0] : "Dashboard"}</span>
                </Link>
                <Link
                  href={
                    authUser.role === "ADMIN"
                      ? "/admin/dashboard"
                      : authUser.role === "DOCTOR"
                      ? "/doctor/dashboard"
                      : "/patient/dashboard"
                  }
                >
                  <Button size="sm" className="rounded-full px-5 font-bold shadow-sm">
                    My Portal
                  </Button>
                </Link>
              </div>
            ) : (
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
            )}
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
                <Image
                  src={logoUrl || "/logo.png"}
                  alt="KELKAR MANAS HEALTH CLINIC"
                  width={180}
                  height={80}
                  className="h-20 w-auto object-contain"
                  priority
                />
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
                        {group.items.map((sub, idx) => {
                          const itemKey = `${sub.href}-${sub.title}-${idx}`;
                          if (sub.actionKey === "openBooking") {
                            return (
                              <button
                                key={itemKey}
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
                                key={itemKey}
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
                              key={itemKey}
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
                {authUser ? (
                  <Link
                    href={
                      authUser.role === "ADMIN"
                        ? "/admin/dashboard"
                        : authUser.role === "DOCTOR"
                        ? "/doctor/dashboard"
                        : "/patient/dashboard"
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Button className="w-full rounded-full py-6 text-base font-bold shadow-sm">
                      Go to My Portal ({authUser.name?.split(" ")[0] || "Account"})
                    </Button>
                  </Link>
                ) : (
                  <>
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
                  </>
                )}
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
