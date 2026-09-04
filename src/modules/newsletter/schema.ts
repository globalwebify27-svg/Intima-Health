import mongoose, { Schema } from "mongoose";
import { INewsletterSubscriber } from "./types";

const NewsletterSubscriberSchema = new Schema<INewsletterSubscriber>(
  {
    email: { type: String, required: true, unique: true, index: true },
    status: { type: String, enum: ["Active", "Unsubscribed"], default: "Active" },
  },
  {
    timestamps: true,
  }
);

delete mongoose.models.NewsletterSubscriber;
export const NewsletterSubscriberModel = mongoose.models.NewsletterSubscriber || mongoose.model<INewsletterSubscriber>("NewsletterSubscriber", NewsletterSubscriberSchema);
