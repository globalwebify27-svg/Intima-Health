import nodemailer, { type Transporter } from "nodemailer";

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
    fromEmail: process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "care@kelkarmanas.com",
    adminEmail: process.env.ADMIN_NOTIFICATION_EMAIL || "kelkarmanashealthcare@gmail.com",
  };
}

let cachedTransporter: Transporter | null = null;

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

export async function verifySmtpConnection(): Promise<{ success: boolean; message: string }> {
  const transporter = getMailTransporter();
  const config = getMailConfig();

  if (!transporter || !config.user || !config.pass) {
    return {
      success: false,
      message: "Hostinger SMTP credentials are not yet configured in .env (SMTP_USER or SMTP_PASS missing).",
    };
  }

  try {
    await transporter.verify();
    return {
      success: true,
      message: `Successfully connected to Hostinger SMTP (${config.host}:${config.port}) as ${config.user}.`,
    };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "SMTP verification failed.";
    return {
      success: false,
      message: `Failed to connect to Hostinger SMTP: ${msg}`,
    };
  }
}
