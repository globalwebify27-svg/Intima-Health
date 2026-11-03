import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { connectDB } from "@/db/connect";
import { MediaModel } from "@/modules/system/media";

export interface SaveUploadedMediaOptions {
  folder: string; // e.g. "avatars", "hospitals", "content", "docs"
  filename: string; // e.g. "e719d951384307de.webp"
  buffer: Buffer;
  contentType: string;
  isPermanent?: boolean;
}

/**
 * Persists uploaded media to MongoDB so files persist across serverless deployments
 * (e.g. Vercel) where local filesystems are read-only (EROFS) and ephemeral.
 * Also performs a best-effort local disk write for local development convenience.
 */
export async function saveUploadedMedia({
  folder,
  filename,
  buffer,
  contentType,
  isPermanent = true,
}: SaveUploadedMediaOptions): Promise<{ url: string; size: number }> {
  await connectDB();

  const relativePath = `${folder}/${filename}`;

  // 1. Persist to MongoDB Media collection
  await MediaModel.findOneAndUpdate(
    { path: relativePath },
    {
      filename,
      folder,
      path: relativePath,
      contentType,
      data: buffer,
      size: buffer.length,
      isPermanent,
      expiresAt: isPermanent ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // 2. Best-effort local file write (ignored on Vercel/read-only systems without throwing)
  try {
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);
  } catch (err: unknown) {
    // Expected in serverless environments like Vercel (EROFS: read-only file system)
    // The file is safely persisted in MongoDB and served via /uploads/[...path]
    const code = (err as { code?: string })?.code;
    if (code !== "EROFS") {
      console.warn("[Storage] Local disk write skipped:", err);
    }
  }

  return {
    url: `/uploads/${folder}/${filename}`,
    size: buffer.length,
  };
}

export async function getUploadedMedia(relativePath: string) {
  await connectDB();
  return MediaModel.findOne({ path: relativePath }).lean();
}

