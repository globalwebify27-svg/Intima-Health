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
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/store/useCart";
import { ShoppingBag, Menu, X, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
          {children}
        </p>
      </Link>
    </li>
  );
});
ListItem.displayName = "ListItem";

export function Header() {
  const router = useRouter();
  const { openCart, items } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);
  
  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
      <div className="container mx-auto flex h-20 items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
              Intima<span className="font-sans text-primary font-semibold">Health</span>
            </span>
          </Link>

          <NavigationMenu className="hidden xl:flex">
            <NavigationMenuList className="gap-1">
              
              {/* Conditions We Treat (Problem First) */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-foreground/80 hover:text-primary font-semibold transition-colors">
                  Conditions We Treat
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    <ListItem href="/conditions/ed" title="Erectile Dysfunction">
                      Personalized treatment plans for ED.
                    </ListItem>
                    <ListItem href="/conditions/pe" title="Premature Ejaculation">
                      Build endurance and stamina safely.
                    </ListItem>
                    <ListItem href="/conditions/testosterone" title="Low Testosterone">
                      TRT and hormone optimization therapies.
                    </ListItem>
                    <ListItem href="/conditions/sti" title="STI Management">
                      Fast, private testing and treatment.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Our Services (Solutions) */}
              <NavigationMenuItem>
                <NavigationMenuTrigger 
                  onClick={() => router.push('/services')}
                  className="bg-transparent text-foreground/80 hover:text-primary font-semibold transition-colors cursor-pointer"
                >
                  Our Services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2">
                    <ListItem href="/consultations" title="Online Consultations">
                      15-min discrete video calls with specialists.
                    </ListItem>
                    <ListItem href="/pharmacy" title="Discreet Pharmacy">
                      Medication delivered in unbranded packaging.
                    </ListItem>
                    <ListItem href="/diagnostics" title="At-Home Diagnostics">
                      Lab testing from the comfort of your home.
                    </ListItem>
                    <ListItem href="/therapy" title="Sex Therapy">
                      Behavioral and psychological counseling.
                    </ListItem>
                    <div className="md:col-span-2 pt-3 mt-1 border-t border-border/50 text-center">
                      <Link href="/services" className="inline-flex items-center text-sm font-semibold text-primary hover:underline transition-all">
                        View All Services <span className="ml-1">&rarr;</span>
                      </Link>
                    </div>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Shop (Products) */}
              <NavigationMenuItem>
                <Link href="/products" className={cn(navigationMenuTriggerStyle(), "bg-transparent text-foreground/80 hover:text-primary font-semibold transition-colors")}>
                  Shop
                </Link>
              </NavigationMenuItem>

              {/* Clinics (Physical Trust) */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-foreground/80 hover:text-primary font-semibold transition-colors">
                  Clinics
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[300px] gap-3 p-4">
                    <ListItem href="/clinics/delhi" title="New Delhi">
                      Vasant Vihar Premium Clinic
                    </ListItem>
                    <ListItem href="/clinics/mumbai" title="Mumbai">
                      Bandra West Flagship Center
                    </ListItem>
                    <ListItem href="/clinics/bangalore" title="Bangalore">
                      Indiranagar Hub
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* About Us (Brand Trust) */}
              <NavigationMenuItem>
                <Link href="/about" className={cn(navigationMenuTriggerStyle(), "bg-transparent text-foreground/80 hover:text-primary font-semibold transition-colors")}>
                  About Us
                </Link>
              </NavigationMenuItem>

              {/* Our Sexologists */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-foreground/80 hover:text-primary font-semibold transition-colors">
                  Our Experts
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[300px] gap-3 p-4">
                    <ListItem href="/doctors" title="Meet the Team">
                      View our board-certified experts.
                    </ListItem>
                    <ListItem href="/booking" title="Book Appointment">
                      Schedule a secure video consultation.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Resources */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-foreground/80 hover:text-primary font-semibold transition-colors">
                  Resources
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[300px] gap-3 p-4">
                    <ListItem href="/blog" title="Clinical Journal">
                      Articles on longevity and intimacy.
                    </ListItem>
                    <ListItem href="/research" title="Research Library">
                      Our clinical studies and findings.
                    </ListItem>
                    <ListItem href="/faq" title="FAQ & Support">
                      Answers to common questions.
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={openCart}
            className="relative p-2 text-foreground/80 hover:text-primary transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-primary rounded-full">
                {cartItemCount}
              </span>
            )}
          </button>
          
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
            <Link href="/booking" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-6 py-5 text-sm font-semibold shadow-sm hover:shadow-md transition-all")}>
              Get Started
            </Link>
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
              <span className="font-serif text-xl font-bold tracking-tight text-foreground">
                Intima<span className="font-sans text-primary font-semibold">Health</span>
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-2">
              <nav className="flex flex-col text-lg font-medium">
                <MobileNavGroup title="Conditions We Treat">
                  <Link href="/conditions/ed" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors">Erectile Dysfunction</Link>
                  <Link href="/conditions/pe" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors">Premature Ejaculation</Link>
                  <Link href="/conditions/testosterone" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors">Low Testosterone</Link>
                  <Link href="/conditions/sti" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors">STI Management</Link>
                </MobileNavGroup>
                
                <MobileNavGroup title="Our Services">
                  <Link href="/consultations" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors">Online Consultations</Link>
                  <Link href="/pharmacy" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors">Discreet Pharmacy</Link>
                  <Link href="/diagnostics" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors">At-Home Diagnostics</Link>
                  <Link href="/therapy" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors">Sex Therapy</Link>
                </MobileNavGroup>

                <div className="border-b border-border/50">
                  <Link href="/products" onClick={() => setIsMobileMenuOpen(false)} className="flex py-4 text-lg font-medium hover:text-primary transition-colors">Shop</Link>
                </div>

                <MobileNavGroup title="Clinics">
                  <Link href="/clinics/delhi" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors">New Delhi</Link>
                  <Link href="/clinics/mumbai" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors">Mumbai</Link>
                  <Link href="/clinics/bangalore" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors">Bangalore</Link>
                </MobileNavGroup>

                <div className="border-b border-border/50">
                  <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="flex py-4 text-lg font-medium hover:text-primary transition-colors">About Us</Link>
                </div>

                <MobileNavGroup title="Our Experts">
                  <Link href="/doctors" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors">Meet the Team</Link>
                  <Link href="/booking" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors">Book Appointment</Link>
                </MobileNavGroup>

                <MobileNavGroup title="Resources">
                  <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors">Clinical Journal</Link>
                  <Link href="/research" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors">Research Library</Link>
                  <Link href="/faq" onClick={() => setIsMobileMenuOpen(false)} className="py-2 hover:text-primary transition-colors">FAQ & Support</Link>
                </MobileNavGroup>
              </nav>
            </div>
            
            <div className="p-6 border-t border-border bg-muted/30 flex flex-col gap-4">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-full py-6 text-base">
                  Log In
                </Button>
              </Link>
              <Link href="/booking" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full rounded-full py-6 text-base">
                  Get Started
                </Button>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}

function MobileNavGroup({ title, children }: { title: string, children: React.ReactNode }) {
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
