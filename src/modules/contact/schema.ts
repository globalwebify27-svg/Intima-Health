import mongoose, { Schema } from "mongoose";
import { IContactSubmission } from "./types";

const ContactSubmissionSchema = new Schema<IContactSubmission>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["New", "Read", "Replied"], default: "New" }
  },
  {
    timestamps: true,
  }
);

delete mongoose.models.ContactSubmission;
export const ContactSubmissionModel = mongoose.models.ContactSubmission || mongoose.model<IContactSubmission>("ContactSubmission", ContactSubmissionSchema);
