"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { useCart } from "@/store/useCart";
import Link from "next/link";

const products = [
  {
    id: "intima-comprehensive",
    title: "Intima Full Spectrum Screen",
    subtitle: "Complete clinical workup",
    description: "Our flagship diagnostic suite. Covers the 10 most common markers for total reproductive and sexual wellness.",
    slug: "sti-screen",
    price: 3999,
    originalPrice: 5500,
    discount: "Save ₹1500",
    features: ["At-home sample collection", "NABL-certified lab analysis", "Follow-up physician review"],
    image: "/images/product_kit_1.png",
    type: "diagnostic" as const
  },
  {
    id: "vitality-check",
    title: "Vitality & Hormone Assay",
    subtitle: "Endocrine deep dive",
    description: "Map your metabolic and hormonal baselines to uncover the root causes of fatigue or low drive.",
    slug: "hormone-panel",
    price: 2899,
    originalPrice: 3899,
    discount: "Save ₹1000",
    features: ["Testosterone & Thyroid markers", "Digital interactive report", "Actionable wellness plan"],
    image: "/images/product_kit_2.png",
    type: "diagnostic" as const
  },
  {
    id: "performance-protocol",
    title: "Performance Protocol Kit",
    subtitle: "Physician-guided",
    description: "A tailored regimen combining diagnostics with behavioral health strategies for optimal intimacy.",
    slug: "daily-tadalafil",
    price: 4499,
    originalPrice: 5499,
    discount: "Save ₹1000",
    features: ["Clinical evaluation included", "Premium therapeutic tools", "Ongoing therapy access"],
    image: "/images/product_kit_3.png",
    type: "diagnostic" as const
  }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 20 }
  }
};

export function FeaturedProducts() {
  const { addItem } = useCart();

  return (
    <section className="py-32 bg-background relative overflow-hidden">
      
      {/* Decorative Orbs (Static for scroll performance) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px]" />
      </div>
      
      <div className="container mx-auto px-6 lg:px-12 relative z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8"
        >
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              Advanced diagnostics. <br className="hidden md:block"/>
              <span className="text-primary">Zero friction.</span>
            </h2>
            <p className="text-lg text-muted-foreground font-medium leading-relaxed">
              Take control of your health with clinical-grade testing you can do from the absolute privacy of your home. Everything you need, shipped overnight.
            </p>
          </div>
          <Link href="/products">
            <Button variant="outline" className="hidden md:inline-flex rounded-full px-8 py-6 font-bold shadow-sm hover:shadow-md hover:text-primary transition-all group border-border/60">
              Explore Shop <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12"
        >
          {products.map((product) => (
            <motion.div 
              key={product.id} 
              variants={cardVariants}
              className="flex flex-col rounded-[2.5rem] bg-white border border-border/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(122,46,122,0.12)] hover:-translate-y-2 transition-all duration-500 relative group overflow-hidden"
            >
              
              {/* Product Image Header */}
              <Link href={`/products/${product.slug}`} className="relative w-full h-[320px] bg-muted/20 overflow-hidden shrink-0 block">
                <Image 
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                 sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
                
                {/* Gradient overlay for text legibility if needed, or just a sleek vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

                <div className="absolute top-6 right-6 z-10">
                  <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-md px-4 py-1.5 text-xs font-bold text-primary shadow-sm border border-white/20">
                    {product.discount}
                  </span>
                </div>
              </Link>

              {/* Card Body */}
              <div className="p-8 md:p-10 flex flex-col flex-grow relative bg-white z-10">
                <div className="mb-6">
                  <p className="text-primary font-bold text-xs mb-3 uppercase tracking-[0.15em]">{product.subtitle}</p>
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4 leading-tight group-hover:text-primary transition-colors">{product.title}</h3>
                  </Link>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="space-y-4 mb-10 flex-grow">
                  {product.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span className="text-sm font-semibold text-foreground/80 leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-8 border-t border-border/40">
                  <div className="flex items-baseline gap-3 mb-8">
                    <span className="text-4xl font-bold text-foreground tracking-tight">₹{product.price}</span>
                    <span className="text-lg text-muted-foreground line-through font-medium">₹{product.originalPrice}</span>
                  </div>
                  <Button 
                    onClick={() => addItem({
                      id: product.id,
                      name: product.title,
                      price: product.price,
                      image: product.image,
                      type: product.type
                    })}
                    className="w-full rounded-2xl py-7 text-lg font-bold shadow-sm hover:shadow-xl transition-all group-hover:bg-primary/95 group-hover:-translate-y-1"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <div className="mt-12 text-center md:hidden">
          <Link href="/products">
            <Button variant="outline" className="rounded-full px-8 py-6 w-full font-bold shadow-sm group">
              Explore Shop <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
