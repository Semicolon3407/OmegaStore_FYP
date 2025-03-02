const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data) => {
  // Create a transporter using Gmail's SMTP settings
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use 'service' instead of host and port for Gmail
    auth: {
      user: process.env.MAIL_ID, // Your Gmail address
      pass: process.env.MP,      // Your Google App Password
    },
  });

  // Send mail with defined transport object
  const info = await transporter.sendMail({
    from: `"Omega Store" <${process.env.MAIL_ID}>`, // Sender address
    to: data.to, // List of receivers
    subject: data.subject, // Subject line
    text: data.text, // Plain text body
    html: data.html, // HTML body
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
});

module.exports = sendEmail;
