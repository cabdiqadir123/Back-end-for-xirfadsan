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
    m.id,
    m.sender_id,
    sender.name AS sender_name,
    m.receiver_id,
    receiver.name AS receiver_name,
    m.message,
    s.bookid,
    m.created_at
    FROM messages m
    LEFT JOIN users sender ON m.sender_id = sender.id
    LEFT JOIN users receiver ON m.receiver_id = receiver.id
    WHERE (m.sender_id = ? AND m.receiver_id = ?) 
    OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.created_at ASC;
    `,
    [sender_id, receiver_id, receiver_id, sender_id],
    (error, rows) => {
      if (!error) {
        res.json(rows);
      } else {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch messages' });
      }
    }
  );
});

// ✅ Send a new message
ChatRouter.post('/send', (req, res) => {
  const { sender_id, receiver_id, message,bookid } = req.body;

  if (!sender_id || !receiver_id || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  mysqlconnection.query(
    'INSERT INTO messages (sender_id, receiver_id, message,bookid, created_at) VALUES (?, ?, ?, ?, NOW())',
    [sender_id, receiver_id, message, bookid],
    (error, result) => {
      if (!error) {
        res.json({ success: true, message_id: result.insertId });
      } else {
        console.error(error);
        res.status(500).json({ error: 'Failed to send message' });
      }
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