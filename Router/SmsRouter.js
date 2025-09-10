const express = require("express");
const axios = require("axios");
require("dotenv").config();

const SmsRouter = express.Router();

// POST /api/send-sms/otp
SmsRouter.post("/otp", async (req, res) => {
  const { to, otp } = req.body;

  if (!to || !otp) {
    return res.status(400).json({ message: "Missing required fields (to, otp)" });
  }

  try {
    // Construct the full TextBee endpoint with your device ID
    const textBeeApiUrl = `${process.env.TEXTBEE_API_URL}/${process.env.TEXTBEE_DEVICE_ID}/send-sms`;

    // Send SMS via TextBee
    const response = await axios.post(
      textBeeApiUrl,
      {
        recipients: [to],
        message: `Your OTP code is: ${otp}`
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.TEXTBEE_API_KEY
        }
      }
    );

    res.status(200).json({
      message: "OTP sent successfully via TextBee",
      response: response.data
    });
  } catch (error) {
    console.error("Error sending OTP via TextBee:", error.response ? error.response.data : error.message);
    res.status(500).json({
      message: "Error sending OTP via TextBee",
      error: error.response ? error.response.data : error.message
    });
  }
});

module.exports = SmsRouter;