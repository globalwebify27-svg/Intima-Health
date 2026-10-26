import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { UserModel, hashPassword } from "@/modules/auth/schema";
import { DoctorModel } from "@/modules/doctors/schema";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";

export const dynamic = 'force-dynamic';


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
      role: { $in: ["CLINIC_MANAGER", "DOCTOR", "PHARMACY_STAFF", "THERAPIST"] }
    }).populate("clinicId").exec();

    // Find all doctor profiles to combine metadata
    const doctors = await DoctorModel.find({}).exec();
    const doctorMap = new Map(doctors.map(d => [d.email, d]));

    // Find all therapist profiles to combine metadata
    const { TherapistModel } = await import("@/modules/therapists/schema");
    const therapists = await TherapistModel.find({}).exec();
    const therapistMap = new Map(therapists.map(t => [t.email, t]));

    const staffList = users.map(user => {
      const docProfile = user.role === "DOCTOR" ? doctorMap.get(user.email) : null;
      const therapistProfile = user.role === "THERAPIST" ? therapistMap.get(user.email) : null;
      const profile = docProfile || therapistProfile;

      return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId,
        status: user.status,
        createdAt: user.createdAt,
        // Include doctor / therapist specific fields if present
        doctorId: docProfile ? docProfile._id : undefined,
        therapistId: therapistProfile ? therapistProfile._id : undefined,
        specialization: profile ? profile.specialization : undefined,
        registrationNumber: profile ? profile.registrationNumber : undefined,
        phone: profile ? profile.phone : undefined,
        salary: (docProfile?.salary ?? therapistProfile?.fees) !== undefined ? (docProfile?.salary ?? therapistProfile?.fees) : undefined,
        experience: profile ? profile.experience : undefined,
        bio: profile ? profile.bio : undefined,
        rating: profile ? profile.rating : undefined,
        availability: profile ? profile.availability : undefined,
        qualifications: profile ? profile.qualifications : undefined,
        conditions: docProfile ? docProfile.conditions : undefined,
        showOnHomepage: profile ? profile.showOnHomepage : undefined,
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
    const { name, email, password, role, clinicId, status, doctorDetails, therapistDetails } = body;

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
        phone: doctorDetails.phone,
        specialization: doctorDetails.specialization || undefined,
        registrationNumber: doctorDetails.registrationNumber || undefined,
        experience: (doctorDetails.experience === "" || doctorDetails.experience === undefined) ? undefined : Number(doctorDetails.experience),
        bio: doctorDetails.bio || undefined,
        rating: (doctorDetails.rating === "" || doctorDetails.rating === undefined) ? undefined : Number(doctorDetails.rating),
        salary: (doctorDetails.salary === "" || doctorDetails.salary === undefined) ? undefined : Number(doctorDetails.salary),
        qualifications: doctorDetails.qualifications || [],
        availability: doctorDetails.availability || [],
        conditions: doctorDetails.conditions || [],
        showOnHomepage: doctorDetails.showOnHomepage || false,
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
    } else if (role === "THERAPIST") {
      const details = therapistDetails || doctorDetails || {};
      const { TherapistModel } = await import("@/modules/therapists/schema");

      const newTherapist = await TherapistModel.create({
        clinicId: clinicId || undefined,
        name,
        email,
        phone: details.phone || "+91 90000 00000",
        specialization: details.specialization || "Clinical Psychology & Sex Therapy",
        registrationNumber: details.registrationNumber || `RCI-${Date.now().toString().slice(-6)}`,
        experience: details.experience ? Number(details.experience) : 0,
        bio: details.bio || "",
        rating: details.rating ? Number(details.rating) : 5.0,
        fees: details.salary ? Number(details.salary) : 1500,
        qualifications: details.qualifications || [],
        availability: details.availability || [],
        showOnHomepage: details.showOnHomepage || false,
        status: status || "Active",
      });

      await UserModel.create({
        name,
        email,
        passwordHash,
        role: "THERAPIST",
        clinicId: clinicId || undefined,
        therapistId: newTherapist._id,
        status: status || "Active"
      });

      const { logAuditEvent } = await import("@/lib/audit");
      await logAuditEvent({
        userId: payload.userId,
        action: "THERAPIST_CREATED",
        details: { therapistId: newTherapist._id, name, email },
      });

      return NextResponse.json({
        success: true,
        message: "Therapist and login credentials created successfully.",
        data: newTherapist
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
