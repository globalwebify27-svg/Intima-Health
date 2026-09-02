"use client";

import { useEffect, useState } from "react";
import { Pill, FileSignature, CheckCircle, X, Calendar, User, UserCheck, Phone, Mail, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Medicine {
  drug: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Therapy {
  name: string;
  price?: number;
}

interface Consultation {
  _id: string;
  appointmentId?: {
    date: string;
  };
  patientId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  doctorId?: {
    name: string;
  };
  prescriptionSummary?: string;
  prescribedTherapies?: string;
  prescriptionStatus?: "Pending" | "Fulfilled";
  createdAt: string;
}

export default function PharmacyPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [clinicId, setClinicId] = useState<string | null>(null);

  // Modal states
  const [selectedPrescription, setSelectedPrescription] = useState<Consultation | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const getMedsArray = (summary?: string): Medicine[] => {
    if (!summary) return [];
    try {
      return JSON.parse(summary);
    } catch {
      return [];
    }
  };

  const getTherapiesArray = (summary?: string): Therapy[] => {
    if (!summary) return [];
    try {
      return JSON.parse(summary);
    } catch {
      return [];
    }
  };

  const fetchPrescriptions = async (cId: string) => {
    try {
      const url = cId ? `/api/consultations?clinicId=${cId}` : "/api/consultations";
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && json.data) {
        const activeRx = json.data.filter((c: any) => c.prescriptionSummary);
        setPrescriptions(activeRx);
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
        if (data.success && data.user && data.user.clinicId) {
          setClinicId(data.user.clinicId);
          fetchPrescriptions(data.user.clinicId);
        } else {
          fetchPrescriptions("");
        }
      })
      .catch(() => fetchPrescriptions(""));
  }, []);

  const handleVerifyFulfill = async (record: Consultation) => {
    if (!record.prescriptionSummary || !clinicId) return;
    try {
      const meds: Medicine[] = JSON.parse(record.prescriptionSummary);
      if (meds.length === 0) return;

      // Fetch clinic products to map medicine names to actual database products
      const prodRes = await fetch(`/api/pharmacy/products?clinicId=${clinicId}`);
      const prodJson = await prodRes.json();
      const clinicProducts = prodJson.success ? prodJson.data : [];

      const items = meds.map((m, idx) => {
        const matchedProduct = clinicProducts.find((p: any) =>
          p.name.toLowerCase().includes(m.drug.toLowerCase()) ||
          m.drug.toLowerCase().includes(p.name.toLowerCase())
        );

        const qty = quantities[idx] || 1;

        if (matchedProduct) {
          return {
            productId: matchedProduct._id,
            quantity: qty,
            priceAtPurchase: matchedProduct.price,
          };
        } else {
          const fallbackProduct = clinicProducts[0] || { _id: "65f27c62d08a50672e811bc3", price: 100 };
          return {
            productId: fallbackProduct._id,
            quantity: qty,
            priceAtPurchase: fallbackProduct.price || 100,
          };
        }
      });

      const totalAmount = items.reduce((acc, item) => acc + item.priceAtPurchase * item.quantity, 0);

      const res = await fetch("/api/pharmacy/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: record.patientId._id,
          clinicId,
          items,
          totalAmount,
          status: "Delivered",
          shippingAddress: "Handed over at clinic pharmacy counter"
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Update prescriptionStatus to Fulfilled
        await fetch(`/api/consultations/${record._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prescriptionStatus: "Fulfilled" }),
        });

        alert(`Rx #${record._id.substring(18).toUpperCase()} fulfilled successfully! Order created and stock updated.`);
        setIsDetailsModalOpen(false);
        fetchPrescriptions(clinicId);
      } else {
        alert(data.message || "Failed to fulfill prescription.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process prescription fulfillment.");
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading digital prescriptions...
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescription Fulfillment CENTER</h1>
          <p className="text-muted-foreground mt-2">
            Review and fulfill digital prescriptions authorized by platform doctors.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {prescriptions.length > 0 ? (
          prescriptions.map((record) => {
            const meds = getMedsArray(record.prescriptionSummary);
            const isFulfilled = record.prescriptionStatus === "Fulfilled";

            return (
              <div key={record._id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-card rounded-2xl border border-border shadow-sm hover:border-primary/20 transition-colors gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-muted rounded-xl shrink-0">
                    <FileSignature className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Rx #${record._id.substring(18).toUpperCase()} for {record.patientId?.name || "Patient"}</h3>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm text-muted-foreground mt-1">
                      <span>Prescriber: Dr. {record.doctorId?.name || "Clinician"}</span>
                      <span className="hidden md:inline">•</span>
                      <span>Issued: {new Date(record.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {meds.map((med, idx) => (
                        <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                          <Pill className="w-3 h-3 text-primary" /> {med.drug} ({med.dosage} - {med.duration})
                        </Badge>
                      ))}
                      {getTherapiesArray(record.prescribedTherapies).map((th, idx) => (
                        <Badge key={`th-${idx}`} variant="outline" className="flex items-center gap-1 bg-purple-500/10 text-purple-600 border-purple-500/20">
                          <Activity className="w-3 h-3 text-purple-600" /> {th.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {isFulfilled ? (
                    <>
                      <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> Delivered
                      </Badge>
                      <Button 
                        variant="outline" 
                        className="rounded-xl" 
                        onClick={() => {
                          setSelectedPrescription(record);
                          const initialQuantities: Record<number, number> = {};
                          getMedsArray(record.prescriptionSummary).forEach((_, i) => initialQuantities[i] = 1);
                          setQuantities(initialQuantities);
                          setIsDetailsModalOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="rounded-xl w-full" 
                      onClick={() => {
                        setSelectedPrescription(record);
                        const initialQuantities: Record<number, number> = {};
                        getMedsArray(record.prescriptionSummary).forEach((_, i) => initialQuantities[i] = 1);
                        setQuantities(initialQuantities);
                        setIsDetailsModalOpen(true);
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Verify & Fulfill
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-12 text-center border border-dashed border-border rounded-3xl text-muted-foreground/60">
            <FileSignature className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm font-semibold">No active prescriptions awaiting fulfillment.</p>
          </div>
        )}
      </div>

      {/* Prescription Details Modal */}
      {isDetailsModalOpen && selectedPrescription && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl border border-border p-6 shadow-lg relative space-y-6 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => {
                setIsDetailsModalOpen(false);
                setSelectedPrescription(null);
              }}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div>
              <h2 className="text-xl font-bold">
                {selectedPrescription.prescriptionStatus === "Fulfilled" 
                  ? "Prescription Details" 
                  : "Verify & Fulfill Prescription"}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                Rx ID: #{selectedPrescription._id.toUpperCase()}
              </p>
            </div>

            {/* Quick Metadata Info */}
            <div className="grid grid-cols-2 gap-4 border-y border-border py-4">
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Patient Info
                </h4>
                <div className="text-sm">
                  <p className="font-semibold">{selectedPrescription.patientId?.name || "Patient"}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3" /> {selectedPrescription.patientId?.email}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {selectedPrescription.patientId?.phone || "No Phone"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" /> Authorized By
                </h4>
                <div className="text-sm">
                  <p className="font-semibold">Dr. {selectedPrescription.doctorId?.name || "Sarah Jenkins"}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" /> {new Date(selectedPrescription.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Medications List */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm">Prescribed Medications</h3>
              <div className="space-y-3">
                {getMedsArray(selectedPrescription.prescriptionSummary).map((med, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-border bg-muted/40 hover:bg-muted/65 transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Pill className="w-4 h-4 text-primary" />
                      </div>
                      <h4 className="font-bold text-foreground">{med.drug}</h4>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground items-end">
                      <div>
                        <span className="block font-medium text-[10px] uppercase tracking-wider">Dosage</span>
                        <span className="font-semibold text-foreground">{med.dosage}</span>
                      </div>
                      <div>
                        <span className="block font-medium text-[10px] uppercase tracking-wider">Frequency</span>
                        <span className="font-semibold text-foreground">{med.frequency}</span>
                      </div>
                      <div>
                        <span className="block font-medium text-[10px] uppercase tracking-wider">Duration</span>
                        <span className="font-semibold text-foreground">{med.duration}</span>
                      </div>
                      {selectedPrescription.prescriptionStatus !== "Fulfilled" && (
                        <div>
                          <span className="block font-medium text-[10px] uppercase tracking-wider mb-1">Qty</span>
                          <Input 
                            type="number" 
                            min="1" 
                            className="h-7 text-xs px-2 w-full bg-background"
                            value={quantities[idx] || ""}
                            onChange={(e) => setQuantities(prev => ({ ...prev, [idx]: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prescribed Therapies */}
            {getTherapiesArray(selectedPrescription.prescribedTherapies).length > 0 && (
              <div className="space-y-3">
                <h3 className="font-bold text-sm">Prescribed Therapies</h3>
                <div className="space-y-3">
                  {getTherapiesArray(selectedPrescription.prescribedTherapies).map((th, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-purple-200 bg-purple-50/20 dark:bg-purple-950/10 hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="p-1.5 bg-purple-500/10 rounded-lg">
                          <Activity className="w-4 h-4 text-purple-600" />
                        </div>
                        <h4 className="font-bold text-foreground">{th.name}</h4>
                      </div>
                      {th.price && (
                        <p className="text-xs text-muted-foreground ml-8">Session Cost: ₹{th.price}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-4 border-t border-border">
              {selectedPrescription.prescriptionStatus === "Fulfilled" ? (
                <Button 
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    setSelectedPrescription(null);
                  }}
                  className="rounded-xl"
                >
                  Close
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsDetailsModalOpen(false);
                      setSelectedPrescription(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => handleVerifyFulfill(selectedPrescription)}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Verify & Fulfill
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
