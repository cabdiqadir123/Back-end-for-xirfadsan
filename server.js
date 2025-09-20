const express = require('express');
const cors = require("cors");

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

// ------------------- START SERVER -------------------
app.listen(app.get('port'), () => {
    console.log('Server running on port', app.get('port'));
});
