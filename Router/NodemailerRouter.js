const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();

const EmailRouter = express.Router();

// POST /api/send/otp
EmailRouter.post("/otp", async (req, res) => {
  const { to, otp } = req.body;

  if (!to || !otp) {
    return res.status(400).json({ message: "Missing required fields (to, otp)" });
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: "mail.privateemail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // OTP Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${otp}`, // plain text fallback
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <h2>🔐 Verification Code</h2>
          <p style="font-size: 18px;">Use the following OTP to continue:</p>
          <h1 style="color: #2e6c80; font-size: 36px;">${otp}</h1>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "OTP email sent successfully",
      response: info.response,
    });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res.status(500).json({
      message: "Error sending OTP email",
      error: error,
    });
  }
});

EmailRouter.post("/suppert", async (req, res) => {
  const { name, email,sub } = req.body;

  if (!to || !otp) {
    return res.status(400).json({ message: "Missing required fields (to, otp)" });
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: "mail.privateemail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // OTP Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: "support@xirfadsan.com",
      subject: "Contact us ",
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${sub}`, // fallback for plain text
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "OTP email sent successfully",
      response: info.response,
    });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    res.status(500).json({
      message: "Error sending OTP email",
      error: error,
    });
  }
});

module.exports = EmailRouter;