// routes/sendnotify.js
const { Router } = require("express");
const admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");
const mysql = require("../dstsbase/database");
require("dotenv").config();

const sendnotify = Router();

/* ------------------- FIREBASE ADMIN INIT ------------------- */
let serviceAccount = null;
if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  const json = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8");
  serviceAccount = JSON.parse(json);
} else {
  throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_BASE64 env var");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/* ------------------- UTIL: Save offline message ------------------- */
function saveOfflineMessage(token, title, body, role) {
  return new Promise((resolve, reject) => {
    mysql.query(
      "INSERT INTO offline_messages (token, title, body, role, sent, created_at) VALUES (?, ?, ?, ?, 0, NOW())",
      [token, title, body, role],
      (err) => {
        if (err) {
          console.error("Failed to save offline message:", err);
          return reject(err);
        }
        resolve();
      }
    );
  });
}

/* ------------------- UTIL: Sync offline messages for token ------------------- */
async function syncOfflineMessagesForToken(token) {
  return new Promise((resolve, reject) => {
    mysql.query(
      "SELECT * FROM offline_messages WHERE token = ? AND sent = 0 ORDER BY id ASC",
      [token],
      async (err, rows) => {
        if (err) return reject(err);
        if (!rows || rows.length === 0) {
          return resolve({ token, totalRows: 0, sentCount: 0 });
        }

        let sentCount = 0;

        for (const msg of rows) {
          const message = {
            notification: { title: msg.title, body: msg.body },
            data: {
              title: msg.title,
              body: msg.body,
              role: msg.role ?? "",
              timestamp: msg.id.toString(),
            },
            token,
            android: { priority: "high" },
            apns: { headers: { "apns-priority": "10" } },
          };

          try {
            await getMessaging().send(message);

            // mark as sent
            mysql.query(
              "UPDATE offline_messages SET sent = 1, sent_at = NOW() WHERE id = ?",
              [msg.id],
              (uErr) => {
                if (uErr) console.error("Failed to mark offline message sent:", uErr);
              }
            );

            sentCount++;
          } catch (sendErr) {
            console.error(`Failed to resend offline message id=${msg.id} to token=${token}:`, sendErr);
          }
        }

        resolve({ token, totalRows: rows.length, sentCount });
      }
    );
  });
}

/* ------------------- POST /send-data ------------------- */
sendnotify.post("/send-data", async (req, res) => {
  const { title, body, token, role } = req.body;
  if (!token || !title || !body) return res.status(400).json({ message: "Missing token/title/body" });

  const timestamp = Date.now().toString();

  const message = {
    notification: { title, body },
    data: { title, body, role: role ?? "", timestamp },
    token,
    android: { priority: "high" },
    apns: { headers: { "apns-priority": "10" } },
  };

  try {
    const response = await getMessaging().send(message);
    return res.status(200).json({ message: "Notification sent", response });
  } catch (err) {
    console.error("Send error:", err.code || err);

    const shouldSaveOffline =
      ["messaging/registration-token-not-registered", "messaging/unregistered", "messaging/invalid-recipient"].includes(err.code) ||
      (err.code === undefined && err.message && err.message.includes("SERVICE_NOT_AVAILABLE"));

    if (shouldSaveOffline) {
      try {
        await saveOfflineMessage(token, title, body, role ?? "");
        console.log("Saved offline message for token:", token);
      } catch (saveErr) {
        console.error("Failed saving offline message after send error:", saveErr);
      }
    }

    return res.status(500).json({ message: "Failed to send notification", error: err.message ?? err });
  }
});

/* ------------------- POST /send-data-to-all ------------------- */
sendnotify.post("/send-data-to-all", (req, res) => {
  const { title, body, role } = req.body;
  if (!role || !title || !body) return res.status(400).json({ message: "Missing role/title/body" });

  mysql.query(
    "SELECT token FROM users WHERE role = ? AND token IS NOT NULL AND status = 'Active'",
    [role],
    async (err, rows) => {
      if (err) return res.status(500).json({ message: "Database error", error: err.message });
      if (!rows || rows.length === 0) return res.status(404).json({ message: "No tokens found for role" });

      const tokens = rows.map((r) => r.token);
      const timestamp = Date.now().toString();

      const multicast = {
        notification: { title, body },
        data: { title, body, role, timestamp },
        android: { priority: "high" },
        apns: { headers: { "apns-priority": "10" } },
        tokens,
      };

      try {
        const result = await getMessaging().sendEachForMulticast(multicast);

        // save offline messages for failed tokens
        const promises = [];
        result.responses.forEach((r, idx) => {
          if (!r.success) {
            const errCode = r.error && r.error.code;
            if (["messaging/registration-token-not-registered", "messaging/unregistered", "messaging/invalid-recipient"].includes(errCode)) {
              const t = tokens[idx];
              promises.push(saveOfflineMessage(t, title, body, role).catch((e) => console.error("Offline save error:", e)));
            }
          }
        });

        await Promise.all(promises);

        return res.status(200).json({
          message: `Sent to role ${role}`,
          successCount: result.successCount,
          failureCount: result.failureCount,
        });
      } catch (sendErr) {
        console.error("Multicast send error:", sendErr);
        return res.status(500).json({ message: "Failed to send multicast", error: sendErr.message ?? sendErr });
      }
    }
  );
});

module.exports = sendnotify;