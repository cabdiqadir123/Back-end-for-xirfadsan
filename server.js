const express = require('express');
const cors = require("cors");
const fetch = require('node-fetch'); // npm install node-fetch@2

const app = express();

app.use(cors());
app.set('port', process.env.PORT || 5000);
app.use(express.json());

// ------------------- ROUTES -------------------
const routes = [
    '/api/user/',
    '/api/services/',
    '/api/subservices/',
    '/api/units/',
    '/api/product/',
    '/api/supplier/',
    '/api/staff/',
    '/api/freelancer/',
    '/api/faq/',
    '/api/Complaint/',
    '/api/notification/',
    '/api/testimonial/',
    '/api/banner/',
    '/api/booking/',
    '/api/earning/',
    '/api/discount/',
    '/api/send/',
    '/api/favour/',
    '/api/review/',
    '/api/terms/',
    '/api/privacy/',
    '/api/subscriber/',
    '/api/blog/',
    '/api/send-email/'
];

// Register routes
routes.forEach(route => {
    app.use(route, require(`./Router${route}Router`));
});

// ------------------- HEARTBEAT -------------------
const APP_URL = process.env.APP_URL; // Your Render backend URL

if (APP_URL) {
    setInterval(async () => {
        try {
            console.log('--- Sending heartbeat to keep backend warm ---');
            for (const route of routes) {
                const url = APP_URL + route;
                const res = await fetch(url).catch(err => console.error(`Ping failed for ${route}:`, err));
                if (res) console.log(`Pinged ${route} Status: ${res.status}`);
            }
        } catch (err) {
            console.error('Heartbeat error:', err);
        }
    }, 5 * 60 * 1000); // every 5 minutes
}

// ------------------- START SERVER -------------------
app.listen(app.get('port'), () => {
    console.log('Server running on port', app.get('port'));
});
