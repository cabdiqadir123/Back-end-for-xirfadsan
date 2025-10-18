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
    const { name, email, phone, subject, message, is_read, replied_at, created_at } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "Missing required fields (name, email, message)" });
    }

    const query = `
    INSERT INTO contact_messages 
    (name, email, phone, subject, message, is_read,replied_at, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?,?);
  `;
    const values = [name, email, phone, subject, message, is_read, replied_at, created_at];

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


ContactsRouter.put('/update_is_read/:id', (req, res) => {
    const id = req.params.id;
    const { is_read } = req.body;

    is_read = (is_read === true || is_read === 'true' || is_read === 1 || is_read === '1') ? 1 : 0;

    // Using SQL's COALESCE + NULLIF to keep old values when no new data is provided
    const query = `
    UPDATE contact_messages
    SET 
      is_read = COALESCE(NULLIF(?, ''), is_read),
    WHERE id = ?;
  `;

    const values = [is_read, id];

    mysqlconnection.query(query, values, (error, result) => {
        if (error) {
            console.error("Error updating contact message:", error);
            return res.status(500).json({
                status: "error",
                message: "Error updating the is read",
                error: err.message,
                reqBody: req.body,
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Contact message not found" });
        }

        res.status(200).json({ message: "Contact message updated successfully", id });
    });
});

ContactsRouter.put('/update_replied_at/:id', (req, res) => {
    const id = req.params.id;
    const { is_read, replied_at } = req.body;

    is_read = (is_read === true || is_read === 'true' || is_read === 1 || is_read === '1') ? 1 : 0;

    // Using SQL's COALESCE + NULLIF to keep old values when no new data is provided
    const query = `
    UPDATE contact_messages
    SET 
      is_read = COALESCE(NULLIF(?, ''), is_read),
      replied_at = COALESCE(NULLIF(?, ''), replied_at),
    WHERE id = ?;
  `;

    const values = [is_read, replied_at, id];

    mysqlconnection.query(query, values, (error, result) => {
        if (error) {
            console.error("Error updating contact message:", error);
            return res.status(500).json({
                status: "error",
                message: "Error updating the is repliaed",
                error: err.message,
                reqBody: req.body,
            });
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