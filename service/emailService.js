const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const FROM_EMAIL = process.env.EMAIL_FROM || process.env.EMAIL_USER;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });
  }

  return transporter;
}

async function sendOtpEmail({
  to,
  name,
  otp,
  expiresInMinutes,
  purpose = "create",
}) {
  if (!EMAIL_USER || !EMAIL_PASS || !FROM_EMAIL) {
    throw new Error("Email configuration is missing");
  }

  const templateName =
    purpose === "reset" ? "reset-otp.ejs" : "otp.ejs";
  const templatePath = path.join(__dirname, "../views/email", templateName);
  const html = await ejs.renderFile(templatePath, {
    name,
    otp,
    expiresInMinutes,
  });

  const subject =
    purpose === "reset"
      ? "Your Student Management App password reset code"
      : "Your Student Management App verification code";
  const text =
    purpose === "reset"
      ? `Hello ${name || "there"}, your password reset code is ${otp}. It expires in ${expiresInMinutes} minutes.`
      : `Hello ${name || "there"}, your verification code is ${otp}. It expires in ${expiresInMinutes} minutes.`;

  return getTransporter().sendMail({
    from: FROM_EMAIL,
    to,
    subject,
    html,
    text,
  });
}

module.exports = {
  sendOtpEmail,
};
