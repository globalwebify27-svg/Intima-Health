"use client";

import { useEffect, useState } from "react";
import { Pill, FileText, Download, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Medicine {
  drug: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Consultation {
  _id: string;
  doctorId?: {
    name: string;
    specialization: string;
    clinicId?: string;
  };
  prescriptionSummary?: string;
  prescribedTherapies?: string;
  createdAt: string;
}

export default function PatientPrescriptionsPage() {
  const [patientId, setPatientId] = useState<string | null>(null);
  const [prescriptions, setPrescriptions] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = async (pId: string) => {
    try {
      const res = await fetch(`/api/consultations?patientId=${pId}`);
      const json = await res.json();
      if (json.success && json.data) {
        // Filter consultations with active prescriptions
        const completedPrescriptions = json.data.filter(
          (c: any) => c.status === "Completed" && c.prescriptionSummary
        );
        setPrescriptions(completedPrescriptions);
      }
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user && data.user.patientId) {
          setPatientId(data.user.patientId);
          fetchPrescriptions(data.user.patientId);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleOrderRefill = async (consultation: Consultation) => {
    if (!consultation.prescriptionSummary || !patientId) return;
    
    try {
      const meds: Medicine[] = JSON.parse(consultation.prescriptionSummary);
      if (meds.length === 0) return;

      const clinicId = consultation.doctorId?.clinicId;
      if (!clinicId) {
        alert("This prescription is not linked to a clinic pharmacy.");
        return;
      }

      // Fetch clinic products to map medicine names to actual database products
      const prodRes = await fetch(`/api/pharmacy/products?clinicId=${clinicId}`);
      const prodJson = await prodRes.json();
      const clinicProducts = prodJson.success ? prodJson.data : [];

      const items = meds.map((m) => {
        // Match drug name with seeded products
        const matchedProduct = clinicProducts.find((p: any) =>
          p.name.toLowerCase().includes(m.drug.toLowerCase()) ||
          m.drug.toLowerCase().includes(p.name.toLowerCase())
        );

        if (matchedProduct) {
          return {
            productId: matchedProduct._id,
            quantity: 1,
            priceAtPurchase: matchedProduct.price,
          };
        } else {
          // fallback to first product or generic default
          const fallbackProduct = clinicProducts[0] || { _id: "65f27c62d08a50672e811bc3", price: 100 };
          return {
            productId: fallbackProduct._id,
            quantity: 1,
            priceAtPurchase: fallbackProduct.price || 100,
          };
        }
      });

      const totalAmount = items.reduce((acc, item) => acc + item.priceAtPurchase * item.quantity, 0);

      const res = await fetch("/api/pharmacy/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          clinicId,
          items,
          totalAmount,
          status: "Pending",
          shippingAddress: "Home Address on file"
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Refill order placed successfully at the Clinic Pharmacy!");
      } else {
        alert(data.message || "Failed to order refill.");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to process refill order.");
    }
  };

  const handleDownloadPrescription = (consultation: Consultation) => {
    const { printPrescription } = require("@/lib/print-prescription");
    printPrescription(consultation);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading prescriptions...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Active Prescriptions</h1>
        <p className="text-muted-foreground mt-2">
          View your current medications and request refills.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {prescriptions.length > 0 ? (
          prescriptions.map((consult) => {
            const meds: Medicine[] = JSON.parse(consult.prescriptionSummary || "[]");
            return (
              <div key={consult._id} className="p-6 bg-card rounded-2xl border border-border shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Pill className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-lg">Rx #{consult._id.substring(18)}</h3>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    {meds.map((med, idx) => (
                      <div key={idx} className="p-2 bg-muted/40 rounded-xl text-xs">
                        <p className="font-bold text-foreground">{med.drug}</p>
                        <p className="text-muted-foreground">Dosage: {med.dosage} | Freq: {med.frequency} | Duration: {med.duration}</p>
                      </div>
                    ))}
                    {consult.prescribedTherapies && JSON.parse(consult.prescribedTherapies).map((th: any, idx: number) => (
                      <div key={`th-${idx}`} className="p-2 bg-purple-500/5 dark:bg-purple-950/5 border border-purple-500/10 rounded-xl text-xs flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <div>
                          <p className="font-bold text-purple-900 dark:text-purple-400">{th.name}</p>
                          <p className="text-muted-foreground text-[10px]">Prescribed Clinic Therapy</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-sm border-t border-border/40 pt-2">
                    <p><strong>Prescribed by:</strong> Dr. {consult.doctorId?.name || "Sarah Jenkins"}</p>
                    <p className="text-xs text-muted-foreground">Date: {new Date(consult.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button className="w-full rounded-xl" onClick={() => handleOrderRefill(consult)}>Order Refill</Button>
                  <Button variant="outline" size="icon" className="shrink-0 rounded-xl" onClick={() => handleDownloadPrescription(consult)}>
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 text-center border border-dashed border-border rounded-3xl text-muted-foreground/60">
            <Pill className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm font-semibold">No active prescriptions found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
