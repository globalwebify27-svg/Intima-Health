import { Document } from "mongoose";

export interface IContactSubmission extends Document {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
  status: "New" | "Read" | "Replied";
  createdAt: Date;
  updatedAt: Date;
}
