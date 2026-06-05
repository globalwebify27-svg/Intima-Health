"use client";

import { Users, UserPlus, Calendar, IndianRupee, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";
import { mockDoctors, mockPatients, mockAppointments, mockOrders } from "@/lib/mock-data";

export default function AdminDashboard() {
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const activePatients = mockPatients.filter(p => p.status === "Active").length;
  const activeDoctors = mockDoctors.filter(d => d.status === "Active").length;
  const todaysAppointments = mockAppointments.length;

  const stats = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      trend: "up",
      icon: IndianRupee,
    },
    {
      title: "Active Patients",
      value: activePatients.toString(),
      change: "+18.2%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Active Doctors",
      value: activeDoctors.toString(),
      change: "+2.4%",
      trend: "up",
      icon: UserPlus,
    },
    {
      title: "Appointments (Today)",
      value: todaysAppointments.toString(),
      change: "-4.1%",
      trend: "down",
      icon: Calendar,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your platform's overall performance and metrics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
                <div className={`flex items-center text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                  {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4 ml-1" /> : <ArrowDownRight className="w-4 h-4 ml-1" />}
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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm min-h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Revenue Chart Placeholder</p>
        </div>
        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm min-h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Recent Appointments Placeholder</p>
        </div>
      </div>
    </div>
  );
}
