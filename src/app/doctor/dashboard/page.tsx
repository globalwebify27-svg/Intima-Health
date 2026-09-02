"use client";

import { useEffect, useState } from "react";
import { Users, Calendar, Video, ArrowUpRight, Clock, FileSignature } from "lucide-react";
import { formatTime12Hour } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface DoctorData {
  _id: string;
  name: string;
  specialization: string;
  experience: number;
  slotDuration?: number;
}

export default function DoctorDashboard() {
  const [doctor, setDoctor] = useState<DoctorData | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meJson = await meRes.json();
        if (!meJson.success || meJson.user.role !== "DOCTOR") {
          window.location.href = "/staff-login";
          return;
        }

        const dId = meJson.user.doctorId;
        if (dId) {
          // Fetch specific doctor profile
          const docRes = await fetch(`/api/doctors/${dId}`);
          const docJson = await docRes.json();
          if (docJson.success) {
            setDoctor(docJson.data);
          }

          // Fetch appointments for this doctor
          const aptsRes = await fetch(`/api/appointments?doctorId=${dId}`);
          const aptsJson = await aptsRes.json();
          if (aptsJson.success) {
            setAppointments(aptsJson.data);
          }
        }
      } catch (err) {
        console.error("Error loading doctor dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") fetchDashboardData();
    }, 30000);
    const onFocus = () => fetchDashboardData();
    window.addEventListener("focus", onFocus);
    return () => { clearInterval(interval); window.removeEventListener("focus", onFocus); };
  }, []);

  const handleStartSession = async (appointmentId: string) => {
    try {
      await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Engaged" }),
      });
    } catch (err) {
      console.error("Failed to update status to Engaged", err);
    } finally {
      window.location.href = `/doctor/consultations?appointmentId=${appointmentId}`;
    }
  };

  const todayStr = typeof window !== "undefined" ? new Date().toLocaleDateString("en-CA") : "";
  const currentMonth = todayStr.substring(0, 7); // e.g. "2026-06"
  // Only show today's appointments where patient has paid
  const todayApts = appointments.filter(
    (a) => a.date === todayStr && a.paymentStatus === "Paid"
  );
  const completedApts = appointments.filter((a) => a.status === "Completed" && a.paymentStatus === "Paid");
  const pendingToday = todayApts.filter((a) => a.status === "Scheduled").length;

  // Only count unique patients from completed appointments in the current month
  const thisMonthCompleted = completedApts.filter((a) => a.date && a.date.startsWith(currentMonth));
  const uniquePatientsCount = new Set(
    thisMonthCompleted.map((a) => (a.patientId?._id || a.patientId || "").toString())
  ).size;

  const totalHours = (completedApts.length * (doctor?.slotDuration || 30)) / 60;

  const stats = [
    {
      title: "Patients Seen (Month)",
      value: String(uniquePatientsCount),
      change: "+10%",
      icon: Users,
    },
    {
      title: "Today's Appointments",
      value: String(todayApts.length),
      change: `${pendingToday} pending`,
      icon: Calendar,
    },
    {
      title: "Total Consult Hours",
      value: `${totalHours}h`,
      change: `+${totalHours}h`,
      icon: Video,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome, {loading ? "Loading..." : doctor ? doctor.name : "Dr. Smith"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {doctor ? `${doctor.specialization} Specialist • ${doctor.experience} years experience` : "Here is your clinical schedule and overview for today."}
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
                <div className="flex items-center text-sm font-medium text-green-600">
                  {stat.change}
                  <ArrowUpRight className="w-4 h-4 ml-1" />
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
        {/* Today's Schedule */}
        <div className="lg:col-span-2 p-6 bg-card rounded-2xl border border-border shadow-sm min-h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Today's Schedule</h3>
            <Button variant="outline" size="sm">View Calendar</Button>
          </div>
          <div className="space-y-4">
            {todayApts.length > 0 ? (
              todayApts.map((apt) => (
                <div key={apt._id} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center px-3 h-12 rounded-xl bg-primary/10 text-primary font-bold text-sm">
                      {formatTime12Hour(apt.time)}
                    </div>
                    <div>
                      <h4 className="font-semibold flex items-center gap-2">
                        {apt.patientId?.name || "Patient"}
                        {apt.status === "Checked In" && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            Patient Waiting
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground">{apt.serviceName || `${apt.type} Consult`} • {apt.notes || "Routine checkup"}</p>
                    </div>
                  </div>
                  {apt.status === "Completed" ? (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3.5 py-1.5 rounded-xl border border-emerald-500/20">
                      Completed
                    </span>
                  ) : apt.status === "Cancelled" ? (
                    <span className="text-xs font-bold text-red-600 bg-red-500/10 px-3.5 py-1.5 rounded-xl border border-red-500/20">
                      Cancelled
                    </span>
                  ) : (apt.status === "Checked In" || apt.status === "Engaged") ? (
                    <Button 
                      size="sm"
                      onClick={() => handleStartSession(apt._id)}
                    >
                      {apt.status === "Engaged" ? "Rejoin Session" : "Start Session"}
                    </Button>
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground bg-muted px-3.5 py-1.5 rounded-xl border border-border">
                      {apt.status}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Calendar className="w-10 h-10 mb-2 text-muted-foreground/50" />
                <p className="font-medium text-sm">No appointments scheduled for today.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm min-h-[400px]">
          <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start h-12" size="lg">
              <FileSignature className="w-4 h-4 mr-2" /> Write Prescription
            </Button>
            <Button variant="outline" className="w-full justify-start h-12" size="lg">
              <Clock className="w-4 h-4 mr-2" /> Update Availability
            </Button>
            <Button variant="outline" className="w-full justify-start h-12" size="lg">
              <Users className="w-4 h-4 mr-2" /> View Patient Directory
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
