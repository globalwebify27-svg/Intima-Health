import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { connectDB } from "@/db/connect";
import { verifyJwt } from "@/lib/jwt";
import { UserModel, hashPassword, verifyPassword } from "@/modules/auth/schema";

export async function PUT(req: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Not authenticated." }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload) {
      return NextResponse.json({ success: false, message: "Invalid session." }, { status: 401 });
    }

    const body = await req.json();
    const { name, oldPassword, newPassword } = body;

    const user = await UserModel.findById(payload.userId).exec();
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
    }

    // Update name
    if (name) {
      user.name = name;
    }

    // Change password if requested
    if (newPassword) {
      if (!oldPassword) {
        return NextResponse.json({ success: false, message: "Current password is required to change password." }, { status: 400 });
      }
      const isMatch = verifyPassword(oldPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ success: false, message: "Current password is incorrect." }, { status: 400 });
      }
      user.passwordHash = hashPassword(newPassword);
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}
