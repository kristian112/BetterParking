require("dotenv").config();
const nodemailer = require("nodemailer");

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

/**
 * Send Email
 * @param {string} to - email на собственика
 * @param {string} subject
 * @param {string} text
 * @param {Array} attachments - attachments (по желание)
 */
async function sendEmail({ to, subject, text, attachments = [] }) {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: "kristian007g@gmail.com",
      subject,
      text,
      attachments
    });

    console.log("Email sent:", info.messageId);
    return info;
  } catch (err) {
    console.error("Email error:", err);
    throw err;
  }
}

module.exports = { sendEmail };
