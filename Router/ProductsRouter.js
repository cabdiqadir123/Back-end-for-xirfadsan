const { Router } = require('express')
const path = require('path');
const multer = require('multer');

const ProductRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

ProductRouter.get('/', (req, res) => {
  res.status(200).json('server on port 9000 and database is connected');
});

ProductRouter.get('/all', (req, res) => {
  mysqlconnection.query('select * from product', (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

ProductRouter.get("/image/:id", (req, res) => {
  const imageId = req.params.id;
  const query = "SELECT image FROM product WHERE product_id = ?";

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
ProductRouter.post('/add', upload.single("image"), (req, res) => {
  const { name, sub_service_id, unit_id, descibtion } = req.body;
  const imageBuffer = req.file.buffer;
  const query= 'insert into product(name,sub_service_id,unit_id,Descibtion,image) values(?,(select sub_service_id from sub_services where sub_service=?),(select unit_id from units where name=?),?,?);';
  mysqlconnection.query(query,[name, sub_service_id, unit_id, descibtion,imageBuffer], (error, rows, fields) => {
      if (error) {
        return res.status(500).send("Error saving image to database");
      }
      res.status(200).send("Image uploaded successfully");
    });
});

ProductRouter.put('/update', (req, res) => {
  const { name, service_id, sub_service_id, unit_id, Descibtion, image, product_id } = req.body;
  console.log(req.body);
  mysqlconnection.query('update product set name= ?, service_id= ?, sub_service_id= ?, unit_id=?, Descibtion=?, image=? where product_id=?'
    , [name, service_id, sub_service_id, unit_id, Descibtion, image, product_id], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'updated' });
      } else {
        console.log(error);
      }
    });
});

ProductRouter.post('/delete', (req, res) => {
  const { product_id } = req.body;
  console.log(req.body);
  mysqlconnection.query('delete from product where product_id=?'
    , [product_id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        res.json({ status: error });
      }
    });
});

module.exports = ProductRouter;