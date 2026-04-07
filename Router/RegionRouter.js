const { Router } = require('express')

const RegionRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

RegionRouter.get('/', (req, res) => {
    res.status(200).json('server on port 9000 and database is connected');
});

RegionRouter.get('/all', (req, res) => {
    mysqlconnection.query('select * from regions',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
            }
        });
});

RegionRouter.post('/add', (req, res) => {
    const {
        name,
        status ,
        created_at
    } = req.body;

    const sql = `
    INSERT INTO regions (name,status , created_at)
    VALUES (?,?, ?)
  `;

    mysqlconnection.query(
        sql,
        [name,status , created_at],
        (error, results) => {
            if (error) {
                console.error("❌ MySQL Insert Error:", error);
                return res.status(500).json({ error: "Database insert failed" });
            }

            // ✅ Get the inserted ID
            const insertedId = results.insertId;

            // ✅ Fetch the full inserted record to return
            mysqlconnection.query(
                'SELECT * FROM regions WHERE id = ?',
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

RegionRouter.put('/update/:id', (req, res) => {
    const id = req.params.id;
    const { name,status  } = req.body;

    // Automatically use current timestamp if last_updated is not provided
    const currentTime = new Date();

    const query = `
    UPDATE regions
    SET 
      name = ?,
      status =?
    WHERE id = ?;
  `;

    const values = [
        name,
        status ,
        id
    ];

    mysqlconnection.query(query, values, (error, result) => {
        if (error) {
            console.error("Error updating regions section:", error);
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

RegionRouter.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    mysqlconnection.query('delete from regions where id=?'
        , [id], (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                res.json({ status: error });
            }
        });
});

module.exports = RegionRouter;