const { Router } = require('express')

const AmenitiesRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

AmenitiesRouter.get('/', (req, res) => {
    res.status(200).json('server on port 9000 and database is connected');
});

AmenitiesRouter.get('/all', (req, res) => {
    mysqlconnection.query('select * from amenities',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
            }
        });
});

AmenitiesRouter.post('/add', (req, res) => {
    const {
        unit_code,
        name,
        created_at
    } = req.body;

    const sql = `
    INSERT INTO amenities (unit_code,name, created_at)
    VALUES (?,?,?)
  `;

    mysqlconnection.query(
        sql,
        [unit_code,name, created_at],
        (error, results) => {
            if (error) {
                console.error("❌ MySQL Insert Error:", error);
                return res.status(500).json({ error: "Database insert failed" });
            }

            // ✅ Get the inserted ID
            const insertedId = results.insertId;

            // ✅ Fetch the full inserted record to return
            mysqlconnection.query(
                'SELECT * FROM amenities WHERE id = ?',
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

AmenitiesRouter.put('/update/:id', (req, res) => {
    const id = req.params.id;
    const { unit_code,name } = req.body;

    // Automatically use current timestamp if last_updated is not provided
    const currentTime = new Date();

    const query = `
    UPDATE amenities
    SET 
      unit_code=?,name=?
    WHERE id = ?;
  `;

    const values = [
        unit_code,name,
        id
    ];

    mysqlconnection.query(query, values, (error, result) => {
        if (error) {
            console.error("Error updating amenities section:", error);
            return res.status(500).json({ error: "Failed to update amenities section", details: error });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "amenities section not found" });
        }

        res.status(200).json({
            message: "amenities section updated successfully",
            id
        });
    });
});

AmenitiesRouter.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    mysqlconnection.query('delete from amenities where id=?'
        , [id], (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                res.json({ status: error });
            }
        });
});

module.exports = AmenitiesRouter;