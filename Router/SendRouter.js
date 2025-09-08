const { Router } = require('express');
const admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging');
const sendnotify = Router();
const mysqlconnection = require('../dstsbase/database.js');
require('dotenv').config();

let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  const jsonString = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
  serviceAccount = JSON.parse(jsonString);
} else {
  throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_BASE64 env variable");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// ✅ Single user notification (data-only)
sendnotify.post('/send-data', async (req, res) => {
  const { title, body, token, role } = req.body;

  try {
    const message = {
      data: {
        title,
        body,
        role: role ?? '',
        orderid: "test order",
        orderdate: "date",
        timestamp: Date.now().toString()
      },
      android: { priority: 'high', ttl: 0 },
      apns: { headers: { 'apns-priority': '10' }, payload: { aps: { 'content-available': 1 } } },
      token
    };

    const response = await getMessaging().send(message);
    console.log("Notification sent at:", new Date().toISOString());
    return res.status(200).send({ message: "Notification sent", response });
  } catch (err) {
    console.error("Error sending notification:", err);
    return res.status(500).send({ message: "Failed to send notification", error: err.message });
  }
});

// ✅ Multicast notifications per role (data-only)
sendnotify.post('/send-data-to-all', async (req, res) => {
  const { title, body, role } = req.body;

  if (!role) return res.status(400).send({ message: "Missing 'role' in request body" });

  try {
    mysqlconnection.query(
      "SELECT token FROM users WHERE role = ? AND token IS NOT NULL",
      [role],
      async (error, rows) => {
        if (error) {
          console.error("Database query error:", error);
          return res.status(500).send({ message: "Database error", error: error.message });
        }

        if (rows.length === 0) {
          return res.status(404).send({ message: `No tokens found for role '${role}'` });
        }

        const tokens = rows.map(row => row.token);

        const multicastMessage = {
          tokens,
          data: {
            title,
            body,
            role,
            orderid: "test order",
            orderdate: "date",
            timestamp: Date.now().toString()
          },
          android: { priority: 'high' },
          apns: { headers: { 'apns-priority': '10' }, payload: { aps: { 'content-available': 1 } } }
        };

        try {
          const response = await getMessaging().sendEachForMulticast(multicastMessage);
          return res.status(200).send({
            message: `Notification sent to role '${role}'`,
            successCount: response.successCount,
            failureCount: response.failureCount,
            responses: response.responses
          });
        } catch (messagingError) {
          console.error("Messaging error:", messagingError);
          return res.status(500).send({ message: "Failed to send notification", error: messagingError.message });
        }
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).send({ message: "Unexpected error", error: err.message });
  }
});

module.exports = sendnotify;
