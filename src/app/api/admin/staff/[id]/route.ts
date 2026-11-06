import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { UserModel, hashPassword } from "@/modules/auth/schema";
import { DoctorModel } from "@/modules/doctors/schema";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PUT to update staff details and assignments
export async function PUT(req: Request, { params }: RouteParams) {
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
    const { id } = await params;
    const body = await req.json();
    const { name, email, password, clinicId, status, doctorDetails } = body;

    const user = (await UserModel.findById(id).exec()) || 
                 (await UserModel.findOne({ $or: [{ doctorId: id }, { therapistId: id }] }).exec());
    if (!user) {
      return NextResponse.json({ success: false, message: "Staff user not found." }, { status: 404 });
    }

    const oldEmail = user.email;

    // Check if email changed and is already taken
    if (email && email !== oldEmail) {
      const emailTaken = await UserModel.findOne({ email }).exec();
      if (emailTaken) {
        return NextResponse.json({ success: false, message: "New email is already in use." }, { status: 400 });
      }
    }

    // Update basic user details
    if (name) user.name = name;
    if (email) user.email = email;
    user.clinicId = clinicId ? clinicId : null;
    if (status) user.status = status;

    if (password) {
      user.passwordHash = hashPassword(password);
    }

    await user.save();

    // If role is DOCTOR, update Doctor collection
    if (user.role === "DOCTOR") {
      const doctor = await DoctorModel.findOne({
        $or: [
          ...(user.doctorId ? [{ _id: user.doctorId }] : []),
          ...(body.doctorId ? [{ _id: body.doctorId }] : []),
          { email: { $regex: new RegExp(`^${oldEmail.trim()}$`, "i") } },
          ...(email ? [{ email: { $regex: new RegExp(`^${email.trim()}$`, "i") } }] : [])
        ]
      }).exec();

      if (doctor) {
        if (name) doctor.name = name;
        if (email) doctor.email = email;
        doctor.clinicId = clinicId ? clinicId : null;
        if (status) doctor.status = status;

        if (doctorDetails) {
          if (doctorDetails.avatar !== undefined) {
            doctor.avatar = doctorDetails.avatar || undefined;
            try {
              const { TherapistModel } = await import("@/modules/therapists/schema");
              await TherapistModel.updateMany(
                { $or: [{ email: doctor.email }, { name: doctor.name }] },
                { $set: { avatar: doctorDetails.avatar || undefined } }
              ).exec();
            } catch {}
          }
          if (doctorDetails.signature !== undefined) doctor.signature = doctorDetails.signature || undefined;
          if (doctorDetails.phone) doctor.phone = doctorDetails.phone;
          if (doctorDetails.specialization !== undefined) doctor.specialization = doctorDetails.specialization;
          if (doctorDetails.registrationNumber) doctor.registrationNumber = doctorDetails.registrationNumber;
          if (doctorDetails.experience === "") {
            doctor.experience = undefined as any;
          } else if (doctorDetails.experience !== undefined) {
            doctor.experience = Number(doctorDetails.experience);
          }
          if (doctorDetails.bio !== undefined) doctor.bio = doctorDetails.bio;
          
          if (doctorDetails.rating === "") {
            doctor.rating = undefined as any;
          } else if (doctorDetails.rating !== undefined) {
            doctor.rating = Number(doctorDetails.rating);
          }
          
          if (doctorDetails.salary === "") {
            doctor.salary = undefined as any;
          } else if (doctorDetails.salary !== undefined) {
            doctor.salary = Number(doctorDetails.salary);
          }
          if (doctorDetails.qualifications) doctor.qualifications = doctorDetails.qualifications;
          if (doctorDetails.availability) doctor.availability = doctorDetails.availability;
          if (doctorDetails.conditions) doctor.conditions = doctorDetails.conditions;
          if (doctorDetails.showOnHomepage !== undefined) doctor.showOnHomepage = doctorDetails.showOnHomepage;
        }
        await doctor.save();
      }
    } else if (user.role === "THERAPIST") {
      const { TherapistModel } = await import("@/modules/therapists/schema");
      const therapist = await TherapistModel.findOne({
        $or: [
          ...(user.therapistId ? [{ _id: user.therapistId }] : []),
          ...(body.therapistId ? [{ _id: body.therapistId }] : []),
          { email: { $regex: new RegExp(`^${oldEmail.trim()}$`, "i") } },
          ...(email ? [{ email: { $regex: new RegExp(`^${email.trim()}$`, "i") } }] : [])
        ]
      }).exec();
      const details = body.therapistDetails || doctorDetails;

      if (therapist) {
        if (name) therapist.name = name;
        if (email) therapist.email = email;
        therapist.clinicId = clinicId ? clinicId : null;
        if (status) therapist.status = status;

        if (details) {
          if (details.avatar !== undefined) {
            therapist.avatar = details.avatar || undefined;
            try {
              await DoctorModel.updateMany(
                { $or: [{ email: therapist.email }, { name: therapist.name }] },
                { $set: { avatar: details.avatar || undefined } }
              ).exec();
            } catch {}
          }
          if (details.phone) therapist.phone = details.phone;
          if (details.specialization !== undefined) therapist.specialization = details.specialization;
          if (details.registrationNumber) therapist.registrationNumber = details.registrationNumber;
          if (details.experience !== undefined) therapist.experience = details.experience === "" ? 0 : Number(details.experience);
          if (details.bio !== undefined) therapist.bio = details.bio;
          if (details.rating !== undefined) therapist.rating = details.rating === "" ? 5.0 : Number(details.rating);
          if (details.salary !== undefined) therapist.fees = details.salary === "" ? 1500 : Number(details.salary);
          if (details.qualifications) therapist.qualifications = details.qualifications;
          if (details.availability) therapist.availability = details.availability;
          if (details.showOnHomepage !== undefined) therapist.showOnHomepage = details.showOnHomepage;
        }
        await therapist.save();
      } else if (details) {
        const newTh = await TherapistModel.create({
          clinicId: clinicId ? clinicId : null,
          name: name || user.name,
          email: email || user.email,
          avatar: details.avatar || undefined,
          phone: details.phone || "+91 90000 00000",
          specialization: details.specialization || "Clinical Psychology & Sex Therapy",
          registrationNumber: details.registrationNumber || `RCI-${Date.now().toString().slice(-6)}`,
          experience: details.experience !== "" && details.experience !== undefined ? Number(details.experience) : 0,
          bio: details.bio || "",
          rating: details.rating !== "" && details.rating !== undefined ? Number(details.rating) : 5.0,
          fees: details.salary !== "" && details.salary !== undefined ? Number(details.salary) : 1500,
          qualifications: details.qualifications || [],
          availability: details.availability || [],
          showOnHomepage: details.showOnHomepage || false,
          status: status || "Active",
        });
        user.therapistId = newTh._id as any;
        await user.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: "Staff member updated successfully."
    });
  } catch (error: any) {
    console.error("Error updating staff:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update staff member." },
      { status: 500 }
    );
  }
}

// DELETE to remove staff member
export async function DELETE(req: Request, { params }: RouteParams) {
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
    const { id } = await params;

    const user = await UserModel.findById(id).exec();
    if (!user) {
      return NextResponse.json({ success: false, message: "Staff user not found." }, { status: 404 });
    }

    const email = user.email;

    // Delete Doctor profile if user is a doctor
    if (user.role === "DOCTOR") {
      await DoctorModel.deleteOne({
        email: { $regex: new RegExp(`^${email.trim()}$`, "i") }
      }).exec();
    } else if (user.role === "THERAPIST") {
      const { TherapistModel } = await import("@/modules/therapists/schema");
      await TherapistModel.deleteOne({
        email: { $regex: new RegExp(`^${email.trim()}$`, "i") }
      }).exec();
    }

    // Delete User credentials
    await UserModel.deleteOne({ _id: id }).exec();

    return NextResponse.json({
      success: true,
      message: "Staff member removed successfully."
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete staff member." },
      { status: 500 }
    );
  }
}
