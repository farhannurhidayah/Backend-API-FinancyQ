const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");
require("dotenv").config();

const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "FinancyQ - Manage Your Money, Achieve Your Dreams",
    link: "mailto:financyQworkspace@gmail.com?subject=Inquiry%20about%20FinancyQ", //
  },
});

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.HOST_MAIL,
    pass: process.env.PASS_MAIL,
  },
});

async function sendingmail(email, otp) {
  try {
    const emailTemplate = {
      body: {
        name: `Hello User`,
        intro: "Welcome to FinancyQ.",
        action: {
          instructions: "Please input this OTP code number:",
          button: {
            color: "#22BC66", // Color of the button
            text: `${otp}`, // Text of the button
          },
        },
        outro:
          "Need help, or have questions? Just reply to this email, we'd love to help.",
      },
    };

    // Generate an HTML email with the provided template
    const emailBody = mailGenerator.generate(emailTemplate);

    // Mail options
    const mailOptions = {
      from: process.env.HOST_MAIL,
      to: email,
      subject: "Your OTP Code",
      html: emailBody,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    console.log(nodemailer.getTestMessageUrl(mailOptions));
  } catch (error) {
    console.error("Error occurred while sending email:", error);
  }
}

module.exports = { sendingmail };
