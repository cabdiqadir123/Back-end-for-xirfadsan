const { Router } = require('express');
const admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging');
const sendnotify = Router();
const mysqlconnection = require('../dstsbase/database.js');
const axios = require("axios");
require('dotenv').config();

async function syncOfflineMessagesForToken(token) {
  return new Promise((resolve, reject) => {
    mysqlconnection.query(
      "SELECT * FROM offline_messages WHERE token = ? AND sent = 0 ORDER BY id ASC",
      [token],
      async (error, rows) => {
        if (error) return reject({ error: error.message });

        if (!rows || rows.length === 0) {
          return resolve({ token, totalRows: 0, successCount: 0, message: "No offline messages" });
        }

        let successCount = 0;

        for (const msg of rows) {
          try {
            const message = {
              notification: { title: msg.title, body: msg.body },
              data: {
                title: msg.title,
                body: msg.body,
                role: msg.role,
                timestamp: msg.id.toString(), // DB ID as timestamp
              },
              token,
              android: { priority: "high" },
              apns: { headers: { "apns-priority": "10" } },
            };

            await getMessaging().send(message);
            successCount++;

            // ✅ Mark as sent immediately
            mysqlconnection.query(
              "UPDATE offline_messages SET sent = 1 WHERE id = ?",
              [msg.id],
              (err) => {
                if (err) console.error(`❌ Failed to mark message ${msg.id} as sent:`, err);
              }
            );
          } catch (sendErr) {
            console.error(`❌ Error resending message ${msg.id} to token ${token}:`, sendErr.message);
          }
        }

        resolve({ token, totalRows: rows.length, successCount, message: `Sent ${successCount} messages` });
      }
    );
  });
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

  if (!token) return res.status(400).json({ message: "Missing token" });

  try {
    // 1️⃣ Insert message in offline DB first
    mysqlconnection.query(
      "INSERT INTO offline_messages (token, title, body, role, sent) VALUES (?, ?, ?, ?, FALSE)",
      [token, title, body, role ?? '', (err) => { if (err) console.error(err); }],
    );

    // 2️⃣ Sync all offline messages (including this one)
    const syncResult = await syncOfflineMessagesForToken(token);

    return res.status(200).json({ message: "Notification sent", syncResult });
  } catch (err) {
    console.error("⚠️ Error sending notification:", err.message);
    return res.status(500).json({ message: "Failed to send notification", error: err.message });
  }
});


// ✅ Multicast notifications per role
sendnotify.post('/send-data-to-all', async (req, res) => {
  const { title, body, role } = req.body;
  if (!role) return res.status(400).json({ message: "Missing 'role'" });

  mysqlconnection.query(
    "SELECT token FROM users WHERE role = ? AND token IS NOT NULL AND status='Active'",
    [role],
    async (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error", error: err.message });
      if (!rows || rows.length === 0) return res.status(404).json({ message: `No tokens for role '${role}'` });

      const tokens = rows.map(r => r.token);

      try {
        // 1️⃣ Insert all offline messages first
        await Promise.all(tokens.map(token =>
          new Promise((resolve) => {
            mysqlconnection.query(
              "INSERT INTO offline_messages (token, title, body, role, sent) VALUES (?, ?, ?, ?, FALSE)",
              [token, title, body, role],
              () => resolve()
            );
          })
        ));

        // 2️⃣ Sync each token's offline messages
        const results = await Promise.all(tokens.map(t => syncOfflineMessagesForToken(t)));

        return res.status(200).json({ message: `Notifications sent to ${tokens.length} devices`, results });
      } catch (error) {
        return res.status(500).json({ message: "Failed sending notifications", error: error.message });
      }
    }
  );
});

sendnotify.post('/sync-offline-messages', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Missing token" });
  }

  mysqlconnection.query(
    "DELETE FROM offline_messages WHERE token = ? AND sent = 0",
    [token],
    (error, result) => {
      if (error) {
        console.error("❌ DB delete error:", error);
        return res.status(500).json({ message: "Database error", error: error.message });
      }

      if (result.affectedRows === 0) {
        return res.status(200).json({ message: "No offline messages to delete" });
      }

      return res.status(200).json({
        message: `🗑️ Deleted ${result.affectedRows} offline messages for token`,
        deletedCount: result.affectedRows,
        token,
      });
    }
  );
});

module.exports = sendnotify;