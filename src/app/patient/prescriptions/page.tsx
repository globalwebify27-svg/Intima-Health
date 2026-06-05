"use client";

import { Pill, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PatientPrescriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Active Prescriptions</h1>
        <p className="text-muted-foreground mt-2">
          View your current medications and request refills.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 bg-card rounded-2xl border border-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Pill className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">Tadalafil 5mg Daily</h3>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">Take 1 tablet daily at the same time each day. Do not exceed prescribed dosage.</p>
            <div className="text-sm">
              <p><strong>Prescribed by:</strong> Dr. Sarah Jenkins</p>
              <p><strong>Refills remaining:</strong> 2</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <Button className="w-full rounded-xl">Order Refill</Button>
            <Button variant="outline" size="icon" className="shrink-0"><FileText className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
