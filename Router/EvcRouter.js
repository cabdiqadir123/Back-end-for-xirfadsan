const { Router } = require('express');
const axios = require('axios');
require('dotenv').config();
const PaymentRouter = Router();

PaymentRouter.get('/', (req, res) => {
  res.status(200).json('✅ Payment API Router is running');
});

PaymentRouter.post('/pay', async (req, res) => {
  try {
    const { phoneNumber, price } = req.body;

    const url = "https://api.waafipay.net/asm";
    const now = Date.now().toString(); // unique ID for this request

    const data = {
      schemaVersion: "1.0",
      requestId: now,
      timestamp: new Date().toISOString(),
      channelName: "WEB",
      serviceName: "API_PURCHASE",
      serviceParams: {
        merchantUid: process.env.MERCHANT_UID,
        apiUserId: process.env.API_USER_ID,
        apiKey: process.env.API_KEY,
        paymentMethod: "mwallet_account",
        payerInfo: {
          accountNo: phoneNumber.toString() // don’t parseInt to avoid cutting leading zeros
        },
        transactionInfo: {
          referenceId: "REF" + now, // 👈 must be unique
          invoiceId: "INV" + now,   // 👈 must be unique
          amount: parseFloat(price),
          currency: "USD",
          description: "Test USD"
        }
      }
    };

    const response = await axios.post(url, data, {
      headers: { "Content-Type": "application/json" },
    });

    res.json(response.data);
  } catch (error) {
    console.error("❌ Payment Error:", error.response ? error.response.data : error.message);
    res.status(500).json({
      error: "Payment failed",
      details: error.response ? error.response.data : error.message,
    });
  }
});

module.exports = PaymentRouter;