import { wrapEmailLayout } from "./layout";
import { emailIcons } from "./icons";

export interface MedicineOrderItemData {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  quantity?: number;
}

export interface MedicineOrderRequestEmailData {
  orderNumber: string;
  recipientType: "PHARMACY" | "ADMIN";
  clinicName: string;
  clinicAddress?: string;
  doctorName?: string;
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  medicines: MedicineOrderItemData[];
  requestedAt?: string;
  portalUrl?: string;
}

export function generateMedicineOrderRequestEmail(data: MedicineOrderRequestEmailData): { subject: string; html: string } {
  const isPharmacy = data.recipientType === "PHARMACY";
  const portalUrl = data.portalUrl || (isPharmacy ? "https://kelkarmanasclinic.com/pharmacy/orders" : "https://kelkarmanasclinic.com/admin/orders");
  const timeStr = data.requestedAt || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const subject = isPharmacy
    ? `[ACTION REQUIRED] New Medicine Order Request - ${data.patientName} (${data.orderNumber})`
    : `New Medicine Order Request (${data.clinicName}) - ${data.orderNumber}`;

  const medicinesRows = data.medicines.map((m, idx) => `
    <tr style="border-bottom: 1px solid #F0EAF0;">
      <td style="padding: 10px 8px; font-size: 13px; font-weight: 700; color: #2D242D;">
        ${idx + 1}. ${m.name}
        ${m.dosage ? `<div style="font-size: 11px; font-weight: 500; color: #7A2E7A;">${m.dosage}</div>` : ""}
      </td>
      <td style="padding: 10px 8px; font-size: 12px; color: #6E5C6E;">
        ${m.frequency || "As Prescribed"}
      </td>
      <td style="padding: 10px 8px; font-size: 12px; color: #6E5C6E;">
        ${m.duration || "-"}
      </td>
      <td style="padding: 10px 8px; font-size: 13px; font-weight: 700; color: #2D242D; text-align: center;">
        ${m.quantity || 1}
      </td>
    </tr>
  `).join("");

  const bodyHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span class="badge-pill" style="display: inline-block; background-color: #EDE7F6; color: #512DA8; font-weight: 700; font-size: 11px; padding: 4px 14px; border-radius: 9999px; text-transform: uppercase;">
        ${emailIcons.pill("#512DA8", 13)} Medicine Order Request
      </span>
      <h2 style="font-family: Georgia, serif; font-size: 22px; color: #2D242D; margin: 12px 0 6px 0;">
        ${isPharmacy ? "New Prescription Request for Your Pharmacy" : "New Order Request Received"}
      </h2>
      <p style="font-size: 14px; color: #6E5C6E; margin: 0; line-height: 1.5;">
        ${isPharmacy 
          ? `Patient <strong>${data.patientName}</strong> has submitted an order request from their doctor consultation at <strong>${data.clinicName}</strong>.`
          : `A new medicine order request has been routed to <strong>${data.clinicName}</strong>.`}
      </p>
    </div>

    <!-- Call Verification Alert Notice -->
    <div style="background-color: #FFF9E6; border: 1px solid #FFE082; border-radius: 12px; padding: 14px 18px; margin-bottom: 22px;">
      <div style="font-weight: 700; font-size: 13px; color: #8D6E14; display: flex; align-items: center; gap: 6px;">
        ${emailIcons.phone("#8D6E14", 14)} Order Verification &amp; Fulfilment Workflow
      </div>
      <p style="font-size: 13px; color: #6D540A; margin: 6px 0 0 0; line-height: 1.5;">
        Please contact the patient via phone call to verify and confirm their ordered medicines before dispensing. Fulfilment or cancellation should be updated in the portal after speaking with the patient.
      </p>
    </div>

    <!-- Patient & Clinic Summary Card -->
    <div style="background-color: #FAF7F9; border: 1px solid #ECE4EB; border-radius: 14px; padding: 18px; margin-bottom: 22px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #8F7D8F; width: 35%;">${emailIcons.fileText("#8F7D8F", 13)} Request Ref:</td>
          <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #7A2E7A;">${data.orderNumber}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #8F7D8F;">${emailIcons.user("#8F7D8F", 13)} Patient Name:</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #2D242D;">${data.patientName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #8F7D8F;">${emailIcons.phone("#8F7D8F", 13)} Contact Phone:</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #2D242D;">
            <a href="tel:${data.patientPhone}" style="color: #7A2E7A; text-decoration: none;">${data.patientPhone}</a>
            <span style="font-size: 11px; font-weight: 600; color: #25D366; margin-left: 6px;">(Click to Call)</span>
          </td>
        </tr>
        ${data.patientEmail ? `
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #8F7D8F;">${emailIcons.mail("#8F7D8F", 13)} Patient Email:</td>
          <td style="padding: 6px 0; font-size: 13px; color: #2D242D;">${data.patientEmail}</td>
        </tr>
        ` : ""}
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #8F7D8F;">${emailIcons.mapPin("#8F7D8F", 13)} Assigned Clinic:</td>
          <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #2D242D;">${data.clinicName}</td>
        </tr>
        ${data.doctorName ? `
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #8F7D8F;">${emailIcons.user("#8F7D8F", 13)} Prescribing Doctor:</td>
          <td style="padding: 6px 0; font-size: 13px; color: #2D242D;">Dr. ${data.doctorName}</td>
        </tr>
        ` : ""}
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #8F7D8F;">${emailIcons.clock("#8F7D8F", 13)} Requested Time:</td>
          <td style="padding: 6px 0; font-size: 13px; color: #6E5C6E;">${timeStr}</td>
        </tr>
      </table>
    </div>

    <!-- Medicines Requested Table -->
    <div style="background-color: #ffffff; border: 1px solid #ECE4EB; border-radius: 14px; padding: 18px; margin-bottom: 24px;">
      <h3 style="font-size: 14px; font-weight: 700; color: #2D242D; margin: 0 0 12px 0;">
        Ordered Medicines (${data.medicines.length})
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="border-bottom: 2px solid #ECE4EB; text-align: left;">
            <th style="padding: 6px 8px; font-size: 11px; font-weight: 700; color: #8F7D8F; text-transform: uppercase;">Medicine</th>
            <th style="padding: 6px 8px; font-size: 11px; font-weight: 700; color: #8F7D8F; text-transform: uppercase;">Dosage / Freq</th>
            <th style="padding: 6px 8px; font-size: 11px; font-weight: 700; color: #8F7D8F; text-transform: uppercase;">Duration</th>
            <th style="padding: 6px 8px; font-size: 11px; font-weight: 700; color: #8F7D8F; text-transform: uppercase; text-align: center;">Qty</th>
          </tr>
        </thead>
        <tbody>
          ${medicinesRows}
        </tbody>
      </table>
    </div>

    <!-- Call to Actions -->
    <div style="text-align: center; margin-bottom: 16px;">
      <a href="tel:${data.patientPhone}" 
         style="display: inline-block; background-color: #10B981; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 12px 26px; text-decoration: none; border-radius: 9999px; margin-right: 8px; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);">
        ${emailIcons.phone("#ffffff", 14)} Call Patient Now
      </a>
      <a href="${portalUrl}" 
         style="display: inline-block; background-color: #7A2E7A; color: #ffffff !important; font-weight: 700; font-size: 14px; padding: 12px 26px; text-decoration: none; border-radius: 9999px; box-shadow: 0 2px 8px rgba(122, 46, 122, 0.25);">
        Open Order Panel &rarr;
      </a>
    </div>

    <p style="font-size: 12px; color: #8F7D8F; text-align: center; margin: 16px 0 0 0;">
      Notification routed to ${isPharmacy ? "the clinic pharmacy panel" : "central clinic administration"}.
    </p>
  `;

  return {
    subject,
    html: wrapEmailLayout({
      title: subject,
      previewText: `New Medicine Order Request from ${data.patientName} for ${data.clinicName}`,
      bodyHtml,
    }),
  };
}

