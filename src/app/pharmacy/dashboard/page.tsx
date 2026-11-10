"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, Pill, PackageSearch, Package, X, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OrderItem {
  productId?: {
    name: string;
  };
  quantity: number;
}

interface Order {
  _id: string;
  totalAmount: number;
  status: string;
  items: OrderItem[];
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  stock: number;
  status: string;
  category?: string;
  packSize?: string;
}

export default function PharmacyDashboard() {
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [prescriptionsCount, setPrescriptionsCount] = useState(0);

  // Restock modal state
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(50);
  const [restocking, setRestocking] = useState(false);
  const [restockError, setRestockError] = useState("");

  const fetchDashboardData = async (cId: string) => {
    try {
      setLoading(true);
      // 1. Fetch Orders
      const ordersRes = await fetch(`/api/pharmacy/orders?clinicId=${cId}`);
      const ordersJson = await ordersRes.json();
      if (ordersJson.success) {
        setOrders(ordersJson.data || []);
      }

      // 2. Fetch Products
      const productsRes = await fetch(`/api/pharmacy/products?clinicId=${cId}`);
      const productsJson = await productsRes.json();
      if (productsJson.success) {
        setProducts(productsJson.data || []);
      }

      // 3. Fetch Prescriptions Count (Walk-in, Standalone & Video Consultations across platform)
      const rxUrl = `/api/consultations?_t=${Date.now()}`;
      const rxRes = await fetch(rxUrl, { cache: "no-store", credentials: "include" });
      const rxJson = await rxRes.json();
      if (rxJson.success && rxJson.data) {
        const activeRx = rxJson.data.filter((c: any) => {
          const hasMeds = c.prescriptionSummary && c.prescriptionSummary !== "[]" && c.prescriptionSummary.trim() !== "";
          const hasTherapies = c.prescribedTherapies && c.prescribedTherapies !== "[]" && c.prescribedTherapies.trim() !== "";
          return (hasMeds || hasTherapies) && c.prescriptionStatus !== "Fulfilled";
        });
        setPrescriptionsCount(activeRx.length);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && data.user.clinicId) {
          setClinicId(data.user.clinicId);
          fetchDashboardData(data.user.clinicId);
        } else {
          fetchDashboardData("");
        }
      })
      .catch(() => fetchDashboardData(""));
  }, []);

  const handleProcessOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/pharmacy/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Delivered" }),
      });
      const data = await res.json();
      if (data.success && clinicId) {
        fetchDashboardData(clinicId);
      }
    } catch (err) {
      console.error("Fulfillment error:", err);
    }
  };

  const handleOpenRestock = (product: Product) => {
    setRestockProduct(product);
    setRestockQty(50);
    setRestockError("");
  };

  const handleConfirmRestock = async () => {
    if (!restockProduct || !restockQty || restockQty <= 0) return;
    setRestocking(true);
    setRestockError("");
    try {
      const newStock = restockProduct.stock + Number(restockQty);
      const res = await fetch("/api/pharmacy/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: restockProduct._id, stock: newStock }),
      });
      const data = await res.json();
      if (data.success) {
        setRestockProduct(null);
        setRestockQty(50);
        if (clinicId) {
          fetchDashboardData(clinicId);
        }
      } else {
        setRestockError(data.message || "Failed to update stock.");
      }
    } catch (err: any) {
      console.error("Restock error:", err);
      setRestockError(err.message || "An error occurred while updating stock.");
    } finally {
      setRestocking(false);
    }
  };

  const pendingOrders = orders.filter(o => {
    const s = (o.status || "").toUpperCase();
    return !["FULFILLED", "DELIVERED", "CANCELLED"].includes(s);
  });
  const lowStockProducts = products.filter(p => p.stock <= 15);

  const stats = [
    {
      title: "Pending Orders",
      value: pendingOrders.length,
      change: "awaiting dispatch",
      trend: "up",
      icon: ShoppingBag,
    },
    {
      title: "Active Prescriptions",
      value: prescriptionsCount,
      change: "authorized rx",
      trend: "up",
      icon: Pill,
    },
    {
      title: "Low Stock Items",
      value: lowStockProducts.length,
      change: "requires attention",
      trend: "down",
      icon: PackageSearch,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading Fulfillment Center Dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Fulfillment Center</h1>
        <p className="text-muted-foreground mt-2">
          Manage orders, verify prescriptions, and track inventory.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-card rounded-2xl border border-border shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex items-center text-xs font-semibold text-muted-foreground">
                  {stat.change}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders to Process */}
        <div className="lg:col-span-2 p-6 bg-card rounded-2xl border border-border shadow-sm min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Orders Awaiting Processing</h3>
            <Button variant="outline" size="sm" onClick={() => window.location.href = "/pharmacy/orders"}>View All Orders</Button>
          </div>
          
          <div className="space-y-4 flex-1">
            {pendingOrders.length > 0 ? (
              pendingOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-muted text-muted-foreground">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Order #${order._id.substring(18)}</h4>
                      <p className="text-xs text-muted-foreground">
                        {order.items.length} Items • Total: ₹{order.totalAmount}
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => handleProcessOrder(order._id)}>Fulfill Order</Button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm flex items-center justify-center h-full">
                No pending orders awaiting fulfillment.
              </div>
            )}
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm min-h-[400px] flex flex-col">
          <h3 className="text-lg font-bold mb-6">Inventory Alerts</h3>
          <div className="space-y-4 flex-1">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((prod) => (
                <div key={prod._id} className="p-4 rounded-xl border border-red-200 bg-red-50/50 dark:bg-red-950/10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-red-900 dark:text-red-400">{prod.name}</h4>
                  </div>
                  <p className="text-xs text-red-700 dark:text-red-300 mb-3">Only {prod.stock} units remaining in stock.</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleOpenRestock(prod)} 
                    className="w-full text-red-700 border-red-200 hover:bg-red-100 dark:hover:bg-red-950/20 font-bold rounded-xl"
                  >
                    Restock Now
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm flex items-center justify-center h-full">
                All inventory levels are optimal.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Restock Inventory Modal with Quantity Input */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 shadow-2xl relative space-y-5 animate-in zoom-in-95">
            <button 
              onClick={() => { setRestockProduct(null); setRestockQty(50); }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                <PackageSearch className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Restock Product Inventory</h3>
                <p className="text-xs text-muted-foreground">Specify the quantity to add to stock</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-muted/40 rounded-2xl border border-border/60 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Medicine Name</span>
                <p className="text-sm font-bold text-foreground leading-snug">{restockProduct.name}</p>
                <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                  <span>Current Stock: <strong className="text-amber-600 dark:text-amber-400 font-bold">{restockProduct.stock} units</strong></span>
                  {restockProduct.category && <span>• {restockProduct.category}</span>}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="restock-qty" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Quantity to Add *
                  </label>
                  <span className="text-xs font-semibold text-primary">
                    New Total Stock: <strong>{restockProduct.stock + (Number(restockQty) || 0)} units</strong>
                  </span>
                </div>
                <Input
                  id="restock-qty"
                  type="number"
                  min={1}
                  value={restockQty || ""}
                  onChange={(e) => setRestockQty(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="Enter quantity to add..."
                  className="h-11 rounded-xl text-base font-bold bg-background focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
                
                {/* Quick Add Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-muted-foreground font-medium mr-1">Quick Select:</span>
                  {[20, 50, 100, 200, 500].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRestockQty(num)}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-all ${
                        restockQty === num
                          ? "bg-primary text-white border-primary shadow-xs"
                          : "bg-muted/40 hover:bg-muted text-foreground border-border/60"
                      }`}
                    >
                      +{num}
                    </button>
                  ))}
                </div>
              </div>

              {restockError && (
                <p className="text-xs text-destructive font-semibold">{restockError}</p>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border/40">
                <Button
                  variant="outline"
                  onClick={() => { setRestockProduct(null); setRestockQty(50); }}
                  className="rounded-xl h-11 px-5 font-bold"
                  disabled={restocking}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmRestock}
                  className="rounded-xl h-11 px-6 font-bold shadow-md bg-primary hover:bg-primary/90 text-white"
                  disabled={restocking || !restockQty || restockQty <= 0}
                >
                  {restocking ? "Updating Stock..." : `Add +${restockQty} to Stock`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
