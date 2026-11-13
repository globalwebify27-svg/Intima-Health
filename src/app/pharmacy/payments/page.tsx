"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Banknote,
  CheckCircle2,
  Clock,
  CreditCard,
  RefreshCw,
  Search,
  Wallet,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface PopulatedOrder {
  _id: string;
  orderNumber?: string;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  totalAmount?: number;
  shippingAddress?: string;
  items?: Array<{ name?: string; quantity: number; priceAtPurchase: number }>;
}

interface PopulatedPatient {
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
}

interface PharmacyPayment {
  _id: string;
  orderId?: PopulatedOrder | null;
  patientId?: PopulatedPatient | null;
  customerName?: string;
  customerPhone?: string;
  context?: string;
  paymentMethod?: string;
  gatewayProvider?: string;
  gatewayOrderId?: string;
  gatewayTransactionId: string;
  gatewayPaymentMethod?: string;
  amount: number;
  currency: string;
  status: "Success" | "Failed" | "Pending" | "Refunded";
  createdAt: string;
}

interface PaymentStats {
  totalRevenue: number;
  cashRevenue: number;
  onlineRevenue: number;
  successCount: number;
  pendingCount: number;
  failedCount: number;
  totalTransactions: number;
}

const STATUS_BADGE: Record<PharmacyPayment["status"], string> = {
  Success: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  Pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  Failed: "bg-rose-500/10 text-rose-700 border-rose-500/20",
  Refunded: "bg-slate-500/10 text-slate-700 border-slate-500/20",
};

export default function PharmacyPaymentsPage() {
  const [payments, setPayments] = useState<PharmacyPayment[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    cashRevenue: 0,
    onlineRevenue: 0,
    successCount: 0,
    pendingCount: 0,
    failedCount: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");

  const fetchPayments = useCallback(async (syncGateway = false) => {
    try {
      if (syncGateway) setSyncing(true);
      else setLoading(true);

      const res = await fetch(`/api/pharmacy/payments${syncGateway ? "?sync=true" : ""}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success) {
        setPayments(json.data || []);
        if (json.stats) setStats(json.stats);
      }
    } catch (err) {
      console.error("Failed to fetch pharmacy payments:", err);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/pharmacy/payments", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (!active) return;
        if (json.success) {
          setPayments(json.data || []);
          if (json.stats) setStats(json.stats);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch pharmacy payments:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredPayments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return payments.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (methodFilter === "Cash" && p.paymentMethod !== "Cash") return false;
      if (methodFilter === "Online" && (p.paymentMethod === "Cash" || p.paymentMethod === "COD")) return false;
      if (methodFilter === "COD" && p.paymentMethod !== "COD") return false;

      if (!q) return true;
      const patientName = (p.patientId?.name || p.customerName || "").toLowerCase();
      const patientPhone = (p.patientId?.phone || p.customerPhone || "").toLowerCase();
      const orderNo = (p.orderId?.orderNumber || p.context || "").toLowerCase();
      const txn = (p.gatewayTransactionId || p.gatewayOrderId || "").toLowerCase();
      return (
        patientName.includes(q) ||
        patientPhone.includes(q) ||
        orderNo.includes(q) ||
        txn.includes(q)
      );
    });
  }, [payments, search, statusFilter, methodFilter]);

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-foreground">
            Pharmacy Payments
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track counter settlements, online orders, transaction IDs, and payment statuses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => void fetchPayments(false)}
            disabled={loading || syncing}
            className="rounded-xl gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            onClick={() => void fetchPayments(true)}
            disabled={syncing}
            className="rounded-xl gap-2"
          >
            <RotateCcw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing Gateway..." : "Sync Gateway"}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Total Collected</span>
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold mt-2 text-foreground">
            ₹{stats.totalRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.successCount} successful transactions
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Cash / COD</span>
            <Banknote className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold mt-2 text-foreground">
            ₹{stats.cashRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Counter &amp; COD settlements</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Online / UPI / Card</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold mt-2 text-foreground">
            ₹{stats.onlineRevenue.toLocaleString("en-IN")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Counter UPI/POS &amp; HDFC Gateway</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            <span>Pending / Failed</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold mt-2 text-foreground">
            {stats.pendingCount + stats.failedCount}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.pendingCount} pending &bull; {stats.failedCount} failed
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, patient name, phone, or transaction ID..."
            className="pl-10 rounded-xl h-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-input bg-background text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="Success">Success</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>
        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="h-10 px-3 rounded-xl border border-input bg-background text-sm"
        >
          <option value="all">All Methods</option>
          <option value="Cash">Cash</option>
          <option value="Online">Online / UPI</option>
          <option value="COD">COD</option>
        </select>
      </div>

      {/* Table / List */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            Loading pharmacy payments...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            No pharmacy payment records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/40 border-b border-border text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3.5 font-semibold">Date</th>
                  <th className="px-4 py-3.5 font-semibold">Order / Context</th>
                  <th className="px-4 py-3.5 font-semibold">Patient</th>
                  <th className="px-4 py-3.5 font-semibold">Method &amp; Source</th>
                  <th className="px-4 py-3.5 font-semibold">Transaction / Ref ID</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="px-4 py-3.5 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredPayments.map((p) => {
                  const orderNo = p.orderId?.orderNumber || p.context || "Pharmacy Order";
                  const patientName = p.patientId?.name || p.customerName || "Patient";
                  const patientPhone = p.patientId?.phone || p.customerPhone || "";
                  return (
                    <tr key={p._id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                        {formatDate(p.createdAt)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-foreground">{orderNo}</div>
                        {p.orderId?.status && (
                          <div className="text-[11px] text-muted-foreground">
                            Order: {p.orderId.status.replace(/_/g, " ")}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-foreground">{patientName}</div>
                        {patientPhone && (
                          <div className="text-xs text-muted-foreground">{patientPhone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-foreground">
                          {p.gatewayPaymentMethod || p.paymentMethod || "Online"}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {p.gatewayProvider || "Counter"}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground max-w-[200px] truncate">
                        {p.gatewayTransactionId || p.gatewayOrderId || "—"}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <Badge variant="outline" className={`gap-1 ${STATUS_BADGE[p.status]}`}>
                          {p.status === "Success" && <CheckCircle2 className="w-3 h-3" />}
                          {p.status === "Pending" && <Clock className="w-3 h-3" />}
                          {p.status === "Failed" && <XCircle className="w-3 h-3" />}
                          {p.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 text-right font-bold whitespace-nowrap">
                        ₹{Number(p.amount || 0).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
