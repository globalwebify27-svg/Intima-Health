export interface InitiateHdfcCheckoutParams {
  entityType: "order" | "appointment" | "therapy";
  entityId: string;
  returnTo?: string;
  pendingSlot?: {
    date?: string;
    time?: string;
    selectedMode?: "Online" | "Offline";
  };
}

export async function initiateHdfcCheckout(
  params: InitiateHdfcCheckoutParams
): Promise<{ orderId: string; paymentUrl: string }> {
  const res = await fetch("/api/payments/hdfc/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(params),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success || !data.paymentUrl) {
    throw new Error(data?.error || "Failed to initialize HDFC SmartGateway payment session.");
  }

  return {
    orderId: data.orderId,
    paymentUrl: data.paymentUrl,
  };
}

