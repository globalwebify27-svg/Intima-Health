"use client";

import { Calendar, Pill, Video, FileText, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function PatientDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, John!</h1>
        <p className="text-muted-foreground mt-2">
          Here is what's happening with your health journey today.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Next Appointment Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 bg-primary/5 rounded-2xl border border-primary/20 shadow-sm col-span-full lg:col-span-1 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Video className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">Upcoming</span>
          </div>
          <h3 className="text-xl font-bold mb-2">Dr. Sarah Jenkins</h3>
          <p className="text-muted-foreground mb-6">Video Consultation • Today, 4:30 PM</p>
          <Button className="w-full rounded-xl">Join Consultation</Button>
        </motion.div>

        {/* Active Prescriptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 bg-card rounded-2xl border border-border shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-muted rounded-lg">
                <Pill className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="font-semibold">Active Prescriptions</h3>
            </div>
            <p className="text-2xl font-bold mb-2">2 Medications</p>
            <p className="text-sm text-muted-foreground">Next refill due in 14 days.</p>
          </div>
          <Button variant="outline" className="mt-6 w-full rounded-xl group">
            Request Refill <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Recent Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-card rounded-2xl border border-border shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-muted rounded-lg">
                <FileText className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="font-semibold">Recent Lab Reports</h3>
            </div>
            <p className="text-2xl font-bold mb-2">Testosterone Panel</p>
            <p className="text-sm text-green-600 font-medium">Results available</p>
          </div>
          <Button variant="outline" className="mt-6 w-full rounded-xl group">
            View Results <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm min-h-[300px]">
          <h3 className="text-lg font-bold mb-4">Treatment Plan Timeline</h3>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Timeline Placeholder
          </div>
        </div>
        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm min-h-[300px]">
          <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Orders List Placeholder
          </div>
        </div>
      </div>
    </div>
  );
}
