"use client";

import { useEffect, useState } from "react";
import { Users, UserPlus, Calendar, IndianRupee, ArrowUpRight, ArrowDownRight, TrendingUp, Clock } from "lucide-react";
import { formatTime12Hour } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface StatsData {
  totalRevenue: number;
  totalPatients: number;
  activeDoctors: number;
  todayAppointments: number;
  totalAppointments: number;
  statusCounts: { Scheduled: number; Completed: number; Cancelled: number };
  monthlyRevenue: { month: string; revenue: number; count: number }[];
  serviceBreakdown: { name: string; count: number }[];
  topDoctors: { name: string; specialization: string; appointments: number }[];
  recentAppointments: {
    _id: string;
    patientName: string;
    doctorName: string;
    doctorSpec: string;
    date: string;
    time: string;
    status: string;
    serviceName: string;
    paymentStatus: string;
    feeAmount: number;
  }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [clinics, setClinics] = useState<any[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<string>("all");

  useEffect(() => {
    fetch("/api/clinics")
      .then(res => res.json())
      .then(json => {
        if (json.success) setClinics(json.data);
      })
      .catch(err => console.error("Clinics fetch error:", err));
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = selectedClinic === "all" ? "/api/admin/stats" : `/api/admin/stats?clinicId=${selectedClinic}`;
    fetch(url)
      .then(res => res.json())
      .then(json => {
        if (json.success) setStats(json.data);
      })
      .catch(err => console.error("Stats fetch error:", err))
      .finally(() => setLoading(false));
  }, [selectedClinic]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-2">Monitor your platform&apos;s overall performance and metrics.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 bg-card rounded-2xl border border-border shadow-sm animate-pulse">
              <div className="h-4 w-24 bg-muted rounded mb-4" />
              <div className="h-8 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="p-6 bg-card rounded-2xl border border-border shadow-sm min-h-[400px] animate-pulse" />
          <div className="p-6 bg-card rounded-2xl border border-border shadow-sm min-h-[400px] animate-pulse" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">
        Failed to load dashboard data.
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Total Patients",
      value: stats.totalPatients.toString(),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-500/10",
    },
    {
      title: "Active Doctors",
      value: stats.activeDoctors.toString(),
      icon: UserPlus,
      color: "text-purple-600",
      bg: "bg-purple-500/10",
    },
    {
      title: "Appointments (Today)",
      value: stats.todayAppointments.toString(),
      icon: Calendar,
      color: "text-orange-600",
      bg: "bg-orange-500/10",
    },
  ];

  const maxRevenue = Math.max(...stats.monthlyRevenue.map(m => m.revenue), 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-2">Monitor your platform&apos;s overall performance and metrics.</p>
        </div>
        <select
          value={selectedClinic}
          onChange={(e) => setSelectedClinic(e.target.value)}
          className="h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="all">All Clinics (Global)</option>
          {clinics.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
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
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
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

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-card rounded-2xl border border-border shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">Revenue Trend</h3>
              <p className="text-xs text-muted-foreground mt-1">Last 6 months</p>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-end gap-3 h-[280px] pt-4">
            {stats.monthlyRevenue.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-bold text-primary">
                  {m.revenue > 0 ? `₹${(m.revenue / 1000).toFixed(1)}k` : ""}
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max((m.revenue / maxRevenue) * 100, 4)}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                  className="w-full rounded-xl bg-gradient-to-t from-primary to-primary/60 min-h-[4px]"
                />
                <span className="text-[10px] text-muted-foreground font-medium">{m.month}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-card rounded-2xl border border-border shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">Recent Appointments</h3>
              <p className="text-xs text-muted-foreground mt-1">Latest bookings</p>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          {stats.recentAppointments.length === 0 ? (
            <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
              No appointments yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {stats.recentAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {apt.patientName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{apt.patientName}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      Dr. {apt.doctorName} · {apt.date} · {formatTime12Hour(apt.time)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge
                      variant={apt.status === "Scheduled" ? "secondary" : apt.status === "Completed" ? "default" : "destructive"}
                      className="text-[9px] h-5"
                    >
                      {apt.status}
                    </Badge>
                    {apt.feeAmount > 0 && (
                      <span className="text-[10px] font-bold text-primary">₹{apt.feeAmount}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Appointment Status Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid gap-6 md:grid-cols-3"
      >
        {([
          { label: "Scheduled", count: stats.statusCounts.Scheduled, color: "bg-blue-500", textColor: "text-blue-600" },
          { label: "Completed", count: stats.statusCounts.Completed, color: "bg-emerald-500", textColor: "text-emerald-600" },
          { label: "Cancelled", count: stats.statusCounts.Cancelled, color: "bg-red-500", textColor: "text-red-600" },
        ]).map((item) => {
          const total = stats.totalAppointments || 1;
          const pct = Math.round((item.count / total) * 100);
          return (
            <div key={item.label} className="p-5 bg-card rounded-2xl border border-border shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                <span className={`text-lg font-bold ${item.textColor}`}>{item.count}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className={`h-full rounded-full ${item.color}`}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">{pct}% of total appointments</p>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
