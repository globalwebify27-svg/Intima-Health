import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file uploaded." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const mimeType = file.type || "image/png";
    const base64String = buffer.toString("base64");
    const fileUrl = `data:${mimeType};base64,${base64String}`;

    return NextResponse.json({
      success: true,
      message: "File converted to base64 successfully.",
      url: fileUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Upload failed." },
      { status: 500 }
    );
  }
}
