"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShoppingBag, ArrowLeft, Info, CheckCircle2, Truck, CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCart } from "@/store/useCart";

interface ProductDetailProps {
  product: {
    id: string;
    _id?: string;
    slug?: string;
    name: string;
    category: string;
    price: number;
    mrp?: number;
    image?: string;
    type?: "medication" | "diagnostic" | "supplement";
    description?: string;
    isPrescription?: boolean;
    dosageForm?: string;
    packSize?: string;
    composition?: string;
    manufacturer?: string;
    stock?: number;
  };
}

export default function ProductDetailClient({ product }: ProductDetailProps) {
  const router = useRouter();
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || "/images/product_kit_1.png",
      type: product.type || "medication",
      isPrescription: product.isPrescription,
    });
  };

  const handleBuyNow = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || "/images/product_kit_1.png",
      type: product.type || "medication",
      isPrescription: product.isPrescription,
    });
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back */}
        <Link
          href="/products"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left Column: Image */}
          <div className="space-y-6">
            <div className="relative aspect-square md:aspect-[4/3] lg:aspect-square bg-muted/30 rounded-[2.5rem] border border-border flex items-center justify-center p-12 overflow-hidden shadow-sm">
              {product.isPrescription && (
                <div className="absolute top-6 left-6 bg-background/80 backdrop-blur font-bold px-3 py-1.5 rounded-lg border border-border z-10 flex items-center gap-2 text-sm">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Prescription Required
                </div>
              )}
              <Image
                src={product.image || "/images/product_kit_1.png"}
                alt={product.name || "Product"}
                fill
                priority
                className="object-contain p-12 hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Secure Data</p>
                  <p className="text-xs text-muted-foreground mt-1">Confidential &amp; Verified</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details */}
          <div className="flex flex-col">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {product.category || "Medication"}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-serif font-medium mb-4">
              {product.name}
            </h1>

            {product.description && (
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="text-3xl font-bold mb-8">
              ₹{product.price.toLocaleString()}
              {product.packSize && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  / {product.packSize}
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4 mb-12 border-b border-border pb-12">
              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  size="lg"
                  className="flex-1 rounded-full py-6 text-base gap-2"
                  variant="outline"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  size="lg"
                  className="flex-1 rounded-full py-6 text-base gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Buy Now
                </Button>
              </div>

              {product.isPrescription && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3 text-sm text-foreground/80">
                  <Info className="w-5 h-5 text-primary shrink-0" />
                  <p>
                    <strong>Medical Consultation Required:</strong> After checkout, you will be prompted
                    to complete a brief medical intake or upload your prescription. A licensed clinician will
                    review your details before packing your order.
                  </p>
                </div>
              )}
            </div>

            {/* Expandable Details */}
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
                    {product.isPrescription
                      ? "Complete medical review or provide prescription."
                      : "We process and pack your order directly."}
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    Dispatched in discreet, tamper-proof packaging.
                  </li>
                </ul>
              </div>

              {product.composition && (
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold mb-1 text-muted-foreground uppercase tracking-wider">
                    Composition
                  </h3>
                  <p className="text-sm font-medium">{product.composition}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

