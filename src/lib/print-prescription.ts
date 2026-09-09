export function printPrescription(consultation: any) {
  let doctorName = consultation.doctorId?.name || "";
  doctorName = doctorName.replace(/^(Dr\.\s*)+/i, "");
  
  const doctorSpecialization = consultation.doctorId?.specialization || "";
  const doctorQualifications = consultation.doctorId?.qualifications?.join(", ") || "";
  const doctorRegNumber = consultation.doctorId?.registrationNumber || "";
  
  const clinic = consultation.appointmentId?.clinicId || {};
  const clinicName = clinic.name || "";
  
  // Combine address components dynamically based on schema structure
  const addressParts = [clinic.address, clinic.city, clinic.state].filter(Boolean);
  const clinicAddress = addressParts.join(", ") || "";
  
  const clinicPhone = clinic.phone || "";
  const clinicEmail = clinic.email || "";

  const patientName = consultation.patientId?.name || "";
  const patientGender = consultation.patientId?.gender || "";
  const patientDob = consultation.patientId?.dob ? new Date(consultation.patientId.dob).toLocaleDateString() : "";
  const dateStr = new Date(consultation.createdAt).toLocaleDateString();
  const rxNumber = consultation._id ? consultation._id.substring(18).toUpperCase() : "";

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

  const medicinesHtml = meds.map((med: any, idx: number) => `
    <tr style="border-bottom: 1px solid #f1f5f9;">
      <td style="padding: 14px 8px; font-weight: 600; color: #1e293b; font-size: 13px;">${idx + 1}. ${med.drug}</td>
      <td style="padding: 14px 8px; color: #475569; font-size: 13px;">${med.dosage}</td>
      <td style="padding: 14px 8px; color: #475569; font-size: 13px;">${med.frequency}</td>
      <td style="padding: 14px 8px; text-align: right; color: #1e293b; font-weight: 600; font-size: 13px;">${med.duration} Days</td>
    </tr>
  `).join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Prescription - ${rxNumber}</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet">
        <style>
          :root {
            --primary: #7A2E7A;
            --primary-light: #f5f0f5;
            --text-dark: #0f172a;
            --text-gray: #475569;
            --border-light: #e2e8f0;
          }
          @page {
            size: A4 portrait;
            margin: 0;
          }
          * {
            box-sizing: border-box;
          }
          @media print {
            body { 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact;
              background: white !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            .btn-print {
              display: none !important;
            }
            .page-container {
              border: none !important;
              box-shadow: none !important;
              margin: 0 !important;
              width: 100% !important;
              height: 296mm !important;
              padding: 15mm !important;
              overflow: hidden !important;
              page-break-after: avoid !important;
              page-break-inside: avoid !important;
            }
          }
          body {
            font-family: 'Inter', sans-serif;
            color: var(--text-dark);
            line-height: 1.5;
            margin: 0;
            padding: 0;
            background: #f8fafc;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            padding-top: 20px;
            padding-bottom: 20px;
          }
          .btn-print {
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: var(--primary);
            color: white;
            border: none;
            padding: 12px 24px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 4px 6px -1px rgba(122, 46, 122, 0.3);
            z-index: 1000;
            font-family: 'Inter', sans-serif;
            transition: all 0.2s ease;
          }
          .btn-print:hover {
            background-color: #5E205E;
            transform: translateY(-1px);
          }
          .page-container {
            width: 210mm;
            min-height: 297mm;
            background: white;
            padding: 15mm;
            position: relative;
            border: 1px solid #cbd5e1;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
          }
          
          /* Header Section */
          .header-grid {
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 20px;
            align-items: center;
            margin-bottom: 20px;
          }
          .brand-logo img {
            max-height: 60px;
            width: auto;
          }
          .doc-details {
            text-align: right;
          }
          .doc-name {
            font-size: 24px;
            font-weight: 800;
            color: var(--primary);
            letter-spacing: -0.5px;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          .doc-spec {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-dark);
          }
          .doc-creds {
            font-size: 11px;
            color: var(--text-gray);
            margin-top: 2px;
          }
          
          /* Border Separator */
          .border-separator {
            border-top: 2px solid var(--primary);
            border-bottom: 1px solid var(--primary);
            height: 4px;
            margin-bottom: 25px;
          }

          /* Patient Meta Banner */
          .meta-banner {
            background: var(--primary-light);
            border-radius: 8px;
            padding: 16px 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            margin-bottom: 30px;
          }
          .meta-block h4 {
            margin: 0 0 4px 0;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: var(--primary);
          }
          .meta-block p {
            margin: 0;
            font-size: 13px;
            color: var(--text-dark);
            font-weight: 500;
          }
          .meta-block .sub {
            font-size: 12px;
            color: var(--text-gray);
            margin-top: 2px;
            font-weight: 400;
          }

          /* Rx Symbol */
          .rx-symbol {
            font-family: 'Playfair Display', serif;
            font-size: 42px;
            font-weight: 700;
            color: var(--primary);
            margin-bottom: 20px;
            font-style: italic;
          }

          /* Table */
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
          }
          th {
            background-color: transparent;
            color: var(--text-gray);
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
            text-align: left;
            padding: 12px 8px;
            border-bottom: 2px solid var(--text-dark);
          }
          
          /* Footer positioning */
          .footer-wrapper {
            position: absolute;
            bottom: 15mm;
            left: 15mm;
            right: 15mm;
          }

          /* Signature */
          .signature-area {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 30px;
          }
          .signature-box {
            text-align: center;
            width: 200px;
          }
          .signature-line {
            border-bottom: 1px dashed var(--text-gray);
            height: 40px;
            margin-bottom: 8px;
          }
          .signature-name {
            font-size: 13px;
            font-weight: 700;
            color: var(--text-dark);
          }
          .signature-label {
            font-size: 10px;
            color: var(--text-gray);
          }

          /* Bottom Footer */
          .footer-bottom {
            border-top: 2px solid var(--primary);
            border-bottom: 1px solid var(--primary);
            padding: 12px 0;
            text-align: center;
          }
          .footer-text {
            font-size: 11px;
            color: var(--text-gray);
            line-height: 1.6;
          }
          .footer-text strong {
            color: var(--text-dark);
            font-size: 12px;
          }
          .emergency-notice {
            margin-top: 8px;
            color: #dc2626;
            font-weight: 600;
            font-size: 11px;
            letter-spacing: 0.5px;
          }
        </style>
      </head>
      <body>
        <button class="btn-print" onclick="window.print()">Print Prescription</button>
        
        <div class="page-container">
          
          <!-- Header -->
          <div class="header-grid">
            <div class="brand-logo">
              <img src="/logo.png" alt="Clinic Logo" onerror="this.style.display='none'" />
            </div>
            <div class="doc-details">
              <div class="doc-name">DR. ${doctorName}</div>
              ${doctorSpecialization ? `<div class="doc-spec">${doctorSpecialization}</div>` : ''}
              ${doctorQualifications ? `<div class="doc-creds">${doctorQualifications}</div>` : ''}
              ${doctorRegNumber ? `<div class="doc-creds">Reg. No: ${doctorRegNumber}</div>` : ''}
            </div>
          </div>

          <div class="border-separator"></div>

          <!-- Patient & Meta -->
          <div class="meta-banner">
            <div class="meta-block">
              <h4>Patient Details</h4>
              <p>${patientName}</p>
              <div class="sub">${patientGender ? `Gender: ${patientGender} | ` : ''}${patientDob ? `DOB: ${patientDob}` : ''}</div>
            </div>
            <div class="meta-block" style="text-align: right;">
              <h4>Prescription Info</h4>
              <p>ID: ${rxNumber}</p>
              <div class="sub">Date: ${dateStr}</div>
            </div>
          </div>

          <!-- Rx Body -->
          <div class="rx-symbol">Rx</div>

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
              ${medicinesHtml || `<tr><td colspan="4" style="text-align: center; padding: 40px; color: #94a3b8; font-size: 13px; font-style: italic;">No medications prescribed.</td></tr>`}
            </tbody>
          </table>

          <!-- Footer Wrapper -->
          <div class="footer-wrapper">
            
            <div class="signature-area">
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-name">Dr. ${doctorName}</div>
                <div class="signature-label">Authorized Signatory</div>
              </div>
            </div>

            <div class="footer-bottom">
              <div class="footer-text">
                <strong>${clinicName}</strong><br/>
                ${clinicAddress}<br/>
                ${clinicPhone ? `Phone: ${clinicPhone} | ` : ''}${clinicEmail ? `Email: ${clinicEmail}` : ''}
              </div>
              <div class="emergency-notice">
                IN CASE OF EMERGENCY, PLEASE CONTACT THE NEAREST HOSPITAL CASUALTY
              </div>
            </div>
            
          </div>

        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
