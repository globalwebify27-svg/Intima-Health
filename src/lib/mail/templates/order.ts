import { wrapEmailLayout } from "./layout";
import { emailIcons } from "./icons";

export interface OrderEmailItem {
  name: string;
  quantity: number;
  price: number;
  dosage?: string;
  isPrescription?: boolean;
}

export interface OrderEmailData {
  orderNumber: string;
  patientName: string;
  phone: string;
  receiverName?: string;
  receiverPhone?: string;
  items: OrderEmailItem[];
  itemsSubtotal: number;
  taxAmount: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: string;
  shippingAddress: string;
  estimatedDelivery?: string;
}

export function generateOrderCustomerEmail(data: OrderEmailData): { subject: string; html: string } {
  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #ECE4EB; font-size: 13px; color: #2D242D;">
        <strong>${item.name}</strong>
        ${item.dosage ? `<br><span style="font-size: 11px; color: #8F7D8F;">Dosage: ${item.dosage}</span>` : ""}
        ${item.isPrescription ? `<br><span style="font-size: 10px; color: #D97706; font-weight: bold;">(Doctor Rx Verified)</span>` : ""}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #ECE4EB; font-size: 13px; text-align: center; color: #6E5C6E;">
        ${item.quantity}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #ECE4EB; font-size: 13px; text-align: right; font-weight: 600; color: #2D242D;">
        ₹${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `).join("");

  const bodyHtml = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span class="badge-pill" style="display: inline-block; background-color: #E8F5E9; color: #2E7D32; font-weight: 700; font-size: 11px; padding: 4px 14px; border-radius: 9999px; text-transform: uppercase;">
        ${emailIcons.truck("#2E7D32", 14)} Medicine Order Placed
      </span>
      <h2 style="font-family: Georgia, serif; font-size: 22px; color: #2D242D; margin: 12px 0 6px 0;">
        Dear ${data.patientName},
      </h2>
      <p style="font-size: 14px; color: #6E5C6E; margin: 0; line-height: 1.5;">
        Thank you for ordering your prescribed medicines with Kelkar Manas Health Care. Your order is registered and has been forwarded to our licensed dispensary partner for express dispatch.
      </p>
    </div>

    <!-- Order Summary Header -->
    <div style="background-color: #FAF7F9; border: 1px solid #ECE4EB; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
        <tr>
          <td style="color: #8F7D8F;">Order Reference:</td>
          <td style="font-weight: 700; font-family: monospace; text-align: right; color: #2D242D;">${data.orderNumber}</td>
        </tr>
        <tr>
          <td style="padding-top: 6px; color: #8F7D8F;">Payment Method:</td>
          <td style="padding-top: 6px; font-weight: 600; text-align: right; color: #7A2E7A;">
            ${data.paymentMethod === "COD" ? "Pay on Delivery (Cash/UPI)" : "Prepaid Online (Razorpay)"}
          </td>
        </tr>
        <tr>
          <td style="padding-top: 6px; color: #8F7D8F;">Delivery Contact:</td>
          <td style="padding-top: 6px; font-weight: 600; text-align: right; color: #2D242D;">+91 ${data.phone}</td>
        </tr>
      </table>
    </div>

    <!-- Medicines Table -->
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
      <thead>
        <tr style="border-bottom: 2px solid #ECE4EB; text-align: left; font-size: 11px; color: #8F7D8F; text-transform: uppercase; letter-spacing: 0.5px;">
          <th style="padding-bottom: 8px;">Medicine</th>
          <th style="padding-bottom: 8px; text-align: center;">Qty</th>
          <th style="padding-bottom: 8px; text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <!-- Pricing Summary -->
    <div style="background-color: #FAF7F9; border-radius: 12px; padding: 16px; margin-bottom: 24px; font-size: 13px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 4px 0; color: #6E5C6E;">Medicines Subtotal:</td>
          <td style="padding: 4px 0; text-align: right; font-weight: 600;">₹${data.itemsSubtotal.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6E5C6E;">Applicable GST (12%):</td>
          <td style="padding: 4px 0; text-align: right; font-weight: 600;">₹${data.taxAmount.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; color: #6E5C6E;">Local Express Delivery:</td>
          <td style="padding: 4px 0; text-align: right; font-weight: 600; color: ${data.deliveryCharge === 0 ? "#2E7D32" : "#2D242D"};">
            ${data.deliveryCharge === 0 ? "FREE" : `₹${data.deliveryCharge.toLocaleString()}`}
          </td>
        </tr>
        <tr style="border-top: 2px solid #ECE4EB;">
          <td style="padding: 10px 0 0 0; font-weight: 700; font-size: 15px; color: #2D242D;">Total Payable:</td>
          <td style="padding: 10px 0 0 0; text-align: right; font-weight: 700; font-size: 18px; color: #7A2E7A;">
            ₹${data.totalAmount.toLocaleString()}
          </td>
        </tr>
      </table>
    </div>

    <!-- Shipping Address -->
    <div style="background-color: #ffffff; border: 1px solid #ECE4EB; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
      <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #2D242D;">${emailIcons.mapPin("#7A2E7A", 14)} Shipping Address:</h4>
      <p style="margin: 0; font-size: 12px; color: #6E5C6E; line-height: 1.5;">
        ${data.shippingAddress}
      </p>
      ${data.receiverName ? `
      <p style="margin: 6px 0 0 0; font-size: 12px; color: #7A2E7A; font-weight: 600;">
        Receiver at Doorstep: <strong>${data.receiverName}</strong>${data.receiverPhone ? ` (+91 ${data.receiverPhone})` : ""}
      </p>
      ` : ""}
      <p style="margin: 6px 0 0 0; font-size: 11px; color: #8F7D8F;">
        Estimated Delivery: <strong>${data.estimatedDelivery || "Within 24 Hours (Akola Local Express)"}</strong>
      </p>
    </div>

    <!-- Action Link -->
    <div style="text-align: center; margin-bottom: 16px;">
      <a href="https://kelkarmanas.com/patient/orders" class="btn-primary" style="display: inline-block; background-color: #7A2E7A; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 32px; text-decoration: none; border-radius: 9999px;">
        Track Order Status &rarr;
      </a>
    </div>

    <p style="font-size: 11px; color: #8F7D8F; text-align: center; margin: 0; line-height: 1.5;">
      Medicines are verified by a registered pharmacist before dispatch and delivered in discreet packaging across Akola.
    </p>
  `;

  return {
    subject: `Order Confirmed: ${data.orderNumber} - Kelkar Manas Pharmacy`,
    html: wrapEmailLayout({
      title: "Medicine Order Confirmation",
      previewText: `Your medicine order ${data.orderNumber} (₹${data.totalAmount.toLocaleString()}) has been placed successfully.`,
      bodyHtml,
    }),
  };
}

