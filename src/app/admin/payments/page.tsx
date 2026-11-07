"use client";

import { useEffect, useState } from "react";
import { 
  Search, RefreshCw, Download, Calendar, Filter, 
  CheckCircle2, XCircle, Clock, Copy, Check, ArrowUpDown, 
  DollarSign, ShoppingBag, Stethoscope, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PaymentItem {
  _id: string;
  date: string;
  transactionId: string;
  patient: {
    name: string;
    phone: string;
    email?: string;
  };
  doctor?: {
    name: string;
    specialization?: string;
    role: "Doctor" | "Therapist";
  } | null;
  clinic?: {
    name: string;
    city?: string;
  } | null;
  context: string;
  paymentMethod: string;
  amount: number;
  currency: string;
  status: "Success" | "Failed" | "Pending" | "Refunded";
}

interface PaymentStats {
  totalRevenue: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  totalTransactions: number;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedContext, setSelectedContext] = useState("All");
  const [selectedClinic, setSelectedClinic] = useState("All");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Export Modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");

  const fetchPayments = async (syncGateway = false) => {
    try {
      if (syncGateway) setSyncing(true);
      else setLoading(true);

      const res = await fetch(`/api/admin/payments?sync=${syncGateway ? "true" : "false"}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPayments(json.data);
        if (json.stats) setStats(json.stats);
      }
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchPayments(false);
  }, []);

  const handleManualGatewaySync = async () => {
    try {
      setSyncing(true);
      const res = await fetch("/api/admin/payments", { method: "POST" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPayments(json.data);
        alert(json.message || "Payment records successfully synced from payment gateway and website database.");
      }
    } catch (err) {
      console.error(err);
      alert("Error syncing payments with gateway.");
    } finally {
      setSyncing(false);
      fetchPayments(false);
    }
  };

  const copyTransactionId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Distinct Filter Options
  const clinics = Array.from(new Set(payments.map(p => p.clinic?.name).filter(Boolean)));
  const contexts = Array.from(new Set(payments.map(p => {
    if (p.context.toLowerCase().includes("appointment")) return "Appointments";
    if (p.context.toLowerCase().includes("pharmacy")) return "Pharmacy Orders";
    return "Other Services";
  })));

  // Filter Logic
  const filteredPayments = payments.filter((payment) => {
    // Status Filter
    if (selectedStatus !== "All" && payment.status !== selectedStatus) {
      return false;
    }

    // Context Filter
    if (selectedContext !== "All") {
      const isAppt = payment.context.toLowerCase().includes("appointment");
      const isPharm = payment.context.toLowerCase().includes("pharmacy");
      if (selectedContext === "Appointments" && !isAppt) return false;
      if (selectedContext === "Pharmacy Orders" && !isPharm) return false;
      if (selectedContext === "Other Services" && (isAppt || isPharm)) return false;
    }

    // Clinic Filter
    if (selectedClinic !== "All" && payment.clinic?.name !== selectedClinic) {
      return false;
    }

    // Search Query (Patient Name, Phone, Email, Transaction ID)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const name = (payment.patient?.name || "").toLowerCase();
      const phone = (payment.patient?.phone || "").toLowerCase();
      const email = (payment.patient?.email || "").toLowerCase();
      const txn = (payment.transactionId || "").toLowerCase();
      const doc = (payment.doctor?.name || "").toLowerCase();
      const clinicName = (payment.clinic?.name || "").toLowerCase();

      if (
        !name.includes(q) &&
        !phone.includes(q) &&
        !email.includes(q) &&
        !txn.includes(q) &&
        !doc.includes(q) &&
        !clinicName.includes(q)
      ) {
        return false;
      }
    }

    // Date Range Filters
    if (startDate) {
      const pTime = new Date(payment.date).getTime();
      const sTime = new Date(startDate).setHours(0, 0, 0, 0);
      if (pTime < sTime) return false;
    }
    if (endDate) {
      const pTime = new Date(payment.date).getTime();
      const eTime = new Date(endDate).setHours(23, 59, 59, 999);
      if (pTime > eTime) return false;
    }

    return true;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPayments.length / pageSize) || 1;
  const paginatedPayments = filteredPayments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // CSV Export
  const downloadReport = () => {
    const exportData = payments.filter((payment) => {
      if (exportStartDate) {
        if (new Date(payment.date).getTime() < new Date(exportStartDate).setHours(0, 0, 0, 0)) return false;
      }
      if (exportEndDate) {
        if (new Date(payment.date).getTime() > new Date(exportEndDate).setHours(23, 59, 59, 999)) return false;
      }
      return true;
    });

    const headers = [
      "Date",
      "Time",
      "Patient Name",
      "Patient Phone",
      "Patient Email",
      "Doctor / Specialist",
      "Clinic",
      "Transaction ID",
      "Payment Method",
      "Context",
      "Amount",
      "Status",
    ];

    const csvRows = [headers.join(",")];
    exportData.forEach((payment) => {
      const d = new Date(payment.date);
      const dateStr = d.toLocaleDateString("en-IN");
      const timeStr = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
      const patient = payment.patient?.name || "Patient";
      const phone = payment.patient?.phone || "";
      const email = payment.patient?.email || "";
      const doctor = payment.doctor?.name || "N/A";
      const clinic = payment.clinic ? `${payment.clinic.name} (${payment.clinic.city || ""})` : "N/A";
      const txnId = payment.transactionId || "";
      const method = payment.paymentMethod || "Online";
      const context = payment.context || "Website Transaction";
      const amount = `${payment.currency} ${payment.amount}`;
      const status = payment.status;

      csvRows.push(
        [dateStr, timeStr, patient, phone, email, doctor, clinic, txnId, method, context, amount, status]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
      );
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `payments_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setIsExportModalOpen(false);
  };

  const calculatedTotalRevenue = filteredPayments
    .filter((p) => p.status === "Success")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Payment Transactions
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
            Centralized website payment records synced across appointments, pharmacy orders, and payment gateway.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualGatewaySync}
            disabled={syncing}
            className="rounded-xl font-bold text-xs h-9 px-3 gap-2 border-primary/30 text-primary hover:bg-primary/10 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin text-primary" : ""}`} />
            {syncing ? "Syncing Gateway..." : "Sync Gateway Records"}
          </Button>

          <Button
            size="sm"
            onClick={() => setIsExportModalOpen(true)}
            className="rounded-xl font-bold text-xs h-9 px-4 gap-2 bg-primary hover:bg-primary/90 text-white shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Export Report
          </Button>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 bg-card rounded-2xl border border-border/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-primary" /> Total Verified Revenue
          </span>
          <p className="text-2xl font-black text-foreground">
            ₹{calculatedTotalRevenue.toLocaleString("en-IN")}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {filteredPayments.filter(p => p.status === "Success").length} successful payments
          </span>
        </div>

        <div className="p-4 bg-card rounded-2xl border border-border/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Success Rate
          </span>
          <p className="text-2xl font-black text-foreground">
            {filteredPayments.length > 0 
              ? `${Math.round((filteredPayments.filter(p => p.status === "Success").length / filteredPayments.length) * 100)}%` 
              : "100%"}
          </p>
          <span className="text-[11px] text-muted-foreground">
            {filteredPayments.filter(p => p.status === "Success").length} of {filteredPayments.length} transactions
          </span>
        </div>

        <div className="p-4 bg-card rounded-2xl border border-border/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-blue-600" /> Appointments Paid
          </span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {filteredPayments.filter(p => p.context.toLowerCase().includes("appointment") && p.status === "Success").length}
          </p>
          <span className="text-[11px] text-muted-foreground">Doctor & Therapy Consultations</span>
        </div>

        <div className="p-4 bg-card rounded-2xl border border-border/80 shadow-2xs space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-purple-600" /> Pharmacy Orders
          </span>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
            {filteredPayments.filter(p => p.context.toLowerCase().includes("pharmacy") && p.status === "Success").length}
          </p>
          <span className="text-[11px] text-muted-foreground">Counter & Online Medicine Orders</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card p-4 rounded-3xl border border-border/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search Patient, Phone, Specialist, or Transaction ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-background border border-border/90 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground"
            />
          </div>

          {/* Date Range Start */}
          <div className="flex items-center gap-2 bg-background border border-border/90 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-bold text-muted-foreground shrink-0">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-transparent focus:outline-none text-foreground"
            />
          </div>

          {/* Date Range End */}
          <div className="flex items-center gap-2 bg-background border border-border/90 rounded-xl px-3 py-1.5">
            <span className="text-[11px] font-bold text-muted-foreground shrink-0">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs bg-transparent focus:outline-none text-foreground"
            />
          </div>
        </div>

        {/* Dropdown Quick Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40">
          <span className="text-[11px] font-bold text-muted-foreground mr-1">Filter By:</span>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-background border border-border/80 rounded-xl px-3 py-1.5 text-foreground font-semibold cursor-pointer focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">All Statuses</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
            <option value="Pending">Pending</option>
            <option value="Refunded">Refunded</option>
          </select>

          {/* Context Dropdown */}
          <select
            value={selectedContext}
            onChange={(e) => {
              setSelectedContext(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-background border border-border/80 rounded-xl px-3 py-1.5 text-foreground font-semibold cursor-pointer focus:ring-2 focus:ring-primary/20"
          >
            <option value="All">All Contexts</option>
            <option value="Appointments">Appointments Only</option>
            <option value="Pharmacy Orders">Pharmacy Orders Only</option>
            <option value="Other Services">Other Services</option>
          </select>

          {/* Clinic Dropdown */}
          {clinics.length > 0 && (
            <select
              value={selectedClinic}
              onChange={(e) => {
                setSelectedClinic(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs bg-background border border-border/80 rounded-xl px-3 py-1.5 text-foreground font-semibold cursor-pointer focus:ring-2 focus:ring-primary/20"
            >
              <option value="All">All Clinics</option>
              {clinics.map((c) => (
                <option key={c as string} value={c as string}>
                  {c as string}
                </option>
              ))}
            </select>
          )}

          {/* Reset Filters Button */}
          {(searchQuery || startDate || endDate || selectedStatus !== "All" || selectedContext !== "All" || selectedClinic !== "All") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStartDate("");
                setEndDate("");
                setSelectedStatus("All");
                setSelectedContext("All");
                setSelectedClinic("All");
                setCurrentPage(1);
              }}
              className="text-xs font-bold text-destructive hover:bg-destructive/10 rounded-xl h-8 px-3"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Transactions Data Table */}
      {loading ? (
        <div className="p-16 text-center text-muted-foreground text-sm bg-card rounded-3xl border border-border/80">
          Loading centralized payment records...
        </div>
      ) : (
        <div className="bg-card rounded-3xl border border-border shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs sm:text-sm">
              <thead className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/40 border-b border-border/80">
                <tr>
                  <th className="px-5 py-3.5">Date &amp; Time</th>
                  <th className="px-5 py-3.5">Patient Details</th>
                  <th className="px-5 py-3.5">Doctor / Specialist</th>
                  <th className="px-5 py-3.5">Clinic Location</th>
                  <th className="px-5 py-3.5">Transaction ID</th>
                  <th className="px-5 py-3.5">Context</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {paginatedPayments.map((payment) => {
                  const d = new Date(payment.date);
                  const isAppt = payment.context.toLowerCase().includes("appointment");
                  const isPharm = payment.context.toLowerCase().includes("pharmacy");

                  return (
                    <tr key={payment._id} className="hover:bg-muted/20 transition-colors">
                      
                      {/* Date & Time */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-foreground">
                          {d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                        </div>
                      </td>

                      {/* Patient Details */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-foreground">
                          {payment.patient?.name || "Patient"}
                        </div>
                        {payment.patient?.phone && (
                          <div className="text-[11px] text-muted-foreground font-mono">
                            {payment.patient.phone}
                          </div>
                        )}
                        {payment.patient?.email && (
                          <div className="text-[10px] text-muted-foreground/80 max-w-[140px] truncate" title={payment.patient.email}>
                            {payment.patient.email}
                          </div>
                        )}
                      </td>

                      {/* Doctor / Specialist */}
                      <td className="px-5 py-3.5">
                        {payment.doctor ? (
                          <div>
                            <div className="font-semibold text-foreground">
                              {payment.doctor.role === "Doctor" ? "Dr. " : ""}{payment.doctor.name}
                            </div>
                            {payment.doctor.specialization && (
                              <div className="text-[11px] text-primary font-medium">
                                {payment.doctor.specialization}
                              </div>
                            )}
                          </div>
                        ) : isPharm ? (
                          <span className="text-[11px] text-muted-foreground font-medium">
                            Clinic Pharmacy
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </td>

                      {/* Clinic Location */}
                      <td className="px-5 py-3.5">
                        {payment.clinic ? (
                          <div>
                            <div className="font-semibold text-foreground text-xs">
                              {payment.clinic.name}
                            </div>
                            {payment.clinic.city && (
                              <div className="text-[11px] text-muted-foreground">
                                {payment.clinic.city}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">Global / Online</span>
                        )}
                      </td>

                      {/* Transaction ID & Method */}
                      <td className="px-5 py-3.5 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-foreground truncate max-w-[140px]" title={payment.transactionId}>
                            {payment.transactionId}
                          </span>
                          <button
                            onClick={() => copyTransactionId(payment.transactionId)}
                            className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors"
                            title="Copy Transaction ID"
                          >
                            {copiedId === payment.transactionId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-sans font-medium mt-0.5">
                          {payment.paymentMethod || "Online"}
                        </div>
                      </td>

                      {/* Context */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold py-0.5 px-2 rounded-lg ${
                            isAppt
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300"
                              : isPharm
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                              : "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300"
                          }`}
                        >
                          {payment.context}
                        </Badge>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-3.5 font-bold text-foreground whitespace-nowrap">
                        ₹{payment.amount.toLocaleString("en-IN")}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        {payment.status === "Success" && (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-[11px] gap-1 py-0.5 px-2">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Success
                          </Badge>
                        )}
                        {payment.status === "Failed" && (
                          <Badge variant="destructive" className="font-bold text-[11px] gap-1 py-0.5 px-2">
                            <XCircle className="w-3 h-3" /> Failed
                          </Badge>
                        )}
                        {payment.status === "Pending" && (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 font-bold text-[11px] gap-1 py-0.5 px-2">
                            <Clock className="w-3 h-3 text-amber-600" /> Pending
                          </Badge>
                        )}
                        {payment.status === "Refunded" && (
                          <Badge variant="secondary" className="font-bold text-[11px] gap-1 py-0.5 px-2">
                            Refunded
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredPayments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground text-xs">
                      No matching payment records found. Try adjusting your search query or date range filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredPayments.length > pageSize && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
              <span className="text-xs font-semibold text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredPayments.length)} of {filteredPayments.length} transactions
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl text-xs font-bold h-8 px-3"
                >
                  Previous
                </Button>
                <span className="text-xs font-bold text-foreground px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-xl text-xs font-bold h-8 px-3"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Export Report Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl shadow-2xl border border-border max-w-md w-full p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-foreground">Export Payments Report</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Download verified payment records as a detailed CSV file.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">Start Date (Optional)</label>
                <input
                  type="date"
                  value={exportStartDate}
                  onChange={(e) => setExportStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block font-bold text-foreground mb-1">End Date (Optional)</label>
                <input
                  type="date"
                  value={exportEndDate}
                  onChange={(e) => setExportEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Leaving dates empty will export all {payments.length} payment records in the database.
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-border/40">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExportModalOpen(false)}
                className="rounded-xl font-bold h-9 px-4"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={downloadReport}
                className="rounded-xl font-bold h-9 px-5 bg-primary hover:bg-primary/90 text-white shadow-xs"
              >
                Download CSV
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
