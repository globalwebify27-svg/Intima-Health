import { wrapEmailLayout } from "./layout";
import { emailIcons } from "./icons";

export interface ContactNotificationEmailData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  submittedAt?: string;
  adminPortalUrl?: string;
}

export function generateContactInquiryAdminEmail(data: ContactNotificationEmailData): { subject: string; html: string } {
  const fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Website Visitor";
  const portalUrl = data.adminPortalUrl || "https://kelkarmanasclinic.com/admin/contact";
  const timeStr = data.submittedAt || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const bodyHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span class="badge-pill" style="display: inline-block; background-color: #EDE7F6; color: #512DA8; font-weight: 700; font-size: 11px; padding: 4px 14px; border-radius: 9999px; text-transform: uppercase;">
        ${emailIcons.mail("#512DA8", 13)} New Website Contact Inquiry
      </span>
      <h2 style="font-family: Georgia, serif; font-size: 22px; color: #2D242D; margin: 12px 0 6px 0;">
        New Message from ${fullName}
      </h2>
      <p style="font-size: 14px; color: #6E5C6E; margin: 0; line-height: 1.5;">
        A visitor has submitted a new inquiry through the public contact form on Kelkar Manas Health Care.
      </p>
    </div>

    <!-- Inquiry Details Card -->
    <div style="background-color: #FAF7F9; border: 1px solid #ECE4EB; border-radius: 14px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #8F7D8F; width: 35%;">${emailIcons.user("#8F7D8F", 13)} Sender Name:</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #2D242D;">${fullName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #8F7D8F;">${emailIcons.mail("#8F7D8F", 13)} Sender Email:</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #7A2E7A;">
            <a href="mailto:${data.email}" style="color: #7A2E7A; text-decoration: underline;">${data.email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #8F7D8F;">${emailIcons.fileText("#8F7D8F", 13)} Subject:</td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 700; color: #2D242D;">${data.subject || "General Inquiry"}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-size: 13px; color: #8F7D8F;">${emailIcons.clock("#8F7D8F", 13)} Received At:</td>
          <td style="padding: 8px 0; font-size: 13px; font-weight: 600; color: #6E5C6E;">${timeStr}</td>
        </tr>
      </table>

      <!-- Message Content Box -->
      <div style="margin-top: 16px; padding: 14px; background-color: #ffffff; border: 1px solid #E2D9E2; border-radius: 10px;">
        <span style="font-size: 11px; font-weight: 700; color: #8F7D8F; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
          Message:
        </span>
        <p style="font-size: 14px; line-height: 1.6; color: #2D242D; margin: 0; white-space: pre-wrap;">
          ${data.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
        </p>
      </div>
    </div>

    <!-- Call to Actions -->
    <div style="text-align: center; margin-bottom: 16px;">
      <a href="mailto:${data.email}?subject=${encodeURIComponent("Re: " + (data.subject || "Your Inquiry at Kelkar Manas Health Care"))}" 
         style="display: inline-block; background-color: #7A2E7A; color: #ffffff !important; font-weight: 600; font-size: 14px; padding: 12px 28px; text-decoration: none; border-radius: 9999px; margin-right: 8px; box-shadow: 0 2px 8px rgba(122, 46, 122, 0.25);">
        ✉ Reply to Sender
      </a>
      <a href="${portalUrl}" 
         style="display: inline-block; background-color: #F4ECF4; color: #7A2E7A !important; font-weight: 600; font-size: 14px; padding: 12px 24px; text-decoration: none; border-radius: 9999px; border: 1px solid #E2D9E2;">
        View in Admin Portal &rarr;
      </a>
    </div>

    <p style="font-size: 12px; color: #8F7D8F; text-align: center; margin: 16px 0 0 0;">
      This notification was dispatched automatically to the designated administrative notification address.
    </p>
  `;

  const emailSubject = `[New Contact Inquiry] ${data.subject || "Website Message"} - from ${fullName}`;

  return {
    subject: emailSubject,
    html: wrapEmailLayout({
      title: emailSubject,
      previewText: `New contact submission from ${fullName}: ${data.subject}`,
      bodyHtml,
    }),
  };
}

