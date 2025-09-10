const { Router } = require('express');
const axios = require('axios');
require('dotenv').config(); // load .env
const PaymentRouter = Router();

// test route
PaymentRouter.get('/', (req, res) => {
    res.status(200).json('✅ Payment API Router is running');
});

// Make Payment request
PaymentRouter.post('/pay', async (req, res) => {
    try {
        const { phoneNumber, price } = req.body;

        const url = "https://api.waafipay.net/asm";

        const data = {
            schemaVersion: "1.0",
            requestId: "10111331033",
            timestamp: new Date().toISOString(), // sax timestamp
            channelName: "WEB",
            serviceName: "API_PURCHASE",
            serviceParams: {
                merchantUid: process.env.MERCHANT_UID,
                apiUserId: process.env.API_USER_ID,
                apiKey: process.env.API_KEY,
                paymentMethod: "mwallet_account",
                payerInfo: {
                    accountNo: parseInt(phoneNumber)
                },
                transactionInfo: {
                    referenceId: "12334",
                    invoiceId: "7896504",
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
        res.status(500).json({ error: "Payment failed", details: error.message });
    }
});

module.exports = PaymentRouter;