// const nodemailer = require("nodemailer");

// const sendEmail = async (email, subject, options) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

  
//     const html = typeof options === "string" ? options : options?.html;
//     const text = typeof options === "string" ? undefined : options?.text;

//     await transporter.sendMail({
//       from: `"internArea" <${process.env.EMAIL_USER}>`,
//       to: email,
//       subject,
//       html, 
//       text: text || "Please view this email in HTML mode.",
//     });

//     console.log("✅ Email Sent Successfully");
//   } catch (error) {
//     console.log("❌ Email Error:", error);
//     throw error;
//   }
// };

// module.exports = sendEmail;

const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, options) => {
  try {
    const transporter = nodemailer.createTransport({
      // ✅ Brevo SMTP Settings
      host: "smtp-relay.brevo.com", 
      port: 587, 
      secure: false, // true for 465, false for other ports like 587
      auth: {
        user: process.env.EMAIL_USER, // Brevo se linked email
        pass: process.env.EMAIL_PASS, // Brevo SMTP Key (Not Gmail App Password)
      },
      // Optional: Agar phir bhi IPv6 issue aaye toh ye rakhein, par Brevo usually stable hota hai
      // family: 4, 
    });

    const html = typeof options === "string" ? options : options?.html;
    const text = typeof options === "string" ? undefined : options?.text;

    await transporter.sendMail({
      from: `"internArea" <${process.env.EMAIL_USER}>`, // Sender name and email
      to: email,
      subject,
      html, 
      text: text || "Please view this email in HTML mode.",
    });

    console.log("✅ Email Sent Successfully via Brevo");
    return true;
  } catch (error) {
    console.log("❌ Email Error:", error.message);
    // Login fail na ho isliye false return kar rahe hain
    return false; 
  }
};

module.exports = sendEmail;