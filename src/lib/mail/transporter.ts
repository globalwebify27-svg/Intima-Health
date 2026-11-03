import nodemailer, { type Transporter } from "nodemailer";
import path from "path";
import fs from "fs";
import { connectDB } from "@/db/connect";
import { SettingModel } from "@/modules/system/schema";

export function getMailLogoAttachment() {
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    if (fs.existsSync(logoPath)) {
      return [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "clinic-logo@kelkarmanas",
        },
      ];
    }
  } catch (err) {
    console.warn("[Mail] Failed to load clinic logo attachment:", err);
  }
  return [];
}

export interface MailConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  fromName: string;
  fromEmail: string;
  adminEmail: string;
}

export function getMailConfig(): MailConfig {
  return {
    host: process.env.SMTP_HOST || "smtp.hostinger.com",
    port: parseInt(process.env.SMTP_PORT || "465", 10),
    secure: process.env.SMTP_SECURE !== "false", // default to SSL on 465
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    fromName: process.env.SMTP_FROM_NAME || "Kelkar Manas Health Care",
    fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "support@kelkarmanasclinic.com",
    adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || "temptest9093@gmail.com",
  };
}

/**
 * Resolves SMTP and notification configuration by checking database settings first,
 * falling back to process.env variables.
 */
export async function getResolvedMailConfig(): Promise<MailConfig> {
  const envConfig = getMailConfig();
  try {
    await connectDB();
    const settings = await SettingModel.find({
      key: {
        $in: [
          "smtp_host",
          "smtp_port",
          "smtp_secure",
          "smtp_user",
          "smtp_pass",
          "smtp_from_name",
          "smtp_from_email",
          "contact_notification_email",
        ],
      },
    }).lean();

    const map: Record<string, string> = {};
    for (const s of settings) {
      if (s.key && s.value) {
        map[s.key] = s.value;
      }
    }

    const host = map["smtp_host"] || envConfig.host;
    const port = map["smtp_port"] ? parseInt(map["smtp_port"], 10) : envConfig.port;
    const secure = map["smtp_secure"] !== undefined ? map["smtp_secure"] === "true" : (port === 465 || envConfig.secure);
    const user = map["smtp_user"] || envConfig.user;
    const pass = map["smtp_pass"] || envConfig.pass;
    const fromName = map["smtp_from_name"] || envConfig.fromName;
    const fromEmail = map["smtp_from_email"] || envConfig.fromEmail;
    const adminEmail = map["contact_notification_email"] || envConfig.adminEmail;

    return {
      host,
      port,
      secure,
      user,
      pass,
      fromName,
      fromEmail,
      adminEmail,
    };
  } catch (err) {
    console.warn("[Mail] Failed to load SMTP settings from DB, using env fallback:", err);
    return envConfig;
  }
}

let cachedTransporter: Transporter | null = null;
let lastUsedConfigSignature: string = "";

/**
 * Asynchronous transporter loader that respects dynamically saved Admin Panel settings.
 */
export async function getMailTransporterAsync(): Promise<Transporter | null> {
  const config = await getResolvedMailConfig();

  if (!config.user || !config.pass) {
    return null;
  }

  const signature = `${config.host}:${config.port}:${config.secure}:${config.user}:${config.pass}`;
  if (!cachedTransporter || signature !== lastUsedConfigSignature) {
    lastUsedConfigSignature = signature;
    cachedTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });
  }

  return cachedTransporter;
}

/**
 * Synchronous fallback for legacy callers
 */
export function getMailTransporter(): Transporter | null {
  const config = getMailConfig();

  if (!config.user || !config.pass) {
    return null;
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });
  }

  return cachedTransporter;
}

export function resetMailTransporterCache() {
  cachedTransporter = null;
  lastUsedConfigSignature = "";
}

export async function verifySmtpConnectionWithConfig(customConfig?: Partial<MailConfig>): Promise<{ success: boolean; message: string }> {
  const baseConfig = await getResolvedMailConfig();
  const config: MailConfig = {
    ...baseConfig,
    ...customConfig,
  };

  if (!config.user || !config.pass) {
    return {
      success: false,
      message: "SMTP user and password are required to connect.",
    };
  }

  try {
    const testTransporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: true,
      },
    });

    await testTransporter.verify();
    return {
      success: true,
      message: `Successfully connected to SMTP server (${config.host}:${config.port}) as ${config.user}.`,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "SMTP verification failed.";
    return {
      success: false,
      message: `Failed to connect to SMTP server: ${msg}`,
    };
  }
}

export async function verifySmtpConnection(): Promise<{ success: boolean; message: string }> {
  return await verifySmtpConnectionWithConfig();
}
