const { Router } = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const mysqlconnection = require('../dstsbase/database.js');

const CallRouter = Router();

const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERT = process.env.AGORA_APP_CERT;

// 🔹 Create new call (customer → dashboard)
CallRouter.post('/create', (req, res) => {
    const { caller_id, receiver_id } = req.body;

    if (!caller_id || !receiver_id) {
        return res.status(400).json({ error: "Missing caller_id or receiver_id" });
    }

    // Unique channel name for call
    const channelName = `call_${caller_id}_${Date.now()}`;
    const uid = 0; // Agora auto assigns UID
    const role = RtcRole.PUBLISHER;

    // Token expires in 1 hour
    const expireTime = Math.floor(Date.now() / 1000) + 3600;

    // Create token
    const token = RtcTokenBuilder.buildTokenWithUid(
        AGORA_APP_ID,
        AGORA_APP_CERT,
        channelName,
        uid,
        role,
        expireTime
    );

    // Save call in MySQL
    mysqlconnection.query(
        `INSERT INTO calls (caller_id, receiver_id, channel, status, created_at) 
         VALUES (?, ?, ?, 'ringing', NOW())`,
        [caller_id, receiver_id, channelName],
        (err, result) => {
            if (err) return res.status(500).json({ error: "DB error" });

            // Notify receiver (dashboard) via socket.io
            global.io.to(global.onlineUsers.get(receiver_id)).emit('incoming_call', {
                call_id: result.insertId,
                caller_id,
                receiver_id,
                channel: channelName,
            });

            res.json({
                success: true,
                call_id: result.insertId,
                channel: channelName,
                token,
                agora_app_id: AGORA_APP_ID
            });
        }
    );
});

// 🔹 Answer call (dashboard)
CallRouter.post('/answer', (req, res) => {
    const { call_id } = req.body;

    mysqlconnection.query(
        "UPDATE calls SET status = 'answered' WHERE id = ?",
        [call_id],
        (err) => {
            if (err) return res.status(500).json({ error: "DB error" });
            res.json({ success: true });
        }
    );
});

// 🔹 End call
CallRouter.post('/end', (req, res) => {
    const { call_id } = req.body;

    mysqlconnection.query(
        "UPDATE calls SET status = 'ended' WHERE id = ?",
        [call_id],
        (err) => {
            if (err) return res.status(500).json({ error: "DB error" });
            res.json({ success: true });
        }
    );
});

module.exports = CallRouter;