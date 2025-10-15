const { Router } = require('express')
const path = require('path');
const multer = require('multer');

const ServiceRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

ServiceRouter.get('/', (req, res) => {
  res.status(200).json('server on port 9000 and database is connected');
});

ServiceRouter.get('/all', (req, res) => {
  mysqlconnection.query('select service_id,name,image,color,created_at  from services', (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

ServiceRouter.get("/getbyservice/all/:id", (req, res) => {
  const service_id = req.params.id;
  const query = "select service_id,name,color,created_at from services WHERE service_id = (select service_id from suppliers WHERE user_id=?)";
  mysqlconnection.query(query, [service_id], (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

// ServiceRouter.get("/byimage/:id", (req, res) => {
//   const imageId = req.params.id;
//   const query = "SELECT image FROM services WHERE name = ?";
//   mysqlconnection.query(query, [imageId], (err, result) => {
//     if (err) {
//       return res.status(500).send("Error fetching image");
//     }
//     res.contentType("image/jpeg");
//     res.send(result[0].image); // Send the image buffer back as a response
//   });
// });

// ServiceRouter.get("/image/:id", (req, res) => {
//   const imageId = req.params.id;
//   const query = "SELECT image FROM services WHERE service_id = ?";
//   mysqlconnection.query(query, [imageId], (err, result) => {
//     if (err) {
//       return res.status(500).send("Error fetching image");
//     }
//     res.contentType("image/jpeg");
//     res.send(result[0].image); // Send the image buffer back as a response
//   });
// });

ServiceRouter.get("/secondry_image/:id", (req, res) => {
  const imageId = req.params.id;
  const query = "SELECT secondry_image FROM services WHERE service_id=?";
  mysqlconnection.query(query, [imageId], (err, result) => {
    if (err) {
      return res.status(500).send("Error fetching image");
    }
    res.contentType("image/jpeg");
    res.send(result[0].secondry_image); // Send the image buffer back as a response
  });
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

ServiceRouter.post(
  '/add',
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'secondry_image', maxCount: 1 }]),
  (req, res) => {
    const { name, color, created_at } = req.body;
    const imageBuffer1 = req.files?.image ? req.files.image[0].buffer.toString("utf-8") : null;
    const imageBuffer2 = req.files?.secondry_image ? req.files.secondry_image[0].buffer : null;

    const sql = 'INSERT INTO services (name, image, secondry_image, color, created_at) VALUES (?, ?, ?, ?, ?)';
    mysqlconnection.query(sql, [name, imageBuffer1, imageBuffer2, color, created_at], (error, result) => {
      if (error) {
        console.error('MySQL insert error:', error);
        return res.status(500).json({ error: 'Database insert failed', details: error.message });
      }

      res.json({
        status: 'inserted',
        id: result.insertId, // actual auto-increment ID
        name,
        color,
        created_at,
      });
    });
  }
);

ServiceRouter.put(
  "/update/:id",
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'secondry_image', maxCount: 1 },
  ]),
  (req, res) => {
    const id = req.params.id;
    const { name, color } = req.body;

    const imageBuffer = req.files?.image?.[0]?.buffer.toString("utf-8");
    const secondryImageBuffer = req.files?.secondry_image?.[0]?.buffer;

    // Start SQL and values
    let sql = "UPDATE services SET name = ?, color = ?";
    const values = [name, color];

    // Conditionally add image fields
    if (imageBuffer) {
      sql += ", image = ?";
      values.push(imageBuffer);
    }
    if (secondryImageBuffer) {
      sql += ", secondry_image = ?";
      values.push(secondryImageBuffer);
    }

    sql += " WHERE service_id = ?";
    values.push(id);

    mysqlconnection.query(sql, values, (err, result) => {
      if (err) {
        console.error('MySQL update error:', err);
        return res.status(500).json({ error: 'Database update failed', details: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).send("Service not found");
      }

      res.status(200).send("Service updated successfully");
    });
  }
);




// ServiceRouter.put('/update', (req, res) => {
//   const { name, image, secondry_image, created_at, service_id } = req.body;
//   console.log(req.body);
//   mysqlconnection.query('update services set name= ?, image= ?, secondry_image= ?, created_at=? where service_id=?'
//     , [name, image, secondry_image, created_at, service_id], (error, rows, fields) => {
//       if (!error) {
//         res.json({ status: 'updated' });
//       } else {
//         console.log(error);
//       }
//     });
// });

ServiceRouter.post('/delete', (req, res) => {
  const { service_id } = req.body;
  console.log(req.body);
  mysqlconnection.query('delete from services where service_id=?'
    , [service_id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        res.json({ status: error });
      }
    });
});

module.exports = ServiceRouter;