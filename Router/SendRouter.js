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

// ✅ Single user notification - this still works fine
sendnotify.post('/send-data', async (req, res, next) => {
  const { title, body, token } = req.body;

  try {
    const message = {
      notification: {
        title,
        body
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK'
        }
      },
      apns: {
        headers: {
          'apns-priority': '10'
        },
        payload: {
          aps: {
            sound: 'default',
            badge: 1,
            alert: {
              title,
              body
            }
          }
        }
      },
      data: {
        orderid: "test order",
        orderdate: "date",
        timestamp: Date.now().toString()
      },
      token
    };

    const response = await getMessaging().send(message); 
    return res.status(200).send({
      message: "Notification sent",
      response
    });
  } catch (err) {
    console.error("Error sending notification:", err);
    return res.status(500).send({
      message: "Failed to send notification",
      error: err.message
    });
  }
});

// Multicast notification using getMessaging().sendEachForMulticast
sendnotify.post('/send-data-to-all', async (req, res, next) => {
  const { title, body, role } = req.body;

  if (!role) {
    return res.status(400).send({ message: "Missing 'role' in request body" });
  }

  try {
    mysqlconnection.query(
      "SELECT token FROM users WHERE role = ? AND token IS NOT NULL",
      [role],
      async (error, rows, fields) => {
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
          notification: { title, body },
          android: {
            priority: 'high',
            notification: {
              sound: 'default',
              clickAction: 'FLUTTER_NOTIFICATION_CLICK'
            }
          },
          apns: {
            headers: { 'apns-priority': '10' },
            payload: {
              aps: {
                sound: 'default',
                badge: 1,
                alert: { title, body }
              }
            }
          },
          data: {
            orderid: "test order",
            orderdate: "date",
            timestamp: Date.now().toString()
          }
        };

        try {
          const response = await getMessaging().sendEachForMulticast(multicastMessage);
          return res.status(200).send({
            message: `Notification sent to '${role}'`,
            successCount: response.successCount,
            failureCount: response.failureCount,
            responses: response.responses
          });
        } catch (messagingError) {
          console.error("Messaging error:", messagingError);
          return res.status(500).send({
            message: "Failed to send notification",
            error: messagingError.message
          });
        }
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).send({
      message: "Unexpected error",
      error: err.message
    });
  }
});

module.exports = sendnotify;
