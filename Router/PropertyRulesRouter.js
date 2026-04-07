const { Router } = require('express')

const PropertyRulesRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

PropertyRulesRouter.get('/', (req, res) => {
    res.status(200).json('server on port 9000 and database is connected');
});

PropertyRulesRouter.get('/all', (req, res) => {
    mysqlconnection.query('select * from property_rules',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
            }
        });
});

PropertyRulesRouter.post('/add', (req, res) => {
    const {
        unit_code,
        name,
        created_at
    } = req.body;

    const sql = `
    INSERT INTO property_rules (unit_code,name, created_at)
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
                'SELECT * FROM property_rules WHERE id = ?',
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

PropertyRulesRouter.put('/update/:id', (req, res) => {
    const id = req.params.id;
    const { unit_code,name } = req.body;

    // Automatically use current timestamp if last_updated is not provided
    const currentTime = new Date();

    const query = `
    UPDATE property_rules
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
            console.error("Error updating property_rules section:", error);
            return res.status(500).json({ error: "Failed to update property_rules section", details: error });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "property_rules section not found" });
        }

        res.status(200).json({
            message: "property_rules section updated successfully",
            id
        });
    });
});

PropertyRulesRouter.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    mysqlconnection.query('delete from property_rules where id=?'
        , [id], (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                res.json({ status: error });
            }
        });
});

module.exports = PropertyRulesRouter;