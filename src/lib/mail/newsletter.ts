import nodemailer, { type Transporter } from "nodemailer";
import dns from "dns/promises";
import { connectDB } from "@/db/connect";
import { SettingModel } from "@/modules/system/schema";
import { getMailLogoAttachment, getResolvedMailConfig } from "./transporter";
import { emailIcons } from "./templates/icons";

export interface NewsletterMailConfig {
  host: string;
  port: number;
  secure: boolean;
  smtpUser?: string;
  smtpPass?: string;
  hasSeparateNewsletterAuth: boolean;
  senderName: string;
  senderEmail: string;
  replyToEmail: string;
  smtpConfigured: boolean;
}

function deriveNewsletterEmail(fallbackFromEmail: string): string {
  const email = (fallbackFromEmail || "").trim().toLowerCase();
  const atIndex = email.indexOf("@");
  if (atIndex > -1) {
    const domain = email.slice(atIndex + 1);
    if (domain && domain !== "gmail.com" && domain !== "yahoo.com" && domain !== "outlook.com") {
      return `newsletter@${domain}`;
    }
  }
  return email || "newsletter@kelkarmanasclinic.com";
}

export async function getNewsletterMailConfig(): Promise<NewsletterMailConfig> {
  const baseConfig = await getResolvedMailConfig();

  let map: Record<string, string> = {};
  try {
    await connectDB();
    const settings = await SettingModel.find({
      key: {
        $in: [
          "newsletter_from_email",
          "newsletter_from_name",
          "newsletter_reply_to",
          "newsletter_smtp_user",
          "newsletter_smtp_pass",
        ],
      },
    }).lean();

    for (const s of settings) {
      if (s.key && s.value) {
        map[s.key] = s.value;
      }
    }
  } catch (err) {
    console.warn("[Newsletter Mail] Failed to load newsletter settings from DB:", err);
  }

  const newsletterSmtpUser = map["newsletter_smtp_user"]?.trim();
  const newsletterSmtpPass = map["newsletter_smtp_pass"]?.trim();
  const hasSeparateNewsletterAuth = Boolean(newsletterSmtpUser && newsletterSmtpPass);

  const smtpUser = hasSeparateNewsletterAuth ? newsletterSmtpUser : baseConfig.user;
  const smtpPass = hasSeparateNewsletterAuth ? newsletterSmtpPass : baseConfig.pass;

  const senderEmail =
    map["newsletter_from_email"]?.trim().toLowerCase() ||
    process.env.NEWSLETTER_FROM_EMAIL?.trim().toLowerCase() ||
    deriveNewsletterEmail(baseConfig.fromEmail);

  const senderName =
    map["newsletter_from_name"]?.trim() ||
    process.env.NEWSLETTER_FROM_NAME?.trim() ||
    "Kelkar Manas Healthcare";

  const replyToEmail =
    map["newsletter_reply_to"]?.trim().toLowerCase() ||
    baseConfig.fromEmail ||
    senderEmail;

  return {
    host: baseConfig.host,
    port: baseConfig.port,
    secure: baseConfig.secure,
    smtpUser,
    smtpPass,
    hasSeparateNewsletterAuth,
    senderName,
    senderEmail,
    replyToEmail,
    smtpConfigured: Boolean(smtpUser && smtpPass && baseConfig.host),
  };
}

export function createNewsletterTransporter(config: NewsletterMailConfig): Transporter | null {
  if (!config.smtpUser || !config.smtpPass || !config.host) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });
}

export function getPublicAppBaseUrl(req?: Request): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  }
  if (req) {
    try {
      const url = new URL(req.url);
      if (url.origin && !url.origin.includes("localhost")) {
        return url.origin.replace(/\/+$/, "");
      }
      return url.origin.replace(/\/+$/, "");
    } catch {}
  }
  return "https://kelkarmanasclinic.com";
}

function absolutizeHtmlUrls(html: string, baseUrl: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  return html
    .replace(/(src|href)=(["'])(\/[^"']*)\2/gi, (_match, attr, quote, path) => {
      return `${attr}=${quote}${cleanBase}${path}${quote}`;
    });
}

export function buildNewsletterEmailHtml({
  subject,
  contentHtml,
  unsubscribeUrl,
  replyToEmail = "support@kelkarmanasclinic.com",
  baseUrl = "https://kelkarmanasclinic.com",
  isPreview = false,
}: {
  subject: string;
  contentHtml: string;
  unsubscribeUrl: string;
  replyToEmail?: string;
  baseUrl?: string;
  isPreview?: boolean;
}): string {
  const currentYear = new Date().getFullYear();
  const logoSrc = isPreview ? "/logo.png" : "cid:clinic-logo@kelkarmanas";
  const processedContent = isPreview ? contentHtml : absolutizeHtmlUrls(contentHtml, baseUrl);
  const safeReplyTo = replyToEmail || "support@kelkarmanasclinic.com";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #FAF7F9;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #2D242D;
      -webkit-font-smoothing: antialiased;
    }
    .newsletter-body h1 { font-size: 26px; font-weight: 800; color: #2D242D; margin: 18px 0 10px 0; line-height: 1.25; }
    .newsletter-body h2 { font-size: 21px; font-weight: 700; color: #4A154B; margin: 16px 0 8px 0; line-height: 1.3; }
    .newsletter-body h3 { font-size: 17px; font-weight: 700; color: #2D242D; margin: 14px 0 6px 0; line-height: 1.35; }
    .newsletter-body h4, .newsletter-body h5, .newsletter-body h6 { font-size: 15px; font-weight: 700; color: #2D242D; margin: 12px 0 6px 0; }
    .newsletter-body p { font-size: 15px; line-height: 1.7; color: #3D333D; margin: 0 0 14px 0; }
    .newsletter-body ul, .newsletter-body ol { margin: 10px 0 16px 0; padding-left: 22px; color: #3D333D; font-size: 15px; line-height: 1.7; }
    .newsletter-body li { margin-bottom: 6px; }
    .newsletter-body blockquote { border-left: 4px solid #7A2E7A; margin: 16px 0; padding: 10px 16px; background-color: #FAF7F9; color: #524252; font-style: italic; border-radius: 0 8px 8px 0; }
    .newsletter-body a { color: #7A2E7A; text-decoration: underline; font-weight: 600; }
    .newsletter-body img { max-width: 100%; height: auto; border-radius: 12px; display: block; margin: 14px auto; }
    .newsletter-body table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    .newsletter-body th, .newsletter-body td { border: 1px solid #ECE4EB; padding: 10px 12px; text-align: left; font-size: 14px; }
    .newsletter-body th { background-color: #F4ECF4; color: #4A154B; font-weight: 700; }
  </style>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #FAF7F9;">
  <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #ECE4EB; box-shadow: 0 4px 20px rgba(122, 46, 122, 0.05);">
    <!-- Header -->
    <div style="background-color: #ffffff; padding: 24px 32px 18px 32px; text-align: center; border-bottom: 2px solid #F4ECF4;">
      <a href="${baseUrl}" target="_blank" style="text-decoration: none; display: inline-block;">
        <img src="${logoSrc}" alt="Kelkar Manas Healthcare" height="52" style="height: 52px; max-height: 52px; width: auto; max-width: 220px; display: block; margin: 0 auto; border: 0;" />
      </a>
      <p style="margin: 8px 0 0 0; font-size: 11px; color: #7A2E7A; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700;">
        Kelkar Manas Healthcare &bull; Official Newsletter
      </p>
    </div>

    <!-- Subject Banner -->
    <div style="background-color: #FAF7F9; padding: 18px 32px; border-bottom: 1px solid #ECE4EB;">
      <h1 style="margin: 0; font-size: 20px; line-height: 1.35; color: #2D242D; font-weight: 800; text-align: center;">
        ${subject}
      </h1>
    </div>

    <!-- Newsletter Rich Body -->
    <div class="newsletter-body" style="padding: 28px 32px; color: #3D333D; font-size: 15px; line-height: 1.7;">
      ${processedContent}
    </div>

    <!-- Trust Banner -->
    <div style="background-color: #FAF7F9; padding: 16px 32px; border-top: 1px solid #ECE4EB; border-bottom: 1px solid #ECE4EB; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #6E5C6E; line-height: 1.6;">
        ${emailIcons.shieldCheck("#16A34A", 15)} <strong>Kelkar Manas Healthcare</strong> &bull; Confidential Clinical Excellence
      </p>
    </div>

    <!-- Footer with Unsubscribe -->
    <div style="background-color: #ffffff; padding: 22px 32px; text-align: center; font-size: 11px; color: #8F7D8F; line-height: 1.6;">
      <p style="margin: 0 0 8px 0;">
        <strong>Kelkar Manas Health Care Clinic</strong><br>
        Civil Lines, Near District Hospital, Akola, Maharashtra 444001<br>
        Enquiries: <a href="mailto:${safeReplyTo}" style="color: #7A2E7A; text-decoration: none; font-weight: 600;">${safeReplyTo}</a>
      </p>
      <p style="margin: 10px 0 10px 0; padding: 10px 14px; background-color: #FAF7F9; border-radius: 8px; border: 1px solid #ECE4EB; font-size: 11px; color: #6E5C6E;">
        You are receiving this email because you subscribed to updates from Kelkar Manas Healthcare.<br>
        Don&apos;t want to receive future newsletters?
        <a href="${unsubscribeUrl}" target="_blank" style="color: #7A2E7A; font-weight: 700; text-decoration: underline;">Unsubscribe here</a>.
      </p>
      <p style="margin: 0; color: #B3A4B3; font-size: 10px;">
        &copy; ${currentYear} Kelkar Manas Healthcare. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendSingleNewsletterEmail({
  transporter,
  config,
  toEmail,
  subject,
  contentHtml,
  unsubscribeUrl,
  baseUrl,
  isTest = false,
}: {
  transporter: Transporter;
  config: NewsletterMailConfig;
  toEmail: string;
  subject: string;
  contentHtml: string;
  unsubscribeUrl: string;
  baseUrl: string;
  isTest?: boolean;
}) {
  const finalSubject = isTest ? `[TEST] ${subject}` : subject;
  const html = buildNewsletterEmailHtml({
    subject,
    contentHtml,
    unsubscribeUrl,
    replyToEmail: config.replyToEmail,
    baseUrl,
    isPreview: false,
  });

  return await transporter.sendMail({
    from: `"${config.senderName}" <${config.senderEmail}>`,
    replyTo: config.replyToEmail,
    to: toEmail,
    subject: finalSubject,
    html,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      Precedence: "bulk",
    },
    attachments: getMailLogoAttachment(),
  });
}

export interface DnsAuthStatus {
  domain: string;
  spf: { configured: boolean; record?: string };
  dmarc: { configured: boolean; record?: string };
  dkim: { checkedSelectors: string[]; foundSelector?: string; configured: boolean };
}

export async function checkDomainEmailAuth(email: string): Promise<DnsAuthStatus> {
  const domain = (email.split("@")[1] || "").trim().toLowerCase();
  const result: DnsAuthStatus = {
    domain,
    spf: { configured: false },
    dmarc: { configured: false },
    dkim: { checkedSelectors: ["hostingermail", "default", "dkim", "selector1", "google"], configured: false },
  };

  if (!domain) return result;

  try {
    const txtRecords = await dns.resolveTxt(domain).catch(() => []);
    for (const entry of txtRecords) {
      const joined = entry.join("");
      if (joined.toLowerCase().includes("v=spf1")) {
        result.spf = { configured: true, record: joined };
        break;
      }
    }

    const dmarcRecords = await dns.resolveTxt(`_dmarc.${domain}`).catch(() => []);
    for (const entry of dmarcRecords) {
      const joined = entry.join("");
      if (joined.toLowerCase().includes("v=dmarc1")) {
        result.dmarc = { configured: true, record: joined };
        break;
      }
    }

    for (const selector of result.dkim.checkedSelectors) {
      const dkimTxt = await dns.resolveTxt(`${selector}._domainkey.${domain}`).catch(() => []);
      const dkimCname = await dns.resolveCname(`${selector}._domainkey.${domain}`).catch(() => []);
      if (dkimTxt.length > 0 || dkimCname.length > 0) {
        result.dkim.configured = true;
        result.dkim.foundSelector = selector;
        break;
      }
    }
  } catch (err) {
    console.warn("[Newsletter DNS Check] Error checking DNS records:", err);
  }

  return result;
}

