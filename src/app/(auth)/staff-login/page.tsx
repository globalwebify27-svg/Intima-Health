"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export default function StaffLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid credentials.");
      }

      const role = data.user.role;
      if (role === "SUPER_ADMIN" || role === "CLINIC_ADMIN") {
        router.push("/admin/dashboard");
      } else if (role === "DOCTOR") {
        router.push("/doctor/dashboard");
      } else if (role === "PHARMACY_ADMIN" || role === "PHARMACY_VENDOR" || role === "PHARMACY_STAFF") {
        router.push("/pharmacy/dashboard");
      } else if (role === "CLINIC_MANAGER") {
        router.push("/clinic-manager/dashboard");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.message || "Invalid staff credentials or unauthorized access.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-primary/5 flex-col justify-between p-12 overflow-hidden border-r border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 pointer-events-none" />
        
        {/* Decorative blur orbs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-[100px]" />

        <div className="relative z-10">
          <Link href="/" className="inline-block">
            <span className="font-serif text-3xl font-bold tracking-tight text-foreground">
              Intima<span className="font-sans text-primary font-semibold">Health</span>
              <span className="ml-2 text-sm font-sans font-medium text-muted-foreground uppercase tracking-widest border border-border rounded px-2 py-0.5">Staff Portal</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-serif font-medium mb-6 leading-tight">
            Provider & Admin Access
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Manage patient care, track orders, and oversee operations securely.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px] space-y-10">
          
          <div className="lg:hidden mb-12 flex justify-center flex-col items-center gap-2">
            <Link href="/">
              <span className="font-serif text-3xl font-bold tracking-tight text-foreground">
                Intima<span className="font-sans text-primary font-semibold">Health</span>
              </span>
            </Link>
            <span className="text-xs font-sans font-medium text-muted-foreground uppercase tracking-widest border border-border rounded px-2 py-0.5">Staff Portal</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Staff Login</h1>
            <p className="text-muted-foreground">
              Sign in with your authorized provider email and password.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input 
                    id="email" 
                    placeholder="doctor@intimahealth.com" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-muted/30 border-border/60 focus-visible:ring-primary/20"
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl shadow-sm hover:shadow-md transition-all group">
              Access Dashboard
              <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-10">
            Are you a patient?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Patient Login Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
