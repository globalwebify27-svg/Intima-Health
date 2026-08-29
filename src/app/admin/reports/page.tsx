"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  IndianRupee,
  CheckCircle2,
  XCircle,
  Clock,
  Activity,
  Users,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Range = "week" | "month" | "3months" | "all";

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
  recentAppointments: any[];
}

const RANGE_OPTIONS: { label: string; value: Range }[] = [
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "Last 3 Months", value: "3months" },
  { label: "All Time", value: "all" },
];

export default function ReportsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>("all");
  const [clinics, setClinics] = useState<any[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<string>("all");

  const fetchStats = async (r: Range, clinicId: string) => {
    setLoading(true);
    try {
      let url = `/api/admin/stats?range=${r}`;
      if (clinicId !== "all") {
        url += `&clinicId=${clinicId}`;
      }
      const res = await fetch(url, { cache: "no-store" });
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/clinics")
      .then(res => res.json())
      .then(json => {
        if (json.success) setClinics(json.data);
      })
      .catch(err => console.error("Clinics fetch error:", err));
  }, []);

  useEffect(() => {
    // Auth check
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        if (!data.success || data.user?.role !== "SUPER_ADMIN") {
          router.push("/staff-login");
        }
      })
      .catch(() => router.push("/staff-login"));
  }, []);

  useEffect(() => {
    fetchStats(range, selectedClinic);
  }, [range, selectedClinic]);

  if (loading && !stats) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1 text-sm">Loading report data...</p>
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 bg-card rounded-2xl border border-border shadow-sm animate-pulse">
              <div className="h-4 w-24 bg-muted rounded mb-4" />
              <div className="h-8 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">
        Failed to load report data.
      </div>
    );
  }

  const completedPct = stats.totalAppointments > 0
    ? Math.round((stats.statusCounts.Completed / stats.totalAppointments) * 100)
    : 0;
  const cancelledPct = stats.totalAppointments > 0
    ? Math.round((stats.statusCounts.Cancelled / stats.totalAppointments) * 100)
    : 0;

  const maxRevenue = Math.max(...stats.monthlyRevenue.map(m => m.revenue), 1);
  const maxServiceCount = Math.max(...stats.serviceBreakdown.map(s => s.count), 1);

  const summaryCards = [
    { title: "Total Appointments", value: stats.totalAppointments, icon: Calendar, color: "text-blue-600", bg: "bg-blue-500/10" },
    { title: "Total Revenue", value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-emerald-600", bg: "bg-emerald-500/10" },
    { title: "Completed Rate", value: `${completedPct}%`, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-500/10" },
    { title: "Cancelled Rate", value: `${cancelledPct}%`, icon: XCircle, color: "text-red-600", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-card border border-border shadow-sm rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              Comprehensive overview of your platform performance.
            </p>
          </div>
        </div>
        {/* Filters */}
        <div className="flex gap-4 flex-wrap items-center">
          <select
            value={selectedClinic}
            onChange={(e) => setSelectedClinic(e.target.value)}
            className="h-9 px-3 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Clinics</option>
            {clinics.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
          
          <div className="flex gap-2 flex-wrap">
            {RANGE_OPTIONS.map(opt => (
              <Button
                key={opt.value}
                variant={range === opt.value ? "default" : "outline"}
                size="sm"
                onClick={() => setRange(opt.value)}
                className="rounded-xl text-xs h-9 px-4"
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="p-6 bg-card rounded-2xl border border-border shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Trend + Appointment Status */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Trend (2/3 width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 p-6 bg-card rounded-2xl border border-border shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">Revenue Trend</h3>
              <p className="text-xs text-muted-foreground mt-1">Monthly revenue (last 6 months)</p>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-end gap-4 h-[250px] pt-4">
            {stats.monthlyRevenue.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <span className="text-[10px] font-bold text-primary whitespace-nowrap">
                  {m.revenue > 0 ? `₹${(m.revenue / 1000).toFixed(1)}k` : "–"}
                </span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max((m.revenue / maxRevenue) * 100, 3)}%` }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                  className="w-full rounded-xl bg-gradient-to-t from-primary to-primary/60 min-h-[3px]"
                />
                <div className="text-center">
                  <span className="text-[10px] text-muted-foreground font-medium block">{m.month}</span>
                  <span className="text-[9px] text-muted-foreground/60">{m.count} appts</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Appointment Status Breakdown (1/3 width) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 bg-card rounded-2xl border border-border shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Status Breakdown</h3>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Activity className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="space-y-5">
            {([
              { label: "Scheduled", count: stats.statusCounts.Scheduled, color: "bg-blue-500", text: "text-blue-600" },
              { label: "Completed", count: stats.statusCounts.Completed, color: "bg-emerald-500", text: "text-emerald-600" },
              { label: "Cancelled", count: stats.statusCounts.Cancelled, color: "bg-red-500", text: "text-red-600" },
            ]).map((item) => {
              const total = stats.totalAppointments || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
                    <span className={`text-sm font-bold ${item.text}`}>{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                      className={`h-full rounded-full ${item.color}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">Total: <span className="font-bold text-foreground">{stats.totalAppointments}</span> appointments</p>
          </div>
        </motion.div>
      </div>

      {/* Service Breakdown + Top Doctors */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Service Popularity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-6 bg-card rounded-2xl border border-border shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">Service Popularity</h3>
              <p className="text-xs text-muted-foreground mt-1">Bookings per service type</p>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
          </div>
          {stats.serviceBreakdown.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
              No service data yet.
            </div>
          ) : (
            <div className="space-y-4">
              {stats.serviceBreakdown.map((service, i) => {
                const pct = Math.round((service.count / maxServiceCount) * 100);
                return (
                  <div key={service.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium truncate max-w-[200px]">{service.name}</span>
                      <span className="text-sm font-bold text-primary">{service.count}</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.6 + i * 0.05, duration: 0.4 }}
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Top Doctors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-6 bg-card rounded-2xl border border-border shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">Top Doctors</h3>
              <p className="text-xs text-muted-foreground mt-1">By appointment count</p>
            </div>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <Stethoscope className="w-4 h-4 text-orange-600" />
            </div>
          </div>
          {stats.topDoctors.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
              No doctor data yet.
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topDoctors.map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">Dr. {doc.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{doc.specialization}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] h-6 shrink-0">
                    {doc.appointments} appts
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
