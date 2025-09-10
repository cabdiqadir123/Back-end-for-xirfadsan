const express = require("express");
const axios = require("axios");
require("dotenv").config();

const SmsRouter = express.Router();

// POST /api/send/sms
SmsRouter.post("/otp", async (req, res) => {
  const { to, otp } = req.body;

  if (!to || !otp) {
    return res.status(400).json({ message: "Missing required fields (to, otp)" });
  }

  const API_KEY = process.env.TEXTBEE_API_KEY; // store your API key in .env
  const url = "https://api.textbee.dev/api/v1/sms/send";

  try {
    const response = await axios.post(
      url,
      {
        to: to,
        message: `Your OTP is: ${otp}`,
        sender: "Xirfadsan" // optional
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        }
      }
    );

    res.status(200).json({
      message: "OTP SMS sent successfully",
      response: response.data,
    });
  } catch (error) {
    console.error("Error sending OTP SMS:", error.response ? error.response.data : error.message);
    res.status(500).json({
      message: "Error sending OTP SMS",
      error: error.response ? error.response.data : error.message,
    });
  }
});

module.exports = SmsRouter;
