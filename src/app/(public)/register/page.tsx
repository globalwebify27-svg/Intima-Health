"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Mail, Lock, User, ShieldCheck } from "lucide-react";
import Image from "next/image";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex flex-row-reverse">
      {/* Left side (Visuals) - Hidden on mobile */}
      <div className="hidden lg:flex w-1/2 relative bg-secondary/5 flex-col justify-between p-12 overflow-hidden border-l border-border/50">
        <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 via-background to-secondary/10 pointer-events-none" />
        
        {/* Decorative blur orbs */}
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 flex justify-end">
          <Link href="/" className="inline-block">
            <span className="font-serif text-3xl font-bold tracking-tight text-foreground">
              Intima<span className="font-sans text-primary font-semibold">Health</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md ml-auto text-right mt-12">
          <div className="flex justify-end mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm">
              <ShieldCheck className="w-5 h-5" /> HIPAA Compliant
            </div>
          </div>
          <h2 className="text-4xl font-serif font-medium mb-6 leading-tight">
            Confidential care. <br/> Uncompromised privacy.
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            Your health data is secured with enterprise-grade encryption. We never share your personal information without your explicit consent.
          </p>
          
          <div className="bg-white/60 backdrop-blur-md border border-border/50 rounded-2xl p-6 text-left shadow-xl">
            <p className="italic text-foreground/80 mb-4 font-medium">
              "The registration process was seamless, and I finally felt like I was taking back control of my health in a completely judgment-free zone."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                M
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Verified Patient</p>
                <p className="text-xs text-muted-foreground">Joined March 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-[440px] space-y-8">
          
          <div className="lg:hidden mb-8 flex justify-center">
            <Link href="/">
              <span className="font-serif text-3xl font-bold tracking-tight text-foreground">
                Intima<span className="font-sans text-primary font-semibold">Health</span>
              </span>
            </Link>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Create your account</h1>
            <p className="text-muted-foreground">
              Join thousands of men optimizing their health. It takes less than 2 minutes.
            </p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="firstName" 
                    placeholder="John" 
                    className="pl-10 h-12 bg-muted/30 border-border/60 focus-visible:ring-primary/20"
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input 
                  id="lastName" 
                  placeholder="Doe" 
                  className="h-12 bg-muted/30 border-border/60 focus-visible:ring-primary/20"
                  required 
                />
              </div>
            </div>

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
              <Label htmlFor="password">Create password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="At least 8 characters"
                  className="pl-10 h-12 bg-muted/30 border-border/60 focus-visible:ring-primary/20"
                  required 
                />
              </div>
            </div>

            <Button className="w-full h-12 text-base font-bold rounded-xl shadow-sm hover:shadow-md transition-all group">
              Create Account
              <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-xs text-center text-muted-foreground mt-4">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>
              {" "}and{" "}
              <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link>.
            </p>
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
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
