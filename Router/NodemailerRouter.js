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
  const { to, name , email ,sub} = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: "mail.privateemail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to, // ✅ your support email
      subject: `New Contact Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${sub}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border:1px solid #ddd; border-radius:8px;">
          <h2 style="color:#FE4C00;">📨 New Contact Request</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="padding:15px; background-color:#f9f9f9; border-radius:5px;">${sub}</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({
      message: "Contact email sent successfully",
      response: info.response,
    });
  } catch (error) {
    console.error("Error sending contact email:", error);
    res.status(500).json({
      message: "Error sending contact email",
      error,
    });
  }
});

module.exports = EmailRouter;