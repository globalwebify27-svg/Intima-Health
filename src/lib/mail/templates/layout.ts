import { emailIcons } from "./icons";

export interface EmailLayoutOptions {
  title: string;
  previewText?: string;
  bodyHtml: string;
}

export function wrapEmailLayout({ title, previewText, bodyHtml }: EmailLayoutOptions): string {
  const currentYear = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #FAF7F9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #2D242D;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #ECE4EB;
      box-shadow: 0 4px 20px rgba(122, 46, 122, 0.05);
    }
    .btn-primary {
      display: inline-block;
      background-color: #7A2E7A;
      color: #ffffff !important;
      font-weight: 600;
      font-size: 14px;
      padding: 12px 28px;
      text-decoration: none;
      border-radius: 9999px;
      box-shadow: 0 2px 8px rgba(122, 46, 122, 0.25);
    }
    .badge-pill {
      display: inline-block;
      background-color: #F4ECF4;
      color: #7A2E7A;
      font-weight: 700;
      font-size: 11px;
      padding: 4px 12px;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #FAF7F9;">
  ${previewText ? `<div style="display: none; max-height: 0px; overflow: hidden;">${previewText}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ""}
  
  <div class="email-container" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #ECE4EB;">
    <!-- Top Hospital Header with Official Logo -->
    <div style="background-color: #ffffff; padding: 24px 32px 18px 32px; text-align: center; border-bottom: 2px solid #F4ECF4;">
      <a href="https://kelkarmanasclinic.com" target="_blank" style="text-decoration: none; display: inline-block;">
        <img src="cid:clinic-logo@kelkarmanas" alt="Kelkar Manas Health Care" height="52" style="height: 52px; max-height: 52px; width: auto; max-width: 220px; display: block; margin: 0 auto; border: 0;" />
      </a>
      <p style="margin: 8px 0 0 0; font-size: 11px; color: #7A2E7A; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">
        Clinical Excellence &bull; Holistic Wellness &bull; Akola &amp; Thane
      </p>
    </div>

    <!-- Main Content Area -->
    <div style="padding: 32px 32px 24px 32px;">
      ${bodyHtml}
    </div>

    <!-- Hospital Verification Guarantee -->
    <div style="background-color: #FAF7F9; padding: 18px 32px; border-top: 1px solid #ECE4EB; border-bottom: 1px solid #ECE4EB; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #6E5C6E; line-height: 1.6;">
        ${emailIcons.shieldCheck("#16A34A", 16)} <strong>Confidential &amp; Registered Clinical Practice</strong><br>
        Kelkar Manas Health Care &bull; ISO Certified Clinical Protocol &bull; Akola &amp; Thane Centres
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #ffffff; padding: 24px 32px; text-align: center; font-size: 11px; color: #8F7D8F; line-height: 1.6;">
      <p style="margin: 0 0 8px 0;">
        <strong>Kelkar Manas Health Care Clinic</strong><br>
        Civil Lines, Near District Hospital, Akola, Maharashtra 444001<br>
        Behind Fatema Church, Ghodbandar Road, Majiwada, Thane
      </p>
      <p style="margin: 0 0 12px 0;">
        ${emailIcons.phone("#7A2E7A", 12)} Helpline: <a href="tel:+919422861000" style="color: #7A2E7A; text-decoration: none; font-weight: 600;">+91 94228 61000</a> &bull; 
        ${emailIcons.mail("#7A2E7A", 12)} Email: <a href="mailto:support@kelkarmanasclinic.com" style="color: #7A2E7A; text-decoration: none; font-weight: 600;">support@kelkarmanasclinic.com</a>
      </p>
      <p style="margin: 0; color: #B3A4B3; font-size: 10px;">
        &copy; ${currentYear} Kelkar Manas Health Care. All rights reserved. This email is intended solely for the recipient named above.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

