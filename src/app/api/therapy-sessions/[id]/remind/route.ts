import { NextResponse } from "next/server";
import { connectDB } from "@/db/connect";
import { TherapySessionModel } from "@/modules/pharmacy/schema";
import "@/modules/therapists/schema";
import "@/modules/doctors/schema";
import "@/modules/patients/schema";
import "@/modules/clinics/schema";
import "@/modules/consultations/schema";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/jwt";
import { sendAppointmentReminder } from "@/lib/whatsapp";
import { getMailTransporter, getMailTransporterAsync, getResolvedMailConfig } from "@/lib/mail/transporter";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    await connectDB();
    const { id } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const payload = token ? verifyJwt(token) : null;

    if (!payload || !["CLINIC_MANAGER", "SUPER_ADMIN", "ADMIN"].includes(payload.role)) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Clinic Manager access required." },
        { status: 403 }
      );
    }

    const session = await TherapySessionModel.findById(id)
      .populate("patientId")
      .populate("doctorId")
      .populate("clinicId")
      .exec();

    if (!session) {
      return NextResponse.json(
        { success: false, message: "Therapy session record not found." },
        { status: 404 }
      );
    }

    const patient = session.patientId as any;
    const doctor = session.doctorId as any;
    const clinic = session.clinicId as any;

    if (!patient) {
      return NextResponse.json(
        { success: false, message: "Patient record is missing for this session." },
        { status: 400 }
      );
    }

    const patientName = patient.name || "Patient";
    const patientPhone = (patient.phone || "").replace(/\D/g, "").slice(-10);
    const patientEmail = patient.email && !patient.email.includes("@noemail-intima.com") ? patient.email : "";
    const therapyName = session.name || "Recommended Therapy";
    const doctorName = (doctor?.name || "Specialist").replace(/^Dr\.?\s+/i, "");
    const clinicName = clinic?.name || "Kelkar Manas Health Care";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://intima.health";

    let waSuccess = false;
    let emailSuccess = false;

    // 1. Send WhatsApp Reminder if phone is available
    if (patientPhone.length === 10) {
      try {
        await sendAppointmentReminder({
          patientId: patient._id.toString(),
          phone: patientPhone,
          patientName,
          doctorName: `Dr. ${doctorName}`,
          date: session.date || "Available slots",
          time: session.time || "Open slot",
          mode: `${therapyName} Session`,
          clinicName,
        });
        waSuccess = true;
      } catch (waErr: any) {
        console.error("[Therapy Reminder] WhatsApp dispatch error:", waErr.message);
      }
    }

    // 2. Send Email Reminder if email is available
    if (patientEmail && patientEmail.includes("@")) {
      try {
        const transporter = (await getMailTransporterAsync()) || getMailTransporter();
        const config = await getResolvedMailConfig();
        if (transporter) {
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 12px; background: #fff;">
              <h2 style="color: #4A154B; margin-top: 0;">Recommended Therapy Reminder</h2>
              <p>Dear <strong>${patientName}</strong>,</p>
              <p>During your consultation with <strong>Dr. ${doctorName}</strong>, the following therapy session was advised as part of your treatment plan:</p>
              <div style="background: #fdf7fe; padding: 16px; border-radius: 8px; border-left: 4px solid #4A154B; margin: 20px 0;">
                <p style="margin: 0; font-size: 16px; font-weight: bold; color: #4A154B;">${therapyName}</p>
                <p style="margin: 6px 0 0 0; font-size: 14px; color: #666;">Estimated Fee: ₹${session.price || 0}</p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #666;">Clinic: ${clinicName}</p>
              </div>
              <p>Please log in to your patient dashboard to schedule your date and time slot:</p>
              <p style="text-align: center; margin: 28px 0;">
                <a href="${appUrl}/patient/dashboard" style="background: #4A154B; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Open Patient Dashboard &amp; Schedule
                </a>
              </p>
              <p style="font-size: 13px; color: #777;">If you have any questions or wish to book at the desk, feel free to contact the clinic manager.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
              <p style="font-size: 12px; color: #999;">Best regards,<br/><strong>${clinicName}</strong></p>
            </div>
          `;

          await transporter.sendMail({
            from: `"${config.fromName}" <${config.fromEmail}>`,
            to: patientEmail,
            subject: `Reminder: Recommended ${therapyName} - ${clinicName}`,
            html: emailHtml,
          });
          emailSuccess = true;
        }
      } catch (mErr: any) {
        console.error("[Therapy Reminder] Email dispatch error:", mErr.message);
      }
    }

    if (!waSuccess && !emailSuccess) {
      return NextResponse.json(
        {
          success: false,
          message: patientPhone || patientEmail
            ? "Could not dispatch notification. Please check gateway connectivity."
            : "Patient has neither a valid 10-digit phone number nor email on file.",
        },
        { status: 400 }
      );
    }

    const channels: string[] = [];
    if (waSuccess) channels.push(`WhatsApp (+91 ${patientPhone})`);
    if (emailSuccess) channels.push(`Email (${patientEmail})`);

    return NextResponse.json({
      success: true,
      message: `Reminder sent to ${patientName} via ${channels.join(" and ")}!`,
    });
  } catch (error: any) {
    console.error("[Therapy Reminder Exception]:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to send therapy reminder." },
      { status: 500 }
    );
  }
}
