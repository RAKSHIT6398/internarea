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
      host: "smtp.gmail.com",
      port: 587, // 465 mat use kar
      secure: false, // 587 pe false hota hai
      family: 4, // FIX 3: Force IPv4
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Gmail App Password
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
    return true;
  } catch (error) {
    console.log("❌ Email Error:", error.message);
    // throw error;  <-- YE HATA DE, warna login fail hoga
    return false; // email fail bhi hua to login to hone de
  }
};

module.exports = sendEmail;