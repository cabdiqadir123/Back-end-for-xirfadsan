const { Router } = require('express')
const path = require('path');
const multer = require('multer');

const BannerRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

BannerRouter.get('/', (req, res) => {
  res.status(200).json('server on port 8000 and database is connected');
});

BannerRouter.get('/all', (req, res) => {
  mysqlconnection.query('select * from banners', (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

BannerRouter.get("/image/:id", (req, res) => {
  const imageId = req.params.id;
  const query = "SELECT image FROM banners WHERE banner_id = ?";

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

BannerRouter.post("/add", upload.single("image"), (req, res) => {
  const imageBuffer = req.file.buffer;
  const query = "INSERT INTO banners (image) VALUES (?)";

  mysqlconnection.query(query, [imageBuffer], (err, result) => {
    if (err) {
      return res.status(500).send("Error saving image to database");
    }
    res.status(200).send("Image uploaded successfully");
  });
});

BannerRouter.put('/update', (req, res) => {
  const { image, banner_id } = req.body;
  console.log(req.body);
  mysqlconnection.query('update banners set image=? ,created_at=? where banner_id=?'
    , [image, banner_id], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'updated' });
      } else {
        console.log(error);
      }
    });
});

BannerRouter.delete('/delete', (req, res) => {
  const { banner_id } = req.body;
  console.log(req.body);
  mysqlconnection.query('delete from banners where banner_id=?'
    , [banner_id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        res.json({ status: error });
      }
    });
});

module.exports = BannerRouter;