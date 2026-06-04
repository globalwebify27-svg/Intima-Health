"use client";

import { use, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { notFound } from "next/navigation";
import { products } from "../page";
import { ShieldCheck, ShoppingBag, ArrowLeft, Info, CheckCircle2, Truck, Plus, Minus, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCart } from "@/store/useCart";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const product = products.find((p) => p.slug === resolvedParams.slug);
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      type: product.type,
    });
    // The store automatically opens the cart, but if we need to update quantity in cart, we'd need a different addItem signature or just call updateQuantity after. 
    // Since our addItem sets quantity to 1, let's just do it sequentially or update the store to accept initial quantity. 
    // For now, we will just add it 1 by 1.
  };

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      type: product.type,
    });
    // Wait for state to update, then navigate to checkout
    setTimeout(() => {
      window.location.href = "/checkout";
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb / Back */}
        <Link href="/products" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left Column: Image */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square bg-muted/30 rounded-[2.5rem] border border-border flex items-center justify-center p-12 overflow-hidden">
              {product.isPrescription && (
                <div className="absolute top-6 left-6 bg-background/80 backdrop-blur font-bold px-3 py-1.5 rounded-lg border border-border z-10 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Prescription Required
                </div>
              )}
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain p-12 hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-2xl p-4 border border-border flex items-start gap-3">
                <Truck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Discreet Shipping</p>
                  <p className="text-xs text-muted-foreground mt-1">Unbranded packaging</p>
                </div>
              </div>
              <div className="bg-muted/30 rounded-2xl p-4 border border-border flex items-start gap-3">
                <LockIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Secure Data</p>
                  <p className="text-xs text-muted-foreground mt-1">HIPAA compliant</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {product.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-serif font-medium mb-4">
              {product.name}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="text-3xl font-bold mb-8">
              ₹{product.price.toLocaleString()}
              <span className="text-sm font-normal text-muted-foreground ml-2">/ kit</span>
            </div>

            {/* Actions */}
            <div className="space-y-4 mb-12 border-b border-border pb-12">
              <div className="flex gap-4">
                <Button onClick={handleAddToCart} size="lg" className="flex-1 rounded-full py-6 text-base gap-2" variant="outline">
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </Button>
                <Button onClick={handleBuyNow} size="lg" className="flex-1 rounded-full py-6 text-base gap-2">
                  <CreditCard className="w-5 h-5" />
                  Buy Now
                </Button>
              </div>
              
              {product.isPrescription && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3 text-sm text-foreground/80">
                  <Info className="w-5 h-5 text-primary shrink-0" />
                  <p>
                    <strong>Medical Consultation Required:</strong> After checkout, you will be prompted to complete a brief medical intake. A licensed clinician will review your details before fulfilling the order.
                  </p>
                </div>
              )}
            </div>

            {/* Expandable Details (Mock) */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">How it Works</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    Place your order online securely.
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    {product.isPrescription ? "Complete a medical review." : "We ship your order directly."}
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    Delivered in plain, discreet packaging.
                  </li>
                </ul>
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    </div>
  );
}

// Simple Lock Icon for the guarantee section
function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
