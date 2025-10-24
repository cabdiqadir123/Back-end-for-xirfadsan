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

// ------------------ Helper: send FCM ------------------
async function sendFCM(token, message) {
  return getMessaging().send(message);
}

// ------------------ Store offline message ------------------
function storeOfflineMessage(userId, title, body, role, data) {
  const sql = `INSERT INTO offline_messages (user_id, title, body, role, data) VALUES (?, ?, ?, ?, ?)`;
  mysqlconnection.query(sql, [userId, title, body, role, JSON.stringify(data)], (err) => {
    if (err) console.error("Failed to store offline message:", err);
  });
}

// ------------------ Send single notification ------------------
sendnotify.post('/send-data', async (req, res) => {
  const { title, body, token, role, userId } = req.body; // <-- userId added

  if (!token) {
    // User offline → store message
    storeOfflineMessage(userId, title, body, role, { role });
    return res.status(200).send({ message: "User offline, message queued" });
  }

  try {
    const message = {
      notification: { title, body },
      data: { role, timestamp: Date.now().toString() },
      android: { priority: 'high', ttl: 86400000 },
      token,
    };
    await sendFCM(token, message);
    return res.status(200).send({ message: "Notification sent" });
  } catch (err) {
    console.error(err);
    // If send fails, store offline
    storeOfflineMessage(userId, title, body, role, { role });
    return res.status(500).send({ message: "Failed to send, queued offline", error: err.message });
  }
});

// ------------------ Send notification to all users of a role ------------------
sendnotify.post('/send-data-to-all', async (req, res) => {
  const { title, body, role } = req.body;

  if (!role) return res.status(400).send({ message: "Missing 'role'" });

  mysqlconnection.query(
    "SELECT id, token FROM users WHERE role = ?",
    [role],
    async (err, rows) => {
      if (err) return res.status(500).send({ message: "DB error", error: err.message });

      if (!rows.length) return res.status(404).send({ message: "No users found" });

      for (const user of rows) {
        if (!user.token) {
          // User offline → store offline message
          storeOfflineMessage(user.id, title, body, role, { role });
          continue;
        }

        const message = {
          notification: { title, body },
          data: { role, timestamp: Date.now().toString() },
          android: { priority: 'high', ttl: 86400000 },
          token: user.token,
        };

        try {
          await sendFCM(user.token, message);
        } catch (err) {
          console.error("FCM failed for user", user.id, err);
          storeOfflineMessage(user.id, title, body, role, { role });
        }
      }

      return res.status(200).send({ message: "Notifications processed" });
    }
  );
});

// ------------------ User online: send queued messages ------------------
sendnotify.post('/user-online', (req, res) => {
  const { userId, token } = req.body;
  if (!userId || !token) return res.status(400).send({ message: "Missing userId or token" });

  const sql = "SELECT * FROM offline_messages WHERE user_id = ? AND sent = FALSE";
  mysqlconnection.query(sql, [userId], async (err, rows) => {
    if (err) return res.status(500).send({ message: "DB error", error: err.message });

    for (const msg of rows) {
      const fcmMessage = {
        notification: { title: msg.title, body: msg.body },
        data: { role: msg.role, timestamp: Date.now().toString() },
        android: { priority: 'high', ttl: 86400000 },
        token,
      };

      try {
        await sendFCM(token, fcmMessage);
        // mark as sent
        mysqlconnection.query("UPDATE offline_messages SET sent = TRUE WHERE id = ?", [msg.id]);
      } catch (err) {
        console.error("Failed to send queued message", msg.id, err);
      }
    }

    // ✅ Clean up old sent messages (older than 3 days)
    mysqlconnection.query("DELETE FROM offline_messages WHERE sent = TRUE AND created_at < NOW() - INTERVAL 3 DAY");

    res.status(200).send({ message: "Queued messages sent", count: rows.length });
  });
});

module.exports = sendnotify;