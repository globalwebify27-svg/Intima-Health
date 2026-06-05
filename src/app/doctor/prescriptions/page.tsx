"use client";

import { FileSignature, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DoctorPrescriptionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Digital Prescriptions</h1>
          <p className="text-muted-foreground mt-2">
            Write and sign new prescriptions for your patients.
          </p>
        </div>
        <Button className="rounded-xl">
          <Plus className="w-4 h-4 mr-2" /> Write Prescription
        </Button>
      </div>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-6 bg-card rounded-2xl border border-border shadow-sm hover:border-primary/20 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-muted rounded-xl">
                <FileSignature className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Rx for John Doe</h3>
                <p className="text-sm text-muted-foreground mt-1">Tadalafil 5mg • Prescribed on June {5 - i}, 2024</p>
              </div>
            </div>
            <Button variant="outline" className="rounded-xl">View Details</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
