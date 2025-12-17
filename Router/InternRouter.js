const { Router } = require('express');
const multer = require('multer');

const InternRouter = Router();
const mysqlconnection = require('../dstsbase/database.js');

/* =========================
   MULTER MEMORY STORAGE
========================= */
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/* =========================
   TEST ROUTE
========================= */
InternRouter.get('/', (req, res) => {
    res.status(200).json('Intern API is working');
});

/* =========================
   GET ALL INTERNS
========================= */
InternRouter.get('/all', (req, res) => {
    mysqlconnection.query(
        'SELECT * FROM intern ORDER BY created_at DESC',
        (error, rows) => {
            if (error) {
                console.error(error);
                return res.status(500).json({ message: 'Database error' });
            }
            res.json(rows);
        }
    );
});

/* =========================
   GET SINGLE INTERN
========================= */
InternRouter.get('/:id', (req, res) => {
    const id = req.params.id;

    mysqlconnection.query(
        'SELECT * FROM intern WHERE id = ?',
        [id],
        (error, rows) => {
            if (error) return res.status(500).json({ message: 'Database error' });

            if (rows.length === 0) {
                return res.status(404).json({ message: 'Intern not found' });
            }

            res.json(rows[0]);
        }
    );
});

/* =========================
   ADD INTERN
========================= */
InternRouter.post('/add', upload.single('profile_image'), (req, res) => {
    const { name, email, phone, role, sex, status } = req.body;

    // convert image buffer to base64 string
    const profile_image = req.file
        ? req.file.buffer.toString('base64')
        : null;

    const query = `
        INSERT INTO intern 
        (name, email, phone, role, sex, status, profile_image) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    mysqlconnection.query(
        query,
        [name, email, phone, role, sex, status, profile_image],
        (err, result) => {
            if (err) {
                console.error("❌ Error inserting intern:", err);
                return res.status(500).json({
                    status: "error",
                    message: "Failed to add intern",
                    error: err.message,
                });
            }

            res.status(200).json({
                status: "success",
                message: "Intern added successfully",
                id: result.insertId,
            });
        }
    );
});

/* =========================
   UPDATE INTERN
========================= */
InternRouter.put('/update/:id', upload.single('profile_image'), (req, res) => {
    const id = req.params.id;
    const { name, email, phone, role, sex, status } = req.body;

    const profile_image = req.file
        ? req.file.buffer.toString('base64')
        : null;

    let query = `
        UPDATE intern 
        SET name = ?, email = ?, phone = ?, role = ?, sex = ?, status = ?
    `;
    const values = [name, email, phone, role, sex, status];

    if (profile_image) {
        query += `, profile_image = ?`;
        values.push(profile_image);
    }

    query += ` WHERE id = ?`;
    values.push(id);

    mysqlconnection.query(query, values, (err, result) => {
        if (err) {
            console.error("❌ Update error:", err);
            return res.status(500).json({
                status: "error",
                message: "Failed to update intern",
                error: err.message,
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: "not_found",
                message: "Intern not found",
            });
        }

        res.status(200).json({
            status: "success",
            message: "Intern updated successfully",
            id,
        });
    });
});

/* =========================
   DELETE INTERN
========================= */
InternRouter.post('/delete', (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({
            status: "error",
            message: "id is required",
        });
    }

    mysqlconnection.query(
        'DELETE FROM intern WHERE id = ?',
        [id],
        (error, result) => {
            if (error) {
                console.error("❌ Delete error:", error);
                return res.status(500).json({
                    status: "error",
                    message: "Failed to delete intern",
                    error: error.message,
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    status: "not_found",
                    message: "Intern not found",
                });
            }

            res.status(200).json({
                status: "success",
                message: "Intern deleted successfully",
                id,
            });
        }
    );
});

module.exports = InternRouter;