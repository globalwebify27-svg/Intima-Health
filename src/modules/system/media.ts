import mongoose, { Schema, Document } from "mongoose";

export interface IMedia extends Document {
  filename: string;
  contentType: string;
  data: Buffer;
  createdAt: Date;
}

const MediaSchema = new Schema<IMedia>({
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
  data: { type: Buffer, required: true },
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 30 }, // auto delete after 30 days
});

export const MediaModel = mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema);
