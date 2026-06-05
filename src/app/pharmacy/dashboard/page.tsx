"use client";

import { ShoppingBag, Pill, PackageSearch, ArrowUpRight, ArrowDownRight, Package } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Pending Orders",
    value: "24",
    change: "+4",
    trend: "up",
    icon: ShoppingBag,
  },
  {
    title: "New Prescriptions",
    value: "12",
    change: "awaiting review",
    trend: "up",
    icon: Pill,
  },
  {
    title: "Low Stock Items",
    value: "8",
    change: "needs attention",
    trend: "down",
    icon: PackageSearch,
  },
];

export default function PharmacyDashboard() {
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
                <div className={`flex items-center text-sm font-medium ${stat.trend === 'up' ? 'text-orange-500' : 'text-red-600'}`}>
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
        <div className="lg:col-span-2 p-6 bg-card rounded-2xl border border-border shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Orders Awaiting Processing</h3>
            <Button variant="outline" size="sm">View All Orders</Button>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-muted text-muted-foreground">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Order #ORD-{9823 + item}</h4>
                    <p className="text-sm text-muted-foreground">2 Items • Standard Shipping</p>
                  </div>
                </div>
                <Button>Process Order</Button>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm min-h-[400px]">
          <h3 className="text-lg font-bold mb-6">Inventory Alerts</h3>
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div key={item} className="p-4 rounded-xl border border-red-200 bg-red-50/50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-red-900">Tadalafil 5mg Daily</h4>
                </div>
                <p className="text-sm text-red-700 mb-3">Only 14 units remaining in stock.</p>
                <Button variant="outline" size="sm" className="w-full text-red-700 border-red-200 hover:bg-red-100">Restock Now</Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
