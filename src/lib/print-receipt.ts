export function printReceipt(appointment: any, receiptTitle: string = "Payment Receipt") {
  const appointmentId = appointment._id;
  const pStatus = appointment.paymentStatus || "Pending";
  const type = appointment.type;
  
  const patientName = appointment.patientId?.name || "Patient";
  const doctorName = appointment.doctorId?.name || "Doctor";
  const docNameFixed = doctorName.replace(/^(Dr\.\s*)+/i, "");
  
  const transactionId = appointment.transactionId || `TXN-${appointmentId.substring(0, 10).toUpperCase()}`;
  const paymentMethod = appointment.paymentMethod || (type === "Video" ? "Online" : "Cash");
  const collectedBy = appointment.collectedBy || (type === "Video" ? "System / Online" : "Clinic Manager");
  const feeAmount = appointment.feeAmount || (type === "Video" ? 999 : 1499);
  
  const dateStr = appointment.date;
  const timeStr = appointment.time;

  const paymentDateObj = appointment.updatedAt ? new Date(appointment.updatedAt) : new Date();
  const paymentDateStr = paymentDateObj.toLocaleDateString();
  const paymentTimeStr = paymentDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Please allow popups to view the receipt.");
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>${receiptTitle} - ${appointmentId}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
          body { 
            font-family: 'Inter', sans-serif; 
            padding: 40px; 
            color: #1a1a1a;
            background-color: #f9fafb;
            display: flex;
            justify-content: center;
            margin: 0;
          }
          .receipt-container {
            background: #ffffff;
            width: 100%;
            max-width: 500px;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01);
            border: 1px solid #f3f4f6;
          }
          .header { 
            text-align: center; 
            margin-bottom: 35px;
            padding-bottom: 25px;
            border-bottom: 2px dashed #e5e7eb;
          }
          .header h2 {
            margin: 0 0 6px 0;
            color: #7c3aed;
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.5px;
          }
          .header h3 {
            margin: 0;
            color: #6b7280;
            font-size: 13px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
          }
          .details-group {
            margin-bottom: 25px;
          }
          .group-title {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            color: #9ca3af;
            letter-spacing: 1px;
            margin-bottom: 12px;
            border-bottom: 1px solid #f3f4f6;
            padding-bottom: 4px;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 14px;
          }
          .detail-label {
            color: #6b7280;
            font-weight: 600;
          }
          .detail-value {
            font-weight: 600;
            color: #111827;
            text-align: right;
          }
          .amount-section { 
            padding-top: 25px; 
            border-top: 2px dashed #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .amount-label {
            font-size: 16px;
            font-weight: 700;
            color: #374151;
          }
          .amount-value {
            font-size: 28px;
            font-weight: 800;
            color: #10b981;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            line-height: 1.6;
          }
          @media print {
            body { background-color: #ffffff; padding: 0; }
            .receipt-container { box-shadow: none; border: none; padding: 20px; max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h2>Intima Health</h2>
            <h3>${receiptTitle}</h3>
          </div>
          
          <div class="details-group">
            <div class="group-title">Consultation Info</div>
            <div class="detail-row">
              <span class="detail-label">Receipt ID</span>
              <span class="detail-value">#REC-${appointmentId.slice(-6).toUpperCase()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Patient</span>
              <span class="detail-value">${patientName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Doctor</span>
              <span class="detail-value">Dr. ${docNameFixed}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Date & Time</span>
              <span class="detail-value">${dateStr} at ${timeStr}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Type</span>
              <span class="detail-value">${type}</span>
            </div>
          </div>

          <div class="details-group">
            <div class="group-title">Payment Details</div>
            <div class="detail-row">
              <span class="detail-label">Payment Date & Time</span>
              <span class="detail-value">${paymentDateStr} at ${paymentTimeStr}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Transaction ID</span>
              <span class="detail-value">${transactionId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Payment Mode</span>
              <span class="detail-value">${paymentMethod}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Collected By</span>
              <span class="detail-value">${collectedBy}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status</span>
              <span class="detail-value" style="color: #10b981;">${pStatus}</span>
            </div>
          </div>

          <div class="amount-section">
            <span class="amount-label">Total Paid</span>
            <span class="amount-value">₹${feeAmount}</span>
          </div>

          <div class="footer">
            Thank you for choosing Intima Health.<br>
            This is a computer-generated receipt and requires no signature.
          </div>
        </div>
        <script>
          window.onload = () => { setTimeout(() => { window.print(); window.close(); }, 300); }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
