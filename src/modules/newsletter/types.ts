import { Document } from "mongoose";

export interface INewsletterSubscriber extends Document {
  email: string;
  status: "Active" | "Unsubscribed";
  createdAt: Date;
  updatedAt: Date;
}
