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
app.use('/api/evc-pay/', require('./Router/EvcRouter'));
app.use('/api/member/', require('./Router/MemRouter'));
app.use('/api/contact/', require('./Router/ContactRouter'));

// ------------------- HEARTBEAT -------------------
const APP_URL = process.env.APP_URL; // Set this in Render environment variables
const MAIN_ROUTE = '/api/user/'; // Only ping this route to wake the service

// Check Somalia time (UTC+3) and active hours
function isSomaliaActiveTime() {
    const now = new Date();
    const somaliaHour = now.getUTCHours() + 3; // UTC+3
    const hour = somaliaHour >= 24 ? somaliaHour - 24 : somaliaHour;
    return hour >= 5 && hour <= 22; // 5 AM - 10 PM
}

// Ping main route
async function pingMainRoute() {
    if (!APP_URL) return;
    if (!isSomaliaActiveTime()) {
        console.log(`[${new Date().toISOString()}] Outside active hours, skipping ping.`);
        return;
    }

    try {
        const res = await fetch(APP_URL + MAIN_ROUTE);
        console.log(`[${new Date().toISOString()}] Pinged ${MAIN_ROUTE} Status: ${res.status}`);
    } catch (err) {
        console.error(`[${new Date().toISOString()}] Ping failed for ${MAIN_ROUTE}:`, err.message);
    }
}

// Run every 14 minutes
setInterval(pingMainRoute, 14 * 60 * 1000);

// Optional: ping immediately at startup
pingMainRoute();

// ------------------- START SERVER -------------------
app.listen(app.get('port'), () => {
    console.log('Server running on port', app.get('port'));
});
