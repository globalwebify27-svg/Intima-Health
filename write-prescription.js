const fs = require('fs');

const content = `export function printPrescription(consultation: any) {
  let doctorName = consultation.doctorId?.name || "Practitioner";
  doctorName = doctorName.replace(/^(Dr\\.\\s*)+/i, "");
  
  const doctorSpecialization = consultation.doctorId?.specialization || "General Medicine";
  const doctorQualifications = consultation.doctorId?.qualifications?.join(", ") || "";
  const doctorRegNumber = consultation.doctorId?.registrationNumber || "";
  
  const clinicName = consultation.clinicId?.name || "Kelkar Manas Healthcare Pvt. Ltd";
  const clinicAddress = consultation.clinicId?.address || "P294+H8J, Ramdas Peth, Akola, Maharashtra 444001";
  const clinicPhone = consultation.clinicId?.phone || "";
  const clinicEmail = consultation.clinicId?.email || "";

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

  const medicinesHtml = meds.map((med: any) => \`
    <tr style="border-bottom: 1px solid #e2e8f0;">
      <td style="padding: 12px 8px; font-weight: bold; color: #0f172a; font-size: 13px;">\${med.drug}</td>
      <td style="padding: 12px 8px; color: #475569; font-size: 13px;">\${med.dosage}</td>
      <td style="padding: 12px 8px; color: #475569; font-size: 13px;">\${med.frequency}</td>
      <td style="padding: 12px 8px; text-align: right; color: #0f172a; font-weight: 600; font-size: 13px;">\${med.duration} Days</td>
    </tr>
  \`).join("");

  const htmlContent = \\\`
    <html>
      <head>
        <title>Rx Prescription - \${rxNumber}</title>
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
            max-width: 700px;
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
            align-items: flex-start;
            border-bottom: 3px solid #7A2E7A;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .brand-logo img {
            height: 75px;
            width: auto;
            margin-bottom: 5px;
          }
          .doctor-info {
            text-align: right;
          }
          .doc-name {
            font-size: 22px;
            font-weight: 900;
            color: #7A2E7A;
            letter-spacing: 0.02em;
          }
          .doc-qualifications, .doc-specialization, .doc-reg {
            font-size: 12px;
            color: #475569;
            margin-top: 2px;
          }
          .doc-specialization {
            font-weight: 700;
            color: #0f172a;
          }
          
          .meta-container {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 25px;
            background: #f8fafc;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .meta-item {
            font-size: 13px;
          }
          .meta-label {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            color: #7A2E7A;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
          }
          .meta-val {
            font-weight: bold;
            color: #0f172a;
            font-size: 14px;
          }
          .meta-sub {
            color: #64748b;
            font-size: 11px;
            font-weight: 500;
            margin-top: 2px;
          }
          
          .rx-symbol {
            font-size: 36px;
            font-weight: bold;
            color: #7A2E7A;
            font-family: Georgia, serif;
            margin-bottom: 15px;
          }
          
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          th {
            background-color: #f1f5f9;
            color: #475569;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.05em;
            text-align: left;
            padding: 10px 8px;
            border-bottom: 2px solid #cbd5e1;
          }
          
          .footer {
            margin-top: 60px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .contact-info {
            font-size: 11px;
            color: #64748b;
            max-width: 350px;
            line-height: 1.5;
          }
          .contact-info strong {
            color: #334155;
            font-size: 12px;
          }
          .emergency-alert {
            margin-top: 10px;
            color: #ef4444;
            font-weight: 600;
            font-size: 10px;
            background: #fef2f2;
            padding: 6px 10px;
            border-radius: 6px;
            display: inline-block;
          }
          
          .signature-box {
            text-align: center;
            width: 180px;
          }
          .signature-line {
            border-bottom: 1.5px solid #94a3b8;
            margin-bottom: 6px;
            height: 40px;
          }
          .signature-title {
            font-size: 12px;
            font-weight: bold;
            color: #0f172a;
          }
          .signature-sub {
            font-size: 10px;
            color: #94a3b8;
          }
        </style>
      </head>
      <body>
        <div style="text-align: right;">
          <button class="btn-print" onclick="window.print()">Print Prescription</button>
        </div>
        
        <div class="header">
          <div class="brand-logo">
            <img src="/logo.png" alt="\${clinicName}" />
          </div>
          <div class="doctor-info">
            <div class="doc-name">DR. \${doctorName.toUpperCase()}</div>
            <div class="doc-specialization">\${doctorSpecialization}</div>
            \${doctorQualifications ? \`<div class="doc-qualifications">\${doctorQualifications}</div>\` : ''}
            \${doctorRegNumber ? \`<div class="doc-reg">Reg. No: \${doctorRegNumber}</div>\` : ''}
          </div>
        </div>
        
        <div class="meta-container">
          <div class="meta-item">
            <div class="meta-label">Patient Details</div>
            <div class="meta-val">\${patientName}</div>
            <div class="meta-sub">Gender: \${patientGender} &nbsp;|&nbsp; DOB: \${patientDob}</div>
          </div>
          <div class="meta-item" style="text-align: right;">
            <div class="meta-label">Prescription Meta</div>
            <div class="meta-val">ID: \${rxNumber}</div>
            <div class="meta-sub">Date Prescribed: \${dateStr}</div>
          </div>
        </div>

        <div class="rx-symbol">R<sub>x</sub></div>

        <table>
          <thead>
            <tr>
              <th style="width: 40%;">Medicine Name</th>
              <th style="width: 20%;">Dosage</th>
              <th style="width: 20%;">Frequency</th>
              <th style="width: 20%; text-align: right;">Duration</th>
            </tr>
          </thead>
          <tbody>
            \${medicinesHtml || \`<tr><td colspan="4" style="text-align: center; padding: 25px; color: #94a3b8; font-size: 13px; font-style: italic;">No medications prescribed.</td></tr>\`}
          </tbody>
        </table>

        <div class="footer">
          <div class="contact-info">
            <strong>\${clinicName}</strong><br/>
            \${clinicAddress}<br/>
            \${clinicPhone ? \`Phone: \${clinicPhone} | \` : ''}\${clinicEmail ? \`Email: \${clinicEmail}\` : ''}
            <div class="emergency-alert">
              In case of emergency, please contact the nearest hospital casualty.
            </div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-title">Dr. \${doctorName}</div>
            <div class="signature-sub">Authorized Signatory</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          }
        </script>
      </body>
    </html>
  \\\`;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
`;
fs.writeFileSync('src/lib/print-prescription.ts', content);
