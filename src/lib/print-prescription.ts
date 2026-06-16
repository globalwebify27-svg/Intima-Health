export function printPrescription(consultation: any) {
  let doctorName = consultation.doctorId?.name || "Practitioner";
  // Remove duplicate "Dr." prefix if already present
  doctorName = doctorName.replace(/^(Dr\.\s*)+/i, "");
  
  const doctorSpecialization = consultation.doctorId?.specialization || "General Medicine";
  const patientName = consultation.patientId?.name || "Patient";
  const patientGender = consultation.patientId?.gender || "N/A";
  const patientDob = consultation.patientId?.dob ? new Date(consultation.patientId.dob).toLocaleDateString() : "N/A";
  const dateStr = new Date(consultation.createdAt).toLocaleDateString();
  const rxNumber = consultation._id ? consultation._id.substring(18).toUpperCase() : "N/A";

  let meds: any[] = [];
  try {
    meds = JSON.parse(consultation.prescriptionSummary || "[]");
  } catch (e) {
    meds = [];
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to download/print the prescription.");
    return;
  }

  const medicinesHtml = meds.map((med: any) => `
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 10px 4px; font-weight: bold; color: #0f172a; font-size: 13px;">${med.drug}</td>
      <td style="padding: 10px 4px; color: #475569; font-size: 13px;">${med.dosage}</td>
      <td style="padding: 10px 4px; color: #475569; font-size: 13px;">${med.frequency}</td>
      <td style="padding: 10px 4px; text-align: right; color: #0f172a; font-weight: 600; font-size: 13px;">${med.duration}</td>
    </tr>
  `).join("");

  const htmlContent = `
    <html>
      <head>
        <title>Rx Prescription - ${rxNumber}</title>
        <style>
          @page {
            size: portrait;
            margin: 12mm 15mm;
          }
          @media print {
            body { 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact;
            }
            .btn-print {
              display: none !important;
            }
          }
          body {
            font-family: system-ui, -apple-system, sans-serif;
            color: #1e293b;
            line-height: 1.4;
            padding: 10px;
            margin: 0 auto;
            max-width: 650px;
          }
          .btn-print {
            background-color: #7A2E7A;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 13px;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 4px 6px -1px rgba(122, 46, 122, 0.2);
            margin-bottom: 15px;
            transition: background 0.2s;
          }
          .btn-print:hover {
            background-color: #5E205E;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            border-bottom: 2px solid #7A2E7A;
            padding-bottom: 12px;
            margin-bottom: 20px;
          }
          .brand {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.025em;
          }
          .brand span {
            color: #7A2E7A;
          }
          .brand-sub {
            font-size: 10px;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-top: 2px;
          }
          .rx-header-title {
            font-size: 22px;
            font-weight: 900;
            color: #7A2E7A;
            letter-spacing: 0.05em;
            margin: 0;
            text-align: right;
          }
          .meta-container {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 14px;
            margin-bottom: 20px;
            background: #f8fafc;
            display: grid;
            grid-template-columns: 1.2fr 1fr;
            gap: 12px;
          }
          .meta-item {
            font-size: 12px;
          }
          .meta-label {
            font-size: 9px;
            font-weight: 800;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.05em;
            margin-bottom: 2px;
          }
          .meta-val {
            font-weight: bold;
            color: #0f172a;
          }
          .rx-symbol {
            font-size: 32px;
            font-weight: bold;
            color: #7A2E7A;
            font-family: Georgia, serif;
            margin-bottom: 8px;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background-color: #f1f5f9;
            color: #475569;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 10px;
            letter-spacing: 0.05em;
            text-align: left;
            padding: 8px 4px;
            border-bottom: 1.5px solid #cbd5e1;
          }
          .footer {
            margin-top: 60px;
            border-top: 1px solid #e2e8f0;
            padding-top: 14px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .signature-box {
            text-align: center;
            width: 180px;
          }
          .signature-line {
            border-bottom: 1.5px solid #94a3b8;
            margin-bottom: 4px;
            height: 35px;
          }
          .signature-title {
            font-size: 10px;
            font-weight: bold;
            color: #475569;
          }
        </style>
      </head>
      <body>
        <div style="text-align: right;">
          <button class="btn-print" onclick="window.print()">Print Prescription</button>
        </div>
        
        <div class="header">
          <div>
            <div class="brand">Intima<span>Health</span></div>
            <div class="brand-sub">Sexual & Reproductive Wellness Clinic</div>
          </div>
          <div>
            <h1 class="rx-header-title">PRESCRIPTION</h1>
            <div style="font-size: 10px; font-weight: bold; color: #64748b; margin-top: 2px; text-align: right;">Rx #${rxNumber}</div>
          </div>
        </div>

        <div class="meta-container">
          <div class="meta-item">
            <div class="meta-label">Doctor Information</div>
            <div class="meta-val">Dr. ${doctorName}</div>
            <div style="color: #64748b; font-size: 11px; font-weight: 500; margin-top: 1px;">${doctorSpecialization}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Patient Information</div>
            <div class="meta-val">${patientName}</div>
            <div style="color: #64748b; font-size: 11px; font-weight: 500; margin-top: 1px;">Gender: ${patientGender} | DOB: ${patientDob}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Date Prescribed</div>
            <div class="meta-val">${dateStr}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Refills Authorized</div>
            <div class="meta-val">Refills as indicated</div>
          </div>
        </div>

        <div class="rx-symbol">R<sub>x</sub></div>

        <table>
          <thead>
            <tr>
              <th style="width: 45%;">Medicine Name</th>
              <th style="width: 15%;">Dosage</th>
              <th style="width: 25%;">Frequency</th>
              <th style="width: 15%; text-align: right;">Duration</th>
            </tr>
          </thead>
          <tbody>
            ${medicinesHtml || `<tr><td colspan="4" style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">No medications prescribed.</td></tr>`}
          </tbody>
        </table>

        <div class="footer">
          <div style="font-size: 10px; color: #94a3b8; max-width: 320px; line-height: 1.3;">
            This document is a digitally signed digital health prescription. For any clarifications, please contact the prescribing clinic directly.
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-title">Dr. ${doctorName}</div>
            <div style="font-size: 9px; color: #94a3b8;">Authorized Signatory</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
