const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

  
    const html = typeof options === "string" ? options : options?.html;
    const text = typeof options === "string" ? undefined : options?.text;

    await transporter.sendMail({
      from: `"internArea" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html, 
      text: text || "Please view this email in HTML mode.",
    });

    console.log("✅ Email Sent Successfully");
  } catch (error) {
    console.log("❌ Email Error:", error);
    throw error;
  }
};

module.exports = sendEmail;