"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldCheck, ArrowRight, CreditCard, ShoppingBag, CheckCircle2 } from "lucide-react";
import { useCart } from "@/store/useCart";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart();
  const [step, setStep] = useState<"shipping" | "payment" | "success">("shipping");
  const router = useRouter();

  const handleCompleteOrder = () => {
    // In a real app, this would integrate with Razorpay/Stripe
    setStep("success");
    setTimeout(() => {
      clearCart();
    }, 500);
  };

  if (items.length === 0 && step !== "success") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-24 pb-20 px-4">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-serif mb-4">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">
          You need to add some products to your cart before proceeding to checkout.
        </p>
        <Link href="/products">
          <Button size="lg" className="rounded-full px-8">Return to Shop</Button>
        </Link>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center pt-24 pb-20 px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-lg mx-auto"
        >
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-serif font-medium mb-4">Order Confirmed!</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Thank you for your purchase. Your order #INT-{Math.floor(Math.random() * 100000)} is currently being processed. You will receive an email confirmation shortly.
          </p>
          <div className="bg-muted/30 border border-border rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              What happens next?
            </h3>
            <p className="text-sm text-muted-foreground">
              If your order contained prescription medications, a licensed clinician will review your medical profile. Once approved, it will be shipped directly to you in discreet packaging.
            </p>
          </div>
          <Link href="/">
            <Button size="lg" className="rounded-full px-10 py-6 text-base shadow-xl">
              Return to Home
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      
      {/* Checkout Header (Minimal) */}
      <header className="bg-background border-b border-border py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-foreground">
            Intima<span className="font-sans text-primary font-semibold">Health</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <Lock className="w-4 h-4" />
            Secure Checkout
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Left Column: Forms */}
          <div className="lg:w-3/5">
            
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm font-medium mb-10">
              <span className={step === "shipping" ? "text-foreground" : "text-primary cursor-pointer"} onClick={() => setStep("shipping")}>Shipping</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground mx-1" />
              <span className={step === "payment" ? "text-foreground" : "text-muted-foreground"}>Payment</span>
            </div>

            <AnimatePresence mode="wait">
              {step === "shipping" && (
                <motion.div
                  key="shipping"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl font-serif mb-6">Contact Information</h2>
                    <div className="space-y-4">
                      <input type="email" placeholder="Email address" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input type="checkbox" id="news" className="rounded border-border text-primary focus:ring-primary" />
                        <label htmlFor="news">Email me with news and offers</label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-serif mb-6 mt-10">Shipping Address</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="First name" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                      <input type="text" placeholder="Last name" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                      <input type="text" placeholder="Address" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all col-span-2" />
                      <input type="text" placeholder="Apartment, suite, etc. (optional)" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all col-span-2" />
                      <input type="text" placeholder="City" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                      <input type="text" placeholder="State" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                      <input type="text" placeholder="PIN Code" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all col-span-2" />
                      <input type="tel" placeholder="Phone" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all col-span-2" />
                    </div>
                  </div>

                  <Button onClick={() => setStep("payment")} size="lg" className="w-full rounded-xl py-6 text-base mt-6">
                    Continue to Payment
                  </Button>
                </motion.div>
              )}

              {step === "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-8"
                >
                  <div className="bg-background border border-border rounded-xl p-4 text-sm divide-y divide-border">
                    <div className="flex justify-between py-3">
                      <span className="text-muted-foreground w-20">Contact</span>
                      <span className="flex-1 font-medium">user@example.com</span>
                      <button onClick={() => setStep("shipping")} className="text-primary hover:underline">Change</button>
                    </div>
                    <div className="flex justify-between py-3">
                      <span className="text-muted-foreground w-20">Ship to</span>
                      <span className="flex-1 font-medium">123 Health St, New Delhi, 110001</span>
                      <button onClick={() => setStep("shipping")} className="text-primary hover:underline">Change</button>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-serif mb-6 mt-10">Payment</h2>
                    <p className="text-sm text-muted-foreground mb-4">All transactions are secure and encrypted.</p>
                    
                    <div className="bg-background border border-primary ring-1 ring-primary rounded-xl p-6 relative">
                      <div className="absolute top-4 right-4 flex gap-1">
                        <CreditCard className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold mb-4">Credit or Debit Card</h3>
                      <div className="space-y-4">
                        <input type="text" placeholder="Card number" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                        <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="Expiration date (MM / YY)" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                          <input type="text" placeholder="Security code" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                        </div>
                        <input type="text" placeholder="Name on card" className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleCompleteOrder} size="lg" className="w-full rounded-xl py-6 text-base mt-6 shadow-xl">
                    Pay ₹{getTotal().toLocaleString()}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:w-2/5">
            <div className="bg-background border border-border rounded-[2rem] p-8 sticky top-32 shadow-sm">
              <h3 className="text-xl font-serif font-medium mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="relative w-16 h-16 bg-muted rounded-xl border border-border flex items-center justify-center shrink-0">
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center rounded-full z-10">
                        {item.quantity}
                      </span>
                      <Image src={item.image} alt={item.name} fill className="object-cover rounded-xl"  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 uppercase">{item.type}</p>
                    </div>
                    <div className="font-semibold text-sm">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-border">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{getTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 mt-6 border-t border-border">
                <span className="text-lg font-medium">Total</span>
                <span className="text-2xl font-bold">₹{getTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
