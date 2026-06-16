"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Consultation {
  _id: string;
  doctorId?: {
    name: string;
    specialization: string;
  };
  notes?: string;
  createdAt: string;
}

export default function PatientRecordsPage() {
  const [records, setRecords] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meJson = await meRes.json();
        if (meJson.success && meJson.user && meJson.user.patientId) {
          const res = await fetch(`/api/consultations?patientId=${meJson.user.patientId}`);
          const json = await res.json();
          if (json.success && json.data) {
            // Filter completed consultations with doctor notes
            const completedNotes = json.data.filter(
              (c: any) => c.status === "Completed" && c.notes
            );
            setRecords(completedNotes);
          }
        }
      } catch (err) {
        console.error("Error fetching medical records:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const handleDownloadRecord = (record: Consultation) => {
    const { printPrescription } = require("@/lib/print-prescription");
    printPrescription(record);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading medical records...
      </div>
    );
  }

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
        {records.length > 0 ? (
          records.map((record) => (
            <div key={record._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-card rounded-2xl border border-border shadow-sm hover:border-primary/20 transition-colors gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-muted rounded-xl">
                  <FileText className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Clinical Consultation Summary</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Calendar className="w-4 h-4" /> <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-foreground/80 mt-2 font-medium">"{record.notes}"</p>
                  <p className="text-xs text-muted-foreground mt-1">Ordered & Documented by Dr. {record.doctorId?.name || "Practitioner"}</p>
                </div>
              </div>
              <Button variant="outline" className="rounded-xl self-start sm:self-auto" onClick={() => handleDownloadRecord(record)}>
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
            </div>
          ))
        ) : (
          <div className="py-12 text-center border border-dashed border-border rounded-3xl text-muted-foreground/60">
            <FileText className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm font-semibold">No medical records or clinical notes found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
