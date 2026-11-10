"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { initiateHdfcCheckout } from "@/lib/payments/client";
import { useCart } from "@/store/useCart";

interface PaymentStatusData {
  orderId: string;
  transactionId: string;
  status: "Success" | "Failed" | "Pending" | "Refunded";
  amount: number;
  currency: string;
  paymentMethod?: string;
  gatewayProvider: string;
  context?: string;
  entityType: "order" | "appointment" | "therapy" | "unknown";
  entityId?: string;
  entityDetails?: Record<string, any> | null;
  createdAt?: string;
}

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || "";
  const urlStatus = searchParams.get("status") || "";
  const reason = searchParams.get("reason") || "";
  const fallbackEntityType = (searchParams.get("entityType") || "unknown") as PaymentStatusData["entityType"];
  const fallbackEntityId = searchParams.get("entityId") || "";

  const { clearCart } = useCart();

  const [loading, setLoading] = useState(Boolean(orderId));
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<PaymentStatusData | null>(null);

  const loadStatus = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/payments/hdfc/status/${encodeURIComponent(orderId)}`, {
        cache: "no-store",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || "Unable to verify payment status.");
      } else {
        setData(json.data);
        if (json.data?.status === "Success" && json.data?.entityType === "order") {
          clearCart();
        }
      }
    } catch {
      setError("Network error while checking payment status.");
    } finally {
      setLoading(false);
    }
  }, [orderId, clearCart]);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const effectiveStatus = data?.status || (urlStatus === "success" ? "Success" : urlStatus === "pending" ? "Pending" : "Failed");
  const effectiveEntityType = data?.entityType || fallbackEntityType;
  const effectiveEntityId = data?.entityId || fallbackEntityId;

  const handleRetryPayment = async () => {
    if (!effectiveEntityId || effectiveEntityType === "unknown") return;
    setRetrying(true);
    setError("");
    try {
      const { paymentUrl } = await initiateHdfcCheckout({
        entityType: effectiveEntityType,
        entityId: effectiveEntityId,
      });
      window.location.href = paymentUrl;
    } catch (err: any) {
      setError(err?.message || "Unable to restart payment session.");
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center shadow-lg space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <RefreshCw className="w-7 h-7 text-primary animate-spin" />
          </div>
          <h1 className="text-2xl font-serif font-semibold">Verifying Payment</h1>
          <p className="text-sm text-muted-foreground">
            Confirming your transaction securely with HDFC SmartGateway...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-muted/20">
      <div className="max-w-lg w-full bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="text-center space-y-3">
          {effectiveStatus === "Success" ? (
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>
          ) : effectiveStatus === "Pending" ? (
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="w-9 h-9" />
            </div>
          ) : (
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <XCircle className="w-9 h-9" />
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-serif font-bold">
            {effectiveStatus === "Success"
              ? "Payment Confirmed"
              : effectiveStatus === "Pending"
                ? "Payment Pending"
                : "Payment Not Completed"}
          </h1>

          <p className="text-sm text-muted-foreground">
            {effectiveStatus === "Success"
              ? "Your payment has been verified with HDFC SmartGateway and your booking/order is confirmed."
              : effectiveStatus === "Pending"
                ? "Your bank is still confirming the transaction. Please wait a moment and check again."
                : reason || error || "Your payment was cancelled or declined. You can retry safely below."}
          </p>
        </div>

        {(data || orderId) && (
          <div className="bg-muted/40 border border-border rounded-2xl p-4 space-y-2.5 text-sm">
            {data?.context && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Purpose</span>
                <span className="font-semibold text-right">{data.context}</span>
              </div>
            )}
            {data?.amount !== undefined && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-base">₹{Number(data.amount).toLocaleString("en-IN")}</span>
              </div>
            )}
            {(data?.orderId || orderId) && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Gateway Order ID</span>
                <span className="font-mono text-xs">{data?.orderId || orderId}</span>
              </div>
            )}
            {data?.transactionId && data.transactionId !== data.orderId && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-xs">{data.transactionId}</span>
              </div>
            )}
            {data?.paymentMethod && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">{data.paymentMethod}</span>
              </div>
            )}
            <div className="flex justify-between gap-4 pt-2 border-t border-border/60">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" /> Gateway
              </span>
              <span className="font-medium">HDFC SmartGateway</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {effectiveStatus !== "Success" && effectiveEntityId && effectiveEntityType !== "unknown" && (
            <Button
              onClick={handleRetryPayment}
              disabled={retrying}
              className="flex-1 rounded-xl gap-2"
            >
              <CreditCard className="w-4 h-4" />
              {retrying ? "Redirecting..." : "Retry Payment"}
            </Button>
          )}

          {effectiveStatus === "Pending" && orderId && (
            <Button variant="outline" onClick={loadStatus} className="flex-1 rounded-xl gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh Status
            </Button>
          )}

          {effectiveEntityType === "order" ? (
            <Link href="/pharmacy" className="flex-1">
              <Button variant={effectiveStatus === "Success" ? "default" : "outline"} className="w-full rounded-xl gap-2">
                Continue in Pharmacy <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/patient/dashboard" className="flex-1">
              <Button variant={effectiveStatus === "Success" ? "default" : "outline"} className="w-full rounded-xl gap-2">
                Go to Patient Portal <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <RefreshCw className="w-7 h-7 text-primary animate-spin" />
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
