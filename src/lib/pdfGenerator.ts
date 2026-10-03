import PDFDocument from 'pdfkit';
import path from 'path';

export interface InvoiceData {
  patientName: string;
  doctorName: string;
  clinicName: string;
  date: string;
  time: string;
  amount: string;
  paymentId: string;
  paymentMethod: string;
}

export function generateInvoicePdf(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Add Logo
      const logoPath = path.join(process.cwd(), 'public', 'logo.png');
      try {
        doc.image(logoPath, 50, 45, { width: 120 });
      } catch (e) {
        // Fallback if logo not found
        doc.fontSize(20).text(data.clinicName, 50, 45);
      }
      
      doc.fillColor('#444444')
         .fontSize(20)
         .text('INVOICE', 50, 150)
         .fontSize(10)
         .text(`Invoice Number: INV-${Math.floor(Math.random() * 100000)}`, 50, 175)
         .text(`Date: ${new Date().toLocaleDateString()}`, 50, 190)
         .text(`Payment ID: ${data.paymentId}`, 50, 205);

      // Add a line
      doc.moveTo(50, 230).lineTo(550, 230).stroke();

      // Patient details
      doc.fontSize(12).fillColor('#000000').text('Billed To:', 50, 250);
      doc.fontSize(10).fillColor('#444444')
         .text(`Patient: ${data.patientName}`, 50, 265)
         .text(`Doctor: ${data.doctorName}`, 50, 280)
         .text(`Clinic: ${data.clinicName}`, 50, 295);

      // Appointment details
      doc.fontSize(12).fillColor('#000000').text('Appointment Details:', 300, 250);
      doc.fontSize(10).fillColor('#444444')
         .text(`Date: ${data.date}`, 300, 265)
         .text(`Time: ${data.time}`, 300, 280)
         .text(`Method: ${data.paymentMethod}`, 300, 295);

      // Add a line
      doc.moveTo(50, 330).lineTo(550, 330).stroke();

      // Itemized
      doc.fontSize(12).fillColor('#000000')
         .text('Description', 50, 350)
         .text('Amount', 450, 350, { width: 100, align: 'right' });
         
      doc.moveTo(50, 370).lineTo(550, 370).stroke();

      doc.fontSize(10).fillColor('#444444')
         .text('Medical Consultation', 50, 390)
         .text(`Rs. ${data.amount}`, 450, 390, { width: 100, align: 'right' });

      doc.moveTo(50, 420).lineTo(550, 420).stroke();

      // Total
      doc.fontSize(14).fillColor('#000000')
         .text('Total Paid', 300, 440, { width: 100, align: 'right' })
         .text(`Rs. ${data.amount}`, 450, 440, { width: 100, align: 'right' });

      // Footer
      doc.fontSize(10).fillColor('#888888')
         .text('Thank you for choosing Kelkar Manas Health Clinic.', 50, 700, { align: 'center', width: 500 });

      doc.end();
    } catch (e) {
      reject(e);
    }
  });
}
