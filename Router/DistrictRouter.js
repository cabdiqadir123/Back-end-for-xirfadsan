const { Router } = require('express')

const DistrictRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

DistrictRouter.get('/', (req, res) => {
    res.status(200).json('server on port 9000 and database is connected');
});

DistrictRouter.get('/all', (req, res) => {
    const query = `
        SELECT 
            d.id,
            d.name AS district_name,
            d.region_id,
            d.status,
            d.created_at,
            r.name AS region_name
        FROM districts d
        JOIN regions r ON d.region_id = r.id
    `;

    mysqlconnection.query(query, (error, rows) => {
        if (!error) {
            res.json(rows);
        } else {
            console.log(error);
            res.status(500).json({ error: "Database error" });
        }
    });
});

DistrictRouter.post('/add', (req, res) => {
    const {
        name,
        region_id ,
        status ,
        created_at
    } = req.body;

    const sql = `
    INSERT INTO region (name,region_id ,status , created_at)
    VALUES (?,?,?, ?)
  `;

    mysqlconnection.query(
        sql,
        [name,region_id ,status, created_at],
        (error, results) => {
            if (error) {
                console.error("❌ MySQL Insert Error:", error);
                return res.status(500).json({ error: "Database insert failed" });
            }

            // ✅ Get the inserted ID
            const insertedId = results.insertId;

            // ✅ Fetch the full inserted record to return
            mysqlconnection.query(
                'SELECT * FROM districts WHERE id = ?',
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

DistrictRouter.put('/update/:id', (req, res) => {
    const id = req.params.id;
    const { name,region_id,status   } = req.body;

    // Automatically use current timestamp if last_updated is not provided
    const currentTime = new Date();

    const query = `
    UPDATE region
    SET 
      name = ?,
      region_id =?,
      status =?
    WHERE id = ?;
  `;

    const values = [
        name,
        region_id ,
        status ,
        id
    ];

    mysqlconnection.query(query, values, (error, result) => {
        if (error) {
            console.error("Error updating region section:", error);
            return res.status(500).json({ error: "Failed to update region section", details: error });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "region section not found" });
        }

        res.status(200).json({
            message: "region section updated successfully",
            id
        });
    });
});

DistrictRouter.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    mysqlconnection.query('delete from districts where id=?'
        , [id], (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                res.json({ status: error });
            }
        });
});

module.exports = DistrictRouter;