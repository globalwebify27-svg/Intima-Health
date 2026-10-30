"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Filter, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCart } from "@/store/useCart";

export interface Product {
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
  stock?: number;
}

export default function ProductsClient({ initialProducts = [] }: { initialProducts?: Product[] }) {
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [isLoading, setIsLoading] = useState<boolean>((initialProducts || []).length === 0);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [rxOnly, setRxOnly] = useState(false);
  const [otcOnly, setOtcOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"recommended" | "price-asc" | "price-desc">("recommended");

  // Fallback client-side fetch if server returned empty (e.g. cold start)
  useEffect(() => {
    if (products.length === 0) {
      fetch("/api/public/store/products")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && Array.isArray(json.data) && json.data.length > 0) {
            const mapped = json.data.map((p: Product) => ({
              ...p,
              id: p._id || p.id,
              slug: p.slug || p._id || p.id,
              price: Number(p.price || 0),
              image: p.image || "/images/product_kit_1.png",
            }));
            setProducts(mapped);
          }
        })
        .catch((err) => console.error("Client fallback product fetch error:", err))
        .finally(() => setIsLoading(false));
    }
  }, [products.length]);

  // Derive unique categories from products
  const categories = useMemo(() => {
    const set = new Set<string>();
    (products || []).forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [products]);

  // Filter & sort
  const filteredProducts = useMemo(() => {
    let list = [...(products || [])];

    if (selectedCategory !== "All") {
      list = list.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (rxOnly && !otcOnly) {
      list = list.filter((p) => p.isPrescription);
    } else if (otcOnly && !rxOnly) {
      list = list.filter((p) => !p.isPrescription);
    }

    if (sortBy === "price-asc") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return list;
  }, [products, selectedCategory, rxOnly, otcOnly, sortBy]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Section */}
      <section className="pt-12 pb-16 bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-serif font-medium mb-6">
              Clinical-grade solutions, <br />
              <span className="text-primary italic">delivered discreetly.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              From prescription treatments to at-home diagnostic panels, get exactly what you need without the waiting room.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12">
            {/* Mobile Filter Sticky Header */}
            <div className="md:hidden sticky top-[80px] z-40 bg-background/95 backdrop-blur py-4 border-b border-border flex items-center justify-between mb-8 -mx-4 px-4 shadow-sm">
              <span className="font-semibold text-lg">Filters ({filteredProducts.length})</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMobileFiltersOpen(true)}
                className="gap-2 rounded-full"
              >
                <Filter className="w-4 h-4" />
                Categories
              </Button>
            </div>

            {/* Sidebar / Filters (Desktop) */}
            <div className="hidden md:block w-64 shrink-0 space-y-8">
              <div>
                <div className="flex items-center gap-2 font-semibold mb-4 text-lg">
                  <Filter className="w-5 h-5" />
                  Categories
                </div>
                <ul className="space-y-2 text-muted-foreground">
                  {categories.map((cat) => (
                    <li key={cat}>
                      <button
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-left transition-colors font-medium text-sm py-1 px-2 rounded-lg w-full ${
                          selectedCategory === cat
                            ? "bg-primary/10 text-primary font-bold"
                            : "hover:text-foreground"
                        }`}
                      >
                        {cat === "All" ? "All Products" : cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="font-semibold mb-4 text-lg">Treatment Type</div>
                <ul className="space-y-3 text-muted-foreground text-sm">
                  <li className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rx-desk"
                      checked={rxOnly}
                      onChange={(e) => {
                        setRxOnly(e.target.checked);
                        if (e.target.checked) setOtcOnly(false);
                      }}
                      className="rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="rx-desk" className="cursor-pointer">
                      Prescription Required
                    </label>
                  </li>
                  <li className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="otc-desk"
                      checked={otcOnly}
                      onChange={(e) => {
                        setOtcOnly(e.target.checked);
                        if (e.target.checked) setRxOnly(false);
                      }}
                      className="rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <label htmlFor="otc-desk" className="cursor-pointer">
                      Over-the-Counter
                    </label>
                  </li>
                </ul>
              </div>
            </div>

            {/* Mobile Filters Modal */}
            <AnimatePresence>
              {isMobileFiltersOpen && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm md:hidden"
                  />
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-y-0 left-0 z-[101] w-[85%] max-w-sm bg-background border-r border-border shadow-2xl flex flex-col md:hidden"
                  >
                    <div className="flex items-center justify-between p-6 border-b border-border">
                      <span className="font-semibold text-xl flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filters
                      </span>
                      <button
                        onClick={() => setIsMobileFiltersOpen(false)}
                        className="p-2 rounded-full hover:bg-muted transition-colors"
                      >
                        <X className="w-5 h-5 text-muted-foreground" />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                      <div>
                        <div className="font-semibold mb-4 text-lg">Categories</div>
                        <ul className="space-y-3 text-muted-foreground text-base">
                          {categories.map((cat) => (
                            <li key={cat}>
                              <button
                                className={`text-left w-full py-1.5 px-3 rounded-lg text-sm font-medium ${
                                  selectedCategory === cat
                                    ? "bg-primary/10 text-primary font-bold"
                                    : "hover:text-foreground"
                                }`}
                                onClick={() => {
                                  setSelectedCategory(cat);
                                  setIsMobileFiltersOpen(false);
                                }}
                              >
                                {cat === "All" ? "All Products" : cat}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-6 border-t border-border">
                        <div className="font-semibold mb-4 text-lg">Treatment Type</div>
                        <ul className="space-y-4 text-muted-foreground text-base">
                          <li className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id="rx-mob"
                              checked={rxOnly}
                              onChange={(e) => {
                                setRxOnly(e.target.checked);
                                if (e.target.checked) setOtcOnly(false);
                              }}
                              className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                            />
                            <label htmlFor="rx-mob">Prescription Required</label>
                          </li>
                          <li className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id="otc-mob"
                              checked={otcOnly}
                              onChange={(e) => {
                                setOtcOnly(e.target.checked);
                                if (e.target.checked) setRxOnly(false);
                              }}
                              className="w-5 h-5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                            />
                            <label htmlFor="otc-mob">Over-the-Counter</label>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="p-6 border-t border-border bg-muted/30">
                      <Button
                        className="w-full rounded-full py-6 text-base"
                        onClick={() => setIsMobileFiltersOpen(false)}
                      >
                        Show {filteredProducts.length} Products
                      </Button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Product Grid */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-8">
                <p className="text-muted-foreground font-medium">
                  {isLoading ? "Loading products..." : `Showing ${filteredProducts.length} Products`}
                </p>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "recommended" | "price-asc" | "price-desc")}
                  className="bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 animate-pulse">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="flex flex-col bg-card rounded-2xl border border-border overflow-hidden p-6 space-y-4"
                    >
                      <div className="aspect-square bg-muted/70 rounded-xl" />
                      <div className="h-3 w-20 bg-muted rounded" />
                      <div className="h-6 w-3/4 bg-muted rounded" />
                      <div className="h-4 w-full bg-muted/50 rounded" />
                      <div className="flex justify-between items-center pt-4 mt-auto">
                        <div className="h-6 w-20 bg-muted rounded" />
                        <div className="h-8 w-20 bg-muted rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-20 text-center border rounded-2xl bg-muted/20">
                  <p className="text-muted-foreground mb-4">No products found matching your filter.</p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory("All");
                      setRxOnly(false);
                      setOtcOnly(false);
                    }}
                  >
                    Reset Filters
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {filteredProducts.map((product, index) => {
                    const productSlug = product.slug || product.id || product._id;
                    return (
                      <div
                        key={product.id}
                        className="group flex flex-col bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300"
                      >
                        {/* Product Image Area */}
                        <Link
                          href={`/products/${productSlug}`}
                          className="relative aspect-square bg-muted/50 p-6 flex items-center justify-center overflow-hidden"
                        >
                          {product.isPrescription && (
                            <div className="absolute top-4 left-4 bg-background/80 backdrop-blur text-xs font-bold px-2 py-1 rounded border border-border z-10 flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-primary" />
                              Rx
                            </div>
                          )}
                          <Image
                            src={product.image || "/images/product_kit_1.png"}
                            alt={product.name || "Product"}
                            width={300}
                            height={300}
                            priority={index < 4}
                            className="object-contain group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>

                        {/* Product Details */}
                        <div className="p-6 flex flex-col flex-1">
                          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            {product.category}
                          </div>
                          <Link href={`/products/${productSlug}`}>
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
                              onClick={() =>
                                addItem({
                                  id: product.id,
                                  name: product.name,
                                  price: product.price,
                                  image: product.image || "/images/product_kit_1.png",
                                  type: product.type || "medication",
                                  isPrescription: product.isPrescription,
                                })
                              }
                              size="sm"
                              className="rounded-full gap-2"
                            >
                              <ShoppingBag className="w-4 h-4" />
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
