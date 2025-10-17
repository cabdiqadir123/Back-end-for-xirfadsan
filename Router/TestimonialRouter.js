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
  const { name,person_role,title, description ,is_active} = req.body;
  const imageBuffer = req.file ? req.file.buffer : null;

  const query = "INSERT INTO testimonials (name,person_role,title, description, image,is_active) VALUES (?,?,?, ?, ?,?)";

  mysqlconnection.query(query, [name,person_role, title,description, imageBuffer,is_active], (err, result) => {
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

TestimonialRouter.post('/delete', (req, res) => {
    const { testimonial_id } = req.body;
    console.log(req.body);
    mysqlconnection.query('delete from testimonials where testimonial_id=?'
        , [testimonial_id], (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                res.json({ status: error });
            }
        });
});

module.exports = TestimonialRouter;