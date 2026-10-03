export function printReceipt(appointment: any, receiptTitle: string = "Payment Receipt") {
  const appointmentId = appointment._id;
  const type = appointment.type;

  const patientName = appointment.patientId?.name || "Patient";
  const doctorName = appointment.doctorId?.name || "Doctor";
  const clinicName = appointment.clinicId?.name || "Kelkar Manas Health Clinic";

  const transactionId = appointment.transactionId || `TXN-${appointmentId.substring(0, 10).toUpperCase()}`;
  const paymentMethod = appointment.paymentMethod || (type === "Video" ? "Online" : "Cash");
  const feeAmount = appointment.feeAmount;

  const dateStr = appointment.date;
  const timeStr = appointment.time;

  const invoiceNumber = `INV-${Math.floor(Math.random() * 100000)}`;
  const invoiceDateStr = new Date().toLocaleDateString();

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Please allow popups to view the receipt.");
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice - ${appointmentId}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: Arial, sans-serif;
            background: #ffffff;
            padding: 50px;
            color: #222222;
          }
          .logo { margin-bottom: 30px; }
          .logo img { width: 140px; }
          .logo-fallback {
            font-size: 22px;
            font-weight: 700;
            color: #7c3aed;
          }
          h1 {
            font-size: 36px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 8px;
          }
          .meta {
            font-size: 13px;
            color: #444444;
            line-height: 1.8;
            margin-bottom: 30px;
          }
          hr {
            border: none;
            border-top: 1px solid #cccccc;
            margin: 24px 0;
          }
          .two-col {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .col h3 {
            font-size: 14px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 6px;
          }
          .col p {
            font-size: 13px;
            color: #444444;
            line-height: 1.8;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-top: 8px;
          }
          thead tr {
            border-top: 1px solid #cccccc;
            border-bottom: 1px solid #cccccc;
          }
          thead th {
            padding: 10px 0;
            text-align: left;
            font-weight: 700;
            color: #111827;
            font-size: 14px;
          }
          thead th:last-child { text-align: right; }
          tbody td {
            padding: 16px 0;
            color: #444444;
            font-size: 13px;
            border-bottom: 1px solid #cccccc;
          }
          tbody td:last-child { text-align: right; }
          .total-row {
            display: flex;
            justify-content: flex-end;
            align-items: baseline;
            gap: 60px;
            padding-top: 20px;
          }
          .total-label {
            font-size: 16px;
            font-weight: 700;
            color: #111827;
          }
          .total-value {
            font-size: 16px;
            font-weight: 700;
            color: #111827;
          }
          .footer {
            margin-top: 80px;
            font-size: 12px;
            color: #9ca3af;
            text-align: center;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="logo">
          <img src="/logo.png" onerror="this.style.display='none'; document.getElementById('logo-fallback').style.display='block';" />
          <div id="logo-fallback" class="logo-fallback" style="display:none">${clinicName}</div>
        </div>

        <h1>INVOICE</h1>
        <div class="meta">
          Invoice Number: ${invoiceNumber}<br/>
          Date: ${invoiceDateStr}<br/>
          Payment ID: ${transactionId}
        </div>

        <hr />

        <div class="two-col">
          <div class="col">
            <h3>Billed To:</h3>
            <p>
              Patient: ${patientName}<br/>
              Doctor: ${doctorName}<br/>
              Clinic: ${clinicName}
            </p>
          </div>
          <div class="col">
            <h3>Appointment Details:</h3>
            <p>
              Date: ${dateStr}<br/>
              Time: ${timeStr}<br/>
              Method: ${paymentMethod}
            </p>
          </div>
        </div>

        <hr />

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Medical Consultation</td>
              <td>Rs. ${feeAmount}</td>
            </tr>
          </tbody>
        </table>

        <hr />

        <div class="total-row">
          <span class="total-label">Total Paid</span>
          <span class="total-value">Rs. ${feeAmount}</span>
        </div>

        <div class="footer">
          Thank you for choosing ${clinicName}.
        </div>

        <script>
          window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 300); }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
