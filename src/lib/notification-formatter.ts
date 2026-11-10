import { formatTime12Hour } from "./utils";

const TEMPLATE_TITLE_MAP: Record<string, string> = {
  appointment_confirmed_payment_success: "Appointment Confirmed",
  appointment_booking_initiated1: "Booking Initiated",
  appointment_reminder: "Appointment Reminder",
  appointment_rescheduled: "Appointment Rescheduled",
  appointment_cancelled: "Appointment Cancelled",
  video_consultation_reminder: "Video Consultation Reminder",
  appointment_completed_prescription_issued: "Prescription Ready",
  payment_successful: "Payment Received",
  refund_completed: "Refund Processed",
  prescription_issued: "New Digital Prescription",
};

function humanizeTime(timeStr?: string): string {
  if (!timeStr) return "";
  return formatTime12Hour(timeStr) || timeStr;
}

function parseTemplateParams(message: string): string[] | null {
  const trimmed = (message || "").trim();
  if (!trimmed.startsWith("Params:")) return null;
  try {
    const parsed = JSON.parse(trimmed.slice("Params:".length).trim());
    return Array.isArray(parsed) ? parsed.map((v) => String(v ?? "")) : null;
  } catch {
    return null;
  }
}

export function formatNotificationFromTemplate(
  campaignName: string,
  params: string[]
): { title: string; message: string } {
  const title =
    TEMPLATE_TITLE_MAP[campaignName] ||
    campaignName
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();

  switch (campaignName) {
    case "appointment_confirmed_payment_success": {
      const [, doctor, date, time, mode, clinic, fee] = params;
      const t = humanizeTime(time);
      const feePart = fee ? ` • ₹${fee} paid` : "";
      const clinicPart = clinic ? ` at ${clinic}` : "";
      return {
        title,
        message: `${mode || "Consultation"} with ${doctor || "your doctor"} confirmed for ${date}${t ? ` at ${t}` : ""}${clinicPart}${feePart}.`,
      };
    }
    case "appointment_booking_initiated1": {
      const [, doctor, date, time, mode, clinic] = params;
      const t = humanizeTime(time);
      const clinicPart = clinic ? ` at ${clinic}` : "";
      return {
        title,
        message: `${mode || "Walk-in"} booking with ${doctor || "your doctor"} scheduled for ${date}${t ? ` at ${t}` : ""}${clinicPart}.`,
      };
    }
    case "appointment_reminder": {
      const [, doctor, date, time, mode, clinic] = params;
      const t = humanizeTime(time);
      const clinicPart = clinic ? ` (${clinic})` : "";
      return {
        title,
        message: `Reminder: ${mode || "Appointment"} with ${doctor || "your doctor"} on ${date}${t ? ` at ${t}` : ""}${clinicPart}.`,
      };
    }
    case "appointment_rescheduled": {
      const [, doctor, date, time, mode] = params;
      const t = humanizeTime(time);
      return {
        title,
        message: `Your ${mode || "appointment"} with ${doctor || "your doctor"} has been rescheduled to ${date}${t ? ` at ${t}` : ""}.`,
      };
    }
    case "appointment_cancelled": {
      const [, doctor, date, time, mode] = params;
      const t = humanizeTime(time);
      return {
        title,
        message: `Your ${mode || "appointment"} with ${doctor || "your doctor"} on ${date}${t ? ` at ${t}` : ""} has been cancelled.`,
      };
    }
    case "video_consultation_reminder": {
      const [, doctor, date, time] = params;
      const t = humanizeTime(time);
      return {
        title,
        message: `Upcoming video consultation with ${doctor || "your doctor"} on ${date}${t ? ` at ${t}` : ""}.`,
      };
    }
    case "appointment_completed_prescription_issued": {
      const [, doctor, date] = params;
      return {
        title,
        message: `Consultation with ${doctor || "your doctor"}${date ? ` (${date})` : ""} is complete. Your digital prescription is ready.`,
      };
    }
    case "payment_successful": {
      const [, amount, paymentId, paymentFor, , date, time] = params;
      const t = humanizeTime(time);
      return {
        title,
        message: `Payment of ₹${amount || "0"} received for ${paymentFor || "consultation"}${date ? ` on ${date}` : ""}${t ? ` at ${t}` : ""}${paymentId ? ` (${paymentId})` : ""}.`,
      };
    }
    case "refund_completed": {
      const [, amount, , refundId, date] = params;
      return {
        title,
        message: `Refund of ₹${amount || "0"}${refundId ? ` (${refundId})` : ""} processed${date ? ` on ${date}` : ""}.`,
      };
    }
    case "prescription_issued": {
      const [, doctor] = params;
      return {
        title,
        message: `${doctor || "Your doctor"} has issued a new digital prescription for you.`,
      };
    }
    default: {
      const cleanParams = params.filter((p) => p.trim() !== "");
      return {
        title,
        message: cleanParams.join(" • "),
      };
    }
  }
}

export function formatNotificationDisplay(
  rawTitle: string,
  rawMessage: string
): { title: string; message: string } {
  const params = parseTemplateParams(rawMessage);
  if (params) {
    return formatNotificationFromTemplate(rawTitle, params);
  }

  const cleanTitle = TEMPLATE_TITLE_MAP[rawTitle]
    ? TEMPLATE_TITLE_MAP[rawTitle]
    : /^[a-z0-9_]+$/.test(rawTitle || "")
      ? rawTitle
          .replace(/[_-]+/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase())
          .trim()
      : rawTitle;

  return {
    title: cleanTitle || "Notification",
    message: rawMessage || "",
  };
}
