import { PatientModel } from "@/modules/patients/schema";
import { DoctorModel } from "@/modules/doctors/schema";
import { ClinicModel } from "@/modules/clinics/schema";
import { NotificationModel } from "@/modules/system/schema";

export async function sendWhatsAppMessage({
  recipientId,
  recipientType = "PATIENT",
  phone,
  title,
  message,
}: {
  recipientId: string;
  recipientType?: "PATIENT" | "DOCTOR" | "ADMIN";
  phone: string;
  title: string;
  message: string;
}) {
  try {
    const digits = phone.replace(/\D/g, "");
    const last10 = digits.slice(-10);
    const destination = last10.length === 10 ? `+91${last10}` : phone;
    const formattedPhone = last10.length === 10 ? `+91 ${last10}` : phone;

    // Log to console for server terminal/logs visibility
    console.log(`
======================================================================
[WhatsApp Notification via AiSensy]
To: ${formattedPhone} (${recipientType})
Title: ${title}
Message: ${message}
======================================================================
`);

    // Call AiSensy API if API key is configured
    const apiKey = process.env.AISENSY_API_KEY;
    const campaignName = process.env.AISENSY_CAMPAIGN_NAME || "generic_notification";
    const apiUrl = process.env.AISENSY_API_URL || "https://backend.aisensy.com/campaign/t1/api/v2";

    let apiStatus = "Sent";
    if (apiKey) {
      try {
        const payload = {
          apiKey,
          campaignName,
          destination,
          userName: recipientId,
          templateParams: [title, message],
          source: "IntimaHealthPlatform",
        };

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const resData = await response.json();
        console.log("[AiSensy API Response]:", resData);
        if (!response.ok) {
          apiStatus = "Failed";
        }
      } catch (apiErr) {
        console.error("AiSensy API dispatch error:", apiErr);
        apiStatus = "Failed";
      }
    }

    // Save to the database for notification audit log
    await NotificationModel.create({
      recipientId,
      recipientType,
      channel: "WhatsApp (AiSensy)",
      title,
      message,
      status: apiStatus,
    });
  } catch (error) {
    console.error("Failed to send/save WhatsApp notification:", error);
  }
}

export async function sendWelcomeMessage(patientId: string) {
  try {
    const patient = await PatientModel.findById(patientId).exec();
    if (!patient || !patient.phone) return;

    const welcomeMsg = `Welcome to Intima Health, ${patient.name}! 🌟 Your patient profile has been created successfully. You can log in to your patient portal using your WhatsApp number at http://localhost:3000/login or download and log in to our Mobile App using your phone number to access all your details. App Link: https://intima.health/download-app`;
    
    await sendWhatsAppMessage({
      recipientId: patient._id.toString(),
      phone: patient.phone,
      title: "Welcome to Intima Health",
      message: welcomeMsg,
    });
  } catch (error) {
    console.error("Error sending welcome message:", error);
  }
}

export async function sendAppointmentBookingMessage(appointmentId: string, isPaid = false) {
  try {
    // We fetch patient, doctor, and clinic details to construct a customized message
    const patientModel = await PatientModel.db.model("Appointment"); // Ensure Appointment schema is loaded
    const appointment = await patientModel.findById(appointmentId)
      .populate("patientId")
      .populate("doctorId")
      .exec();

    if (!appointment) return;

    const patient = appointment.patientId as any;
    const doctor = appointment.doctorId as any;
    if (!patient || !patient.phone) return;

    let clinicName = "Intima Health Clinic";
    if (doctor?.clinicId) {
      const clinic = await ClinicModel.findById(doctor.clinicId).exec();
      if (clinic) {
        clinicName = clinic.name;
      }
    }

    const docFees = appointment.feeAmount !== undefined ? appointment.feeAmount : (appointment.type === "Walk-in" ? "1,499" : "999");
    const paymentLink = `http://localhost:3000/checkout?appointmentId=${appointmentId}`;
    
    let message = "";
    if (isPaid) {
      message = `Hello ${patient.name}, your appointment with Dr. ${doctor?.name || "our specialist"} is confirmed! 🗓️\n\n` +
        `Date: ${appointment.date}\n` +
        `Time: ${appointment.time}\n` +
        `Type: ${appointment.type}\n` +
        `Clinic: ${clinicName}\n\n` +
        `Your consultation fee of ₹${docFees} has been paid successfully. ✅\n\n` +
        `To access all your details, prescriptions, and join video consultations, download our Mobile App: https://intima.health/download-app or visit http://localhost:3000/patient/dashboard`;
    } else {
      message = `Hello ${patient.name}, your appointment with Dr. ${doctor?.name || "our specialist"} is confirmed! 🗓️\n\n` +
        `Date: ${appointment.date}\n` +
        `Time: ${appointment.time}\n` +
        `Type: ${appointment.type}\n` +
        `Clinic: ${clinicName}\n\n` +
        `Please complete your consultation fee payment of ₹${docFees} using this secure link: ${paymentLink} or pay via your dashboard: http://localhost:3000/patient/dashboard`;
    }

    await sendWhatsAppMessage({
      recipientId: patient._id.toString(),
      phone: patient.phone,
      title: "Appointment Booking & Payment Link",
      message,
    });
  } catch (error) {
    console.error("Error sending appointment booking message:", error);
  }
}

export async function sendPrescriptionMessage(consultationId: string) {
  try {
    const consultationModel = await PatientModel.db.model("Consultation");
    const consultation = await consultationModel.findById(consultationId)
      .populate("patientId")
      .populate("doctorId")
      .exec();

    if (!consultation || !consultation.prescriptionSummary) return;

    const patient = consultation.patientId as any;
    const doctor = consultation.doctorId as any;
    if (!patient || !patient.phone) return;

    const message = `Hello ${patient.name}, your digital prescription has been generated by Dr. ${doctor?.name || "your specialist"}. 📄\n\n` +
      `Prescription Summary:\n${consultation.prescriptionSummary}\n\n` +
      `You can view, download, or print your full prescription here: http://localhost:3000/patient/prescriptions`;

    await sendWhatsAppMessage({
      recipientId: patient._id.toString(),
      phone: patient.phone,
      title: "New Prescription Issued",
      message,
    });
  } catch (error) {
    console.error("Error sending prescription message:", error);
  }
}
