const admin = require('firebase-admin');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

exports.SendPushNotification = (req, res, next) => {
    try {
        const message = {
            notification: {
                title: "test",
                body: "message"
            },
            data: {
                orderid: "test order",
                orderdate: "date"
            },
            token: req.body.fcn_token
        };

        admin.messaging().send(message)
            .then((response) => {
                return res.status(200).send({
                    message: "Notification sent",
                    response
                });
            })
            .catch((error) => {
                console.error("Error sending message:", error);
                return res.status(500).send({
                    message: "Failed to send notification",
                    error: error.message
                });
            });
    } catch (err) {
        console.error("Unexpected error:", err);
        return res.status(500).send({
            message: "Internal server error",
            error: err.message
        });
    }
};
