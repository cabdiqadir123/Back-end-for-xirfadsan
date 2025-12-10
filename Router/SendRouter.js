const { Router } = require("express");
const admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");
const mysql = require("../dstsbase/database");
require("dotenv").config();

const sendnotify = Router();

/* ---------------------------------------------------
   FIREBASE ADMIN INITIALIZATION
--------------------------------------------------- */
let serviceAccount = null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  const json = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8");
  serviceAccount = JSON.parse(json);
} else {
  throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_BASE64 in environment variables.");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

/* ---------------------------------------------------
   UTILITY: RESEND OFFLINE MESSAGES (SKIP LAST ONE)
--------------------------------------------------- */
async function syncOfflineMessagesForToken(token) {
  return new Promise((resolve, reject) => {
    mysql.query(
      "SELECT * FROM offline_messages WHERE token = ? AND sent = 0 ORDER BY id ASC",
      [token],
      async (error, rows) => {
        if (error) return reject(error);

        if (!rows || rows.length === 0) {
          return resolve({ token, totalRows: 0, successCount: 0, message: "No offline messages" });
        }

        // Prevent duplicate → Skip LAST ROW  
        const rowsToSend = rows.slice(0, -1);
        let successCount = 0;

        for (const msg of rowsToSend) {
          try {
            await getMessaging().send({
              notification: { title: msg.title, body: msg.body },
              data: {
                title: msg.title,
                body: msg.body,
                role: msg.role,
                timestamp: msg.id.toString(),
              },
              token,
              android: { priority: "high" },
              apns: { headers: { "apns-priority": "10" } },
            });

            successCount++;

            // Optional DB update (uncomment if needed)
            // mysql.query("UPDATE offline_messages SET sent = 1 WHERE id = ?", [msg.id]);
          } catch (err) {
            console.error(`❌ Failed to resend message to ${token}:`, err.message);
          }
        }

        resolve({
          token,
          totalRows: rows.length,
          sentRows: rowsToSend.length,
          successCount,
          ignoredLast: true,
        });
      }
    );
  });
}

/* ---------------------------------------------------
   CLEANUP OLD SENT MESSAGES
--------------------------------------------------- */
setInterval(() => {
  mysql.query(
    "DELETE FROM offline_messages WHERE sent = 1 AND created_at < NOW() - INTERVAL 3 DAY",
    (err, result) => {
      if (err) console.error("Cleanup Error:", err);
      else console.log(`🧹 Removed ${result.affectedRows} old offline messages`);
    }
  );
}, 1000 * 60 * 60 * 6);

/* ---------------------------------------------------
   SEND NOTIFICATION TO SINGLE TOKEN
--------------------------------------------------- */
sendnotify.post("/send-data", async (req, res) => {
  const { title, body, token, role } = req.body;

  try {
    const timestamp = Date.now().toString();

    const message = {
      notification: { title, body },
      data: { title, body, role: role ?? "", timestamp },
      android: { priority: "high" },
      apns: { headers: { "apns-priority": "10" } },
      token,
    };

    const response = await getMessaging().send(message);

    await syncOfflineMessagesForToken(token);

    return res.status(200).json({ message: "Notification sent", response });
  } catch (err) {
    console.error("Send Error:", err.code);

    if (["messaging/registration-token-not-registered", "messaging/unregistered"].includes(err.code)) {
      mysql.query(
        "INSERT INTO offline_messages (token, title, body, role, sent) VALUES (?, ?, ?, ?, 0)",
        [token, title, body, role],
        () => {}
      );
    }

    return res.status(500).json({ message: "Failed to send notification", error: err.message });
  }
});

/* ---------------------------------------------------
   SEND TO ALL USERS (BY ROLE)
--------------------------------------------------- */
sendnotify.post("/send-data-to-all", (req, res) => {
  const { title, body, role } = req.body;

  if (!role) return res.status(400).json({ message: "Missing role" });

  mysql.query(
    "SELECT token FROM users WHERE role = ? AND token IS NOT NULL AND status='Active'",
    [role],
    async (err, rows) => {
      if (err) return res.status(500).json({ message: "Database error", error: err.message });
      if (!rows.length) return res.status(404).json({ message: "No tokens found" });

      const tokens = rows.map((r) => r.token);
      const timestamp = Date.now().toString();

      try {
        const multicast = {
          notification: { title, body },
          data: { title, body, role, timestamp },
          android: { priority: "high" },
          apns: { headers: { "apns-priority": "10" } },
          tokens,
        };

        const result = await getMessaging().sendEachForMulticast(multicast);

        // Save offline messages async
        await Promise.all(
          tokens.map(
            (t) =>
              new Promise((resolve) => {
                mysql.query(
                  "INSERT INTO offline_messages (token, title, body, role, sent) VALUES (?, ?, ?, ?, 0)",
                  [t, title, body, role],
                  () => resolve()
                );
              })
          )
        );

        const syncResults = await Promise.all(
          tokens.map(async (t) => {
            try {
              return { token: t, result: await syncOfflineMessagesForToken(t) };
            } catch (e) {
              return { token: t, error: e };
            }
          })
        );

        res.status(200).json({
          message: `Sent to all '${role}' users`,
          successCount: result.successCount,
          failureCount: result.failureCount,
          syncResults,
        });
      } catch (e) {
        res.status(500).json({ message: "FCM error", error: e.message });
      }
    }
  );
});

/* ---------------------------------------------------
   DELETE OFFLINE MESSAGES FOR TOKEN
--------------------------------------------------- */
sendnotify.post("/sync-offline-messages", (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(400).json({ message: "Missing token" });

  mysql.query(
    "DELETE FROM offline_messages WHERE token = ? AND sent = 0",
    [token],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error", error: err.message });

      return res.status(200).json({
        message: `Deleted ${result.affectedRows} offline messages`,
        deleted: result.affectedRows,
      });
    }
  );
});

/* ---------------------------------------------------
   SEND CALL NOTIFICATION
--------------------------------------------------- */
sendnotify.post("/send-call", async (req, res) => {
  const { token, callerId, channelName, agoraToken } = req.body;

  if (!token || !callerId || !channelName || !agoraToken) {
    return res.status(400).json({
      message: "Missing fields: token, callerId, channelName, agoraToken",
    });
  }

  try {
    const response = await getMessaging().send({
      data: {
        type: "call",
        callerId: callerId.toString(),
        channelName,
        agoraToken,
      },
      token,
      android: { priority: "high" },
      apns: { headers: { "apns-priority": "10" } },
    });

    await syncOfflineMessagesForToken(token);

    res.status(200).json({ message: "Call sent", response });
  } catch (err) {
    console.error("Call Error:", err.code);

    if (["messaging/registration-token-not-registered", "messaging/unregistered"].includes(err.code)) {
      mysql.query(
        "INSERT INTO offline_messages (token, title, body, role, sent) VALUES (?, ?, ?, ?, 0)",
        [token, "Incoming Call", "Someone is calling you", "call"],
        () => {}
      );
    }

    res.status(500).json({ message: "Failed to send call", error: err.message });
  }
});

module.exports = sendnotify;