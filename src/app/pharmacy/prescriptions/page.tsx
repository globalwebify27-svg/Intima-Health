"use client";

import { useEffect, useState } from "react";
import { Pill, FileSignature, CheckCircle, CheckCircle2, AlertCircle, Trash2, X, Calendar, User, UserCheck, Phone, Mail, Activity, Search } from "lucide-react";
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
  notes?: string;
  createdAt: string;
}

interface ProductData {
  _id: string;
  name: string;
  price: number;
  stock: number;
}

export default function PharmacyPrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Consultation[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"Pending" | "Fulfilled" | "All">("Pending");
  const [searchQuery, setSearchQuery] = useState("");

  // Dispensing state
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [dispenseConsultation, setDispenseConsultation] = useState<Consultation | null>(null);
  const [dispenseItems, setDispenseItems] = useState<Array<{ productId: string; quantity: number; price: number; name: string; stock: number }>>([]);
  const [checkoutStep, setCheckoutStep] = useState<"items" | "payment">("items");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

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
      const url = cId 
        ? `/api/consultations?clinicId=${cId}&_t=${Date.now()}` 
        : `/api/consultations?_t=${Date.now()}`;
      const ordersUrl = cId 
        ? `/api/pharmacy/orders?clinicId=${cId}&_t=${Date.now()}` 
        : `/api/pharmacy/orders?_t=${Date.now()}`;

      const [res, ordersRes] = await Promise.all([
        fetch(url, { cache: "no-store" }),
        fetch(ordersUrl, { cache: "no-store" }).catch(() => null),
      ]);
      const json = await res.json();

      const fulfilledConsultIds = new Set<string>();
      if (ordersRes && ordersRes.ok) {
        try {
          const ordersJson = await ordersRes.json();
          if (ordersJson.success && Array.isArray(ordersJson.data)) {
            ordersJson.data.forEach((o: any) => {
              const s = (o.status || "").toUpperCase();
              if (s === "FULFILLED" || s === "DELIVERED") {
                const consultId = typeof o.consultationId === "object" ? o.consultationId?._id : o.consultationId;
                if (consultId) fulfilledConsultIds.add(String(consultId));
              }
            });
          }
        } catch {}
      }

      if (json.success && json.data) {
        const activeRx = json.data
          .filter((c: any) => c.prescriptionSummary && c.prescriptionSummary !== "[]")
          .map((c: any) => {
            if (fulfilledConsultIds.has(String(c._id)) && c.prescriptionStatus !== "Fulfilled") {
              // Background persist sync so DB stays consistent
              fetch(`/api/consultations/${c._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prescriptionStatus: "Fulfilled" }),
              }).catch(() => {});
              return { ...c, prescriptionStatus: "Fulfilled" };
            }
            return c;
          });
        setPrescriptions(activeRx);
      }

      if (cId) {
        const prodRes = await fetch(`/api/pharmacy/products?clinicId=${cId}`);
        const prodJson = await prodRes.json();
        if (prodJson.success) {
          setProducts(prodJson.data);
        }
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

  const handleDispenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispenseConsultation) return;
    if (dispenseItems.length === 0) {
      setErrorMsg("Please add at least one medicine to dispense.");
      return;
    }

    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    const totalAmount = dispenseItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const payload = {
      patientId: dispenseConsultation.patientId?._id,
      clinicId,
      items: dispenseItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.price
      })),
      totalAmount,
      status: "Delivered",
      paymentMethod,
      shippingAddress: "Clinic Counter Dispense",
      shippingDetails: {
        fullName: dispenseConsultation.patientId?.name || "Patient",
        phone: dispenseConsultation.patientId?.phone || "9999999999",
        street: "Clinic Counter Dispense",
        city: "Akola",
        state: "Maharashtra",
        pinCode: "444001"
      },
      consultationId: dispenseConsultation._id,
      prescriptionSource: "DOCTOR_CONSULTATION"
    };

    try {
      const res = await fetch("/api/pharmacy/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const resData = await res.json();
      if (!resData.success) {
        throw new Error(resData.message || "Failed to dispense medicines.");
      }

      // Update prescriptionStatus to Fulfilled
      await fetch(`/api/consultations/${dispenseConsultation._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prescriptionStatus: "Fulfilled" }),
      });

      setSuccessMsg("Medicines dispensed and billing order registered!");
      setTimeout(() => {
        setShowDispenseModal(false);
        setDispenseConsultation(null);
        setDispenseItems([]);
        setCheckoutStep("items");
        setSuccessMsg("");
        setErrorMsg("");
        fetchPrescriptions(clinicId!);
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const addDispenseItem = (prodId: string) => {
    const prod = products.find(p => p._id === prodId);
    if (!prod) return;
    if (dispenseItems.some(i => i.productId === prodId)) return;

    setDispenseItems([
      ...dispenseItems,
      { productId: prod._id, quantity: 1, price: prod.price, name: prod.name, stock: prod.stock }
    ]);
  };

  const updateDispenseItemQty = (prodId: string, qty: number) => {
    setDispenseItems(
      dispenseItems.map(item => {
        if (item.productId === prodId) {
          const clampedQty = Math.max(1, Math.min(item.stock, qty));
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const removeDispenseItem = (prodId: string) => {
    setDispenseItems(dispenseItems.filter(i => i.productId !== prodId));
  };

  const openDispenseModal = (c: Consultation) => {
    setDispenseConsultation(c);
    const autoItems: typeof dispenseItems = [];

    if (c.prescriptionSummary && c.prescriptionSummary !== "[]") {
      try {
        const meds = JSON.parse(c.prescriptionSummary);
        if (Array.isArray(meds)) {
          meds.forEach((m: any) => {
            const matchedProduct = products.find((p) =>
              p.name.toLowerCase().includes(m.drug.toLowerCase()) ||
              m.drug.toLowerCase().includes(p.name.toLowerCase())
            );

            if (matchedProduct) {
              if (!autoItems.some(i => i.productId === matchedProduct._id)) {
                autoItems.push({
                  productId: matchedProduct._id,
                  quantity: 1,
                  price: matchedProduct.price,
                  name: matchedProduct.name,
                  stock: matchedProduct.stock
                });
              }
            } else if (products.length > 0) {
              const fallback = products[0];
              if (!autoItems.some(i => i.productId === fallback._id)) {
                autoItems.push({
                  productId: fallback._id,
                  quantity: 1,
                  price: fallback.price,
                  name: fallback.name, // Will show the actual stock name instead of the prescribed name if mismatched
                  stock: fallback.stock
                });
              }
            }
          });
        }
      } catch (e) {}
    }

    setDispenseItems(autoItems);
    setCheckoutStep("items");
    setPaymentMethod("Cash");
    setShowDispenseModal(true);
  };

  const renderPrescriptionSummary = (summary?: string, isModal = false) => {
    if (!summary) return "No medications noted";
    try {
      const parsed = JSON.parse(summary);
      if (Array.isArray(parsed)) {
        if (isModal) {
          return (
            <ul className="list-disc pl-5 space-y-1 mt-2 not-italic">
              {parsed.map((item: any, idx: number) => (
                <li key={idx} className="text-sm text-muted-foreground">
                  <strong className="text-foreground">{item.drug}</strong> - Dosage: {item.dosage}, Frequency: {item.frequency}, Duration: {item.duration}
                </li>
              ))}
            </ul>
          );
        } else {
          return parsed.map((item: any) => `${item.drug} (${item.frequency})`).join(", ");
        }
      }
    } catch (e) {
      // Not JSON, fallback
    }
    return summary;
  };



  const counts = {
    Pending: prescriptions.filter((p) => p.prescriptionStatus !== "Fulfilled").length,
    Fulfilled: prescriptions.filter((p) => p.prescriptionStatus === "Fulfilled").length,
    All: prescriptions.length,
  };

  const filteredPrescriptions = prescriptions.filter((record) => {
    const isFulfilled = record.prescriptionStatus === "Fulfilled";
    const patientName = record.patientId?.name || "";
    const doctorName = record.doctorId?.name || "";
    const rxId = record._id || "";

    const matchesSearch =
      patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rxId.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "Pending") return !isFulfilled;
    if (statusFilter === "Fulfilled") return isFulfilled;
    return true;
  });

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

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by patient name, doctor, Rx #..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {[
            { id: "Pending", label: "Pending Fulfilment" },
            { id: "Fulfilled", label: "Fulfilled" },
            { id: "All", label: "All Prescriptions" },
          ].map((tab) => {
            const count = counts[tab.id as keyof typeof counts];
            const isActive = statusFilter === tab.id;
            return (
              <Button
                key={tab.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(tab.id as any)}
                className="rounded-xl text-xs font-semibold h-9 shrink-0 gap-1.5"
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {count}
                </span>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        {filteredPrescriptions.length > 0 ? (
          filteredPrescriptions.map((record) => {
            const meds = getMedsArray(record.prescriptionSummary);
            const isFulfilled = record.prescriptionStatus === "Fulfilled";

            return (
              <div key={record._id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-card rounded-2xl border border-border shadow-sm hover:border-primary/20 transition-colors gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-muted rounded-xl shrink-0">
                    <FileSignature className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-lg">Rx #${record._id.substring(18).toUpperCase()} for {record.patientId?.name || "Patient"}</h3>
                      {!record.appointmentId && (
                        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary bg-primary/10 font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg">
                          Direct Rx (Walk-In)
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm text-muted-foreground mt-1">
                      <span>Prescriber: {record.doctorId?.name || "Clinician"}</span>
                      <span className="hidden md:inline">•</span>
                      <span>Issued: {new Date(record.createdAt).toLocaleDateString()}</span>
                    </div>
                    {record.notes && (
                      <p className="text-xs text-muted-foreground mt-1.5 italic bg-muted/30 px-2.5 py-1 rounded-lg border border-border/50 max-w-xl">
                        Doctor Notes: "{record.notes}"
                      </p>
                    )}
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
                        onClick={() => openDispenseModal(record)}
                      >
                        View Details
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="rounded-xl" 
                      onClick={() => openDispenseModal(record)}
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

      {/* --- MODAL: DISPENSE PRESCRIPTION & CREATE PHARMACY ORDER --- */}
      {showDispenseModal && dispenseConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card border border-border rounded-3xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
            <button 
              onClick={() => {
                setShowDispenseModal(false);
                setDispenseConsultation(null);
                setDispenseItems([]);
                setCheckoutStep("items");
                setSuccessMsg("");
                setErrorMsg("");
              }}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Pill className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold">Dispense Medicines & Settle Order</h3>
            </div>

            <div className="bg-muted/30 border border-border/40 p-4 rounded-xl space-y-2 text-xs">
              <div className="font-bold text-foreground">Doctor's Prescribed Advisory:</div>
              <div className="text-muted-foreground italic">
                {renderPrescriptionSummary(dispenseConsultation.prescriptionSummary, true)}
              </div>
              <div className="text-[10px] text-muted-foreground border-t border-border/30 pt-2 mt-2">
                Patient: <strong className="text-foreground">{dispenseConsultation.patientId?.name}</strong> | Doctor: <strong className="text-foreground">{dispenseConsultation.doctorId?.name}</strong>
              </div>
            </div>

            <form onSubmit={handleDispenseSubmit} className="space-y-4">
              {successMsg && (
                <div className="p-3.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs font-medium rounded-xl border border-emerald-200/50 flex items-center gap-2">
                  <CheckCircle2 className="w-4.5 h-4.5 shrink-0" /> {successMsg}
                </div>
              )}
              {errorMsg && (
                <div className="p-3.5 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 text-xs font-medium rounded-xl border border-rose-200/50 flex items-center gap-2">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" /> {errorMsg}
                </div>
              )}

              {/* Items Selected list */}
              {checkoutStep === "items" ? (
                <>
                  {dispenseItems.length > 0 && (
                    <div className="border border-border rounded-2xl overflow-hidden bg-muted/10">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-border bg-muted/20 font-bold text-muted-foreground">
                            <th className="p-3">Medicine</th>
                            <th className="p-3">Price</th>
                            <th className="p-3">Qty</th>
                            <th className="p-3">Total</th>
                            <th className="p-3 text-right">Remove</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-foreground">
                          {dispenseItems.map((item) => (
                            <tr key={item.productId} className="hover:bg-muted/10 transition">
                              <td className="p-3 font-bold">{item.name}</td>
                              <td className="p-3">₹{item.price}</td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  min={1}
                                  max={item.stock}
                                  value={item.quantity}
                                  onChange={(e) => updateDispenseItemQty(item.productId, parseInt(e.target.value))}
                                  className="w-16 h-8 px-2 rounded border border-border bg-background text-center focus:outline-none"
                                />
                              </td>
                              <td className="p-3 font-bold">₹{item.price * item.quantity}</td>
                              <td className="p-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => removeDispenseItem(item.productId)}
                                  className="text-rose-500 hover:text-rose-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Total Calculation */}
                  <div className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/20">
                    <span className="text-sm font-bold text-primary">Dispensed Order Bill Total:</span>
                    <span className="text-lg font-black text-primary">
                      ₹{dispenseItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                    </span>
                  </div>

                  <Button 
                    type="button" 
                    onClick={() => {
                      if (dispenseItems.length === 0) {
                        setErrorMsg("Please add at least one medicine to dispense.");
                        return;
                      }
                      setCheckoutStep("payment");
                    }} 
                    className="w-full h-11 text-white font-bold rounded-xl mt-2"
                  >
                    Proceed to Payment
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-primary/5 p-4 rounded-xl border border-primary/20 mb-4">
                    <span className="text-sm font-bold text-primary">Total Amount to Collect:</span>
                    <span className="text-xl font-black text-primary">
                      ₹{dispenseItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Payment Method</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {["Cash", "Online", "Send Link in WhatsApp"].map((method) => (
                        <div 
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`p-3 border rounded-xl cursor-pointer text-center font-medium text-sm transition-all ${
                            paymentMethod === method 
                              ? "border-primary bg-primary/10 text-primary" 
                              : "border-border hover:border-primary/50 text-muted-foreground"
                          }`}
                        >
                          {method}
                        </div>
                      ))}
                    </div>
                    {paymentMethod === "Cash" && (
                      <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-xl">
                        💵 Collect cash at the counter. Order will be marked as Paid & Delivered immediately.
                      </p>
                    )}
                    {paymentMethod === "Online" && (
                      <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-xl">
                        💳 Collect payment via clinic UPI / QR / Card machine. Order will be marked as Paid & Delivered immediately.
                      </p>
                    )}
                    {paymentMethod === "Send Link in WhatsApp" && (
                      <p className="text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-xl">
                        📱 A digital payment invoice link will be sent to patient ({dispenseConsultation.patientId?.name || "Patient"}: {dispenseConsultation.patientId?.phone || "registered mobile"}).
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setCheckoutStep("items")} 
                      className="w-1/3 h-11 rounded-xl"
                    >
                      Back
                    </Button>
                    <Button type="submit" disabled={submitting} className="w-2/3 h-11 text-white font-bold rounded-xl">
                      {submitting ? "Settling Counter Billing..." : "Confirm & Complete"}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
