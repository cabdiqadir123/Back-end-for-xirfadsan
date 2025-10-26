const { Router } = require('express')

const NotificationRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

NotificationRouter.get('/', (req, res) => {
  res.status(200).json('server on port 9000 and database is connected');
});

NotificationRouter.get('/all', (req, res) => {
  mysqlconnection.query('select * from notifications',
    (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        console.log(error);
      }
    });
});

NotificationRouter.get('/all_dash', (req, res) => {
  mysqlconnection.query('SELECT title, message , MAX(notification_id ) AS latest_idFROM notificationsGROUP BY title, message',
    (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        console.log(error);
      }
    });
});

NotificationRouter.post('/add', (req, res) => {
  const { from_type, from_id, recipient_role, user_id, title, message, hasButton, hasBook_id, hasBook_started, created_at } = req.body;
  console.log(req.body);
  mysqlconnection.query(
    'insert into notifications(from_type,from_id,recipient_role,user_id,title,message,hasButton,hasBook_id,hasBook_started,created_at) values(?,?,?,?,?,?,?,?,?,?);',
    [from_type, from_id, recipient_role, user_id, title, message, hasButton, hasBook_id, hasBook_started, created_at], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'inserted' });
      } else {
        console.log(error);
      }
    });
});

NotificationRouter.post('/add_to_all', async (req, res) => {
  const { from_type, from_id, recipient_role, title, message, hasButton, hasBook_id, hasBook_started, created_at } = req.body;

  try {
    // 1. Get all user IDs with the recipient_role
    const [users] = await mysqlconnection.promise().query(
      'SELECT id FROM users WHERE role = ?',
      [recipient_role]
    );

    if (users.length === 0) {
      return res.json({ status: 'no users found for this role' });
    }

    // 2. Insert a notification for each user
    const insertPromises = users.map(user => {
      return mysqlconnection.promise().query(
        'INSERT INTO notifications(from_type, from_id, recipient_role, user_id, title, message, hasButton, hasBook_id, hasBook_started, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [from_type, from_id, recipient_role, user.id, title, message, hasButton, hasBook_id, hasBook_started, created_at]
      );
    });

    await Promise.all(insertPromises);

    res.json({ status: 'notifications inserted', count: users.length });

  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'error', error });
  }
});


NotificationRouter.put('/update', (req, res) => {
  const { recipient_role, message, notification_id } = req.body;
  console.log(req.body);
  mysqlconnection.query('update notifications set recipient_role= ?, message= ? where notification_id=?'
    , [recipient_role, message, notification_id], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'updated' });
      } else {
        console.log(error);
      }
    });
});

NotificationRouter.put('/update-message-open/:id', (req, res) => {
  const id = req.params.id;
  const { message_open } = req.body;
  mysqlconnection.query('update notifications set message_open=? where notification_id=?'
    , [message_open, id], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'updated' });
      } else {
        console.log(error);
      }
    });
});

NotificationRouter.put('/update-book_status/:id', (req, res) => {
  const id = req.params.id;
  const { hasBook_started } = req.body;
  mysqlconnection.query('update notifications set hasBook_started=? where hasBook_id=?'
    , [hasBook_started, id], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'updated' });
      } else {
        console.log(error);
      }
    });
});

NotificationRouter.post('/delete/:id', (req, res) => {
  const id = req.params.id;
  console.log(req.body);
  mysqlconnection.query('delete from notifications where user_id=?'
    , [id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        res.json({ status: error });
      }
    });
});

NotificationRouter.post('/delete_all/:id', (req, res) => {
  const id = req.params.id;
  mysqlconnection.query(
    'DELETE FROM notifications WHERE user_id = ? OR from_id = ?',
    [id, id],
    (error, rows, fields) => {
      if (!error) {
        res.json({ success: true, affectedRows: rows.affectedRows });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  );
});

module.exports = NotificationRouter;