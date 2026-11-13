const CRON_INTERVAL_MS = 60_000;
const STARTUP_DELAY_MS = 10_000;
const DAILY_REPORT_HOUR_IST = 21; // 9:00 PM IST
const DAILY_REPORT_WINDOW_MINS = 5;

declare global {
  var __intimaCronStarted: boolean | undefined;
  var __intimaLastDailyReportDate: string | undefined;
}

function getIstDateAndTime(now: Date): { dateStr: string; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);

  const map: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") map[part.type] = part.value;
  }

  return {
    dateStr: `${map.year}-${map.month}-${map.day}`,
    hour: parseInt(map.hour, 10),
    minute: parseInt(map.minute, 10),
  };
}

export function startVpsCron(): void {
  if (globalThis.__intimaCronStarted) return;
  globalThis.__intimaCronStarted = true;

  const port = process.env.PORT || "3000";
  const baseUrl = `http://127.0.0.1:${port}`;
  const cronSecret = process.env.CRON_SECRET || "kmh_daily_report_secret_key_2026";
  let isTickRunning = false;

  const runTick = async () => {
    if (isTickRunning) return;
    isTickRunning = true;
    try {
      const notifRes = await fetch(`${baseUrl}/api/cron/appointment-notifications`, {
        method: "GET",
        cache: "no-store",
      });
      if (notifRes.ok) {
        const data = (await notifRes.json().catch(() => null)) as {
          sent?: number;
          failed?: number;
          cancelled?: number;
        } | null;
        if (data && ((data.sent || 0) > 0 || (data.failed || 0) > 0 || (data.cancelled || 0) > 0)) {
          console.log("[VPS Cron] Appointment notifications:", data);
        }
      }

      const { dateStr, hour, minute } = getIstDateAndTime(new Date());
      if (
        hour === DAILY_REPORT_HOUR_IST &&
        minute < DAILY_REPORT_WINDOW_MINS &&
        globalThis.__intimaLastDailyReportDate !== dateStr
      ) {
        globalThis.__intimaLastDailyReportDate = dateStr;
        const reportRes = await fetch(`${baseUrl}/api/cron/daily-admin-report`, {
          method: "POST",
          headers: { Authorization: `Bearer ${cronSecret}` },
          cache: "no-store",
        });
        if (!reportRes.ok) {
          globalThis.__intimaLastDailyReportDate = undefined;
          console.error("[VPS Cron] Daily admin report failed with status:", reportRes.status);
        } else {
          console.log(`[VPS Cron] Daily admin report sent for ${dateStr}`);
        }
      }
    } catch (err) {
      console.error("[VPS Cron] Tick error:", err);
    } finally {
      isTickRunning = false;
    }
  };

  setTimeout(() => {
    void runTick();
    const timer = setInterval(() => {
      void runTick();
    }, CRON_INTERVAL_MS);
    timer.unref?.();
  }, STARTUP_DELAY_MS).unref?.();

  console.log("[VPS Cron] In-process scheduler registered (notifications every 60s, daily report at 21:00 IST).");
}
