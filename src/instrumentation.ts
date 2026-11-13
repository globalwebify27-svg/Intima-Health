export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    if (process.env.NEXT_PHASE === "phase-production-build") return;
    if (process.env.VERCEL) return;

    const isEnabled = process.env.NODE_ENV === "production" || process.env.ENABLE_LOCAL_CRON === "true";
    if (!isEnabled) return;

    const { startVpsCron } = await import("@/lib/vps-cron");
    startVpsCron();
  }
}
