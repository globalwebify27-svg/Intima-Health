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
  entityType: "order" | "appointment" | "therapy" | "appointment_booking" | "unknown";
  entityId?: string;
  entityDetails?: Record<string, any> | null;
  createdAt?: string;
}

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id") || "";
  const urlStatus = searchParams.get("status") || "";
  const urlAmount = searchParams.get("amount") || "";
  const reason = searchParams.get("reason") || "";
  const fallbackEntityType = (searchParams.get("entityType") || "unknown") as PaymentStatusData["entityType"];
  const fallbackEntityId = searchParams.get("entityId") || "";

  const { clearCart } = useCart();

  const [loading, setLoading] = useState(Boolean(orderId));
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<PaymentStatusData | null>(null);

  const displayAmount = data?.amount !== undefined ? data.amount : urlAmount ? Number(urlAmount) : undefined;
  const displayOrderId = data?.orderId || orderId;

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
    if (effectiveEntityType === "unknown" || (!effectiveEntityId && !data?.orderId && !orderId)) return;
    setRetrying(true);
    setError("");
    try {
      const { paymentUrl } = await initiateHdfcCheckout({
        entityType: effectiveEntityType,
        entityId: effectiveEntityId,
        retryOrderId: effectiveEntityType === "appointment_booking" ? (data?.orderId || orderId) : undefined,
      });
      window.location.href = paymentUrl;
    } catch (err: any) {
      setError(err?.message || "Unable to restart payment session.");
      setRetrying(false);
    }
  };

  const showRetry =
    effectiveStatus !== "Success" &&
    Boolean(effectiveEntityId || data?.orderId || orderId) &&
    effectiveEntityType !== "unknown";
  const showRefresh = effectiveStatus === "Pending" && Boolean(orderId);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="max-w-md w-full bg-card border border-border rounded-3xl p-6 sm:p-8 text-center shadow-lg space-y-4">
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
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-3 sm:px-6 py-6 sm:py-12 bg-muted/20">
      <div className="max-w-lg w-full bg-card border border-border rounded-3xl p-5 sm:p-8 shadow-xl space-y-5 overflow-hidden">
        <div className="text-center space-y-2.5 sm:space-y-3">
          {effectiveStatus === "Success" ? (
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
          ) : effectiveStatus === "Pending" ? (
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Clock className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
          ) : (
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center">
              <XCircle className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl font-serif font-bold">
            {effectiveStatus === "Success"
              ? "Payment Successful"
              : effectiveStatus === "Pending"
                ? "Payment Pending"
                : "Payment Not Completed"}
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {effectiveStatus === "Success"
              ? "Your payment has been verified with HDFC SmartGateway and your booking/order is confirmed."
              : effectiveStatus === "Pending"
                ? effectiveEntityType === "appointment_booking"
                  ? "Your selected slot is temporarily held while awaiting payment confirmation. You can refresh status or retry payment below—your booking will be confirmed only after payment succeeds."
                  : "Your bank is still confirming the transaction. Please wait a moment and check again."
                : reason || error || "Your payment was cancelled or declined. Your booking is not confirmed until payment succeeds—you can retry below."}
          </p>
        </div>

        {effectiveStatus === "Success" && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Success Message:</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-300">Transaction Successful</span>
          </div>
        )}

        {(data || displayOrderId || displayAmount !== undefined) && (
          <div className="bg-muted/40 border border-border rounded-2xl p-3.5 sm:p-4 space-y-2.5 text-xs sm:text-sm overflow-hidden">
            {displayOrderId && (
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground shrink-0 font-medium">Order Number</span>
                <span className="font-mono text-[11px] sm:text-xs font-semibold text-right break-all min-w-0">
                  {displayOrderId}
                </span>
              </div>
            )}
            {displayAmount !== undefined && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground shrink-0 font-medium">Amount</span>
                <span className="font-bold text-sm sm:text-base text-primary">
                  ₹{Number(displayAmount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground shrink-0 font-medium">Transaction Status</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
                  effectiveStatus === "Success"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : effectiveStatus === "Pending"
                      ? "bg-amber-500/10 text-amber-600"
                      : "bg-rose-500/10 text-rose-600"
                }`}
              >
                {effectiveStatus === "Success"
                  ? "Success"
                  : effectiveStatus === "Pending"
                    ? "Pending"
                    : "Failed"}
              </span>
            </div>
            {data?.context && (
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground shrink-0">Purpose</span>
                <span className="font-medium text-right break-words min-w-0">{data.context}</span>
              </div>
            )}
            {data?.transactionId && data.transactionId !== displayOrderId && (
              <div className="flex items-start justify-between gap-3">
                <span className="text-muted-foreground shrink-0">Transaction ID</span>
                <span className="font-mono text-[11px] sm:text-xs text-right break-all min-w-0">
                  {data.transactionId}
                </span>
              </div>
            )}
            {data?.paymentMethod && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground shrink-0">Payment Method</span>
                <span className="font-medium text-right break-words min-w-0">{data.paymentMethod}</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/60">
              <span className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                <ShieldCheck className="w-4 h-4 text-primary" /> Gateway
              </span>
              <span className="font-medium text-right">HDFC SmartGateway</span>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs text-center break-words">
            {error}
          </div>
        )}

        <div className="space-y-2.5 pt-1">
          {(showRetry || showRefresh) && (
            <div className={`grid gap-2.5 ${showRetry && showRefresh ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
              {showRetry && (
                <Button
                  onClick={handleRetryPayment}
                  disabled={retrying}
                  className="w-full h-11 rounded-xl gap-2"
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>{retrying ? "Redirecting..." : "Retry Payment"}</span>
                </Button>
              )}

              {showRefresh && (
                <Button variant="outline" onClick={loadStatus} className="w-full h-11 rounded-xl gap-2">
                  <RefreshCw className="w-4 h-4 shrink-0" />
                  <span>Refresh Status</span>
                </Button>
              )}
            </div>
          )}

          {effectiveEntityType === "order" ? (
            <Link href="/pharmacy" className="block w-full">
              <Button variant={effectiveStatus === "Success" ? "default" : "outline"} className="w-full h-11 rounded-xl gap-2">
                <span>Continue in Pharmacy</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </Button>
            </Link>
          ) : (
            <Link href="/patient/dashboard" className="block w-full">
              <Button variant={effectiveStatus === "Success" ? "default" : "outline"} className="w-full h-11 rounded-xl gap-2">
                <span>Go to Patient Portal</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
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
