import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { ContactSubmissionModel } from "@/modules/contact/schema";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { firstName, lastName, email, subject, message } = body;

    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const submission = await ContactSubmissionModel.create({
      firstName,
      lastName,
      email,
      subject,
      message,
    });

    return NextResponse.json({ success: true, data: submission });
  } catch (error: any) {
    console.error("Error creating contact submission:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
