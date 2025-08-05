const express = require("express");
const mysql = require("mysql2");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

// Create a new express app
const app = express();

// Enable CORS
app.use(cors());

// Setup multer storage engine to store the uploaded image in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// MySQL database connection
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "", // replace with your MySQL password
    database: "servicemanagementsystem", // replace with your database name
});

// Create a table to store the image (if not exists)
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image LONGBLOB NOT NULL
  );
`;

pool.query(createTableQuery, (err, result) => {
    if (err) throw err;
    console.log("Table 'images' is ready!");
});

// Endpoint to upload image
app.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded");
    }

    // Insert the image buffer into the database
    const imageBuffer = req.file.buffer;
    const query = "INSERT INTO images (image) VALUES (?)";

    pool.query(query, [imageBuffer], (err, result) => {
        if (err) {
            return res.status(500).send("Error saving image to database");
        }
        res.status(200).send("Image uploaded successfully");
    });
});

// Endpoint to fetch image from the database
app.get("/images", (req, res) => {
    const query = "SELECT id FROM images";

    pool.query(query, (err, result) => {
        if (err) {
            return res.status(500).send("Error fetching images");
        }
        res.status(200).send(result); // Send back the list of image IDs
    });
});

app.get("/image/:id", (req, res) => {
    const imageId = req.params.id;
    const query = "SELECT image FROM images WHERE id = ?";
  
    pool.query(query, [imageId], (err, result) => {
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

// Start the server
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});
