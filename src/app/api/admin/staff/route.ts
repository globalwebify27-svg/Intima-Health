import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { UserModel, hashPassword } from "@/modules/auth/schema";
import { DoctorModel } from "@/modules/doctors/schema";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";

// GET all staff (Clinic Managers, Doctors, Pharmacy Staff)
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload || payload.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await connectDB();
    
    // Find all users who are staff
    const users = await UserModel.find({
      role: { $in: ["CLINIC_MANAGER", "DOCTOR", "PHARMACY_STAFF"] }
    }).populate("clinicId").exec();

    // Find all doctor profiles to combine metadata
    const doctors = await DoctorModel.find({}).exec();
    const doctorMap = new Map(doctors.map(d => [d.email, d]));

    const staffList = users.map(user => {
      const docProfile = user.role === "DOCTOR" ? doctorMap.get(user.email) : null;
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId,
        status: user.status,
        createdAt: user.createdAt,
        // Include doctor specific fields if present
        doctorId: docProfile ? docProfile._id : undefined,
        specialization: docProfile ? docProfile.specialization : undefined,
        phone: docProfile ? docProfile.phone : undefined,
        salary: docProfile ? docProfile.salary : undefined,
        experience: docProfile ? docProfile.experience : undefined,
        bio: docProfile ? docProfile.bio : undefined,
        availability: docProfile ? docProfile.availability : undefined,
        qualifications: docProfile ? docProfile.qualifications : undefined,
        conditions: docProfile ? docProfile.conditions : undefined,
      };
    });

    return NextResponse.json({
      success: true,
      data: staffList
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch staff directory." },
      { status: 500 }
    );
  }
}

// POST to create new staff member with credentials
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload || payload.role !== "SUPER_ADMIN") {
      return NextResponse.json({ success: false, message: "Unauthorized. Admin access required." }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const { name, email, password, role, clinicId, status, doctorDetails } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ success: false, message: "Name, email, password, and role are required." }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email }).exec();
    if (existingUser) {
      return NextResponse.json({ success: false, message: "Email is already registered." }, { status: 400 });
    }

    // Hash the password
    const passwordHash = hashPassword(password);

    if (role === "DOCTOR") {
      if (!doctorDetails) {
        return NextResponse.json({ success: false, message: "Doctor profile details are required." }, { status: 400 });
      }

      // Check if doctor profile already exists in doctors collection
      const existingDoc = await DoctorModel.findOne({ email }).exec();
      if (existingDoc) {
        return NextResponse.json({ success: false, message: "Doctor profile already exists." }, { status: 400 });
      }

      // Create Doctor document
      const newDoc = await DoctorModel.create({
        clinicId: clinicId || undefined,
        name,
        email,
        phone: doctorDetails.phone || "9876543210",
        specialization: doctorDetails.specialization || "General Medicine",
        experience: Number(doctorDetails.experience) || 1,
        bio: doctorDetails.bio || "No biography provided.",
        salary: Number(doctorDetails.salary) || 500,
        qualifications: doctorDetails.qualifications || ["MD"],
        availability: doctorDetails.availability || [],
        conditions: doctorDetails.conditions || [],
        status: status || "Active"
      });

      // Create corresponding User credentials account
      await UserModel.create({
        name,
        email,
        passwordHash,
        role: "DOCTOR",
        clinicId: clinicId || undefined,
        status: status || "Active"
      });

      return NextResponse.json({
        success: true,
        message: "Doctor and login credentials created successfully.",
        data: newDoc
      }, { status: 201 });
    } else {
      // Create Clinic Manager or Pharmacy Staff
      const newUser = await UserModel.create({
        name,
        email,
        passwordHash,
        role,
        clinicId: clinicId || undefined,
        status: status || "Active"
      });

      return NextResponse.json({
        success: true,
        message: `${role.replace("_", " ")} and login credentials created successfully.`,
        data: newUser
      }, { status: 201 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create staff member." },
      { status: 500 }
    );
  }
}
