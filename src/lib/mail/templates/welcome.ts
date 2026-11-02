import { wrapEmailLayout } from "./layout";

export interface WelcomeEmailData {
  patientName: string;
  email: string;
  phone?: string;
  portalUrl?: string;
}

export function generatePatientWelcomeEmail(data: WelcomeEmailData): { subject: string; html: string } {
  const url = data.portalUrl || "https://kelkarmanas.com/patient/dashboard";

  const bodyHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span class="badge-pill" style="display: inline-block; background-color: #F4ECF4; color: #7A2E7A; font-weight: 700; font-size: 11px; padding: 4px 14px; border-radius: 9999px; text-transform: uppercase;">
        Welcome to Kelkar Manas
      </span>
      <h2 style="font-family: Georgia, serif; font-size: 24px; color: #2D242D; margin: 12px 0 6px 0;">
        Namaste ${data.patientName},
      </h2>
      <p style="font-size: 14px; color: #6E5C6E; margin: 0; line-height: 1.6;">
        Welcome to your personal healthcare portal at Kelkar Manas Health Care. Your account is active, confidential, and ready to use.
      </p>
    </div>

    <!-- Features Card -->
    <div style="background-color: #FAF7F9; border: 1px solid #ECE4EB; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <h3 style="font-size: 14px; font-weight: 700; color: #2D242D; margin: 0 0 12px 0;">
        What you can do in your Patient Portal:
      </h3>
      <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #6E5C6E; line-height: 1.8;">
        <li>📅 <strong>Book Doctor Consultations</strong>: Select specialists for in-clinic or private online video consultations.</li>
        <li>💊 <strong>Digital Prescriptions & Refills</strong>: View your doctor's prescriptions and order genuine medicines with home delivery.</li>
        <li>📑 <strong>Medical Records & Orders</strong>: Track ongoing care plans, past visits, and medicine delivery status.</li>
        <li>🔒 <strong>100% Confidentiality</strong>: All medical data is protected under medical privacy protocols.</li>
      </ul>
    </div>

    <!-- Account Details -->
    <div style="background-color: #ffffff; border: 1px solid #ECE4EB; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="color: #8F7D8F; width: 35%;">Registered Email:</td>
          <td style="font-weight: 600; color: #2D242D;">${data.email}</td>
        </tr>
        ${data.phone ? `
        <tr>
          <td style="padding-top: 6px; color: #8F7D8F;">Mobile Contact:</td>
          <td style="padding-top: 6px; font-weight: 600; color: #2D242D;">+91 ${data.phone}</td>
        </tr>` : ""}
      </table>
    </div>

    <div style="text-align: center; margin-bottom: 20px;">
      <a href="${url}" class="btn-primary" style="display: inline-block; background-color: #7A2E7A; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 32px; text-decoration: none; border-radius: 9999px;">
        Open Your Patient Dashboard &rarr;
      </a>
    </div>

    <p style="font-size: 12px; color: #8F7D8F; text-align: center; margin: 0;">
      If you have questions, our clinic team is here to support you at <a href="tel:+917030414140" style="color: #7A2E7A; font-weight: 600; text-decoration: none;">+91 70304 14140</a>.
    </p>
  `;

  return {
    subject: `Welcome to Kelkar Manas Health Care, ${data.patientName}`,
    html: wrapEmailLayout({
      title: "Welcome to Kelkar Manas Health Care",
      previewText: `Welcome to Kelkar Manas Health Care. Your patient portal account is ready.`,
      bodyHtml,
    }),
  };
}

