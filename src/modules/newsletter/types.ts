import { Document } from "mongoose";

export interface INewsletterSubscriber extends Document {
  email: string;
  status: "Active" | "Unsubscribed";
  unsubscribeToken?: string;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface INewsletterFailedRecipient {
  email: string;
  error: string;
}

export interface INewsletterCampaign extends Document {
  subject: string;
  htmlContent: string;
  senderName: string;
  senderEmail: string;
  replyTo?: string;
  totalRecipients: number;
  successCount: number;
  failedCount: number;
  failedRecipients?: INewsletterFailedRecipient[];
  status: "Draft" | "Sending" | "Sent" | "Failed";
  sentAt?: Date;
  createdBy?: string;
  createdAt: Date;
  updatedAt: Date;
}
