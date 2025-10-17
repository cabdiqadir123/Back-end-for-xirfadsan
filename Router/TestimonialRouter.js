const { Router } = require('express')
const path = require('path');
const multer = require('multer');

const TestimonialRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

TestimonialRouter.get('/', (req, res) => {
    res.status(200).json('server on port 9000 and database is connected');
});

TestimonialRouter.get('/all', (req, res) => {
    mysqlconnection.query('select * from testimonials',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
            }
        });
});

TestimonialRouter.get('/allNew', (req, res) => {
    mysqlconnection.query('select testimonial_id,name,person_role,title,description,is_active,created_at from testimonials',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
            }
        });
});

TestimonialRouter.get("/image/:id", (req, res) => {
    const imageId = req.params.id;
    const query = "SELECT image FROM testimonials WHERE testimonial_id = ?";

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
TestimonialRouter.post("/add", upload.single("image"), (req, res) => {
    const { name, description } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null;

    const query = "INSERT INTO testimonials (name, description, image) VALUES (?, ?, ?)";

    mysqlconnection.query(query, [name, description, imageBuffer], (err, result) => {
        if (err) {
            console.error("❌ Error saving testimonial:", err);
            return res.status(500).json({
                status: "error",
                message: "Error saving testimonial to database",
                error: err.message,
                body: req.body,
            });
        }

        // ✅ Successfully inserted
        res.status(200).json({
            status: "success",
            message: "Testimonial added successfully",
            id: result.insertId, // ✅ Return inserted ID
            name,
            description,
        });
    });
});

// for new typescript dashboard
TestimonialRouter.post("/addNew", upload.single("image"), (req, res) => {
    const { name, person_role, title, description, is_active, created_at } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null;

    const query = "INSERT INTO testimonials (name,person_role,title, description, image,is_active,created_at) VALUES (?,?,?,?,?,?,?)";

    mysqlconnection.query(query, [name, person_role, title, description, imageBuffer, is_active, created_at], (err, result) => {
        if (err) {
            console.error("❌ Error saving testimonial:", err);
            return res.status(500).json({
                status: "error",
                message: "Error saving testimonial to database",
                error: err.message,
                body: req.body,
            });
        }

        // ✅ Successfully inserted
        res.status(200).json({
            status: "success",
            message: "Testimonial added successfully",
            id: result.insertId, // ✅ Return inserted ID
            name,
            person_role,
            title,
            description,
            is_active
        });
    });
});


TestimonialRouter.put("/update/:id", upload.single("image"), (req, res) => {
    const id = req.params.id;
    const { name, description } = req.body;

    const imageBuffer = req.file?.buffer;

    // Build dynamic SQL
    let query = `
    UPDATE testimonials 
    SET name = ?, description = ?
  `;
    const values = [name, description];

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
TestimonialRouter.put("/updateNew/:id", upload.single("image"), (req, res) => {
    const id = req.params.id;
    let { name, person_role, title, description, is_active } = req.body;

    // ✅ Convert boolean/string to 1 or 0
    is_active = (is_active === true || is_active === 'true' || is_active === 1 || is_active === '1') ? 1 : 0;

    const imageBuffer = req.file?.buffer;

    // Build SQL dynamically
    let query = `
        UPDATE testimonials 
        SET name = ?, person_role = ?, title = ?, description = ?, is_active = ?
    `;
    const values = [name, person_role, title, description, is_active];

    // Only update image if a new one is uploaded
    if (imageBuffer) {
        query += `, image = ?`;
        values.push(imageBuffer);
    }

    // Finish query
    query += ` WHERE testimonial_id = ?`;
    values.push(id);

    mysqlconnection.query(query, values, (err, result) => {
        if (err) {
            console.error("❌ MySQL Error:", err);
            return res.status(500).json({
                status: "error",
                message: "Error updating the testimonial",
                error: err.message,
                reqBody: req.body,
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                status: "not_found",
                message: "Testimonial not found",
                reqBody: req.body,
            });
        }

        // ✅ Return success with id and body
        res.status(200).json({
            status: "success",
            message: "Testimonial updated successfully",
            testimonial_id: id,
            reqBody: req.body,
        });
    });
});

TestimonialRouter.post('/delete', (req, res) => {
    const { testimonial_id } = req.body;

    console.log("Delete request body:", req.body);

    if (!testimonial_id) {
        return res.status(400).json({
            status: "error",
            message: "testimonial_id is required",
            reqBody: req.body,
        });
    }

    mysqlconnection.query(
        'DELETE FROM testimonials WHERE testimonial_id = ?',
        [testimonial_id],
        (error, result) => {
            if (error) {
                console.error("❌ MySQL delete error:", error);
                return res.status(500).json({
                    status: "error",
                    message: "Failed to delete testimonial",
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
                message: "Testimonial deleted successfully",
                testimonial_id,
            });
        }
    );
});


module.exports = TestimonialRouter;