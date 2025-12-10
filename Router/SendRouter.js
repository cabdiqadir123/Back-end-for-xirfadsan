// Fixed sendnotify backend
// - Only save offline messages when send fails
// - Mark offline messages as sent after successful resend
// - When multicast send succeeds for a token, we sync its queued messages
// - Avoid duplicate sends

const { Router } = require('express');
const admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging');
const sendnotify = Router();
const mysqlconnection = require('../dstsbase/database.js');
require('dotenv').config();

// helper to run a mysql query as a Promise
function queryAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    mysqlconnection.query(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function syncOfflineMessagesForToken(token) {
  try {
    const rows = await queryAsync(
      "SELECT * FROM offline_messages WHERE token = ? AND sent = 0 ORDER BY id ASC",
      [token]
    );

    if (!rows || rows.length === 0) {
      return { token, totalRows: 0, successCount: 0, message: 'No offline messages' };
    }

    let successCount = 0;

    for (const msg of rows) {
      try {
        const message = {
          notification: { title: msg.title, body: msg.body },
          data: {
            title: msg.title,
            body: msg.body,
            role: msg.role || '',
            timestamp: msg.id.toString(),
          },
          token,
          android: { priority: 'high' },
          apns: { headers: { 'apns-priority': '10' } },
        };

        await getMessaging().send(message);

        // mark this offline message as sent
        await queryAsync('UPDATE offline_messages SET sent = 1 WHERE id = ?', [msg.id]);
        successCount++;
      } catch (sendErr) {
        console.error(`❌ Error resending offline message id=${msg.id} to token=${token}:`, sendErr.message);
        // do NOT re-insert — leave it for next sync attempt
      }
    }

    return { token, totalRows: rows.length, successCount };
  } catch (err) {
    console.error('syncOfflineMessagesForToken error:', err.message);
    throw err;
  }
}

let serviceAccount = null;
if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  const jsonString = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
  serviceAccount = JSON.parse(jsonString);
} else {
  throw new Error('Missing FIREBASE_SERVICE_ACCOUNT_BASE64 env variable');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Periodic cleanup: remove messages marked as sent older than 3 days
setInterval(() => {
  mysqlconnection.query(
    "DELETE FROM offline_messages WHERE sent = TRUE AND created_at < NOW() - INTERVAL 3 DAY",
    (err, result) => {
      if (err) {
        console.error('❌ Cleanup error:', err);
      } else {
        console.log(`🧹 Cleaned up ${result.affectedRows} old messages`);
      }
    }
  );
}, 1000 * 60 * 60 * 6);

// ---------------- Single user notification ----------------
sendnotify.post('/send-data', async (req, res) => {
  const { title, body, token, role } = req.body;

  if (!token) return res.status(400).json({ message: 'Missing token' });

  try {
    const uniqueId = Date.now().toString();
    const message = {
      notification: { title, body },
      data: { title, body, role: role ?? '', timestamp: uniqueId },
      android: { priority: 'high' },
      apns: { headers: { 'apns-priority': '10' } },
      token,
    };

    const response = await getMessaging().send(message);

    console.log('✅ Notification sent:', response);

    // If this device is online (send succeeded), try to flush any queued offline messages for it
    // This will resend older messages (and mark them as sent), but we DID NOT insert the current message into offline_messages
    try {
      const syncResult = await syncOfflineMessagesForToken(token);
      console.log('🔁 sync result for token:', token, syncResult);
    } catch (syncErr) {
      console.error('🔁 Failed to sync offline messages after successful send:', syncErr.message);
    }

    return res.status(200).json({ message: 'Notification sent', response });
  } catch (err) {
    console.error('⚠️ Error sending notification:', err.code || err.message);

    // Only save offline message when the token is definitely not registered or sending failed for that token
    const shouldSaveOffline = (
      err.code === 'messaging/registration-token-not-registered' ||
      err.code === 'messaging/unregistered' ||
      // some networks/timeouts might throw a general error — decide whether to save for retry
      err.code === 'messaging/invalid-registration-token' ||
      // fallback: if no specific code, we can still save to retry later
      !err.code
    );

    if (shouldSaveOffline) {
      mysqlconnection.query(
        'INSERT INTO offline_messages (token, title, body, role, sent) VALUES (?, ?, ?, ?, FALSE)',
        [token, title, body, role || ''],
        (error) => {
          if (error) console.error('❌ Failed to save offline message:', error);
          else console.log('💾 Saved offline message for token:', token);
        }
      );
    }

    return res.status(500).json({ message: 'Failed to send notification', error: err.message || err });
  }
});

// ---------------- Multicast notifications per role ----------------
sendnotify.post('/send-data-to-all', async (req, res) => {
  const { title, body, role } = req.body;

  if (!role) return res.status(400).send({ message: "Missing 'role' in request body" });

  try {
    const rows = await queryAsync(
      "SELECT token FROM users WHERE role = ? AND token IS NOT NULL AND status='Active'",
      [role]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).send({ message: `No tokens found for role '${role}'` });
    }

    const tokens = rows.map(r => r.token);
    const uniqueId = Date.now().toString();

    const multicastMessage = {
      notification: { title, body },
      data: { title, body, role, timestamp: uniqueId },
      android: { priority: 'high' },
      apns: { headers: { 'apns-priority': '10' } },
      tokens,
    };

    const response = await getMessaging().sendEachForMulticast(multicastMessage);

    console.log(`✅ Sent multicast to ${tokens.length} devices`);

    // response.responses is in the same order as tokens
    const promises = tokens.map(async (token, idx) => {
      const resp = response.responses[idx];

      if (!resp.success) {
        // Save offline message only for failed tokens
        try {
          await queryAsync(
            'INSERT INTO offline_messages (token, title, body, role, sent) VALUES (?, ?, ?, ?, FALSE)',
            [token, title, body, role || '']
          );
          return { token, savedOffline: true, error: resp.error ? resp.error.message : 'send failed' };
        } catch (saveErr) {
          console.error('❌ Failed to save offline message for token', token, saveErr.message);
          return { token, savedOffline: false, error: saveErr.message };
        }
      } else {
        // If send succeeded for this token, attempt to flush its queued offline messages
        try {
          const syncRes = await syncOfflineMessagesForToken(token);
          return { token, synced: true, syncRes };
        } catch (syncErr) {
          return { token, synced: false, error: syncErr.message };
        }
      }
    });

    const tokenResults = await Promise.all(promises);

    const offlineSaved = tokenResults.filter(t => t.savedOffline).length;

    return res.status(200).send({
      message: `✅ Notification processed for role '${role}'`,
      multicastReport: {
        successCount: response.successCount,
        failureCount: response.failureCount,
      },
      offlineSaved,
      tokenResults,
    });
  } catch (err) {
    console.error('Unexpected error in send-data-to-all:', err.message || err);
    return res.status(500).send({ message: 'Unexpected error', error: err.message || err });
  }
});

// ---------------- Explicit sync endpoint ----------------
sendnotify.post('/sync-offline-messages', async (req, res) => {
  const { token } = req.body;

  if (!token) return res.status(400).json({ message: 'Missing token' });

  try {
    const deleteResult = await queryAsync('DELETE FROM offline_messages WHERE token = ? AND sent = 0', [token]);
    // Note: deleteResult may be an object depending on mysql driver; use affectedRows if available
    const affectedRows = deleteResult.affectedRows ?? deleteResult.length ?? 0;

    if (affectedRows === 0) {
      return res.status(200).json({ message: 'No offline messages to delete', deletedCount: 0, token });
    }

    return res.status(200).json({ message: `🗑️ Deleted ${affectedRows} offline messages for token`, deletedCount: affectedRows, token });
  } catch (error) {
    console.error('❌ DB delete error:', error);
    return res.status(500).json({ message: 'Database error', error: error.message });
  }
});

module.exports = sendnotify;