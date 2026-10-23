"use client";

import { useEffect, useState } from "react";
import { 
  Pill, FileText, Activity, ShoppingBag, 
  ExternalLink, ShieldCheck 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCart } from "@/store/useCart";
import { printPrescription } from "@/lib/print-prescription";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  appointmentId?: {
    clinicId?: {
      _id: string;
    } | string;
  };
  prescriptionSummary?: string;
  prescribedTherapies?: string;
  createdAt: string;
  isValid?: boolean;
  daysLeft?: number;
}

export default function PatientPrescriptionsPage() {
  const router = useRouter();
  const { addItem, updateQuantity } = useCart();

  const [prescriptions, setPrescriptions] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  // Ordering modal state
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedConsult, setSelectedConsult] = useState<Consultation | null>(null);
  const [selectedMeds, setSelectedMeds] = useState<{ [index: number]: boolean }>({});
  const [medQuantities, setMedQuantities] = useState<{ [index: number]: number }>({});
  const [availableProducts, setAvailableProducts] = useState<Array<{ _id: string; name: string; price: number; image?: string }>>([]);

  const fetchPrescriptions = async (pId: string) => {
    try {
      const res = await fetch(`/api/consultations?patientId=${pId}`);
      const json = await res.json();
      if (json.success && json.data) {
        const currentTime = Date.now();
        const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
        const completedPrescriptions = json.data
          .filter(
            (c: { status: string; prescriptionSummary?: string; prescribedTherapies?: string }) =>
              c.status === "Completed" && (
                (c.prescriptionSummary && c.prescriptionSummary !== "[]") ||
                (c.prescribedTherapies && c.prescribedTherapies !== "[]")
              )
          )
          .map((c: Consultation) => {
            const rxDate = new Date(c.createdAt).getTime();
            const isValid = currentTime - rxDate <= sixtyDaysMs;
            const daysLeft = Math.max(0, 60 - Math.floor((currentTime - rxDate) / (1000 * 60 * 60 * 24)));
            return {
              ...c,
              isValid,
              daysLeft,
            };
          });
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
          fetchPrescriptions(data.user.patientId);
        }
      })
      .catch((err) => console.error(err));

    // Fetch catalog products to map prices
    fetch("/api/pharmacy/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAvailableProducts(data.data || []);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const openOrderModal = (consult: Consultation) => {
    setSelectedConsult(consult);
    const meds: Medicine[] = JSON.parse(consult.prescriptionSummary || "[]");
    
    // Select all by default, but patient can uncheck
    const initialSelection: { [index: number]: boolean } = {};
    const initialQty: { [index: number]: number } = {};
    meds.forEach((_, idx) => {
      initialSelection[idx] = true;
      initialQty[idx] = 1;
    });

    setSelectedMeds(initialSelection);
    setMedQuantities(initialQty);
    setOrderModalOpen(true);
  };

  const handleProceedToDelivery = () => {
    if (!selectedConsult) return;
    const meds: Medicine[] = JSON.parse(selectedConsult.prescriptionSummary || "[]");

    // Add selected medicines to cart
    meds.forEach((m, idx) => {
      if (selectedMeds[idx]) {
        // Try matching product in catalog for realistic price
        const matched = availableProducts.find((p) =>
          p.name.toLowerCase().includes(m.drug.toLowerCase()) ||
          m.drug.toLowerCase().includes(p.name.toLowerCase())
        );

        const qty = medQuantities[idx] || 1;
        const itemId = matched?._id || `rx-${selectedConsult._id}-${idx}`;
        addItem({
          id: itemId,
          name: matched?.name || m.drug,
          price: matched?.price || 120,
          image: matched?.image || "/images/product_kit_1.png",
          type: "medication",
          isPrescription: true,
          dosage: m.dosage,
        });
        if (qty > 1) {
          updateQuantity(itemId, qty);
        }
      }
    });

    setOrderModalOpen(false);
    router.push("/checkout");
  };

  const handleDownloadPrescription = (consultation: Consultation) => {
    try {
      printPrescription(consultation);
    } catch {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground font-medium">
        Loading prescriptions and medical records...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Active Prescriptions & Refills</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            View valid doctor prescriptions, select individual medicines to order, and request authorized refills.
          </p>
        </div>
        <Link href="/products">
          <Button variant="outline" size="sm" className="rounded-full shadow-sm gap-2">
            <ShoppingBag className="w-4 h-4" /> Browse Pharmacy
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {prescriptions.length > 0 ? (
          prescriptions.map((consult) => {
            const meds: Medicine[] = JSON.parse(consult.prescriptionSummary || "[]");
            const isValid = consult.isValid ?? true;
            const daysLeft = consult.daysLeft ?? 60;

            return (
              <div key={consult._id} className="p-6 bg-card rounded-3xl border border-border shadow-sm flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base">Rx #{consult._id.substring(18)}</h3>
                        <p className="text-xs text-muted-foreground">
                          Prescribed by Dr. {consult.doctorId?.name || "Medical Officer"}
                        </p>
                      </div>
                    </div>
                    {isValid ? (
                      <Badge className="bg-emerald-600 text-white text-xs font-semibold">
                        Valid ({daysLeft}d left)
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs font-semibold">
                        Expired
                      </Badge>
                    )}
                  </div>

                  {/* Medicines List */}
                  <div className="space-y-2">
                    {meds.map((med, idx) => (
                      <div key={idx} className="p-3 bg-muted/40 rounded-2xl text-xs space-y-0.5">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-foreground">{med.drug}</p>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground">Qty prescribed</span>
                        </div>
                        <p className="text-muted-foreground">
                          {med.dosage} • {med.frequency} • {med.duration}
                        </p>
                      </div>
                    ))}

                    {/* Prescribed Therapies */}
                    {consult.prescribedTherapies && JSON.parse(consult.prescribedTherapies).map((th: { name: string }, idx: number) => (
                      <div key={`th-${idx}`} className="p-3 bg-purple-500/5 dark:bg-purple-950/5 border border-purple-500/10 rounded-2xl text-xs flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-600 shrink-0" />
                        <div>
                          <p className="font-bold text-purple-900 dark:text-purple-400">{th.name}</p>
                          <p className="text-muted-foreground text-[10px]">Clinical Therapy Recommended</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-xs text-muted-foreground pt-2 border-t border-border/50 flex justify-between">
                    <span>Issued: {new Date(consult.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                    <span>Refills remaining: 1</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  {isValid ? (
                    <Button 
                      className="flex-1 h-11 rounded-xl font-bold gap-2 shadow-sm"
                      onClick={() => openOrderModal(consult)}
                    >
                      <ShoppingBag className="w-4 h-4" /> Order Prescribed Medicines
                    </Button>
                  ) : (
                    <Link href="/booking" className="flex-1">
                      <Button variant="outline" className="w-full h-11 rounded-xl font-bold text-xs gap-1.5 border-primary text-primary">
                        Prescription Expired — Book Reassessment
                      </Button>
                    </Link>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-11 h-11 p-0 shrink-0 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground"
                    onClick={() => handleDownloadPrescription(consult)}
                    title="Download Official Prescription"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-16 text-center border border-dashed border-border rounded-3xl text-muted-foreground space-y-3">
            <Pill className="w-12 h-12 mx-auto text-muted-foreground/60" />
            <div>
              <p className="font-bold text-base text-foreground">No Active Prescriptions</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                Consult a Kelkar Manas doctor to receive verified digital prescriptions eligible for local medicine delivery.
              </p>
            </div>
            <Link href="/booking">
              <Button size="sm" className="rounded-full px-6 gap-2">
                Book Consultation <ExternalLink className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* SELECT MEDICINES MODAL */}
      <Dialog open={orderModalOpen} onOpenChange={setOrderModalOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-8">
          {selectedConsult && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold font-serif">
                  Select Medicines to Order
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Choose individual medicines from your prescription. You are not forced to buy the full list.
                </DialogDescription>
              </DialogHeader>

              {/* Medicines Selection List */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {JSON.parse(selectedConsult.prescriptionSummary || "[]").map((med: Medicine, idx: number) => {
                  const isChecked = !!selectedMeds[idx];
                  return (
                    <div 
                      key={idx}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between text-xs ${isChecked ? "border-primary bg-primary/5" : "border-border bg-background opacity-60"}`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => setSelectedMeds({ ...selectedMeds, [idx]: e.target.checked })}
                          className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                        />
                        <div className="space-y-0.5">
                          <p className="font-bold text-foreground">{med.drug}</p>
                          <p className="text-muted-foreground">{med.dosage} • {med.duration}</p>
                        </div>
                      </div>

                      {/* Quantity Selector (Capped at prescribed limits) */}
                      {isChecked && (
                        <div className="flex items-center gap-1.5 bg-background border border-border rounded-xl px-2 py-1">
                          <span className="text-[10px] text-muted-foreground font-semibold">Packs:</span>
                          <select
                            value={medQuantities[idx] || 1}
                            onChange={(e) => setMedQuantities({ ...medQuantities, [idx]: Number(e.target.value) })}
                            className="bg-transparent font-bold text-xs focus:outline-none"
                          >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-muted/40 rounded-xl text-[11px] text-muted-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Selected medicines will be verified against your doctor&apos;s prescription before delivery.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setOrderModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleProceedToDelivery}
                  disabled={!Object.values(selectedMeds).some(Boolean)}
                  className="rounded-full px-6 font-bold"
                >
                  Proceed to Checkout
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
