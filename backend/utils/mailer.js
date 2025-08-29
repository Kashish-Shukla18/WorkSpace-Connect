const nodemailer = require("nodemailer");

// Setup transporter (using Gmail for example)
const transporter = nodemailer.createTransport({
  service: "gmail",  // or use "smtp"
  auth: {
    user: process.env.EMAIL_USER, // your email
    pass: process.env.EMAIL_PASS, // app password (not your actual email password)
  },
});

// Function to send email
const sendEmail = async (to, subject, text, html = null) => {
  try {
    const mailOptions = {
      from: `"Project Manager" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html, // optional (if you want HTML email)
    };

    let info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
  } catch (err) {
    console.error("❌ Error sending email:", err);
  }
};

module.exports = sendEmail;
