"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight, Filter, Activity, ShieldCheck, HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCart } from "@/store/useCart";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export const products = [
  {
    id: "prod_ed_daily",
    name: "Daily Tadalafil (Cialis)",
    slug: "daily-tadalafil",
    price: 3499,
    image: "/images/product_kit_1.png",
    type: "medication" as const,
    category: "Sexual Health",
    description: "A daily 5mg pill for spontaneous intimacy. No planning required.",
    isPrescription: true,
  },
  {
    id: "prod_pe_spray",
    name: "Endurance Spray",
    slug: "endurance-spray",
    price: 1999,
    image: "/images/product_kit_2.png",
    type: "medication" as const,
    category: "Sexual Health",
    description: "Clinically proven lidocaine spray to help you last longer in bed.",
    isPrescription: false,
  },
  {
    id: "prod_test_panel",
    name: "Comprehensive Hormone Panel",
    slug: "hormone-panel",
    price: 4999,
    image: "/images/product_kit_3.png",
    type: "diagnostic" as const,
    category: "Diagnostics",
    description: "At-home blood test measuring Free T, Total T, Estradiol, and SHBG.",
    isPrescription: false,
  },
  {
    id: "prod_sti_kit",
    name: "Complete STI Screen",
    slug: "sti-screen",
    price: 2999,
    image: "/images/product_kit_1.png",
    type: "diagnostic" as const,
    category: "Diagnostics",
    description: "Private, at-home testing for Chlamydia, Gonorrhea, Syphilis, and HIV.",
    isPrescription: false,
  },
  {
    id: "prod_libido_supp",
    name: "Vitality Complex",
    slug: "vitality-complex",
    price: 1499,
    image: "/images/product_kit_2.png",
    type: "supplement" as const,
    category: "Wellness",
    description: "A blend of Ashwagandha, Maca, and Zinc to naturally support drive and energy.",
    isPrescription: false,
  },
  {
    id: "prod_hair_loss",
    name: "Finasteride 1mg",
    slug: "finasteride",
    price: 2499,
    image: "/images/product_kit_3.png",
    type: "medication" as const,
    category: "Hair Health",
    description: "The gold standard oral medication for stopping male pattern baldness.",
    isPrescription: true,
  }
];

export default function ProductsPage() {
  const { addItem } = useCart();

  return (
    <div className="min-h-screen bg-background text-foreground">
      
      {/* Header Section */}
      <section className="pt-12 pb-16 bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-medium mb-6">
              Clinical-grade solutions, <br />
              <span className="text-primary italic">delivered discreetly.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              From prescription treatments to at-home diagnostic panels, get exactly what you need without the waiting room.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12">
            
            {/* Sidebar / Filters (Mock) */}
            <div className="w-full md:w-64 shrink-0 space-y-8">
              <div>
                <div className="flex items-center gap-2 font-semibold mb-4 text-lg">
                  <Filter className="w-5 h-5" />
                  Categories
                </div>
                <ul className="space-y-3 text-muted-foreground">
                  <li><button className="text-primary font-medium">All Products</button></li>
                  <li><button className="hover:text-foreground transition-colors">Sexual Health</button></li>
                  <li><button className="hover:text-foreground transition-colors">Diagnostics</button></li>
                  <li><button className="hover:text-foreground transition-colors">Wellness Supplements</button></li>
                  <li><button className="hover:text-foreground transition-colors">Hair Health</button></li>
                </ul>
              </div>

              <div>
                <div className="font-semibold mb-4 text-lg">Treatment Type</div>
                <ul className="space-y-3 text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <input type="checkbox" id="rx" className="rounded border-border text-primary focus:ring-primary" />
                    <label htmlFor="rx">Prescription Required</label>
                  </li>
                  <li className="flex items-center gap-2">
                    <input type="checkbox" id="otc" className="rounded border-border text-primary focus:ring-primary" />
                    <label htmlFor="otc">Over-the-Counter</label>
                  </li>
                </ul>
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-8">
                <p className="text-muted-foreground">{products.length} Products</p>
                <select className="bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>

              <motion.div 
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
              >
                {products.map((product) => (
                  <motion.div 
                    key={product.id}
                    variants={fadeIn}
                    className="group flex flex-col bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    {/* Product Image Area */}
                    <Link href={`/products/${product.slug}`} className="relative aspect-square bg-muted/50 p-6 flex items-center justify-center overflow-hidden">
                      {product.isPrescription && (
                        <div className="absolute top-4 left-4 bg-background/80 backdrop-blur text-xs font-bold px-2 py-1 rounded border border-border z-10 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-primary" />
                          Rx
                        </div>
                      )}
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={300}
                        height={300}
                        className="object-contain group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>

                    {/* Product Details */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        {product.category}
                      </div>
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-serif text-xl font-medium mb-2 group-hover:text-primary transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <span className="font-semibold text-lg">
                          ₹{product.price.toLocaleString()}
                        </span>
                        <Button 
                          onClick={() => addItem({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            type: product.type
                          })}
                          size="sm" 
                          className="rounded-full gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
