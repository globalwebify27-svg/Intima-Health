const CRON_INTERVAL_MS = 60_000;
const STARTUP_DELAY_MS = 10_000;
const DAILY_REPORT_HOUR_IST = 21; // 9:00 PM IST
const DAILY_REPORT_WINDOW_MINS = 5;
const DAILY_REPORT_SETTING_KEY = "last_daily_admin_report_date";

declare global {
  var __intimaCronStarted: boolean | undefined;
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

async function runDailyAdminReportIfDue(now: Date): Promise<void> {
  const { dateStr, hour, minute } = getIstDateAndTime(now);
  if (hour !== DAILY_REPORT_HOUR_IST || minute >= DAILY_REPORT_WINDOW_MINS) {
    return;
  }

  const { connectDB } = await import("@/db/connect");
  const { SettingModel } = await import("@/modules/system/schema");
  const { sendDailyAdminReport } = await import("@/lib/mail/service");

  await connectDB();

  await SettingModel.updateOne(
    { key: DAILY_REPORT_SETTING_KEY },
    { $setOnInsert: { key: DAILY_REPORT_SETTING_KEY, value: "", category: "system" } },
    { upsert: true }
  );

  // Atomically claim today's report run so multiple workers never send duplicates
  const claimed = await SettingModel.findOneAndUpdate(
    { key: DAILY_REPORT_SETTING_KEY, value: { $ne: dateStr } },
    { $set: { value: dateStr } },
    { new: true }
  );

  if (!claimed) return;

  const result = await sendDailyAdminReport();
  if (!result.success) {
    await SettingModel.updateOne(
      { key: DAILY_REPORT_SETTING_KEY, value: dateStr },
      { $set: { value: "" } }
    );
    console.error("[VPS Cron] Daily admin report failed:", result.message);
  } else {
    console.log(`[VPS Cron] Daily admin report sent for ${dateStr}`);
  }
}

export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  if (process.env.VERCEL) return;

  const isEnabled = process.env.NODE_ENV === "production" || process.env.ENABLE_LOCAL_CRON === "true";
  if (!isEnabled) return;

  if (globalThis.__intimaCronStarted) return;
  globalThis.__intimaCronStarted = true;

  let isTickRunning = false;

  const runTick = async () => {
    if (isTickRunning) return;
    isTickRunning = true;
    try {
      const { AppointmentNotificationService } = await import("@/modules/notifications/service");
      const res = await AppointmentNotificationService.dispatchDueNotifications({ limit: 50 });
      if (res.sent > 0 || res.failed > 0 || res.cancelled > 0) {
        console.log("[VPS Cron] Appointment notifications:", res);
      }

      await runDailyAdminReportIfDue(new Date());
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
