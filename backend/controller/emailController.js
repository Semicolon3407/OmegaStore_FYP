const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const sendEmail = asyncHandler(async (data) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_ID, // sanup3407@gmail.com
      pass: process.env.MP,      // dwij kfux dtmd yvtq
    },
  });

  const mailOptions = {
    from: `"Omega Store" <${process.env.MAIL_ID}>`,
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.html,
  };

  // Log the email content before sending
  console.log("Sending email with the following details:");
  console.log("To:", data.to);
  console.log("Subject:", data.subject);
  console.log("Text:", data.text);
  console.log("HTML:", data.html);

  const info = await transporter.sendMail(mailOptions);

  console.log("Email sent successfully:");
  console.log("Message ID:", info.messageId);
  console.log("Response:", info.response);
});

module.exports = sendEmail;