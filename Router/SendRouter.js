const { Router } = require('express');
const admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging');
const sendnotify = Router();
const mysqlconnection = require('../dstsbase/database.js');
const axios = require("axios");
require('dotenv').config();

const syncCooldown = new Set();

async function triggerSyncOfflineMessages(token) {
  if (syncCooldown.has(token)) return; // skip if recently synced
  syncCooldown.add(token);
  setTimeout(() => syncCooldown.delete(token), 10000); // 10s cooldown

  try {
    await axios.post(
      "https://back-end-for-xirfadsan.onrender.com/api/send/sync-offline-messages",
      { token },
      { headers: { "Content-Type": "application/json" } }
    );
    console.log(`🔁 Sync triggered for token ${token}`);
  } catch (error) {
    console.error("❌ Failed to trigger sync:", error.message);
  }
}

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
    await triggerSyncOfflineMessages(token);
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
          notification: { title, body },
          data: { title, body, role, timestamp: uniqueId },
          android: { priority: 'high' },
          apns: { headers: { 'apns-priority': '10' } },
          tokens,
        };

        try {
          const response = await getMessaging().sendEachForMulticast(multicastMessage);
          console.log(`✅ Sent multicast to ${tokens.length} devices`);

          let offlineSaved = 0;

          // 🔁 Trigger sync for each token (so users fetch queued messages)
          

          // ✅ Handle failed tokens (offline/unregistered)
          tokens.forEach((token) => {
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
          });

          for (const t of tokens) {
            try {
              await triggerSyncOfflineMessages(t);
            } catch (syncErr) {
              console.error(`⚠️ Sync trigger failed for ${t}:`, syncErr.message);
            }
          }

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
    "SELECT * FROM offline_messages WHERE token = ? AND sent = 0",
    [token],
    async (error, rows) => {
      if (error) return res.status(500).json({ message: "DB error", error: error.message });

      if (rows.length === 0)
        return res.status(200).json({ message: "No offline messages" });

      let successCount = 0;

      for (const msg of rows) {
        try {
          const message = {
            notification: { title: msg.title, body: msg.body },
            data: {
              title: msg.title,
              body: msg.body,
              role: msg.role,
              // ✅ unique and stable ID
              timestamp: msg.id.toString()
            },
            token,
            android: { priority: 'high' },
            apns: { headers: { 'apns-priority': '10' } }
          };

          await getMessaging().send(message);

          // ✅ await DB update properly
          await new Promise((resolve, reject) => {
            mysqlconnection.query(
              "UPDATE offline_messages SET sent = TRUE WHERE id = ?",
              [msg.id],
              (err) => (err ? reject(err) : resolve())
            );
          });

          successCount++;
        } catch (sendErr) {
          console.error("❌ Error resending message:", sendErr);
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