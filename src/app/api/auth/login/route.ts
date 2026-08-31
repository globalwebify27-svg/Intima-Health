import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { UserModel, hashPassword, verifyPassword } from "@/modules/auth/schema";
import { signJwt } from "@/lib/jwt";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Auto-seed default administrator if no users exist
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      const defaultAdmin = new UserModel({
        name: "Intima Admin",
        email: "admin@intima.health",
        passwordHash: hashPassword("adminpassword123"),
        role: "SUPER_ADMIN",
        status: "Active",
      });
      await defaultAdmin.save();
      console.log("Seeded default administrator successfully: admin@intima.health / adminpassword123");
    }

    const user = await UserModel.findOne({ email }).exec();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = signJwt({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      clinicId: user.clinicId,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinicId: user.clinicId,
      },
    });

    // Set cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 86400, // 1 day
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Login failed." },
      { status: 500 }
    );
  }
}
