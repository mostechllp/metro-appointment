require('dotenv').config()
const sgMail = require('@sendgrid/mail');
const { generateCertificate } = require('./certificateGenerator');


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendCertificateEmail(registration, event) {
  try {
    const pdfBuffer = await generateCertificate(registration.name, event);
    
    const msg = {
      to: registration.email,
      from: process.env.SENDER_EMAIL,
      subject: `Your Certificate: ${event.title}`,
      text: `Dear ${registration.name},\n\nThank you for attending ${event.title}. Please find your certificate attached.\n\nBest,\nMetro Starcare Medical Centre`,
      attachments: [
        {
          content: pdfBuffer.toString('base64'),
          filename: 'Certificate.pdf',
          type: 'application/pdf',
          disposition: 'attachment',
        },
      ],
    };

    await sgMail.send(msg);
    return true;
  } catch (error) {
    console.error('SendGrid Error:', error);
    return false;
  }
}

module.exports = { sendCertificateEmail };