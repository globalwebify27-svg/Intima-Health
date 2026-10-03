import { PatientModel } from "@/modules/patients/schema";
import { DoctorModel } from "@/modules/doctors/schema";
import { ClinicModel } from "@/modules/clinics/schema";
import { NotificationModel } from "@/modules/system/schema";
import mongoose from "mongoose";

// OTP function (keep existing)
export async function sendWhatsAppOtp({ phone, code }: { phone: string; code: string }) {
  try {
    const digits = phone.replace(/\D/g, "");
    const last10 = digits.slice(-10);
    const destination = last10.length === 10 ? `91${last10}` : digits;

    const apiKey = process.env.AISENSY_OTP_API_KEY || process.env.AISENSY_API_KEY;
    const campaignName = process.env.AISENSY_OTP_CAMPAIGN_NAME || process.env.AISENSY_CAMPAIGN_NAME || "otp_verification";
    const apiUrl = process.env.AISENSY_API_URL || "https://backend.aisensy.com/campaign/t1/api/v2";

    if (!apiKey) {
      console.warn("[AiSensy WhatsApp OTP] Warning: AISENSY_API_KEY is missing.");
      return { success: false, message: "API key missing" };
    }

    const payload = {
      apiKey,
      campaignName,
      destination,
      userName: `User_${last10}`,
      templateParams: [code],
      buttons: [
        {
          type: "button",
          sub_type: "url",
          index: "0",
          parameters: [
            {
              type: "text",
              text: code
            }
          ]
        }
      ],
      source: "IntimaHealthAuth",
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await response.json();
  } catch (error) {
    console.error("[AiSensy WhatsApp OTP Exception]:", error);
    return { success: false, error };
  }
}

// Base template sender
export async function sendTemplateMessage({
  recipientId,
  recipientType = "PATIENT",
  phone,
  campaignName,
  templateParams,
  media,
}: {
  recipientId: string;
  recipientType?: "PATIENT" | "DOCTOR" | "ADMIN";
  phone: string;
  campaignName: string;
  templateParams: string[];
  media?: { url: string; filename: string };
}) {
  try {
    const digits = phone.replace(/\D/g, "");
    const last10 = digits.slice(-10);
    const destination = last10.length === 10 ? `91${last10}` : digits;

    console.log(`[AiSensy] Sending ${campaignName} to ${destination}`);

    const apiKey = process.env.AISENSY_API_KEY;
    const apiUrl = process.env.AISENSY_API_URL || "https://backend.aisensy.com/campaign/t1/api/v2";

    let apiStatus = "Sent";
    if (apiKey) {
      try {
        const payload: any = {
          apiKey,
          campaignName,
          destination,
          userName: recipientId,
          templateParams: templateParams.map(p => p.replace(/\s+/g, " ").trim()),
          source: "KelkarManasHealthClinic",
        };

        if (media) {
          payload.media = media; // Must contain {url, filename}
        }

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const resData = await response.json();
        console.log("[AiSensy API Response]:", resData);

        if (!response.ok) apiStatus = "Failed";
      } catch (apiErr) {
        console.error("AiSensy API dispatch error:", apiErr);
        apiStatus = "Failed";
      }
    }

    // Audit Log
    await NotificationModel.create({
      recipientId,
      recipientType,
      channel: "WhatsApp",
      title: campaignName,
      message: `Params: ${JSON.stringify(templateParams)}`,
      status: apiStatus,
    });
  } catch (error) {
    console.error("Failed to send WhatsApp template:", error);
  }
}

// ----------------------------------------------------------------------
// TEMPLATE WRAPPERS (1 to 10)
// ----------------------------------------------------------------------

// 1. Walk-in Appointment Booking Initiated
export async function sendAppointmentBookingInitiated({
  patientId, phone, patientName, doctorName, date, time, mode, clinicName, managerPhone
}: any) {
  return sendTemplateMessage({
    recipientId: patientId, phone,
    campaignName: "appointment_booking_initiated1",
    templateParams: [patientName, doctorName, date, time, mode, clinicName, managerPhone]
  });
}

// 2. Appointment Confirmed + Payment Successful
export async function sendAppointmentConfirmedPaymentSuccess({
  patientId, phone, patientName, doctorName, date, time, mode, clinicName, fee, invoiceUrl
}: any) {
  return sendTemplateMessage({
    recipientId: patientId, phone,
    campaignName: "appointment_confirmed_payment_success",
    templateParams: [patientName, doctorName, date, time, mode, clinicName, fee.toString()],
    media: invoiceUrl ? { url: invoiceUrl, filename: "Invoice.pdf" } : undefined
  });
}

// 3. Appointment Reminder
export async function sendAppointmentReminder({
  patientId, phone, patientName, doctorName, date, time, mode, clinicName
}: any) {
  return sendTemplateMessage({
    recipientId: patientId, phone,
    campaignName: "appointment_reminder",
    templateParams: [patientName, doctorName, date, time, mode, clinicName]
  });
}

// 4. Appointment Rescheduled
export async function sendAppointmentRescheduled({
  patientId, phone, patientName, doctorName, date, time, mode, clinicName, managerPhone
}: any) {
  return sendTemplateMessage({
    recipientId: patientId, phone,
    campaignName: "appointment_rescheduled",
    templateParams: [patientName, doctorName, date, time, mode, clinicName, managerPhone]
  });
}

// 5. Appointment Cancelled
export async function sendAppointmentCancelled({
  patientId, phone, patientName, doctorName, date, time, mode, clinicName
}: any) {
  return sendTemplateMessage({
    recipientId: patientId, phone,
    campaignName: "appointment_cancelled",
    templateParams: [patientName, doctorName, date, time, mode, clinicName]
  });
}

// 6. Video Consultation Reminder
export async function sendVideoConsultationReminder({
  patientId, phone, patientName, doctorName, date, time, clinicName
}: any) {
  return sendTemplateMessage({
    recipientId: patientId, phone,
    campaignName: "video_consultation_reminder",
    templateParams: [patientName, doctorName, date, time, "Video", clinicName]
  });
}

// 7. Appointment Completed + Prescription Issued
export async function sendAppointmentCompletedPrescriptionIssued({
  patientId, phone, patientName, doctorName, date, time, prescriptionUrl
}: any) {
  return sendTemplateMessage({
    recipientId: patientId, phone,
    campaignName: "appointment_completed_prescription_issued",
    templateParams: [patientName, doctorName, date, time],
    media: prescriptionUrl ? { url: prescriptionUrl, filename: "Prescription.pdf" } : undefined
  });
}

// 8. Payment Successful (All Payments)
export async function sendPaymentSuccessful({
  patientId, phone, patientName, amount, paymentId, paymentFor, location, date, time, invoiceUrl
}: any) {
  return sendTemplateMessage({
    recipientId: patientId, phone,
    campaignName: "payment_successful",
    templateParams: [patientName, amount.toString(), paymentId, paymentFor, location, date, time],
    media: invoiceUrl ? { url: invoiceUrl, filename: "Invoice.pdf" } : undefined
  });
}

// 9. Refund Completed
export async function sendRefundCompleted({
  patientId, phone, patientName, amount, paymentId, refundId, date, time
}: any) {
  return sendTemplateMessage({
    recipientId: patientId, phone,
    campaignName: "refund_completed",
    templateParams: [patientName, amount.toString(), paymentId, refundId, date, time]
  });
}

// 10. Standalone Prescription Issued
export async function sendPrescriptionIssued({
  patientId, phone, patientName, doctorName, prescriptionUrl
}: any) {
  return sendTemplateMessage({
    recipientId: patientId, phone,
    campaignName: "prescription_issued",
    templateParams: [patientName, doctorName],
    media: prescriptionUrl ? { url: prescriptionUrl, filename: "Prescription.pdf" } : undefined
  });
}

// ----------------------------------------------------------------------
// LEGACY / GENERIC WRAPPERS (Keep for backward compatibility during migration)
// ----------------------------------------------------------------------

export async function sendWelcomeMessage(patientId: string) {
  // Existing functionality wrapped to use standard generic if needed
}

export async function sendAppointmentBookingMessage(appointmentId: string, isPaid = false) {
  try {
    const mongoose = (await import("mongoose")).default;
    const patientModel = mongoose.models.Appointment || mongoose.model("Appointment", new mongoose.Schema({}, { strict: false })); // Use AppointmentModel
    const appointment = await patientModel.findById(appointmentId).populate("patientId").populate("doctorId").exec();
    
    if (!appointment) return;
    const patient = appointment.patientId as any;
    const doctor = appointment.doctorId as any;
    if (!patient || !patient.phone) return;

    let clinicName = "KELKAR MANAS HEALTH CLINIC";
    if (doctor?.clinicId) {
      const clinicModel = mongoose.models.Clinic || mongoose.model("Clinic", new mongoose.Schema({}, { strict: false }));
      const clinic = await clinicModel.findById(doctor.clinicId).exec();
      if (clinic) clinicName = clinic.name;
    }

    const docFees = appointment.feeAmount ?? 0;
    const actuallyPaid = isPaid || appointment.paymentStatus === "Paid";

    if (actuallyPaid) {
      // 1. Generate Invoice PDF
      const { generateInvoicePdf } = await import("./pdfGenerator");
      const { MediaModel } = await import("../modules/system/media");

      const invoiceBuffer = await generateInvoicePdf({
        patientName: patient.name || "Patient",
        doctorName: doctor?.name || "Specialist",
        clinicName,
        date: appointment.date,
        time: appointment.time,
        amount: docFees.toString(),
        paymentId: appointment.transactionId || "TXN-AUTO",
        paymentMethod: appointment.paymentMethod || "Online",
      });

      // 2. Save PDF to Database
      const media = await MediaModel.create({
        filename: `Invoice_${patient.name}_${appointment.date}.pdf`,
        contentType: "application/pdf",
        data: invoiceBuffer
      });

      // 3. Construct Public URL
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://intima-health.vercel.app";
      const invoiceUrl = `${appUrl}/api/media/${media._id}`;

      await sendAppointmentConfirmedPaymentSuccess({
        patientId: patient._id.toString(),
        phone: patient.phone,
        patientName: patient.name || "Patient",
        doctorName: doctor?.name || "Specialist",
        date: appointment.date,
        time: appointment.time,
        mode: appointment.type,
        clinicName,
        fee: docFees,
        invoiceUrl
      });
    } else {
      await sendAppointmentBookingInitiated({
        patientId: patient._id.toString(),
        phone: patient.phone,
        patientName: patient.name || "Patient",
        doctorName: doctor?.name || "Specialist",
        date: appointment.date,
        time: appointment.time,
        mode: appointment.type,
        clinicName,
        managerPhone: "+91 91753 10398" // Or fetch from clinic model
      });
    }
  } catch (err) {
    console.error("Error in sendAppointmentBookingMessage wrapper:", err);
  }
}

export async function sendPrescriptionMessage(consultationId: string) {
  // We will migrate this in the API endpoints to use the new exact templates directly
}
