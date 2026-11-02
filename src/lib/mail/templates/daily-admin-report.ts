import { wrapEmailLayout } from "./layout";

export interface DailyReportAppointment {
  patientName: string;
  patientPhone?: string;
  doctorName: string;
  date: string;
  time: string;
  type: string;
  serviceName?: string;
  paymentStatus?: string;
  feeAmount?: number;
}

export interface DailyReportOrder {
  orderNumber: string;
  patientName: string;
  phone: string;
  itemsCount: number;
  itemsSummary: string;
  totalAmount: number;
  paymentMethod?: string;
  address: string;
}

export interface DailyReportPatient {
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
}

export interface DailyReportInquiry {
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface DailyAdminReportData {
  reportDate: string; // e.g. "Saturday, 31 October 2026"
  tomorrowsDate: string;
  stats: {
    totalBookingsToday: number;
    tomorrowsAppointmentsCount: number;
    totalOrdersToday: number;
    totalOrderRevenueToday: number;
    newPatientsCount: number;
    inquiriesCount: number;
  };
  tomorrowsSchedule: DailyReportAppointment[];
  todayBookings: DailyReportAppointment[];
  todayOrders: DailyReportOrder[];
  todayPatients: DailyReportPatient[];
  todayInquiries: DailyReportInquiry[];
}

export function generateDailyAdminReportEmail(data: DailyAdminReportData): { subject: string; html: string } {
  // 1. Tomorrow's Schedule Rows
  const tomorrowsRows = data.tomorrowsSchedule.length > 0 ? data.tomorrowsSchedule.map(apt => `
    <tr>
      <td style="padding: 10px 8px; border-bottom: 1px solid #ECE4EB; font-size: 13px; font-weight: 700; color: #2D242D;">
        ⏰ ${apt.time}
      </td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #ECE4EB; font-size: 13px; color: #2D242D;">
        <strong>${apt.patientName}</strong>
        ${apt.patientPhone ? `<br><a href="tel:${apt.patientPhone}" style="color: #7A2E7A; text-decoration: none; font-size: 11px;">📞 +91 ${apt.patientPhone}</a>` : ""}
      </td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #ECE4EB; font-size: 13px; color: #2D242D;">
        Dr. ${apt.doctorName}
        ${apt.serviceName ? `<br><span style="font-size: 11px; color: #8F7D8F;">${apt.serviceName}</span>` : ""}
      </td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #ECE4EB; font-size: 12px; font-weight: 600; text-align: right;">
        <span style="display: inline-block; padding: 2px 8px; border-radius: 6px; font-size: 11px; ${apt.type === 'Video' ? 'background: #E0F2FE; color: #0369A1;' : 'background: #F3E8FF; color: #6B21A8;'}">
          ${apt.type === 'Video' ? '💻 Video' : '🏥 In-Clinic'}
        </span>
      </td>
    </tr>
  `).join("") : `
    <tr>
      <td colspan="4" style="padding: 16px; text-align: center; color: #8F7D8F; font-size: 12px;">
        No consultations scheduled yet for tomorrow.
      </td>
    </tr>
  `;

  // 2. Pharmacy Orders Rows
  const ordersRows = data.todayOrders.length > 0 ? data.todayOrders.map(order => `
    <tr>
      <td style="padding: 10px 8px; border-bottom: 1px solid #ECE4EB; font-size: 12px; font-family: monospace; font-weight: 700; color: #7A2E7A;">
        ${order.orderNumber}
      </td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #ECE4EB; font-size: 13px; color: #2D242D;">
        <strong>${order.patientName}</strong>
        <br><span style="font-size: 11px; color: #6E5C6E;">📞 +91 ${order.phone}</span>
        <br><span style="font-size: 11px; color: #8F7D8F;">📍 ${order.address}</span>
      </td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #ECE4EB; font-size: 12px; color: #6E5C6E;">
        ${order.itemsSummary}
      </td>
      <td style="padding: 10px 8px; border-bottom: 1px solid #ECE4EB; font-size: 13px; font-weight: 700; text-align: right; color: #2D242D;">
        ₹${order.totalAmount.toLocaleString()}
        <br><span style="font-size: 10px; font-weight: normal; color: ${order.paymentMethod === 'COD' ? '#D97706' : '#2E7D32'};">
          ${order.paymentMethod === 'COD' ? 'COD' : 'Paid Online'}
        </span>
      </td>
    </tr>
  `).join("") : `
    <tr>
      <td colspan="4" style="padding: 16px; text-align: center; color: #8F7D8F; font-size: 12px;">
        No medicine delivery orders received today.
      </td>
    </tr>
  `;

  // 3. New Patients List
  const patientsHtml = data.todayPatients.length > 0 ? `
    <div style="background-color: #FAF7F9; border-radius: 12px; padding: 14px 16px; margin-bottom: 24px;">
      <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #2D242D; text-transform: uppercase; letter-spacing: 0.5px;">
        👤 New Registered Patients (${data.todayPatients.length})
      </h4>
      <div style="font-size: 12px; color: #6E5C6E; line-height: 1.8;">
        ${data.todayPatients.map(p => `&bull; <strong>${p.name}</strong> (${p.phone ? `+91 ${p.phone}` : p.email})`).join("<br>")}
      </div>
    </div>
  ` : "";

  // 4. Inquiries List
  const inquiriesHtml = data.todayInquiries.length > 0 ? `
    <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #92400E; text-transform: uppercase; letter-spacing: 0.5px;">
        💬 Website Inquiries Received Today (${data.todayInquiries.length})
      </h4>
      ${data.todayInquiries.map(inq => `
        <div style="border-bottom: 1px solid #FCD34D; padding: 8px 0; font-size: 12px; line-height: 1.5;">
          <strong>${inq.name}</strong> (<a href="mailto:${inq.email}" style="color: #92400E;">${inq.email}</a>):<br>
          <em>"${inq.subject}"</em> &mdash; ${inq.message}
        </div>
      `).join("")}
    </div>
  ` : "";

  const bodyHtml = `
    <!-- Top Report Greeting -->
    <div style="text-align: center; margin-bottom: 24px;">
      <span class="badge-pill" style="display: inline-block; background-color: #F4ECF4; color: #7A2E7A; font-weight: 700; font-size: 11px; padding: 4px 14px; border-radius: 9999px; text-transform: uppercase;">
        Daily Executive Summary
      </span>
      <h2 style="font-family: Georgia, serif; font-size: 24px; color: #2D242D; margin: 10px 0 4px 0;">
        Kelkar Manas Daily Clinic Report
      </h2>
      <p style="font-size: 13px; color: #8F7D8F; margin: 0;">
        ${data.reportDate} &bull; Generated for <strong>kelkarmanashealthcare@gmail.com</strong>
      </p>
    </div>

    <!-- 4-Pillar Executive KPI Bar -->
    <div style="margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: separate; border-spacing: 8px;">
        <tr>
          <td style="background-color: #FAF7F9; border: 1px solid #ECE4EB; border-radius: 12px; padding: 14px 10px; text-align: center; width: 25%;">
            <span style="font-size: 22px; font-weight: 700; color: #7A2E7A; display: block;">${data.stats.totalBookingsToday}</span>
            <span style="font-size: 10px; color: #8F7D8F; text-transform: uppercase; font-weight: 600;">Booked Today</span>
          </td>
          <td style="background-color: #FAF7F9; border: 1px solid #ECE4EB; border-radius: 12px; padding: 14px 10px; text-align: center; width: 25%;">
            <span style="font-size: 22px; font-weight: 700; color: #2E7D32; display: block;">${data.stats.tomorrowsAppointmentsCount}</span>
            <span style="font-size: 10px; color: #8F7D8F; text-transform: uppercase; font-weight: 600;">Tomorrow's Appts</span>
          </td>
          <td style="background-color: #FAF7F9; border: 1px solid #ECE4EB; border-radius: 12px; padding: 14px 10px; text-align: center; width: 25%;">
            <span style="font-size: 22px; font-weight: 700; color: #0284C7; display: block;">${data.stats.totalOrdersToday}</span>
            <span style="font-size: 10px; color: #8F7D8F; text-transform: uppercase; font-weight: 600;">Rx Orders (₹${data.stats.totalOrderRevenueToday.toLocaleString()})</span>
          </td>
          <td style="background-color: #FAF7F9; border: 1px solid #ECE4EB; border-radius: 12px; padding: 14px 10px; text-align: center; width: 25%;">
            <span style="font-size: 22px; font-weight: 700; color: #D97706; display: block;">${data.stats.newPatientsCount}</span>
            <span style="font-size: 10px; color: #8F7D8F; text-transform: uppercase; font-weight: 600;">New Patients</span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Section 1: Tomorrow's Appointments Schedule -->
    <div style="margin-bottom: 28px;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #7A2E7A; padding-bottom: 6px; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 15px; color: #2D242D; font-family: Georgia, serif;">
          📅 Tomorrow's Scheduled Sessions (${data.tomorrowsDate})
        </h3>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="font-size: 11px; text-transform: uppercase; color: #8F7D8F; border-bottom: 1px solid #ECE4EB; text-align: left;">
            <th style="padding: 6px 8px;">Time</th>
            <th style="padding: 6px 8px;">Patient</th>
            <th style="padding: 6px 8px;">Doctor</th>
            <th style="padding: 6px 8px; text-align: right;">Mode</th>
          </tr>
        </thead>
        <tbody>
          ${tomorrowsRows}
        </tbody>
      </table>
    </div>

    <!-- Section 2: Pharmacy Medicine Deliveries Placed Today -->
    <div style="margin-bottom: 28px;">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #7A2E7A; padding-bottom: 6px; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 15px; color: #2D242D; font-family: Georgia, serif;">
          💊 Pharmacy Deliveries Received Today (${data.todayOrders.length})
        </h3>
      </div>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="font-size: 11px; text-transform: uppercase; color: #8F7D8F; border-bottom: 1px solid #ECE4EB; text-align: left;">
            <th style="padding: 6px 8px;">Order Ref</th>
            <th style="padding: 6px 8px;">Recipient & Destination</th>
            <th style="padding: 6px 8px;">Medications</th>
            <th style="padding: 6px 8px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${ordersRows}
        </tbody>
      </table>
    </div>

    <!-- Section 3 & 4: New Patients & Inquiries -->
    ${patientsHtml}
    ${inquiriesHtml}

    <!-- Call to Action -->
    <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #ECE4EB;">
      <a href="https://kelkarmanas.com/admin/dashboard" class="btn-primary" style="display: inline-block; background-color: #7A2E7A; color: #ffffff; font-weight: 600; font-size: 13px; padding: 12px 30px; text-decoration: none; border-radius: 9999px;">
        Open Clinic Admin Dashboard &rarr;
      </a>
      <p style="margin: 10px 0 0 0; font-size: 11px; color: #8F7D8F;">
        Automated executive digest generated daily by Kelkar Manas Health Care Portal.
      </p>
    </div>
  `;

  return {
    subject: `Daily Clinic Report: ${data.reportDate} [${data.stats.totalBookingsToday} Bookings | ${data.stats.totalOrdersToday} Rx Orders]`,
    html: wrapEmailLayout({
      title: `Daily Clinic Report - ${data.reportDate}`,
      previewText: `Daily summary for ${data.reportDate}: ${data.stats.totalBookingsToday} new appointments, ${data.stats.totalOrdersToday} medicine delivery orders, and ${data.stats.tomorrowsAppointmentsCount} sessions scheduled for tomorrow.`,
      bodyHtml,
    }),
  };
}
