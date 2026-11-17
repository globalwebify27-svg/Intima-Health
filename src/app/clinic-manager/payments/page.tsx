"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  ShoppingBag,
  DollarSign,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Banknote,
  QrCode,
  Send,
  X,
  ExternalLink,
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { formatTime12Hour } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { initiateHdfcCheckout } from "@/lib/payments/client";

interface PatientData {
  _id: string;
  name: string;
  phone: string;
}

interface AppointmentData {
  _id: string;
  patientId?: PatientData;
  doctorId?: { name: string; salary?: number };
  date: string;
  time: string;
  type: string;
  status?: string;
  paymentStatus: "Pending" | "Paid";
  collectedBy?: string;
  paymentMethod?: string;
  feeAmount?: number;
}

interface TherapySessionData {
  _id: string;
  patientId?: PatientData;
  name: string;
  price: number;
  status: "Unpaid" | "Paid" | "Booked" | "Scheduled" | "Recommended";
  paymentStatus?: "Pending" | "Paid";
  date?: string;
  time?: string;
  createdAt: string;
}

interface OrderItemData {
  productId?: {
    name: string;
  };
  quantity: number;
  priceAtPurchase: number;
}

interface OrderData {
  _id: string;
  patientId?: PatientData;
  items: OrderItemData[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface PaymentModalTarget {
  type: "appointment" | "therapy";
  id: string;
  patientName: string;
  patientPhone?: string;
  serviceTitle: string;
  date?: string;
  time?: string;
  amount: number;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [clinicId, setClinicId] = useState<string | null>(null);
  
  // Tab control
  const [activeTab, setActiveTab] = useState<"consultations" | "therapy" | "pharmacy">("consultations");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // Data states
  const [consultations, setConsultations] = useState<AppointmentData[]>([]);
  const [therapySessions, setTherapySessions] = useState<TherapySessionData[]>([]);
  const [pharmacyOrders, setPharmacyOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Action & Feedback state
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Payment Selection Modal State
  const [paymentModalItem, setPaymentModalItem] = useState<PaymentModalTarget | null>(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<"gateway" | "cash" | "pos" | "whatsapp">("gateway");
  const [posRef, setPosRef] = useState("");
  const [modalProcessing, setModalProcessing] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  const fetchData = async () => {
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
        // Fetch appointments
        const resApt = await fetch(`/api/appointments?clinicId=${cId}&_t=${Date.now()}`);
        const jsonApt = await resApt.json();
        if (jsonApt.success) {
          setConsultations(jsonApt.data);
        }

        // Fetch therapy sessions
        const resTherapy = await fetch(`/api/therapy-sessions?clinicId=${cId}&_t=${Date.now()}`);
        const jsonTherapy = await resTherapy.json();
        if (jsonTherapy.success) {
          setTherapySessions(jsonTherapy.data);
        }

        // Fetch pharmacy orders
        const resOrd = await fetch(`/api/pharmacy/orders?clinicId=${cId}&_t=${Date.now()}`);
        const jsonOrd = await resOrd.json();
        if (jsonOrd.success) {
          setPharmacyOrders(jsonOrd.data);
        }
      }
    } catch (err) {
      console.error("Failed to load payment logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAppointmentPaymentModal = (apt: AppointmentData) => {
    setPaymentModalItem({
      type: "appointment",
      id: apt._id,
      patientName: apt.patientId?.name || "Patient",
      patientPhone: apt.patientId?.phone || "",
      serviceTitle: `Doctor Consultation (${apt.doctorId?.name || "Specialist"})`,
      date: apt.date,
      time: apt.time,
      amount: apt.feeAmount || 1499,
    });
    setSelectedPaymentMode("gateway");
    setPosRef("");
    setModalError("");
    setModalSuccess("");
  };

  const openTherapyPaymentModal = (ts: TherapySessionData) => {
    setPaymentModalItem({
      type: "therapy",
      id: ts._id,
      patientName: ts.patientId?.name || "Patient",
      patientPhone: ts.patientId?.phone || "",
      serviceTitle: `Therapy: ${ts.name}`,
      date: ts.date,
      time: ts.time,
      amount: ts.price,
    });
    setSelectedPaymentMode("gateway");
    setPosRef("");
    setModalError("");
    setModalSuccess("");
  };

  const handleExecutePayment = async () => {
    if (!paymentModalItem) return;
    setModalProcessing(true);
    setModalError("");
    setModalSuccess("");

    try {
      // 1. Online Payment Gateway (HDFC SmartGateway)
      if (selectedPaymentMode === "gateway") {
        const { paymentUrl } = await initiateHdfcCheckout({
          entityType: paymentModalItem.type === "appointment" ? "appointment" : "therapy",
          entityId: paymentModalItem.id,
          returnTo: "/clinic-manager/payments",
        });
        window.location.href = paymentUrl;
        return;
      }

      // 2. Send Payment Link on WhatsApp
      if (selectedPaymentMode === "whatsapp") {
        if (paymentModalItem.type === "appointment") {
          const res = await fetch(`/api/appointments/${paymentModalItem.id}/send-invoice-whatsapp`, {
            method: "POST",
          });
          const json = await res.json();
          if (!json.success) {
            throw new Error(json.message || "Failed to dispatch WhatsApp link.");
          }
          setModalSuccess("Payment details & invoice link dispatched to patient WhatsApp!");
        } else {
          const phone = (paymentModalItem.patientPhone || "").replace(/\D/g, "").slice(-10);
          if (phone) {
            const text = encodeURIComponent(
              `Hello ${paymentModalItem.patientName}, please complete your therapy fee of ₹${paymentModalItem.amount} for "${paymentModalItem.serviceTitle}". Thank you, Kelkar Manas Health Clinic.`
            );
            window.open(`https://wa.me/91${phone}?text=${text}`, "_blank");
            setModalSuccess("WhatsApp chat opened with payment request!");
          } else {
            throw new Error("Patient phone number not found.");
          }
        }
        setTimeout(() => {
          setPaymentModalItem(null);
        }, 2000);
        return;
      }

      // 3. Counter Cash Collection
      if (selectedPaymentMode === "cash") {
        if (paymentModalItem.type === "appointment") {
          const res = await fetch(`/api/appointments/${paymentModalItem.id}/pay`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              collectedBy: "Clinic Manager", 
              paymentMethod: "Cash",
              amount: paymentModalItem.amount 
            }),
          });
          const json = await res.json();
          if (!json.success) throw new Error(json.message || "Failed to confirm cash receipt.");
        } else {
          const res = await fetch("/api/therapy-sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              action: "pay", 
              sessionId: paymentModalItem.id, 
              paymentMethod: "Cash" 
            }),
          });
          const json = await res.json();
          if (!json.success) throw new Error(json.message || "Failed to confirm cash receipt.");
        }

        setModalSuccess(`Payment of ₹${paymentModalItem.amount} collected in Cash successfully!`);
        await fetchData();
        setTimeout(() => {
          setPaymentModalItem(null);
        }, 1200);
        return;
      }

      // 4. Counter POS / UPI Machine
      if (selectedPaymentMode === "pos") {
        const txnId = posRef.trim() || `POS-${Date.now()}`;
        if (paymentModalItem.type === "appointment") {
          const res = await fetch(`/api/appointments/${paymentModalItem.id}/pay`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              collectedBy: "Clinic Manager (POS/UPI)", 
              paymentMethod: "Online",
              transactionId: txnId,
              amount: paymentModalItem.amount 
            }),
          });
          const json = await res.json();
          if (!json.success) throw new Error(json.message || "Failed to record POS payment.");
        } else {
          const res = await fetch("/api/therapy-sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              action: "pay", 
              sessionId: paymentModalItem.id, 
              paymentMethod: "Online",
              transactionId: txnId 
            }),
          });
          const json = await res.json();
          if (!json.success) throw new Error(json.message || "Failed to record POS payment.");
        }

        setModalSuccess(`Payment of ₹${paymentModalItem.amount} recorded via POS/UPI successfully!`);
        await fetchData();
        setTimeout(() => {
          setPaymentModalItem(null);
        }, 1200);
        return;
      }
    } catch (err: any) {
      setModalError(err.message || "Failed to process payment.");
    } finally {
      setModalProcessing(false);
    }
  };

  const filteredConsultations = consultations.filter((apt) => {
    const patientName = apt.patientId?.name.toLowerCase() || "";
    const doctorName = apt.doctorId?.name.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    const matchSearch = patientName.includes(query) || doctorName.includes(query);
    const matchDate = filterDate ? apt.date === filterDate : true;
    
    let matchStatus = true;
    if (filterStatus === "Paid") matchStatus = apt.status !== "Cancelled" && apt.paymentStatus === "Paid";
    if (filterStatus === "Unpaid") matchStatus = apt.status !== "Cancelled" && apt.paymentStatus === "Pending";
    if (filterStatus === "Cancelled") matchStatus = apt.status === "Cancelled";

    return matchSearch && matchDate && matchStatus;
  }).sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

  const filteredTherapy = therapySessions.filter((ts) => {
    const patientName = ts.patientId?.name.toLowerCase() || "";
    const sessionName = ts.name.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchSearch = patientName.includes(query) || sessionName.includes(query);
    const matchDate = filterDate ? (ts.date === filterDate) : true;
    
    let matchStatus = true;
    const isPaid = ts.paymentStatus === "Paid" || ts.status === "Paid";
    if (filterStatus === "Paid") matchStatus = isPaid;
    if (filterStatus === "Unpaid") matchStatus = !isPaid && (ts.status === "Booked" || ts.status === "Unpaid" || ts.status === "Scheduled");
    if (filterStatus === "Cancelled") matchStatus = false;

    return matchSearch && matchDate && matchStatus;
  }).sort((a, b) => new Date(`${b.date || '1970-01-01'}T${b.time || '00:00'}`).getTime() - new Date(`${a.date || '1970-01-01'}T${a.time || '00:00'}`).getTime());

  const filteredPharmacy = pharmacyOrders.filter((order) => {
    const patientName = order.patientId?.name.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    const matchSearch = patientName.includes(query);
    const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
    const matchDate = filterDate ? orderDate === filterDate : true;
    return matchSearch && matchDate;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getPaginatedData = (dataArray: any[]) => {
    const totalPages = Math.ceil(dataArray.length / pageSize);
    const paginated = dataArray.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    return { totalPages, paginated };
  };

  const { totalPages: totalCons, paginated: paginatedCons } = getPaginatedData(filteredConsultations);
  const { totalPages: totalTherapy, paginated: paginatedTherapy } = getPaginatedData(filteredTherapy);
  const { totalPages: totalPharm, paginated: paginatedPharm } = getPaginatedData(filteredPharmacy);

  const renderPagination = (totalPages: number, totalItems: number) => {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/10 col-span-full">
        <div className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} entries
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
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        Loading billing logs...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments & Counter Bills</h1>
        <p className="text-muted-foreground mt-1 text-sm font-medium">
          Review counter therapy session billing and track consultation & prescription order transactions.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-sm font-medium rounded-xl border border-emerald-200/50 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 text-sm font-medium rounded-xl border border-rose-200/50 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" /> {errorMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("consultations")}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "consultations" 
                ? "bg-primary text-white shadow-sm" 
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Consultations</span>
          </button>
          
          <button
            onClick={() => setActiveTab("therapy")}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "therapy" 
                ? "bg-primary text-white shadow-sm" 
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Therapy Sessions</span>
          </button>

          <button
            onClick={() => setActiveTab("pharmacy")}
            className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
              activeTab === "pharmacy" 
                ? "bg-primary text-white shadow-sm" 
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Prescription Orders</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search patient, doctor, order..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />

          {activeTab !== "pharmacy" && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-10 px-3 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Pending</option>
              {activeTab === "consultations" && <option value="Cancelled">Cancelled</option>}
            </select>
          )}
        </div>
      </div>

      {/* Consultations Billing */}
      {activeTab === "consultations" && (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          {filteredConsultations.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No consultation records found matching filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Doctor & Appt Time</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Payment Method</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {paginatedCons.map((apt: AppointmentData) => (
                    <tr key={apt._id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-foreground">{apt.patientId?.name || "Unknown"}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{apt.patientId?.phone || ""}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-foreground">{apt.doctorId?.name || "Doctor"}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{apt.date} at {formatTime12Hour(apt.time)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-medium bg-background">{apt.type}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        {apt.paymentStatus === "Paid" ? (
                          <Badge variant="outline" className="font-medium bg-indigo-50 text-indigo-700 border-indigo-200">
                            {apt.collectedBy === "Clinic Manager" || apt.paymentMethod === "Cash"
                              ? "Counter (Cash)"
                              : apt.paymentMethod === "Online" || apt.collectedBy === "HDFC SmartGateway"
                                ? "HDFC SmartGateway"
                                : "Online Payment"}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge 
                          className={
                            apt.status === "Cancelled" ? "bg-rose-100 text-rose-700 hover:bg-rose-100 border-none shadow-none font-bold"
                            : apt.paymentStatus === "Paid" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none shadow-none font-bold" 
                            : "bg-amber-100 text-amber-700 hover:bg-amber-100 border-none shadow-none font-bold"
                          }
                        >
                          {apt.status === "Cancelled" ? "Cancelled" : apt.paymentStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-bold">
                        ₹{apt.feeAmount || 1499}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {apt.status === "Cancelled" ? (
                          <span className="text-xs font-bold text-rose-500 flex items-center justify-end gap-1">
                            <XCircle className="w-4 h-4" /> Appointment Cancelled
                          </span>
                        ) : apt.paymentStatus === "Paid" ? (
                          <span className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Settled
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => openAppointmentPaymentModal(apt)}
                            disabled={actionLoading === apt._id}
                            className="font-bold shadow-none bg-primary/10 text-primary hover:bg-primary hover:text-white"
                          >
                            Collect Payment
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination(totalCons, filteredConsultations.length)}
            </div>
          )}
        </div>
      )}

      {/* Therapy Sessions Billing */}
      {activeTab === "therapy" && (
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
          {filteredTherapy.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No therapy sessions found matching filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-4">Patient Details</th>
                    <th className="p-4">Therapy Name</th>
                    <th className="p-4">Schedule</th>
                    <th className="p-4">Billing Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {paginatedTherapy.map((ts: TherapySessionData) => (
                    <tr key={ts._id} className="hover:bg-muted/10 transition">
                      <td className="p-4">
                        <div className="font-bold text-foreground">{ts.patientId?.name || "Patient"}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{ts.patientId?.phone || "No phone"}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">{ts.name}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-medium text-muted-foreground">{ts.date} at {ts.time ? formatTime12Hour(ts.time) : ""}</span>
                      </td>
                      <td className="p-4">
                        <span className="font-bold">₹{ts.price}</span>
                      </td>
                      <td className="p-4">
                        <Badge variant={(ts.paymentStatus === "Paid" || ts.status === "Paid") ? "default" : "secondary"}>
                          {ts.paymentStatus === "Paid" ? "Paid" : ts.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        {ts.paymentStatus !== "Paid" && ts.status !== "Paid" && (ts.status === "Booked" || ts.status === "Scheduled") ? (
                          <Button
                            size="sm"
                            disabled={actionLoading === ts._id}
                            onClick={() => openTherapyPaymentModal(ts)}
                            className="text-xs font-bold text-white rounded-lg px-3.5 py-1.5 h-auto bg-primary hover:bg-primary/90"
                          >
                            Collect ₹{ts.price}
                          </Button>
                        ) : (
                          <span className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination(totalTherapy, filteredTherapy.length)}
            </div>
          )}
        </div>
      )}

      {/* Pharmacy Orders Billing */}
      {activeTab === "pharmacy" && (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredPharmacy.length === 0 ? (
            <div className="col-span-full bg-card border border-border rounded-3xl p-12 text-center text-muted-foreground">
              No prescription orders found matching filters.
            </div>
          ) : (
            <>
              {paginatedPharm.map((order: OrderData) => (
                <div 
                  key={order._id}
                  className="bg-card border border-border rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-4"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg leading-tight text-foreground">{order.patientId?.name || "Patient"}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">Phone: {order.patientId?.phone}</p>
                      </div>
                      <Badge variant={order.status === "Delivered" ? "default" : "secondary"}>
                        {order.status}
                      </Badge>
                    </div>

                    {/* Items list */}
                    <div className="border-t border-border pt-3 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ordered Products</h4>
                      <div className="space-y-1.5">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-xs text-foreground bg-muted/40 p-2 rounded-lg border border-border/40">
                            <span>{item.productId?.name || "Medicine"} x {item.quantity}</span>
                            <span className="font-bold">₹{item.priceAtPurchase * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-3 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-sm">
                      <CreditCard className="w-4 h-4 text-primary" />
                      <span>Total Bill: <strong className="text-foreground font-bold">₹{order.totalAmount}</strong></span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Ordered: {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
              <div className="col-span-full">
                {renderPagination(totalPharm, filteredPharmacy.length)}
              </div>
            </>
          )}
        </div>
      )}

      {/* --- PAYMENT OPTIONS MODAL (PAYMENT GATEWAY / CASH / POS / WHATSAPP) --- */}
      {paymentModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in-50 duration-200">
          <div className="bg-card border border-border rounded-3xl w-full max-w-lg p-6 shadow-2xl relative space-y-5 my-auto">
            {/* Close Button */}
            <button 
              onClick={() => setPaymentModalItem(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Collect Payment & Settle Bill</h3>
                <p className="text-xs text-muted-foreground">Choose payment method to settle this appointment fee.</p>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="bg-muted/30 border border-border/60 rounded-2xl p-4 flex justify-between items-center">
              <div>
                <div className="font-bold text-sm text-foreground">{paymentModalItem.patientName}</div>
                <div className="text-xs text-muted-foreground">{paymentModalItem.patientPhone || "No contact"}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{paymentModalItem.serviceTitle}</div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-muted-foreground block">Amount Due</span>
                <span className="text-2xl font-black text-primary">₹{paymentModalItem.amount}</span>
              </div>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 text-xs font-semibold rounded-xl border border-rose-200/50 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {modalError}
              </div>
            )}

            {modalSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 text-xs font-semibold rounded-xl border border-emerald-200/50 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {modalSuccess}
              </div>
            )}

            {/* Payment Method Selector */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Select Payment Method
              </label>

              {/* 1. HDFC SmartGateway Option */}
              <div 
                onClick={() => setSelectedPaymentMode("gateway")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  selectedPaymentMode === "gateway"
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : "border-border hover:border-primary/40 bg-card"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">HDFC SmartGateway (Cards / UPI / NetBanking)</span>
                    <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">Online PG</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Launch official payment gateway to pay securely via Credit/Debit card, UPI, or NetBanking.
                  </p>
                </div>
              </div>

              {/* 2. Cash at Counter Option */}
              <div 
                onClick={() => setSelectedPaymentMode("cash")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  selectedPaymentMode === "cash"
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : "border-border hover:border-primary/40 bg-card"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Banknote className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">Cash (Counter Collection)</span>
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30">Cash</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Collect cash directly at clinic desk and immediately settle bill with invoice.
                  </p>
                </div>
              </div>

              {/* 3. Counter UPI / POS Card Machine Option */}
              <div 
                onClick={() => setSelectedPaymentMode("pos")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  selectedPaymentMode === "pos"
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : "border-border hover:border-primary/40 bg-card"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <QrCode className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">Counter UPI / POS Machine</span>
                    <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-600 border-indigo-500/30">Desk POS</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Patient scanned clinic counter QR code or swiped physical POS card machine.
                  </p>
                  {selectedPaymentMode === "pos" && (
                    <div className="mt-2.5 pt-2 border-t border-border/50">
                      <input
                        type="text"
                        placeholder="Enter UPI / POS UTR Ref ID (Optional)"
                        value={posRef}
                        onChange={(e) => setPosRef(e.target.value)}
                        className="w-full h-8 px-2.5 text-xs rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* 4. WhatsApp Payment Link Option */}
              <div 
                onClick={() => setSelectedPaymentMode("whatsapp")}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                  selectedPaymentMode === "whatsapp"
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : "border-border hover:border-primary/40 bg-card"
                }`}
              >
                <div className="w-9 h-9 rounded-xl bg-green-500/10 text-green-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Send className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">Send Payment Link on WhatsApp</span>
                    <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-600 border-green-500/30">WhatsApp</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Dispatch the payment link & invoice directly to the patient's phone ({paymentModalItem.patientPhone || "registered mobile"}).
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaymentModalItem(null)}
                className="rounded-xl h-10 px-4 text-xs font-semibold"
              >
                Cancel
              </Button>

              <Button
                type="button"
                disabled={modalProcessing}
                onClick={handleExecutePayment}
                className="rounded-xl h-10 px-5 text-xs font-bold text-white bg-primary hover:bg-primary/90 shadow-sm"
              >
                {modalProcessing ? (
                  "Processing..."
                ) : selectedPaymentMode === "gateway" ? (
                  "Launch Payment Gateway →"
                ) : selectedPaymentMode === "cash" ? (
                  "Confirm Cash Payment"
                ) : selectedPaymentMode === "pos" ? (
                  "Confirm POS / UPI Settlement"
                ) : (
                  "Send WhatsApp Link"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
