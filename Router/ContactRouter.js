const { Router } = require('express')

const ContactsRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

ContactsRouter.get('/', (req, res) => {
    res.status(200).json('server on port 9000 and database is connected');
});

ContactsRouter.get('/all', (req, res) => {
    mysqlconnection.query('select * from contact_messages',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
            }
        });
});

ContactsRouter.post('/add', (req, res) => {
    const { name, email, phone, subject, message, status, created_at } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "Missing required fields (name, email, message)" });
    }

    const query = `
    INSERT INTO contact_messages 
    (name, email, phone, subject, message, status, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `;
    const values = [name, email, phone, subject, message, status, created_at];

    mysqlconnection.query(query, values, (error, result) => {
        if (error) {
            console.error("Error inserting contact message:", error);
            return res.status(500).json({ error: "Failed to insert contact message", details: error });
        }

        // Return the inserted record ID
        res.status(201).json({
            message: "Contact message inserted successfully",
            id: result.insertId,
        });
    });
});


ContactsRouter.put('/update/:id', (req, res) => {
    const id = req.params.id;
    const { name, email, phone, subject, message, status } = req.body;

    // Using SQL's COALESCE + NULLIF to keep old values when no new data is provided
    const query = `
    UPDATE contact_messages
    SET 
      name = COALESCE(NULLIF(?, ''), name),
      email = COALESCE(NULLIF(?, ''), email),
      phone = COALESCE(NULLIF(?, ''), phone),
      subject = COALESCE(NULLIF(?, ''), subject),
      message = COALESCE(NULLIF(?, ''), message),
      status = COALESCE(NULLIF(?, ''), status)
    WHERE id = ?;
  `;

    const values = [name, email, phone, subject, message, status, id];

    mysqlconnection.query(query, values, (error, result) => {
        if (error) {
            console.error("Error updating contact message:", error);
            return res.status(500).json({ error: "Failed to update contact message", details: error });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Contact message not found" });
        }

        res.status(200).json({ message: "Contact message updated successfully", id });
    });
});


ContactsRouter.post('/delete', (req, res) => {
    const { id } = req.body;
    console.log(req.body);
    mysqlconnection.query('delete from contact_messages where id=?'
        , [id], (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                res.json({ status: error });
            }
        });
});

module.exports = ContactsRouter;