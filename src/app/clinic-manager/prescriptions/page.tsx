"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Pill, 
  Search, 
  User, 
  Calendar, 
  Clock, 
  FileText,
  Activity,
  ShoppingBag,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PatientData {
  _id: string;
  name: string;
  phone: string;
  email: string;
}

interface ProductData {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: string;
}

interface ConsultationData {
  _id: string;
  notes?: string;
  prescriptionSummary?: string;
  prescribedTherapies?: string;
  status: string;
  patientId?: PatientData;
  doctorId?: {
    name: string;
    specialization: string;
  };
  appointmentId?: {
    date: string;
    time: string;
  };
  createdAt: string;
}

export default function PrescriptionsPage() {
  const router = useRouter();
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [consultations, setConsultations] = useState<ConsultationData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Dispensing state
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [dispenseConsultation, setDispenseConsultation] = useState<ConsultationData | null>(null);
  const [dispenseItems, setDispenseItems] = useState<Array<{ productId: string; quantity: number; price: number; name: string; stock: number }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchPrescriptions = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      const meJson = await meRes.json();
      if (!meJson.success || meJson.user.role !== "CLINIC_MANAGER") {
        router.push("/staff-login");
        return;
      }

      const cId = meJson.user.clinicId;
      setClinicId(cId);

      if (cId) {
        // Fetch consultations
        const res = await fetch(`/api/consultations?clinicId=${cId}`);
        const json = await res.json();
        if (json.success) {
          setConsultations(json.data);
        }

        // Fetch products
        const prodRes = await fetch(`/api/pharmacy/products?clinicId=${cId}`);
        const prodJson = await prodRes.json();
        if (prodJson.success) {
          setProducts(prodJson.data);
        }
      }
    } catch (err) {
      console.error("Failed to load prescriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
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
      shippingAddress: "Clinic Counter Dispense"
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

      setSuccessMsg("Medicines dispensed and billing order registered!");
      setTimeout(() => {
        setShowDispenseModal(false);
        setDispenseConsultation(null);
        setDispenseItems([]);
        setSuccessMsg("");
        setErrorMsg("");
        fetchPrescriptions();
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

  const filtered = consultations.filter((c) => {
    const patientName = c.patientId?.name.toLowerCase() || "";
    const doctorName = c.doctorId?.name.toLowerCase() || "";
    const summaryText = c.prescriptionSummary?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();

    return patientName.includes(query) || doctorName.includes(query) || summaryText.includes(query);
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading prescriptions and logs...
      </div>
    );
  }

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Prescriptions Logs</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          Select a patient prescription below to fulfill their medicines stock at the counter.
        </p>
      </div>

      {/* Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 text-primary font-bold text-sm">
          <Pill className="w-5 h-5" />
          <span>Completed Consultations: {filtered.length}</span>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search patient, doctor, or medication..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Prescription Patient Table */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No completed prescriptions found matching search filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">Consultant Doctor</th>
                  <th className="p-4">Appointment Date/Time</th>
                  <th className="p-4">Prescription Summary</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {paginated.map((c) => (
                  <tr 
                    key={c._id} 
                    className="hover:bg-muted/10 transition cursor-pointer"
                    onClick={() => {
                      setDispenseConsultation(c);
                      setShowDispenseModal(true);
                    }}
                  >
                    <td className="p-4">
                      <div className="font-bold text-foreground">{c.patientId?.name || "Patient"}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{c.patientId?.phone || "No phone"}</div>
                    </td>
                    <td className="p-4 text-muted-foreground font-medium">
                      Dr. {c.doctorId?.name || "Doctor"}
                      <div className="text-[10px] text-muted-foreground mt-0.5">{c.doctorId?.specialization}</div>
                    </td>
                    <td className="p-4 text-muted-foreground text-xs">
                      <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {c.appointmentId?.date || "N/A"}</div>
                      <div className="flex items-center gap-1 mt-1"><Clock className="w-3.5 h-3.5" /> {c.appointmentId?.time || "N/A"}</div>
                    </td>
                    <td className="p-4">
                      <div className="max-w-[280px] truncate text-muted-foreground" title={c.prescriptionSummary}>
                        {renderPrescriptionSummary(c.prescriptionSummary)}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        size="sm"
                        className="text-xs font-bold text-white h-9 rounded-lg px-3.5 flex items-center gap-1.5 ml-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDispenseConsultation(c);
                          setShowDispenseModal(true);
                        }}
                      >
                        <ShoppingBag className="w-4 h-4" /> Create Order
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={currentPage === totalPages || totalPages === 0} 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.max(1, totalPages)))}
                >
                  Next
                </Button>
              </div>
            </div>
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
                Patient: <strong className="text-foreground">{dispenseConsultation.patientId?.name}</strong> | Doctor: <strong className="text-foreground">Dr. {dispenseConsultation.doctorId?.name}</strong>
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

              {/* Product selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Clinic Medicine to Add</label>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      addDispenseItem(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">-- Choose Medicine --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id} disabled={p.stock <= 0}>
                      {p.name} (Price: ₹{p.price} | Stock: {p.stock}) {p.stock <= 0 ? "[Out of Stock]" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Items Selected list */}
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

              <Button type="submit" disabled={submitting} className="w-full h-11 text-white font-bold rounded-xl mt-2">
                {submitting ? "Settling Counter Billing..." : "Confirm Dispense & Collect Counter Payment"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
