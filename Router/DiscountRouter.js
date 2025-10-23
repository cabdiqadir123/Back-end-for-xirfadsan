const { Router } = require('express')
const path = require('path');
const multer = require('multer');

const DiscountRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

DiscountRouter.get('/', (req, res) => {
    res.status(200).json('server on port 8000 and database is connected');
});

DiscountRouter.get('/all', (req, res) => {
    mysqlconnection.query('select id, services.service_id as sub_service_id, services.name AS sub_service,services.service_id,services.name AS servicename,services.service_id as price,promocode,discount.description,type,per,min_order,used_count,usage_limit,end_date,discount.color,discount.created_at from discount INNER JOIN services on discount.service_id =services.service_id ', (error, rows, fields) => {
        if (!error) {
            res.json(rows);
        } else {
            console.log(error);
        }
    });
});

// for new type script dashboard
DiscountRouter.get('/allnew', (req, res) => {
    mysqlconnection.query('select id, services.service_id as sub_service_id, services.name AS sub_service,services.service_id,services.name AS servicename,services.service_id as price,promocode,title,discount.description,type,per,min_order,used_count,usage_limit,discount.status,end_date,discount.color,discount.created_at from discount INNER JOIN services on discount.service_id =services.service_id', (error, rows, fields) => {
        if (!error) {
            res.json(rows);
        } else {
            console.log(error);
        }
    });
});

DiscountRouter.get("/image/:id", (req, res) => {
    const imageId = req.params.id;
    const query = "SELECT image FROM discount WHERE id=?";

    mysqlconnection.query(query, [imageId], (err, result) => {
        if (err) {
            return res.status(500).send("Error fetching image");
        }
        if (result.length === 0) {
            return res.status(404).send("Image not found");
        }

        res.contentType("image/jpeg");
        res.send(result[0].image); // Send the image buffer back as a response
    });
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

DiscountRouter.post("/add", upload.single("image"), (req, res) => {
    const { sub_service_id, promocode, description, per, end_date, color, created_at } = req.body;
    const imageBuffer = req.file.buffer;
    const query = "INSERT INTO discount (sub_service_id, promocode, description, per, image, end_date,color,created_at) VALUES ((select sub_service_id from sub_services where sub_service=?),?,?,?,?,?,?,?)";

    mysqlconnection.query(query, [sub_service_id, promocode, description, per, imageBuffer, end_date, color, created_at], (err, result) => {
        if (err) {
            return res.status(500).send("Error saving image to database");
        }
        res.status(200).send("Image uploaded successfully");
    });
});

// for new typescript dashboard
DiscountRouter.post("/addNew", upload.single("image"), (req, res) => {
    const { service_id, promocode, title, description, type, per, min_order, usage_limit, status, end_date, color, created_at } = req.body;
    const imageBuffer = req.file.buffer;
    const query = "INSERT INTO discount (service_id, promocode,title, description,type, per,min_order,usage_limit,status, image, end_date,color,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)";

    mysqlconnection.query(
        query,
        [service_id, promocode, title, description, type, per, min_order, usage_limit, status, imageBuffer, end_date, color, created_at],
        (err, result) => {
            if (err) {
                console.error("❌ Error saving promo code:", err);
                return res.status(500).json({
                    status: "error",
                    message: "Error saving promo code to database",
                    error: err.message,
                    body: req.body
                });
            }

            // ✅ Successfully inserted
            res.status(200).json({
                status: "success",
                message: "Promo code created successfully",
                id: result.insertId, // ✅ Return the new promo code's ID
            });
        }
    );
});

DiscountRouter.put("/update/:id", upload.single("image"), (req, res) => {
    const id = req.params.id;
    const { sub_service_id, promocode, description, per, end_date, color } = req.body;

    const imageBuffer = req.file?.buffer;

    // Build dynamic SQL
    let query = `
    UPDATE discount 
    SET sub_service_id = (select sub_service_id from sub_services where sub_service=?), promocode = ?, description = ?, per = ?, end_date = ?, color = ?
  `;
    const values = [sub_service_id, promocode, description, per, end_date, color];

    // Only update image if a new one is uploaded
    if (imageBuffer) {
        query += `, image = ?`;
        values.push(imageBuffer);
    }

    query += ` WHERE id = ?`;
    values.push(id);

    mysqlconnection.query(query, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error updating the discount");
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("Discount not found");
        }

        res.status(200).send("Discount updated successfully");
    });
});

// for new typescript dashboard
DiscountRouter.put("/updateNew/:id", upload.single("image"), (req, res) => {
    const id = req.params.id;
    const { service_id, promocode, title, description, type, per, min_order, usage_limit, status, end_date, color } = req.body;

    const imageBuffer = req.file?.buffer;

    // Build dynamic SQL
    let query = `
    UPDATE discount 
    SET service_id = ?, promocode = ?,title=?, description = ?,type=?, per = ?,min_order=?,usage_limit=?,status=?, end_date = ?, color = ?
  `;
    const values = [service_id, promocode, title, description, type, per, min_order, usage_limit, status, end_date, color];

    // Only update image if a new one is uploaded
    if (imageBuffer) {
        query += `, image = ?`;
        values.push(imageBuffer);
    }

    query += ` WHERE id = ?`;
    values.push(id);

    mysqlconnection.query(query, values, (err, result) => {
        if (result.affectedRows === 0) {
            return res.status(404).send("Discount not found");
        }

        if (err) {
            console.error("❌ Error updated promo code:", err);
            return res.status(500).json({
                status: "error",
                message: "Error updated promo code to database",
                error: err.message,
                body: req.body
            });
        }

        // ✅ Successfully updated
        res.status(200).json({
            status: "success",
            message: "Promo code updated successfully",
            id: result.insertId, // ✅ Return the new promo code's ID
        });
    });
});

DiscountRouter.put("/update_used_count/:id", (req, res) => {
    const id = req.params.id;
    const { used_count } = req.body;


    // Build dynamic SQL
    let query = `
    UPDATE discount 
    SET used_count=?
  `;
    const values = [used_count];


    query += ` WHERE id = ?`;
    values.push(id);

    mysqlconnection.query(query, values, (err, result) => {
        if (result.affectedRows === 0) {
            return res.status(404).send("Discount not found");
        }

        if (err) {
            console.error("❌ Error updated promo code:", err);
            return res.status(500).json({
                status: "error",
                message: "Error updated promo code to database",
                error: err.message,
                body: req.body
            });
        }

        // ✅ Successfully updated
        res.status(200).json({
            status: "success",
            message: "Promo code updated successfully",
            id: result.insertId, // ✅ Return the new promo code's ID
        });
    });
});

DiscountRouter.post('/delete', (req, res) => {
    const { id } = req.body;
    console.log(req.body);
    mysqlconnection.query('delete from discount where id=?'
        , [id], (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                res.json({ status: error });
            }
        });
});

module.exports = DiscountRouter;