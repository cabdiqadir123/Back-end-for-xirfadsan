const { Router } = require('express')

const PrivacyRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

PrivacyRouter.get('/', (req, res) => {
    res.status(200).json('server on port 9000 and database is connected');
});

PrivacyRouter.get('/all', (req, res) => {
    mysqlconnection.query('select * from privacy',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
            }
        });
});

PrivacyRouter.post('/add', (req, res) => {
    const {
        section_title,
        section_content,
        section_order,
        last_updated,
        effective_date,
        created_at
    } = req.body;

    const sql = `
    INSERT INTO privacy (section_title, section_content, section_order, last_updated, effective_date, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

    mysqlconnection.query(
        sql,
        [section_title, section_content, section_order, last_updated, effective_date, created_at],
        (error, results) => {
            if (error) {
                console.error("❌ MySQL Insert Error:", error);
                return res.status(500).json({ error: "Database insert failed" });
            }

            // ✅ Get the inserted ID
            const insertedId = results.insertId;

            // ✅ Fetch the full inserted record to return
            mysqlconnection.query(
                'SELECT * FROM privacy WHERE id = ?',
                [insertedId],
                (err2, rows) => {
                    if (err2) {
                        console.error("❌ MySQL Fetch Error:", err2);
                        return res.status(500).json({ error: "Failed to fetch inserted record" });
                    }

                    res.json(rows[0]); // ✅ Return the actual inserted record
                }
            );
        }
    );
});

PrivacyRouter.put('/update/:id', (req, res) => {
    const id = req.params.id;
    const { section_title, section_content, last_updated } = req.body;

    // Automatically use current timestamp if last_updated is not provided
    const currentTime = new Date();

    const query = `
    UPDATE privacy
    SET 
      section_title = COALESCE(NULLIF(?, ''), section_title),
      section_content = COALESCE(NULLIF(?, ''), section_content),
      last_updated = COALESCE(NULLIF(?, ''), ?)
    WHERE id = ?;
  `;

    const values = [
        section_title,
        section_content,
        last_updated,
        currentTime,
        id
    ];

    mysqlconnection.query(query, values, (error, result) => {
        if (error) {
            console.error("Error updating privacy section:", error);
            return res.status(500).json({ error: "Failed to update privacy section", details: error });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Privacy section not found" });
        }

        res.status(200).json({
            message: "Privacy section updated successfully",
            id,
            updated_at: last_updated || currentTime
        });
    });
});

PrivacyRouter.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    mysqlconnection.query('delete from privacy where id=?'
        , [id], (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                res.json({ status: error });
            }
        });
});

module.exports = PrivacyRouter;