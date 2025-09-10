const express = require('express');
const cors = require("cors");
const fetch = require('node-fetch'); // npm install node-fetch@2

const app = express();

app.use(cors());
app.set('port', process.env.PORT || 5000);
app.use(express.json());

// ------------------- ROUTES -------------------
app.use('/api/user/', require('./Router/UserRouter'));
app.use('/api/services/', require('./Router/ServiceRouter'));
app.use('/api/subservices/', require('./Router/SubServiceRouter'));
app.use('/api/units/', require('./Router/UnitRouter'));
app.use('/api/product/', require('./Router/ProductsRouter'));
app.use('/api/supplier/', require('./Router/SupplierRouter'));
app.use('/api/staff/', require('./Router/StaffRouter'));
app.use('/api/freelancer/', require('./Router/FreelancerRouter'));
app.use('/api/faq/', require('./Router/FaqRouter'));
app.use('/api/Complaint/', require('./Router/ComplaintRouter'));
app.use('/api/notification/', require('./Router/NotificationRouter'));
app.use('/api/testimonial/', require('./Router/TestimonialRouter'));
app.use('/api/banner/', require('./Router/BannerRouter'));
app.use('/api/booking/', require('./Router/BookingRouter'));
app.use('/api/earning/', require('./Router/EarningRouter'));
app.use('/api/discount/', require('./Router/DiscountRouter'));
app.use('/api/send/', require('./Router/SendRouter'));
app.use('/api/favour/', require('./Router/FavRouter'));
app.use('/api/review/', require('./Router/ReviewRouter'));
app.use('/api/terms/', require('./Router/TermsRouter'));
app.use('/api/privacy/', require('./Router/PrivacyRouter'));
app.use('/api/subscriber/', require('./Router/SubscriberRouter'));
app.use('/api/blog/', require('./Router/BlogRouter'));
app.use('/api/send-email/', require('./Router/NodemailerRouter'));
app.use('/api/sms/', require('./Router/SmsRouter'));

// ------------------- HEARTBEAT -------------------
const APP_URL = process.env.APP_URL; // Set this in Render environment variables

const heartbeatRoutes = [
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
    '/api/send-email/',
    '/api/sms/'
];

// Ping all API routes every 5 minutes to keep backend awake
if (APP_URL) {
    setInterval(async () => {
        console.log('--- Sending heartbeat to keep backend warm ---');
        for (const route of heartbeatRoutes) {
            try {
                const res = await fetch(APP_URL + route);
                console.log(`Pinged ${route} Status: ${res.status}`);
            } catch (err) {
                console.error(`Ping failed for ${route}:`, err);
            }
        }
    }, 5 * 60 * 1000); // every 5 minutes
}

// ------------------- START SERVER -------------------
app.listen(app.get('port'), () => {
    console.log('Server running on port', app.get('port'));
});
