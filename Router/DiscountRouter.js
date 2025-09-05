const { Router } = require('express')
const path = require('path');
const multer = require('multer');

const DiscountRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

DiscountRouter.get('/', (req, res) => {
    res.status(200).json('server on port 8000 and database is connected');
});

DiscountRouter.get('/all', (req, res) => {
    mysqlconnection.query('select id, discount.sub_service_id,sub_service,sub_services.service_id,services.name AS servicename,price,sub_services.description,promocode,discount.description,per,end_date,discount.color,discount.created_at from discount INNER JOIN sub_services on discount.sub_service_id=sub_services.sub_service_id INNER JOIN services on services.service_id =sub_services.service_id ', (error, rows, fields) => {
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
    const { sub_service_id, promocode, description, per, end_date,color } = req.body;
    const imageBuffer = req.file.buffer;
    const query = "INSERT INTO discount (sub_service_id, promocode, description, per, image, end_date,color) VALUES ((select sub_service_id from sub_services where sub_service=?),?,?,?,?,?,?)";

    mysqlconnection.query(query, [sub_service_id, promocode, description, per, imageBuffer, end_date,color], (err, result) => {
        if (err) {
            return res.status(500).send("Error saving image to database");
        }
        res.status(200).send("Image uploaded successfully");
    });
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