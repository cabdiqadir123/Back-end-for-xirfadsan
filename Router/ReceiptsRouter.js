const { Router } = require('express');

const ReceiptRouter = Router();
const mysqlconnection = require('../dstsbase/database.js');

// ✅ Test route
ReceiptRouter.get('/', (req, res) => {
    res.status(200).json('Receipt service is running and database is connected');
});

// ✅ Get all receipts
ReceiptRouter.get('/all', (req, res) => {
    mysqlconnection.query(
        'SELECT * FROM receipts',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
                res.status(500).json({ error });
            }
        }
    );
});

// ✅ Get receipt by booking id
ReceiptRouter.get('/by-booking/:book_id', (req, res) => {
    const { book_id } = req.params;

    mysqlconnection.query(
        'SELECT * FROM receipts WHERE book_id = ?',
        [book_id],
        (error, rows) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
                res.status(500).json({ error });
            }
        }
    );
});

// ✅ Add new receipt
ReceiptRouter.post('/add', (req, res) => {
    const {
        invoiceNumber,
        invoiceCode,
        book_id,
        phoneNumber,
        completionTime,
    } = req.body;

    mysqlconnection.query(
        `INSERT INTO receipts 
        (invoiceNumber, invoiceCode, book_id, phoneNumber, completionTime) 
        VALUES (?, ?, ?, ?, ?)`,
        [invoiceNumber, invoiceCode, book_id, phoneNumber, completionTime],
        (error, rows) => {
            if (!error) {
                res.json({ status: 'inserted', receipt_id: rows.insertId });
            } else {
                console.log(error);
                res.status(500).json({ error });
            }
        }
    );
});

// ✅ Update receipt
ReceiptRouter.put('/update/:id', (req, res) => {
    const { id } = req.params;
    const {
        invoiceNumber,
        invoiceCode,
        phoneNumber,
        completionTime,
    } = req.body;

    mysqlconnection.query(
        `UPDATE receipts 
         SET invoiceNumber=?, invoiceCode=?, phoneNumber=?, completionTime=? 
         WHERE id=?`,
        [invoiceNumber, invoiceCode, phoneNumber, completionTime, id],
        (error) => {
            if (!error) {
                res.json({ status: 'updated' });
            } else {
                console.log(error);
                res.status(500).json({ error });
            }
        }
    );
});

// ✅ Delete receipt
ReceiptRouter.post('/delete', (req, res) => {
    const { id } = req.body;

    mysqlconnection.query(
        'DELETE FROM receipts WHERE id=?',
        [id],
        (error, rows) => {
            if (!error) {
                res.json({ status: 'deleted' });
            } else {
                console.log(error);
                res.status(500).json({ error });
            }
        }
    );
});

module.exports = ReceiptRouter;