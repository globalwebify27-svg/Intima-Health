import { wrapEmailLayout } from "./layout";

export interface AppointmentEmailData {
  patientName: string;
  doctorName: string;
  doctorSpecialization?: string;
  clinicName?: string;
  clinicAddress?: string;
  date: string;
  time: string;
  type: "Video" | "Walk-in";
  serviceName?: string;
  feeAmount?: number;
  paymentStatus?: string;
  dashboardUrl?: string;
}

export function generateAppointmentCustomerEmail(data: AppointmentEmailData): { subject: string; html: string } {
  const isVideo = data.type === "Video";
  const portalUrl = data.dashboardUrl || "https://kelkarmanas.com/patient/appointments";

  const bodyHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span class="badge-pill" style="display: inline-block; background-color: #E8F5E9; color: #2E7D32; font-weight: 700; font-size: 11px; padding: 4px 14px; border-radius: 9999px; text-transform: uppercase;">
        ✓ Appointment Confirmed
      </span>
      <h2 style="font-family: Georgia, serif; font-size: 22px; color: #2D242D; margin: 12px 0 6px 0;">
        Dear ${data.patientName},
      </h2>
      <p style="font-size: 14px; color: #6E5C6E; margin: 0; line-height: 1.5;">
        Your clinical consultation has been successfully scheduled. Details of your upcoming session are provided below.
      </p>
    </div>

    <!-- Appointment Summary Card -->
    <div style="background-color: #FAF7F9; border: 1px solid #ECE4EB; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #8F7D8F; width: 40%;">Consulting Doctor:</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #2D242D;">
            Dr. ${data.doctorName}
            ${data.doctorSpecialization ? `<br><span style="font-size: 12px; font-weight: normal; color: #7A2E7A;">${data.doctorSpecialization}</span>` : ""}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #8F7D8F;">Date & Time:</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #2D242D;">
            📅 ${data.date} &bull; ⏰ ${data.time}
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #8F7D8F;">Consultation Mode:</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #2D242D;">
            ${isVideo ? "💻 Online Video Consultation" : "🏥 In-Person Clinic Visit"}
          </td>
        </tr>
        ${data.serviceName ? `
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #8F7D8F;">Clinical Focus:</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #2D242D;">${data.serviceName}</td>
        </tr>` : ""}
        ${data.feeAmount ? `
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #8F7D8F;">Consultation Fee:</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #7A2E7A;">
            ₹${data.feeAmount.toLocaleString()} (${data.paymentStatus || "Paid"})
          </td>
        </tr>` : ""}
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #8F7D8F; vertical-align: top;">Location:</td>
          <td style="padding: 8px 0; font-size: 13px; color: #2D242D; line-height: 1.4;">
            ${isVideo 
              ? "Join your secure HD video room via your Patient Portal 5 minutes prior to the session."
              : (data.clinicAddress || "Kelkar Manas Health Clinic, Thane / Akola Center")}
          </td>
        </tr>
      </table>
    </div>

    <!-- Instructions Banner -->
    <div style="background-color: #FFF9E6; border-left: 4px solid #E6B800; padding: 14px 16px; border-radius: 8px; margin-bottom: 24px;">
      <p style="margin: 0; font-size: 12px; color: #665200; line-height: 1.5;">
        ${isVideo 
          ? "<strong>Video Call Instructions:</strong> Please ensure a stable internet connection and a quiet, private room. You can join your doctor directly from your mobile phone or computer." 
          : "<strong>In-Clinic Instructions:</strong> Please arrive 10 minutes before your scheduled appointment time. Bring any past medical prescriptions or relevant diagnostic reports."}
      </p>
    </div>

    <!-- Action Button -->
    <div style="text-align: center; margin-bottom: 20px;">
      <a href="${portalUrl}" class="btn-primary" style="display: inline-block; background-color: #7A2E7A; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 32px; text-decoration: none; border-radius: 9999px;">
        View in Patient Portal &rarr;
      </a>
    </div>

    <p style="font-size: 12px; color: #8F7D8F; text-align: center; margin: 0;">
      Need to reschedule or have questions? Contact our patient care team at <a href="tel:+917030414140" style="color: #7A2E7A; font-weight: 600; text-decoration: none;">+91 70304 14140</a>.
    </p>
  `;

  return {
    subject: `Appointment Confirmed: Dr. ${data.doctorName} on ${data.date} at ${data.time}`,
    html: wrapEmailLayout({
      title: "Appointment Confirmation - Kelkar Manas Health Care",
      previewText: `Your appointment with Dr. ${data.doctorName} is confirmed for ${data.date} at ${data.time}.`,
      bodyHtml,
    }),
  };
}

