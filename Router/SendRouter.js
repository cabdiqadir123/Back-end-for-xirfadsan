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

setInterval(() => {
  mysqlconnection.query(
    "DELETE FROM offline_messages WHERE sent = TRUE AND created_at < NOW() - INTERVAL 3 DAY",
    (err, result) => {
      if (err) {
        console.error("❌ Cleanup error:", err);
      } else {
        console.log(`🧹 Cleaned up ${result.affectedRows} old messages`);
      }
    }
  );
}, 1000 * 60 * 60 * 6);

// ✅ Single user notification
sendnotify.post('/send-data', async (req, res) => {
  const { title, body, token, role } = req.body;

  try {
    const uniqueId = Date.now().toString(); // unique for each message


    const message = {
      notification: { title, body },
      data: { title, body, role: role ?? '', timestamp: uniqueId },
      android: {
        priority: 'high',
      },
      apns: { headers: { 'apns-priority': '10' } },
      token
    };

    const response = await getMessaging().send(message);
    console.log("✅ Notification sent:", response);
    return res.status(200).json({ message: "Notification sent", response });
  } catch (err) {
    console.error("⚠️ Error sending notification:", err.code);

    // Haddii token-ku uu khaldan yahay ama offline yahay
    if (err.code === 'messaging/registration-token-not-registered' || err.code === 'messaging/unregistered') {
      console.log("🔄 Token offline/unregistered, saving message...");
      mysqlconnection.query(
        "INSERT INTO offline_messages (token, title, body, role, sent) VALUES (?, ?, ?, ?, FALSE)",
        [token, title, body, role],
        (error) => {
          if (error) console.error("❌ Failed to save offline message:", error);
        }
      );
    }

    return res.status(500).json({ message: "Failed to send notification", error: err.message });
  }
});

// ✅ Multicast notifications per role
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


        const uniqueId = Date.now().toString();

        const multicastMessage = {
          // notification: { title, body },
          notification: { title, body },
          tokens,
          data: {
            title,
            body,
            role,
            timestamp: uniqueId
          },
          android: {
            priority: 'high',
          },
          apns: { headers: { 'apns-priority': '10' } }
        };

        try {
          const response = await getMessaging().sendEachForMulticast(multicastMessage);

          let offlineSaved = 0;

          // ✅ Handle failed tokens (offline/unregistered)
          response.responses.forEach((r, i) => {
            if (!r.success) {
              const token = tokens[i];
              const errCode = r.error?.code;

              if (
                errCode === "messaging/registration-token-not-registered" ||
                errCode === "messaging/unregistered"
              ) {
                mysqlconnection.query(
                  "INSERT INTO offline_messages (token, title, body, role, sent) VALUES (?, ?, ?, ?, FALSE)",
                  [token, title, body, role],
                  (saveErr) => {
                    if (saveErr) {
                      console.error("❌ Failed to save offline message:", saveErr);
                    } else {
                      offlineSaved++;
                    }
                  }
                );
              } else {
                console.error("⚠️ Failed to send to token:", token, errCode);
              }
            }
          });

          return res.status(200).send({
            message: `✅ Notification sent to role '${role}'`,
            successCount: response.successCount,
            failureCount: response.failureCount,
            offlineSaved,
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

sendnotify.post('/sync-offline-messages', async (req, res) => {
  const { token } = req.body;

  mysqlconnection.query(
    "SELECT * FROM offline_messages WHERE token = ? AND sent = FALSE",
    [token],
    async (error, rows) => {
      if (error) return res.status(500).json({ message: "DB error", error: error.message });

      if (rows.length === 0)
        return res.status(200).json({ message: "No offline messages" });

      let successCount = 0;

      for (const msg of rows) {
        try {
          const message = {
            // notification: { title, body,role, timestamp: Date.now().toString()},
            data: { title: msg.title, body: msg.body, role: msg.role, timestamp: msg.id },
            token: token,
            android: { priority: 'high' },
            apns: { headers: { 'apns-priority': '10' } }
          };

          await getMessaging().send(message);
          successCount++;

          mysqlconnection.query("UPDATE offline_messages SET sent = TRUE WHERE id = ?", [msg.id]);
        } catch (sendErr) {
          console.error("Error resending message:", sendErr);
        }
      }

      return res.status(200).json({
        message: `Resent ${successCount} messages to user`,
        successCount,
      });
    }
  );
});

module.exports = sendnotify;