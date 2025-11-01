const { Router } = require('express')

const AccountDelRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

AccountDelRouter.get('/', (req, res) => {
    res.status(200).json('server on port 9000 and database is connected');
});

AccountDelRouter.get('/all', (req, res) => {
    mysqlconnection.query('select * from account_delete',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
            }
        });
});

AccountDelRouter.post('/add', (req, res) => {
  const { user_id, user_email, reason, confirmation_text, status, processed_by, processed_at, created_at } = req.body;

  if (!user_id || !user_email || !reason || !confirmation_text) {
    return res.status(400).json({ error: "Missing required fields (user_id, user_email, reason, confirmation_text)" });
  }

  const query = `
    INSERT INTO account_delete 
    ((select id from users where email=?), user_email, reason, confirmation_text, status, processed_by, processed_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const values = [user_id, user_email, reason, confirmation_text, status, processed_by, processed_at, created_at];

  mysqlconnection.query(query, values, (error, result) => {
    if (error) {
      console.error("Error inserting account delete:", error);
      return res.status(500).json({ error: "Failed to insert account delete request", details: error.message });
    }

    res.status(201).json({
      message: "Account delete request inserted successfully",
      id: result.insertId,
    });
  });
});


AccountDelRouter.put('/update/:id', (req, res) => {
    const id = req.params.id;
    let { status } = req.body;


    // Using SQL's COALESCE + NULLIF to keep old values when no new data is provided
    const query = `UPDATE account_delete SET status =? WHERE id = ?;`;

    const values = [status, id];

    mysqlconnection.query(query, values, (error, result) => {
        if (error) {
            console.error("Error updating account delete message:", error);
            return res.status(500).json({
                status: "error",
                message: "Error updating status",
                error: err.message,
                reqBody: req.body,
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Contact message not found" });
        }

        res.status(200).json({ message: "status updated successfully", id });
    });
});

AccountDelRouter.post('/delete', (req, res) => {
    const { id } = req.body;
    console.log(req.body);
    mysqlconnection.query('delete from account_delete where id=?'
        , [id], (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                res.json({ status: error });
            }
        });
});

module.exports = AccountDelRouter;