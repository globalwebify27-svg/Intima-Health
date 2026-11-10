"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MailCheck, AlertCircle, Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resubscribing, setResubscribing] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setSuccess(false);
      setMessage("Invalid unsubscribe link. Please use the link provided in your newsletter email.");
      return;
    }

    fetch(`/api/public/newsletter/unsubscribe?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSuccess(true);
          setEmail(data.email || "");
          setMessage(data.message || "You have been unsubscribed from future newsletters.");
        } else {
          setSuccess(false);
          setMessage(data.message || "Unable to verify unsubscribe link.");
        }
      })
      .catch(() => {
        setSuccess(false);
        setMessage("An error occurred while updating your preferences.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const handleResubscribe = async () => {
    if (!email) return;
    setResubscribing(true);
    try {
      const res = await fetch("/api/public/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("You have been re-subscribed to Kelkar Manas Healthcare newsletters.");
      }
    } finally {
      setResubscribing(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 text-center shadow-sm space-y-5">
        {loading ? (
          <div className="py-8 flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm font-medium">Updating your newsletter preferences...</p>
          </div>
        ) : success ? (
          <>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <MailCheck className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Subscription Updated</h1>
              {email && (
                <p className="text-xs font-mono text-muted-foreground bg-muted px-3 py-1 rounded-full inline-block">
                  {email}
                </p>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                {message}
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              {email && message.toLowerCase().includes("unsubscribed") && (
                <Button
                  variant="outline"
                  onClick={handleResubscribe}
                  disabled={resubscribing}
                  className="rounded-xl gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${resubscribing ? "animate-spin" : ""}`} />
                  {resubscribing ? "Re-subscribing..." : "Subscribed by mistake? Re-subscribe"}
                </Button>
              )}
              <Link href="/">
                <Button className="w-full rounded-xl gap-2">
                  <ArrowLeft className="w-4 h-4" /> Return to Homepage
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">Invalid Request</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
            </div>
            <Link href="/">
              <Button className="w-full rounded-xl gap-2">
                <ArrowLeft className="w-4 h-4" /> Return to Homepage
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function NewsletterUnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}

