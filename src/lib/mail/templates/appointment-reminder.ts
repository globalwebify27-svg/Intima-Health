import { wrapEmailLayout } from "./layout";
import { emailIcons } from "./icons";
import { NotificationMilestone } from "@/modules/notifications/schema";

interface ReminderEmailData {
  recipientName: string;
  patientName: string;
  specialistName: string;
  specialistRole: "Doctor" | "Therapist";
  specialization?: string;
  date: string;
  time: string;
  type: "Video" | "Walk-in";
  clinicName?: string;
  clinicAddress?: string;
  videoLink?: string;
  milestone: NotificationMilestone;
}

const MILESTONE_LABELS: Record<NotificationMilestone, { badge: string; heading: string; alertBg: string; alertColor: string }> = {
  DOCTOR_1D: {
    badge: "1 Day Reminder",
    heading: "Upcoming Consultation Tomorrow",
    alertBg: "#EFF6FF",
    alertColor: "#1E40AF",
  },
  DOCTOR_1H: {
    badge: "1 Hour Reminder",
    heading: "Consultation in 1 Hour",
    alertBg: "#FEF3C7",
    alertColor: "#92400E",
  },
  DOCTOR_10M: {
    badge: "10 Minutes Notice",
    heading: "Consultation in 10 Minutes",
    alertBg: "#FEE2E2",
    alertColor: "#991B1B",
  },
  DOCTOR_AT_TIME: {
    badge: "Starting Now",
    heading: "Consultation Starting Now",
    alertBg: "#DCFCE7",
    alertColor: "#166534",
  },
  PATIENT_3H: {
    badge: "3 Hours Reminder",
    heading: "Your Appointment is in 3 Hours",
    alertBg: "#EFF6FF",
    alertColor: "#1E40AF",
  },
  PATIENT_2H: {
    badge: "2 Hours Reminder",
    heading: "Your Appointment is in 2 Hours",
    alertBg: "#EFF6FF",
    alertColor: "#1E40AF",
  },
  PATIENT_1H: {
    badge: "1 Hour Reminder",
    heading: "Your Appointment is in 1 Hour",
    alertBg: "#FEF3C7",
    alertColor: "#92400E",
  },
  PATIENT_10M: {
    badge: "10 Minutes Notice",
    heading: "Your Appointment Starts in 10 Minutes",
    alertBg: "#FEE2E2",
    alertColor: "#991B1B",
  },
  PATIENT_AT_TIME: {
    badge: "Starting Now",
    heading: "Your Appointment is Starting Now",
    alertBg: "#DCFCE7",
    alertColor: "#166534",
  },
};

export function generateDoctorTherapistReminderEmail(data: ReminderEmailData): { subject: string; html: string } {
  const isVideo = data.type === "Video";
  const mInfo = MILESTONE_LABELS[data.milestone] || {
    badge: "Reminder",
    heading: "Upcoming Consultation",
    alertBg: "#EFF6FF",
    alertColor: "#1E40AF",
  };

  const subject = `[${mInfo.badge}] Appointment with ${data.patientName} at ${data.time} (${data.date})`;
  const actionUrl = data.videoLink || (isVideo ? "https://kelkarmanasclinic.com/doctor/consultations" : "https://kelkarmanasclinic.com/doctor/dashboard");

  const bodyHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="display: inline-block; background-color: ${mInfo.alertBg}; color: ${mInfo.alertColor}; font-weight: 800; font-size: 11px; padding: 5px 16px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
        ${emailIcons.clock(mInfo.alertColor, 13)} ${mInfo.badge}
      </span>
      <h2 style="font-family: Georgia, serif; font-size: 22px; color: #2D242D; margin: 12px 0 6px 0;">
        Hello, ${data.specialistRole === "Doctor" ? "Dr. " : ""}${data.recipientName}
      </h2>
      <p style="font-size: 14px; color: #6E5C6E; margin: 0; line-height: 1.5;">
        ${mInfo.heading}. Please review the consultation schedule below.
      </p>
    </div>

    <!-- Details Card -->
    <div style="background-color: #FAF7F9; border: 1px solid #ECE4EB; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #8F7D8F; width: 38%;">${emailIcons.user("#8F7D8F", 14)} Patient Name:</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #2D242D;">${data.patientName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #8F7D8F;">${emailIcons.calendar("#8F7D8F", 14)} Date &amp; Time:</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #2D242D;">${data.date} &bull; ${data.time}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #8F7D8F;">${emailIcons.activity("#8F7D8F", 14)} Appointment Type:</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #2D242D;">
            ${isVideo 
              ? `${emailIcons.video("#0284C7", 14)} Online Video Consultation` 
              : `${emailIcons.hospital("#7A2E7A", 14)} In-Clinic Walk-in Consultation`}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #8F7D8F; vertical-align: top;">${emailIcons.mapPin("#8F7D8F", 14)} Location / Room:</td>
          <td style="padding: 8px 0; font-size: 13px; color: #2D242D; line-height: 1.4;">
            ${isVideo 
              ? `Secure Video Consultation Room (<a href="${actionUrl}" style="color: #7A2E7A; font-weight: 700;">Click to Join</a>)` 
              : (data.clinicAddress ? `<strong>${data.clinicName || "Clinic"}</strong><br>${data.clinicAddress}` : "Kelkar Manas Health Care Clinic")}
          </td>
        </tr>
      </table>
    </div>

    <!-- Action Button -->
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${actionUrl}" style="display: inline-block; background-color: #7A2E7A; color: #ffffff; font-weight: 700; font-size: 14px; padding: 13px 36px; text-decoration: none; border-radius: 9999px; box-shadow: 0 4px 10px rgba(122, 46, 122, 0.25);">
        ${isVideo ? "Launch Video Session &rarr;" : "Open Specialist Portal &rarr;"}
      </a>
    </div>

    <p style="font-size: 12px; color: #8F7D8F; text-align: center; margin: 0;">
      Automated appointment reminder from Kelkar Manas Health Care notification system.
    </p>
  `;

  return {
    subject,
    html: wrapEmailLayout({
      title: "Specialist Appointment Reminder",
      previewText: `${mInfo.badge}: Consultation with ${data.patientName} at ${data.time}`,
      bodyHtml,
    }),
  };
}

export function generatePatientReminderEmail(data: ReminderEmailData): { subject: string; html: string } {
  const isVideo = data.type === "Video";
  const mInfo = MILESTONE_LABELS[data.milestone] || {
    badge: "Reminder",
    heading: "Your Appointment Reminder",
    alertBg: "#EFF6FF",
    alertColor: "#1E40AF",
  };

  const subject = `[${mInfo.badge}] Appointment with ${data.specialistRole === "Doctor" ? "Dr. " : ""}${data.specialistName} at ${data.time} (${data.date})`;
  const actionUrl = data.videoLink || (isVideo ? "https://kelkarmanasclinic.com/patient/consultations" : "https://kelkarmanasclinic.com/patient/appointments");

  const bodyHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="display: inline-block; background-color: ${mInfo.alertBg}; color: ${mInfo.alertColor}; font-weight: 800; font-size: 11px; padding: 5px 16px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.5px;">
        ${emailIcons.clock(mInfo.alertColor, 13)} ${mInfo.badge}
      </span>
      <h2 style="font-family: Georgia, serif; font-size: 22px; color: #2D242D; margin: 12px 0 6px 0;">
        Dear ${data.recipientName},
      </h2>
      <p style="font-size: 14px; color: #6E5C6E; margin: 0; line-height: 1.5;">
        ${mInfo.heading}. Here are the confirmed details for your session:
      </p>
    </div>

    <!-- Summary Card -->
    <div style="background-color: #FAF7F9; border: 1px solid #ECE4EB; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #8F7D8F; width: 38%;">${emailIcons.stethoscope("#8F7D8F", 14)} Specialist:</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #2D242D;">
            ${data.specialistRole === "Doctor" ? "Dr. " : ""}${data.specialistName}
            ${data.specialization ? `<br><span style="font-size: 12px; font-weight: normal; color: #7A2E7A;">${data.specialization}</span>` : ""}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #8F7D8F;">${emailIcons.calendar("#8F7D8F", 14)} Date &amp; Time:</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #2D242D;">${data.date} &bull; ${data.time}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #8F7D8F;">${emailIcons.activity("#8F7D8F", 14)} Consultation Mode:</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #2D242D;">
            ${isVideo 
              ? `${emailIcons.video("#0284C7", 14)} Online Video Consultation` 
              : `${emailIcons.hospital("#7A2E7A", 14)} In-Clinic Walk-in Consultation`}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #8F7D8F; vertical-align: top;">${emailIcons.mapPin("#8F7D8F", 14)} Location / Room:</td>
          <td style="padding: 8px 0; font-size: 13px; color: #2D242D; line-height: 1.4;">
            ${isVideo 
              ? `You can join the secure video consultation from your smartphone, tablet, or laptop.` 
              : (data.clinicAddress ? `<strong>${data.clinicName || "Clinic"}</strong><br>${data.clinicAddress}` : "Kelkar Manas Health Care Clinic")}
          </td>
        </tr>
      </table>
    </div>

    <!-- Guidance Banner -->
    <div style="background-color: #FFF9E6; border-left: 4px solid #E6B800; padding: 14px 16px; border-radius: 8px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 12px; color: #665200; line-height: 1.5;">
        ${isVideo 
          ? "<strong>Video Call Instructions:</strong> Please find a quiet, private space and test your camera and microphone. Click the button below to enter the waiting room." 
          : "<strong>In-Clinic Instructions:</strong> Please arrive 10-15 minutes prior to your slot. Bring past medical records, prescriptions, or laboratory tests if available."}
      </p>
    </div>

    <!-- Action Button -->
    <div style="text-align: center; margin-bottom: 24px;">
      <a href="${actionUrl}" style="display: inline-block; background-color: #7A2E7A; color: #ffffff; font-weight: 700; font-size: 14px; padding: 13px 36px; text-decoration: none; border-radius: 9999px; box-shadow: 0 4px 10px rgba(122, 46, 122, 0.25);">
        ${isVideo ? "Join Video Consultation &rarr;" : "View Appointment in Portal &rarr; "}
      </a>
    </div>

    <p style="font-size: 12px; color: #8F7D8F; text-align: center; margin: 0;">
      Need assistance or need to reschedule? Call our patient helpline at <a href="tel:+917030414140" style="color: #7A2E7A; font-weight: 700; text-decoration: none;">+91 7030414140</a>.
    </p>
  `;

  return {
    subject,
    html: wrapEmailLayout({
      title: "Appointment Reminder",
      previewText: `${mInfo.badge}: Appointment with ${data.specialistRole === "Doctor" ? "Dr. " : ""}${data.specialistName} at ${data.time}`,
      bodyHtml,
    }),
  };
}
