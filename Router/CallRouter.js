const { Router } = require("express");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const mysql = require("../dstsbase/database");

const CallRouter = Router();

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERT = process.env.AGORA_APP_CERT;

CallRouter.post("/create", (req, res) => {
    const { caller_id, receiver_id } = req.body;

    if (!caller_id || !receiver_id) {
        return res.status(400).json({ error: "Missing caller_id or receiver_id" });
    }

    // 1. Generate channel name (ONLY HERE)
    const channel = `call_${caller_id}_${receiver_id}_${Date.now()}`;

    // 2. Generate token
    const uid = 0;
    const role = RtcRole.PUBLISHER;
    const expire = Math.floor(Date.now() / 1000) + 3600;

    const token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERT,
        channel,
        uid,
        role,
        expire
    );

    // 3. Save to DB (optional)
    mysql.query(
        `INSERT INTO calls (caller_id, receiver_id, channel, status) VALUES (?, ?, ?, 'ringing')`,
        [caller_id, receiver_id, channel],
        (err, result) => {
            if (err) return res.json({ error: "DB error" });

            const call_id = result.insertId;

            // 4. Notify receiver if online
            const receiverSocket = global.onlineUsers.get(receiver_id);

            if (receiverSocket) {
                global.io.to(receiverSocket).emit("incoming_call", {
                    call_id,
                    callerId: caller_id,
                    receiverId: receiver_id,
                    channelName: channel,
                    token,
                    agoraAppId: APP_ID
                });
            }

            return res.json({
                success: true,
                call_id,
                channel,
                token,
                agoraAppId: APP_ID
            });
        }
    );
});

module.exports = CallRouter;