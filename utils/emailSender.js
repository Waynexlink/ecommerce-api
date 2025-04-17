const nodemailer = require("nodemailer");

const sendEmail = async ({ email, subject, message, html }) => {
  // Correct the transporter creation method
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Verify the transporter is set up correctly
  transporter.verify(function (error, success) {
    if (error) {
      console.error("Transporter verification error:", error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  // Define the email options properly
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: subject,
    text: message,
    html: html,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent to:", email); // Log email address correctly
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("There was an error sending the email. Try again later.");
  }
};

module.exports = sendEmail;
