import mongoose, { Schema } from "mongoose";
import crypto from "crypto";
import { INewsletterSubscriber, INewsletterCampaign } from "./types";

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    status: { type: String, enum: ["Active", "Unsubscribed"], default: "Active", index: true },
    unsubscribeToken: {
      type: String,
      index: true,
      default: () => crypto.randomBytes(24).toString("hex"),
    },
    unsubscribedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const NewsletterCampaignSchema = new Schema<INewsletterCampaign>(
  {
    subject: { type: String, required: true, trim: true },
    htmlContent: { type: String, required: true },
    senderName: { type: String, required: true, default: "Kelkar Manas Healthcare" },
    senderEmail: { type: String, required: true },
    replyTo: { type: String },
    totalRecipients: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    failedRecipients: [
      {
        email: { type: String },
        error: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ["Draft", "Sending", "Sent", "Failed"],
      default: "Draft",
      index: true,
    },
    sentAt: { type: Date },
    createdBy: { type: String },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.NewsletterSubscriber) {
  delete mongoose.models.NewsletterSubscriber;
}
if (mongoose.models.NewsletterCampaign) {
  delete mongoose.models.NewsletterCampaign;
}

export const NewsletterSubscriberModel = mongoose.model<INewsletterSubscriber>(
  "NewsletterSubscriber",
  NewsletterSubscriberSchema
);

export const NewsletterCampaignModel = mongoose.model<INewsletterCampaign>(
  "NewsletterCampaign",
  NewsletterCampaignSchema
);
