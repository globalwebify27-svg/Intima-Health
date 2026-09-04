import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { DoctorModel } from "@/modules/doctors/schema";

export const dynamic = 'force-dynamic'; // Ensures this route is not statically cached

export async function GET() {
  try {
    await connectDB();
    
    // Find all doctors marked to show on homepage
    const doctors = await DoctorModel.find({ 
      showOnHomepage: true,
      status: "Active" 
    }).populate('clinicId').exec();

    return NextResponse.json({
      success: true,
      data: doctors
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch doctors." },
      { status: 500 }
    );
  }
}
