"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import React from "react";
import { useRouter } from "next/navigation";

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
  
  return (
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
              
              {/* About Us */}
              <NavigationMenuItem>
                <Link href="/about" className={cn(navigationMenuTriggerStyle(), "bg-transparent text-foreground/80 hover:text-primary font-semibold transition-colors")}>
                  About Us
                </Link>
              </NavigationMenuItem>

              {/* Our Services */}
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

              {/* Conditions We Treat */}
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

              {/* Clinics */}
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

              {/* For Clinicians */}
              <NavigationMenuItem>
                <Link href="/clinicians" className={cn(navigationMenuTriggerStyle(), "bg-transparent text-foreground/80 hover:text-primary font-semibold transition-colors")}>
                  For Clinicians
                </Link>
              </NavigationMenuItem>

              {/* Our Sexologists */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-foreground/80 hover:text-primary font-semibold transition-colors">
                  Our Sexologists
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
        
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/login" className="text-sm font-semibold text-foreground/80 hover:text-primary transition-colors hidden sm:block">
            Log in
          </Link>
          <Button className="rounded-full px-6 py-5 text-sm font-semibold shadow-sm hover:shadow-md transition-all">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}
