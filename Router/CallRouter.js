const { Router } = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');
const mysqlconnection = require('../dstsbase/database.js');

const CallRouter = Router();

const AGORA_APP_ID = process.env.AGORA_APP_ID;
const AGORA_APP_CERT = process.env.AGORA_APP_CERT;

// --------------------------------------------------
// CREATE CALL (Generate Token + Notify Receiver)
// --------------------------------------------------
CallRouter.post('/create', (req, res) => {
    const { caller_id, receiver_id } = req.body;

    if (!caller_id || !receiver_id) {
        return res.status(400).json({ error: "Missing caller_id or receiver_id" });
    }

    const channelName = `call_${caller_id}_${Date.now()}`;
    const uid = 0;
    const role = RtcRole.PUBLISHER;
    const expireTime = Math.floor(Date.now() / 1000) + 3600;

    const token = RtcTokenBuilder.buildTokenWithUid(
        AGORA_APP_ID,
        AGORA_APP_CERT,
        channelName,
        uid,
        role,
        expireTime
    );

    mysqlconnection.query(
        `INSERT INTO calls (caller_id, receiver_id, channel, status, created_at) 
         VALUES (?, ?, ?, 'ringing', NOW())`,
        [caller_id, receiver_id, channelName],
        (err, result) => {
            if (err) return res.status(500).json({ error: "DB error" });

            // Notify receiver using socket
            const receiverSocket = global.onlineUsers.get(receiver_id);
            if (receiverSocket) {
                global.io.to(receiverSocket).emit("incoming_call", {
                    call_id: result.insertId,
                    caller_id,
                    receiver_id,
                    channel: channelName,
                    token,
                    agora_app_id: AGORA_APP_ID
                });
            }

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

module.exports = CallRouter;