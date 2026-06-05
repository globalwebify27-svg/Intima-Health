"use client";

import { Pill, FileSignature, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PharmacyPrescriptionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescription Fulfillment</h1>
          <p className="text-muted-foreground mt-2">
            Review and fulfill digital prescriptions authorized by platform doctors.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-card rounded-2xl border border-border shadow-sm hover:border-primary/20 transition-colors gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-muted rounded-xl shrink-0">
                <FileSignature className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Rx #{9823 + i} for John Doe</h3>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm text-muted-foreground mt-1">
                  <span>Prescriber: Dr. Sarah Jenkins</span>
                  <span className="hidden md:inline">•</span>
                  <span>Issued: June {5 - i}, 2024</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Pill className="w-3 h-3" /> Tadalafil 5mg (30 tabs)
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex md:flex-col gap-2 shrink-0">
              <Button className="rounded-xl w-full">
                <CheckCircle className="w-4 h-4 mr-2" /> Verify & Fulfill
              </Button>
              <Button variant="outline" className="rounded-xl w-full">View Details</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
