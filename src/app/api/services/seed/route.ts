import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { PlatformServiceModel } from "@/modules/services/schema";

const seedData = [
  { name: "Online Consultation", icon: "Video", description: "15-min video call with a specialist", price: 999, type: "Consultation" },
  { name: "Sex Therapy", icon: "HeartHandshake", description: "30-min psychological counseling", price: 2499, type: "Therapy" },
  { name: "Walk-in Consultation", icon: "Building2", description: "Walk-in visit to our premium clinic", price: 1499, type: "Consultation" }
];

export async function POST() {
  try {
    await connectDB();
    const count = await PlatformServiceModel.countDocuments();
    if (count > 0) {
      return NextResponse.json({ success: true, message: "Database already seeded." });
    }

    await PlatformServiceModel.insertMany(seedData);
    
    return NextResponse.json({
      success: true,
      message: "Database seeded successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to seed." },
      { status: 500 }
    );
  }
}
