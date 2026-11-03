import mongoose, { Schema, Document } from "mongoose";

export interface IMedia extends Document {
  filename: string;
  folder?: string;
  path?: string;
  contentType: string;
  data: Buffer;
  size?: number;
  isPermanent?: boolean;
  createdAt: Date;
  expiresAt?: Date | null;
}

const MediaSchema = new Schema<IMedia>(
  {
    filename: { type: String, required: true },
    folder: { type: String, index: true },
    path: { type: String, index: true },
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
    size: { type: Number },
    isPermanent: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

MediaSchema.index({ path: 1 });
MediaSchema.index({ folder: 1, filename: 1 });
MediaSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const MediaModel = mongoose.models.Media || mongoose.model<IMedia>("Media", MediaSchema);
