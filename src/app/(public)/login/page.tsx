"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Mail, Lock } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Image/Branding (hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-primary/5 flex-col justify-between p-12 overflow-hidden border-r border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 pointer-events-none" />
        
        {/* Decorative blur orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-[100px]" />

        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <span className="font-serif text-3xl font-bold tracking-tight text-foreground">
              Intima<span className="font-sans text-primary font-semibold">Health</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-serif font-medium mb-6 leading-tight">
            Take control of your absolute well-being.
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Access your personalized treatment plans, lab results, and connect with your dedicated care team—all in one secure place.
          </p>
          
          <div className="flex items-center gap-4">
            <div className="flex -space-x-4">
              <div className="w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-bold overflow-hidden relative">
                <Image src="/images/doctor_2.png" alt="Doctor" fill className="object-cover" />
              </div>
              <div className="w-10 h-10 rounded-full bg-primary border-2 border-background flex items-center justify-center text-white text-xs font-bold">
                +10k
              </div>
            </div>
            <p className="text-sm font-medium text-foreground/80">Trusted by over 10,000 men</p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px] space-y-10">
          
          <div className="lg:hidden mb-12 flex justify-center">
            <Link href="/">
              <span className="font-serif text-3xl font-bold tracking-tight text-foreground">
                Intima<span className="font-sans text-primary font-semibold">Health</span>
              </span>
            </Link>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-muted-foreground">
              Enter your details to access your secure patient portal.
            </p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="email" 
                    placeholder="name@example.com" 
                    type="email" 
                    className="pl-10 h-12 bg-muted/30 border-border/60 focus-visible:ring-primary/20"
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-sm font-semibold text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    className="pl-10 h-12 bg-muted/30 border-border/60 focus-visible:ring-primary/20"
                    required 
                  />
                </div>
              </div>
            </div>

            <Button className="w-full h-12 text-base font-bold rounded-xl shadow-sm hover:shadow-md transition-all group">
              Sign In
              <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground font-semibold">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-12 border-border/60 hover:bg-muted/50 font-semibold">
              Google
            </Button>
            <Button variant="outline" className="h-12 border-border/60 hover:bg-muted/50 font-semibold">
              Apple
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-10">
            Don't have an account?{" "}
            <Link href="/register" className="font-bold text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
