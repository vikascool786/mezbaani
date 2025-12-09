const nodemailer = require("nodemailer");
const verificationTemplate = require("./emailTemplates/verifyEmailTemplate");

const transporter = nodemailer.createTransport({
  service: "Gmail", // or use SMTP config
  auth: {
    // user: process.env.SMTP_USER,
    // pass: process.env.SMTP_PASS,
    user: 'vikas.cool786@gmail.com',
    pass: 'oztz uyji llum zpcd',
  },
});

const sendVerificationEmail = async (to, token) => {
  const verificationUrl = `https://vitsolutions24x7.com/workstation/verify-email?token=${token}`;
  const html = verificationTemplate(verificationUrl, to);

  await transporter.sendMail({
    from: `"Kanban App" <${process.env.SMTP_USER}>`,
    to,
    subject: "Verify your email",
    html,
  });
};

module.exports = sendVerificationEmail;
