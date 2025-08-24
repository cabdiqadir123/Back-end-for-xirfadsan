const { Router } = require('express')
const path = require('path');
const multer = require('multer');

const BlogRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

BlogRouter.get('/', (req, res) => {
    res.status(200).json('server on port 8000 and database is connected');
});

BlogRouter.get('/all', (req, res) => {
    mysqlconnection.query('select * from blog', (error, rows, fields) => {
        if (!error) {
            res.json(rows);
        } else {
            console.log(error);
        }
    });
});

BlogRouter.get("/image/:id", (req, res) => {
    const imageId = req.params.id;
    const query = "SELECT image FROM blog WHERE id=?";

    mysqlconnection.query(query, [imageId], (err, result) => {
        if (err) return res.status(500).send("Error fetching image");
        if (result.length === 0) return res.status(404).send("Image not found");

        // Set headers
        res.setHeader("Content-Type", "image/jpeg"); // adjust if you store PNGs
        res.setHeader("Cache-Control", "public, max-age=31536000"); // cache for 1 year
        res.setHeader("Content-Length", result[0].image.length);

        // Send raw buffer
        res.end(result[0].image);
    });
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

BlogRouter.post("/add", upload.single("image"), (req, res) => {
    const { title, blog } = req.body;
    const imageBuffer = req.file.buffer;
    const query = "INSERT INTO blog (title, blog, image) VALUES (?,?,?)";

    mysqlconnection.query(query, [title, blog, imageBuffer], (err, result) => {
        if (err) {
            return res.status(500).send("Error saving image to database");
        }
        res.status(200).send("Image uploaded successfully");
    });
});

BlogRouter.put("/update/:id", upload.single("image"), (req, res) => {
    const id = req.params.id;
    const { title, blog } = req.body;

    const imageBuffer = req.file?.buffer;

    // Build dynamic SQL
    let query = `
    UPDATE blog 
    SET title =?, blog =?
  `;
    const values = [title, blog];

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
            return res.status(500).send("Error updating the blog");
        }

        if (result.affectedRows === 0) {
            return res.status(404).send("blog not found");
        }

        res.status(200).send("blog updated successfully");
    });
});


BlogRouter.post('/delete', (req, res) => {
    const { id } = req.body;
    console.log(req.body);
    mysqlconnection.query('delete from blog where id=?'
        , [id], (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                res.json({ status: error });
            }
        });
});

module.exports = BlogRouter;