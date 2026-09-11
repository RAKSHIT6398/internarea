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



// const { BrevoClient } = require("@getbrevo/brevo");
// const brevo = new BrevoClient({
//   apiKey: process.env.EMAIL_PASS,
// });
// const nodemailer = require("nodemailer");

// const sendEmail = async (email, subject, options) => {
//   try {
//     const transporter = nodemailer.createTransport({
//       // ✅ Brevo SMTP Settings (Updated for Stability)
//       host: "smtp-relay.brevo.com", 
//       port: 587,             // 👈 CHANGE: 587 se 465 kar dein
//       secure: true,          // 👈 CHANGE: false se TRUE kar dein (Port 465 ke liye zaroori hai)
      
//       auth: {
//         user: process.env.EMAIL_USER, // Brevo se linked email
//         pass: process.env.EMAIL_PASS, // Brevo SMTP Key
//       },
      
//       // 👇 YE LINE ADD KAREIN: Force IPv4 to avoid DNS/Network hang issues on Render
//       family: 4, 
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

//     console.log("✅ Email Sent Successfully via Brevo (Port 465)");
//     return true;
//   } catch (error) {
//     console.log("❌ Email Error:", error.message);
//     // Login fail na ho isliye false return kar rahe hain
//     return false; 
//   }
// };

// module.exports = sendEmail;

const { BrevoClient } = require("@getbrevo/brevo");

const brevo = new BrevoClient({
  apiKey: process.env.EMAIL_PASS, // xkeysib-... (API key, SMTP key nahi)
});

const sendEmail = async (email, subject, options) => {
  console.log("📧 Using Brevo HTTP API");

  try {
    const html = typeof options === "string" ? options : options?.html;
    const text = typeof options === "string" ? undefined : options?.text;

    const result = await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: "internArea",
        email: process.env.EMAIL_FROM, // Brevo mein verified sender email
      },
      to: [{ email }],
      subject,
      htmlContent: html || `<p>${text || ""}</p>`,
      textContent: text || "Please view this email in HTML mode.",
    });

    console.log("✅ Email Sent via Brevo API:", result?.messageId);
    return true;
  } catch (error) {
    console.log(
      "❌ Brevo Error:",
      error?.response?.body || error?.body || error.message
    );
    return false;
  }
};

module.exports = sendEmail;