"use client";

import { Users, Calendar, Video, ArrowUpRight, Clock, FileSignature } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Patients Seen (Month)",
    value: "142",
    change: "+12%",
    icon: Users,
  },
  {
    title: "Today's Appointments",
    value: "8",
    change: "3 pending",
    icon: Calendar,
  },
  {
    title: "Total Consult Hours",
    value: "45h",
    change: "+5h",
    icon: Video,
  },
];

export default function DoctorDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, Dr. Smith</h1>
        <p className="text-muted-foreground mt-2">
          Here is your clinical schedule and overview for today.
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
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-bold">
                    {9 + item}:00
                  </div>
                  <div>
                    <h4 className="font-semibold">John Doe</h4>
                    <p className="text-sm text-muted-foreground">Follow-up • Erectile Dysfunction</p>
                  </div>
                </div>
                <Button>Start Call</Button>
              </div>
            ))}
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
