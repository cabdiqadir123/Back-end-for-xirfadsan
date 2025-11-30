const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // npm install node-fetch@2
const http = require('http');
const { Server } = require('socket.io');
const mysqlconnection = require('./dstsbase/database.js');

// ------------------- APP INIT -------------------
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
app.use('/api/account_delete/', require('./Router/AccountDeleteRouter'));
app.use('/api/chat/', require('./Router/ChatRouter'));
app.use('/api/call/', require('./Router/CallRouter')); // Agora token route

// ------------------- HEARTBEAT -------------------
const APP_URL = process.env.APP_URL;
const MAIN_ROUTE = '/api/user/';

function isSomaliaActiveTime() {
  const now = new Date();
  const somaliaHour = (now.getUTCHours() + 3) % 24;
  return somaliaHour >= 5 && somaliaHour <= 22;
}

async function pingMainRoute() {
  if (!APP_URL) return;
  if (!isSomaliaActiveTime()) return;

  try {
    const res = await fetch(APP_URL + MAIN_ROUTE);
    console.log(`Pinged ${MAIN_ROUTE} → Status: ${res.status}`);
  } catch (err) {
    console.error(`Ping failed:`, err.message);
  }
}

setInterval(pingMainRoute, 14 * 60 * 1000);
pingMainRoute();

// ------------------- SOCKET IO CONFIG -------------------
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store online users
const onlineUsers = new Map();
global.io = io;                // make accessible globally
global.onlineUsers = onlineUsers;

// ------------------- SOCKET EVENTS -------------------

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // REGISTER USER
  socket.on("join", (user_id) => {
    onlineUsers.set(user_id, socket.id);
    console.log(`👤 User ${user_id} registered with socket ${socket.id}`);
  });

  // ----------------------------------------------------
  // 🔥 CHAT SYSTEM
  // ----------------------------------------------------
  socket.on("send_message", (data) => {
    const { sender_id, receiver_id, message, bookid } = data;

    mysqlconnection.query(
      "INSERT INTO messages (sender_id, receiver_id, message, bookid, created_at) VALUES (?, ?, ?, ?, NOW())",
      [sender_id, receiver_id, message, bookid],
      (error, result) => {
        if (error) return console.error("DB error:", error);

        const receiverSocket = onlineUsers.get(receiver_id);
        if (receiverSocket) {
          io.to(receiverSocket).emit("receive_message", {
            id: result.insertId,
            sender_id,
            receiver_id,
            message,
            bookid,
            created_at: new Date()
          });
        }
      }
    );
  });

  // ----------------------------------------------------
  // 🔥 CALL SYSTEM (AGORA)
  // ----------------------------------------------------

  // Client → Worker call request
  socket.on("call_user", ({ callerId, receiverId, agoraToken, channelName }) => {
    const receiverSocket = onlineUsers.get(receiverId);
    if (!receiverSocket) return;

    io.to(receiverSocket).emit("incoming_call", {
      callerId,
      receiverId,
      agoraToken,
      channelName
    });


    console.log(`📞 ${callerId} is calling ${receiverId}`);
  });

  // Worker accepted call
  socket.on("call_rejected", ({ callerId, receiverId }) => {
    const callerSocket = onlineUsers.get(callerId);
    if (callerSocket) {
      io.to(callerSocket).emit("call_rejected", {
        callerId,
        receiverId
      });
    }
  });



  // Worker rejected call
  socket.on("call_rejected", ({ callerId, receiverId }) => {
    const callerSocket = onlineUsers.get(callerId);
    if (callerSocket) io.to(callerSocket).emit("call_rejected");
  });

  // End call
  socket.on("end_call", ({ userId }) => {
    const otherSocket = onlineUsers.get(userId);
    if (otherSocket) io.to(otherSocket).emit("call_ended");
  });

  // ----------------------------------------------------

  socket.on("disconnect", () => {
    for (const [user_id, socket_id] of onlineUsers.entries()) {
      if (socket_id === socket.id) {
        onlineUsers.delete(user_id);
        console.log(`🔴 User ${user_id} disconnected`);
      }
    }
  });
});

// ------------------- START SERVER -------------------
server.listen(app.get("port"), () => {
  console.log(`🚀 Server running with Socket.IO on port ${app.get("port")}`);
});