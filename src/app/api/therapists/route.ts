import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { TherapistModel } from "@/modules/therapists/schema";
import { UserModel, hashPassword } from "@/modules/auth/schema";
import { ClinicModel } from "@/modules/clinics/schema";

export const dynamic = "force-dynamic";

// Seed default therapists if none exist
async function ensureSeedTherapists() {
  const count = await TherapistModel.countDocuments();
  if (count > 0) return;

  const firstClinic = await ClinicModel.findOne().exec();
  const clinicId = firstClinic ? firstClinic._id : undefined;

  const defaultTherapists = [
    {
      name: "Dr. Priya Sharma",
      email: "therapist@kelkarmanas.com",
      phone: "+91 98765 43210",
      avatar: "https://images.unsplash.com/photo-1594824813576-92f58e4e6f4f?auto=format&fit=crop&q=80&w=300",
      specialization: "Clinical Psychology & Sex Therapy",
      registrationNumber: "RCI-CR-2021-8841",
      qualifications: ["M.Phil in Clinical Psychology", "Certified Sex Therapist", "Member IASP"],
      experience: 8,
      bio: "Specializing in psychosexual therapy, intimacy counseling, and cognitive behavioral therapy for couples and individuals experiencing performance anxiety.",
      rating: 4.9,
      reviewsCount: 142,
      fees: 1500,
      slotDuration: 50,
      clinicId,
      availability: [
        {
          day: "Monday",
          slots: [
            { start: "10:00 AM", end: "10:50 AM" },
            { start: "11:30 AM", end: "12:20 PM" },
            { start: "02:00 PM", end: "02:50 PM" },
            { start: "04:00 PM", end: "04:50 PM" },
          ],
        },
        {
          day: "Tuesday",
          slots: [
            { start: "10:00 AM", end: "10:50 AM" },
            { start: "11:30 AM", end: "12:20 PM" },
            { start: "03:00 PM", end: "03:50 PM" },
            { start: "05:00 PM", end: "05:50 PM" },
          ],
        },
        {
          day: "Wednesday",
          slots: [
            { start: "10:00 AM", end: "10:50 AM" },
            { start: "02:00 PM", end: "02:50 PM" },
            { start: "04:00 PM", end: "04:50 PM" },
          ],
        },
        {
          day: "Thursday",
          slots: [
            { start: "11:00 AM", end: "11:50 AM" },
            { start: "02:00 PM", end: "02:50 PM" },
            { start: "04:00 PM", end: "04:50 PM" },
          ],
        },
        {
          day: "Friday",
          slots: [
            { start: "10:00 AM", end: "10:50 AM" },
            { start: "12:00 PM", end: "12:50 PM" },
            { start: "03:00 PM", end: "03:50 PM" },
          ],
        },
        {
          day: "Saturday",
          slots: [
            { start: "10:00 AM", end: "10:50 AM" },
            { start: "11:30 AM", end: "12:20 PM" },
          ],
        },
      ],
      status: "Active",
      showOnHomepage: true,
    },
    {
      name: "Dr. Rohan Mehta",
      email: "rohan.therapist@kelkarmanas.com",
      phone: "+91 98230 11223",
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300",
      specialization: "Cognitive Behavioral Therapy (CBT) & Relationship Counseling",
      registrationNumber: "RCI-CR-2019-5432",
      qualifications: ["M.Sc Clinical Psychology", "Advanced CBT Practitioner", "EFT Certified"],
      experience: 6,
      bio: "Expertise in navigating mismatched libidos, emotional communication, stress management, and resolving deep relationship conflicts.",
      rating: 4.8,
      reviewsCount: 98,
      fees: 1400,
      slotDuration: 50,
      clinicId,
      availability: [
        {
          day: "Monday",
          slots: [
            { start: "01:00 PM", end: "01:50 PM" },
            { start: "03:00 PM", end: "03:50 PM" },
            { start: "05:00 PM", end: "05:50 PM" },
          ],
        },
        {
          day: "Wednesday",
          slots: [
            { start: "11:00 AM", end: "11:50 AM" },
            { start: "02:00 PM", end: "02:50 PM" },
            { start: "04:00 PM", end: "04:50 PM" },
          ],
        },
        {
          day: "Friday",
          slots: [
            { start: "10:00 AM", end: "10:50 AM" },
            { start: "01:00 PM", end: "01:50 PM" },
            { start: "04:00 PM", end: "04:50 PM" },
          ],
        },
        {
          day: "Saturday",
          slots: [
            { start: "10:00 AM", end: "10:50 AM" },
            { start: "12:00 PM", end: "12:50 PM" },
            { start: "02:00 PM", end: "02:50 PM" },
          ],
        },
      ],
      status: "Active",
      showOnHomepage: true,
    },
  ];

  for (const t of defaultTherapists) {
    const created = await TherapistModel.create(t);
    // Also ensure User login credentials exist
    const existingUser = await UserModel.findOne({ email: t.email }).exec();
    if (!existingUser) {
      await UserModel.create({
        name: t.name,
        email: t.email,
        passwordHash: hashPassword("therapist123"),
        role: "THERAPIST",
        clinicId,
        therapistId: created._id,
        status: "Active",
      });
    }
  }
}

export async function GET(request: Request) {
  try {
    await connectDB();
    await ensureSeedTherapists();

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get("clinicId");
    const specialization = searchParams.get("specialization");
    const status = searchParams.get("status") || "Active";

    const query: Record<string, any> = {};
    if (status && status !== "ALL") query.status = status;
    if (clinicId) query.clinicId = clinicId;
    if (specialization) {
      query.specialization = { $regex: specialization, $options: "i" };
    }

    const therapists = await TherapistModel.find(query)
      .populate("clinicId")
      .sort({ rating: -1, createdAt: -1 })
      .exec();

    return NextResponse.json({
      success: true,
      data: therapists,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch therapists." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    const existing = await TherapistModel.findOne({ email: body.email }).exec();
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Therapist with this email already exists." },
        { status: 400 }
      );
    }

    const therapist = await TherapistModel.create(body);

    // If password provided, also create User credentials
    if (body.password) {
      await UserModel.create({
        name: therapist.name,
        email: therapist.email,
        passwordHash: hashPassword(body.password),
        role: "THERAPIST",
        clinicId: therapist.clinicId,
        therapistId: therapist._id,
        status: therapist.status || "Active",
      });
    }

    return NextResponse.json(
      { success: true, message: "Therapist created successfully.", data: therapist },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create therapist." },
      { status: 400 }
    );
  }
}
