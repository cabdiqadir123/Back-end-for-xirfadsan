const { Router } = require('express');
const mysqlconnection = require('../dstsbase/database.js');

const ChatRouter = Router();

// ✅ Basic test route
ChatRouter.get('/', (req, res) => {
  res.status(200).json({ message: 'Chat API is running' });
});

// ✅ Get all chats between two users
ChatRouter.get('/messages/:sender_id/:receiver_id', (req, res) => {
  const { sender_id, receiver_id } = req.params;

  mysqlconnection.query(
    `SELECT 
      m.*,
      sender.full_name AS sender_name,
      receiver.full_name AS receiver_name
     FROM messages m
     LEFT JOIN users sender ON m.sender_id = sender.id
     LEFT JOIN users receiver ON m.receiver_id = receiver.id
     WHERE (m.sender_id = ? AND m.receiver_id = ?)
        OR (m.sender_id = ? AND m.receiver_id = ?)
     ORDER BY m.created_at ASC`,
    [sender_id, receiver_id, receiver_id, sender_id],
    (error, rows) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to fetch messages' });
      }

      res.json(rows);
    }
  );
});

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

ChatRouter.post('/upload', upload.single('file'), (req, res) => {
  const fileUrl = `https://back-end-for-gurihage.onrender.com/uploads/${req.file.filename}`;
  res.json({ file_url: fileUrl });
});

// ✅ Send a new message
ChatRouter.post('/send', (req, res) => {
  const { sender_id, receiver_id, message, type, file_url, duration } = req.body;

  if (!sender_id || !receiver_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  mysqlconnection.query(
    `INSERT INTO messages 
    (sender_id, receiver_id, message, type, file_url, duration, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, NOW())`,
    [sender_id, receiver_id, message || null, type || 'text', file_url || null, duration || null],
    (error, result) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to send message' });
      }

      res.json({
        success: true,
        message_id: result.insertId
      });
    }
  );
});

// ✅ Optional: Get user’s recent conversations
ChatRouter.get('/conversations/:user_id', (req, res) => {
  const { user_id } = req.params;

  mysqlconnection.query(
    `SELECT DISTINCT 
        CASE 
            WHEN sender_id = ? THEN receiver_id 
            ELSE sender_id 
        END AS chat_partner
     FROM messages
     WHERE sender_id = ? OR receiver_id = ?`,
    [user_id, user_id, user_id],
    (error, rows) => {
      if (!error) {
        res.json(rows);
      } else {
        console.error(error);
        res.status(500).json({ error: 'Failed to load conversations' });
      }
    }
  );
});

module.exports = ChatRouter;