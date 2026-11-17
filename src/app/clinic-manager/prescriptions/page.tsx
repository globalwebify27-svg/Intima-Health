"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Pill, 
  Search, 
  Calendar, 
  Clock, 
  ShoppingBag, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Banknote, 
  CreditCard,
  RefreshCw,
  Filter
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
  prescriptionStatus?: string;
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
  updatedAt?: string;
}

export default function PrescriptionsPage() {
  const router = useRouter();
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [consultations, setConsultations] = useState<ConsultationData[]>([]);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "fulfilled">("all");
  const [onlyWithMeds, setOnlyWithMeds] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, onlyWithMeds]);

  // Dispensing state
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [dispenseConsultation, setDispenseConsultation] = useState<ConsultationData | null>(null);
  const [dispenseItems, setDispenseItems] = useState<Array<{ productId: string; quantity: number; price: number; name: string; stock: number }>>([]);
  const [checkoutStep, setCheckoutStep] = useState<"items" | "payment">("items");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [transactionRef, setTransactionRef] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchPrescriptions = async (isManual = false) => {
    if (isManual) setRefreshing(true);
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
        // Fetch consultations with cache bust
        const res = await fetch(`/api/consultations?clinicId=${cId}&_t=${Date.now()}`, { cache: "no-store" });
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          // Sort by latest update or creation timestamp descending
          const sorted = [...json.data].sort((a: any, b: any) => {
            const timeA = new Date(a.updatedAt || a.createdAt).getTime();
            const timeB = new Date(b.updatedAt || b.createdAt).getTime();
            return timeB - timeA;
          });
          setConsultations(sorted);
        }

        // Fetch products
        const prodRes = await fetch(`/api/pharmacy/products?clinicId=${cId}`);
        const prodJson = await prodRes.json();
        if (prodJson.success && Array.isArray(prodJson.data)) {
          setProducts(prodJson.data);
        }
      }
    } catch (err) {
      console.error("Failed to load prescriptions:", err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
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
      paymentMethod,
      transactionId: paymentMethod === "Online" && transactionRef.trim() ? transactionRef.trim() : undefined,
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
        setTransactionRef("");
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

  const openDispenseModal = (c: ConsultationData) => {
    setDispenseConsultation(c);
    const autoItems: typeof dispenseItems = [];

    if (c.prescriptionSummary && c.prescriptionSummary !== "[]") {
      try {
        const meds = JSON.parse(c.prescriptionSummary);
        if (Array.isArray(meds)) {
          meds.forEach((m: any) => {
            const drugName = (m.drug || m.name || "").toLowerCase();
            const matchedProduct = products.find((p) =>
              p.name.toLowerCase().includes(drugName) ||
              drugName.includes(p.name.toLowerCase())
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
                  name: fallback.name,
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

  // Helper to check if a consultation has prescribed medicines or therapies
  const hasMedications = (c: ConsultationData) => {
    const hasDrugs = typeof c.prescriptionSummary === "string" 
      && c.prescriptionSummary !== "[]" 
      && c.prescriptionSummary.trim() !== "";
    const hasTherapies = typeof c.prescribedTherapies === "string" 
      && c.prescribedTherapies !== "[]" 
      && c.prescribedTherapies.trim() !== "";
    return hasDrugs || hasTherapies;
  };

  // Filtered and sorted prescriptions
  const filtered = useMemo(() => {
    return consultations.filter((c) => {
      // Medication filter
      if (onlyWithMeds && !hasMedications(c)) {
        return false;
      }

      // Status filter
      if (statusFilter === "pending" && c.prescriptionStatus === "Fulfilled") {
        return false;
      }
      if (statusFilter === "fulfilled" && c.prescriptionStatus !== "Fulfilled") {
        return false;
      }

      // Search query filter
      const patientName = c.patientId?.name?.toLowerCase() || "";
      const patientPhone = c.patientId?.phone || "";
      const doctorName = c.doctorId?.name?.toLowerCase() || "";
      const summaryText = (c.prescriptionSummary && c.prescriptionSummary !== "[]") ? c.prescriptionSummary.toLowerCase() : "";
      const query = searchQuery.toLowerCase().trim();

      if (!query) return true;
      return patientName.includes(query) || patientPhone.includes(query) || doctorName.includes(query) || summaryText.includes(query);
    });
  }, [consultations, onlyWithMeds, statusFilter, searchQuery]);

  // Counts for tabs
  const tabCounts = useMemo(() => {
    const baseList = onlyWithMeds ? consultations.filter(hasMedications) : consultations;
    return {
      all: baseList.length,
      pending: baseList.filter(c => c.prescriptionStatus !== "Fulfilled").length,
      fulfilled: baseList.filter(c => c.prescriptionStatus === "Fulfilled").length,
    };
  }, [consultations, onlyWithMeds]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = useMemo(() => {
    return filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filtered, currentPage, pageSize]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-muted-foreground">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-medium">Loading prescriptions and logs...</span>
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
                  <strong className="text-foreground">{item.drug || item.name}</strong> - Dosage: {item.dosage || "-"}, Frequency: {item.frequency || "-"}, Duration: {item.duration || "-"}
                </li>
              ))}
            </ul>
          );
        } else {
          return parsed.map((item: any) => `${item.drug || item.name} (${item.frequency || "daily"})`).join(", ");
        }
      }
    } catch (e) {
      // Fallback if not JSON
    }
    return summary;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescriptions Logs</h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">
            Select a patient prescription below to fulfill their medicines stock at the counter.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchPrescriptions(true)}
          disabled={refreshing}
          className="rounded-xl border border-border h-10 px-4 font-bold text-xs gap-2 self-start sm:self-auto shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-primary ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh Prescriptions"}
        </Button>
      </div>

      {/* Filter Tabs & Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-sm">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusFilter === "all"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>All Prescriptions</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === "all" ? "bg-white/20 text-white" : "bg-muted text-foreground"}`}>
                {tabCounts.all}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusFilter === "pending"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>Pending Counter Dispense</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === "pending" ? "bg-white/20 text-white" : "bg-muted text-foreground"}`}>
                {tabCounts.pending}
              </span>
            </button>

            <button
              onClick={() => setStatusFilter("fulfilled")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusFilter === "fulfilled"
                  ? "bg-primary text-white shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>Delivered</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${statusFilter === "fulfilled" ? "bg-white/20 text-white" : "bg-muted text-foreground"}`}>
                {tabCounts.fulfilled}
              </span>
            </button>
          </div>

          {/* Search Toolbar */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by patient, phone or drug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Medication Visibility Toggle */}
        <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyWithMeds}
              onChange={(e) => setOnlyWithMeds(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary/30 w-4 h-4 accent-primary"
            />
            <span>Show only consultations with prescribed medications</span>
          </label>

          <span>Showing {filtered.length} total records (sorted latest first)</span>
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
                  <th className="p-4">Prescription Date / Time</th>
                  <th className="p-4">Prescription Summary</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {paginated.map((c) => {
                  const hasMeds = Boolean(
                    c.prescriptionSummary && 
                    c.prescriptionSummary !== "[]" && 
                    c.prescriptionSummary.trim() !== ""
                  );

                  // Compute robust display date & time
                  const displayDate = c.appointmentId?.date 
                    ? c.appointmentId.date 
                    : (c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Recent");

                  const displayTime = c.appointmentId?.time 
                    ? c.appointmentId.time 
                    : (c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "");

                  return (
                    <tr 
                      key={c._id} 
                      className="hover:bg-muted/10 transition cursor-pointer"
                      onClick={() => openDispenseModal(c)}
                    >
                      <td className="p-4">
                        <div className="font-bold text-foreground">{c.patientId?.name || "Patient"}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{c.patientId?.phone || "No phone"}</div>
                      </td>
                      <td className="p-4 text-muted-foreground font-medium">
                        <div className="text-foreground font-semibold">{c.doctorId?.name || "Doctor"}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{c.doctorId?.specialization || "Specialist"}</div>
                      </td>
                      <td className="p-4 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <Calendar className="w-3.5 h-3.5 text-primary shrink-0" /> 
                          {displayDate}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> 
                          {displayTime || "-"}
                          {!c.appointmentId?.date && (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 rounded text-muted-foreground ml-1">
                              Walk-in Rx
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="max-w-[280px] truncate text-muted-foreground" title={hasMeds ? c.prescriptionSummary : undefined}>
                          {hasMeds ? (
                            <span className="text-foreground font-medium">
                              {renderPrescriptionSummary(c.prescriptionSummary)}
                            </span>
                          ) : (
                            <span className="italic text-muted-foreground/70">No medications noted</span>
                          )}
                        </div>
                        {c.prescribedTherapies && c.prescribedTherapies !== "[]" && (
                          <div className="text-[11px] text-primary mt-1 font-semibold">
                            Therapies Recommended
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {c.prescriptionStatus === "Fulfilled" ? (
                          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 px-3 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1 w-max ml-auto">
                            <CheckCircle2 className="w-4 h-4" /> Delivered
                          </Badge>
                        ) : (
                          <Button
                            size="sm"
                            className="text-xs font-bold text-white h-9 rounded-lg px-3.5 flex items-center gap-1.5 ml-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDispenseModal(c);
                            }}
                          >
                            <ShoppingBag className="w-4 h-4" /> Create &amp; Fulfill Order
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
                  className="rounded-xl border-2 border-primary/60 bg-background text-primary font-bold text-xs h-9 px-4 shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-50 disabled:bg-muted/70 disabled:border-border/80 disabled:text-foreground/60 disabled:cursor-not-allowed"
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  <ChevronLeft className="w-4 h-4 mr-1 shrink-0" />
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl border-2 border-primary/60 bg-background text-primary font-bold text-xs h-9 px-4 shadow-sm hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-50 disabled:bg-muted/70 disabled:border-border/80 disabled:text-foreground/60 disabled:cursor-not-allowed"
                  disabled={currentPage === totalPages || totalPages === 0} 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.max(1, totalPages)))}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1 shrink-0" />
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
              <h3 className="text-lg font-bold">Dispense Medicines &amp; Settle Order</h3>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {["Cash", "Online"].map((method) => (
                        <button
                          type="button"
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`p-3 border rounded-xl cursor-pointer flex items-center justify-center gap-2 font-medium text-sm transition-all ${
                            paymentMethod === method 
                              ? "border-primary bg-primary/10 text-primary" 
                              : "border-border hover:border-primary/50 text-muted-foreground"
                          }`}
                        >
                          {method === "Cash" ? <Banknote className="w-4 h-4 shrink-0" /> : <CreditCard className="w-4 h-4 shrink-0" />}
                          <span>{method}</span>
                        </button>
                      ))}
                    </div>
                    {paymentMethod === "Cash" && (
                      <div className="flex items-start gap-2.5 text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl">
                        <Banknote className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                        <span>Collect cash at the counter. Order will be marked as Paid &amp; Delivered immediately.</span>
                      </div>
                    )}
                    {paymentMethod === "Online" && (
                      <div className="space-y-2.5">
                        <div className="flex items-start gap-2.5 text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl">
                          <CreditCard className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                          <span>Collect payment via clinic UPI / QR / Card machine. Order will be marked as Paid &amp; Delivered immediately.</span>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                            UPI / Card Reference ID (Optional)
                          </label>
                          <input
                            type="text"
                            value={transactionRef}
                            onChange={(e) => setTransactionRef(e.target.value)}
                            placeholder="e.g. UTR / UPI Ref / Card Auth Code"
                            className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                      </div>
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
