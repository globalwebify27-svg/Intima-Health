"use client";

import { FileText, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PatientRecordsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Medical Records</h1>
          <p className="text-muted-foreground mt-2">
            Access your lab reports, clinical notes, and treatment plans.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between p-6 bg-card rounded-2xl border border-border shadow-sm hover:border-primary/20 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-muted rounded-xl">
                <FileText className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Testosterone Panel Results</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Calendar className="w-4 h-4" /> <span>June {5 - i}, 2024</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Comprehensive blood work analysis ordered by Dr. Sarah Jenkins.</p>
              </div>
            </div>
            <Button variant="outline" className="rounded-xl">
              <Download className="w-4 h-4 mr-2" /> Download PDF
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
