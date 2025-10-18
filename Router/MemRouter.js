const { Router } = require('express')
const path = require('path');
const multer = require('multer');

const MembersRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

MembersRouter.get('/', (req, res) => {
    res.status(200).json('server on port 9000 and database is connected');
});

MembersRouter.get('/all', (req, res) => {
    mysqlconnection.query('select * from members',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
            }
        });
});

MembersRouter.get('/allNew', (req, res) => {
    mysqlconnection.query('select id,name,role,linkedin_profile,is_active,created_at from members',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
            }
        });
});

MembersRouter.get("/image/:id", (req, res) => {
    const imageId = req.params.id;
    const query = "SELECT image FROM members WHERE id = ?";

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
MembersRouter.post("/add", upload.single("image"), (req, res) => {
    const { name, role,linkedin_profile,is_active } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null;

    const query = "INSERT INTO members (name, role,linkedin_profile,is_active,image) VALUES (?, ?, ?,?,?)";

    mysqlconnection.query(query, [name, role,linkedin_profile,is_active, imageBuffer], (err, result) => {
        if (err) {
            console.error("❌ Error saving team members:", err);
            return res.status(500).json({
                status: "error",
                message: "Error saving team members to database",
                error: err.message,
                body: req.body,
            });
        }

        // ✅ Successfully inserted
        res.status(200).json({
            status: "success",
            message: "team members added successfully",
            id: result.insertId, // ✅ Return inserted ID
            name,
            description,
        });
    });
});

// for new typescript dashboard
MembersRouter.post("/addNew", upload.single("image"), (req, res) => {
    const { name, role, linkedin_profile, is_active, created_at } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null;

    const query = "INSERT INTO members (name,role,linkedin_profile,is_active,image,created_at) VALUES (?,?,?,?,?,?)";

    mysqlconnection.query(query, [name, role, linkedin_profile, is_active, imageBuffer, created_at], (err, result) => {
        if (err) {
            console.error("❌ Error saving testimonial:", err);
            return res.status(500).json({
                status: "error",
                message: "Error saving team members to database",
                error: err.message,
                body: req.body,
            });
        }

        // ✅ Successfully inserted
        res.status(200).json({
            status: "success",
            message: "team members added successfully",
            id: result.insertId, // ✅ Return inserted ID
            name,
            role,
            linkedin_profile,
            is_active,
            created_at
        });
    });
});


MembersRouter.put("/update/:id", upload.single("image"), (req, res) => {
    const id = req.params.id;
    const { name, role } = req.body;

    const imageBuffer = req.file?.buffer;

    // Build dynamic SQL
    let query = `
    UPDATE members 
    SET name = ?, role = ?
  `;
    const values = [name, role];

    // Only update image if a new one is uploaded
    if (imageBuffer) {
        query += `, image = ?`;
        values.push(imageBuffer);
    }

    query += ` WHERE testimonial_id  = ?`;
    values.push(id);

    mysqlconnection.query(query, values, (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error updating the testimonial");
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("Discount not found");
        }

        res.status(200).send("testimonial updated successfully");
    });
});

// for new typescript dashboard
MembersRouter.put("/updateNew/:id", upload.single("image"), (req, res) => {
    const id = req.params.id;
    let { name, role, linkedin_profile, is_active } = req.body;

    // ✅ Convert boolean/string to 1 or 0
    is_active = (is_active === true || is_active === 'true' || is_active === 1 || is_active === '1') ? 1 : 0;

    const imageBuffer = req.file?.buffer;

    // Build SQL dynamically
    let query = `
        UPDATE members 
        SET name = ?, role = ?, linkedin_profile = ?, is_active = ?
    `;
    const values = [name, role, linkedin_profile, is_active];

    // Only update image if a new one is uploaded
    if (imageBuffer) {
        query += `, image = ?`;
        values.push(imageBuffer);
    }

    // Finish query
    query += ` WHERE id = ?`;
    values.push(id);

    mysqlconnection.query(query, values, (err, result) => {
        if (err) {
            console.error("❌ MySQL Error:", err);
            return res.status(500).json({
                status: "error",
                message: "Error updating the team members",
                error: err.message,
                reqBody: req.body,
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: "not_found",
                message: "team members not found",
                reqBody: req.body,
            });
        }

        // ✅ Return success with id and body
        res.status(200).json({
            status: "success",
            message: "team members updated successfully",
            testimonial_id: id,
            reqBody: req.body,
        });
    });
});

MembersRouter.post('/delete', (req, res) => {
    const { testimonial_id } = req.body;

    console.log("Delete request body:", req.body);

    if (!testimonial_id) {
        return res.status(400).json({
            status: "error",
            message: "id is required",
            reqBody: req.body,
        });
    }

    mysqlconnection.query(
        'DELETE FROM members WHERE id = ?',
        [testimonial_id],
        (error, result) => {
            if (error) {
                console.error("❌ MySQL delete error:", error);
                return res.status(500).json({
                    status: "error",
                    message: "Failed to delete team members",
                    error: error.message,
                    reqBody: req.body,
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    status: "not_found",
                    message: "Testimonial not found",
                    testimonial_id,
                });
            }

            res.status(200).json({
                status: "success",
                message: "team members deleted successfully",
                testimonial_id,
            });
        }
    );
});


module.exports = MembersRouter;