"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, MessageSquare, AlertCircle } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (step === 'otp' && resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, resendCooldown]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Client-side validation
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('otp');
        setResendCooldown(30);
        if (data.code) {
          alert(`[Test OTP Code]: ${data.code}\n(This popup is for developer/testing convenience)`);
        }
      } else {
        throw new Error(data.message || "Failed to send OTP.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6 || !/^\d+$/.test(cleanOtp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/patient/dashboard";
      } else {
        throw new Error(data.message || "Invalid OTP code.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

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
                <Image src="/images/doctor_2.png" alt="Doctor" fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
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
              Enter your WhatsApp number to securely access your patient portal.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-destructive/10 text-destructive text-xs font-bold rounded-xl border border-destructive/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={step === 'phone' ? handleSendOtp : handleVerifyOtp}>
            {step === 'phone' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp Number</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-3.5 text-sm font-medium text-muted-foreground">+91</span>
                    <Input
                      id="phone"
                      placeholder="98765 43210"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const input = e.target;
                        const rawValue = input.value;
                        let val = rawValue.replace(/\D/g, '').slice(0, 10);
                        if (val.length > 0 && !/^[6-9]/.test(val[0])) {
                          val = '';
                        }
                        if (rawValue !== val) {
                          input.value = val;
                        }
                        setPhone(val);
                      }}
                      maxLength={10}
                      className="pl-12 h-12 bg-muted/30 border-border/60 focus-visible:ring-primary/20"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="otp">Enter Verification Code</Label>
                    <button type="button" onClick={() => setStep('phone')} className="text-xs text-primary hover:underline font-medium" disabled={loading}>Change Number</button>
                  </div>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="otp"
                      placeholder="6-digit code"
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="pl-10 h-12 bg-muted/30 border-border/60 focus-visible:ring-primary/20 tracking-widest text-center"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">Code sent to +91 {phone.replace(/\D/g, "").slice(-10)}.</p>
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || loading}
                      onClick={() => handleSendOtp()}
                      className="text-xs font-bold text-primary hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full h-12 text-base font-bold rounded-xl shadow-sm hover:shadow-md transition-all group">
              {loading ? 'Processing...' : step === 'phone' ? 'Send OTP via WhatsApp' : 'Verify & Secure Login'}
              {!loading && <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-10">
            By logging in, you agree to our{" "}
            <Link href="/terms" className="font-bold text-primary hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="font-bold text-primary hover:underline">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
