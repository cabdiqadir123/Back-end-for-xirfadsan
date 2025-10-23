const { Router } = require('express')
const path = require('path');
const multer = require('multer');

const SubServiceRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

SubServiceRouter.get('/', (req, res) => {
  res.status(200).json('server on port 9000 and database is connected');
});

SubServiceRouter.get('/all', (req, res) => {
  mysqlconnection.query('SELECT s.sub_service_id, s.sub_service, s.price, s.description, s.service_id,services.name,COALESCE(MAX(f.id), 0) AS favourite_id,COALESCE(MAX(f.user_id), 0) AS favourite_user_id FROM sub_services s inner join services on services.service_id = s.service_id LEFT JOIN favourite f ON s.sub_service_id = f.sub_service_id GROUP BY s.sub_service_id, s.sub_service, s.price, s.description, s.service_id', (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

// for new typescript dashboard
SubServiceRouter.get('/allNew', (req, res) => {
  const query = `
    SELECT 
    ss.sub_service_id,
    ss.sub_service,
    ss.price,
    ss.description,
    ss.status,
    ss.service_id,
    services.name,
    IFNULL(COUNT(bs.id), 0) AS total_booked
    FROM sub_services ss
    LEFT JOIN booking_sub_services bs ON ss.sub_service_id = bs.sub_service_id
    inner join services on services.service_id = ss.service_id 
    GROUP BY 
        ss.sub_service_id,
        ss.sub_service,
        ss.price,
        ss.description,
        ss.service_id
    ORDER BY ss.sub_service_id ASC;
  `;

  mysqlconnection.query(query, (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
      res.status(500).json({ error: 'Database query failed' });
    }
  });
});


SubServiceRouter.get('/all_app/:id', (req, res) => {
  const id = req.params.id;
  mysqlconnection.query('SELECT sub_services.sub_service_id, sub_service, price, description,sub_services.status,sub_services.service_id,services.name, COALESCE(favourite.id, 0) AS favourite_id, COALESCE(favourite.user_id, 0) AS favourite_user_id FROM sub_services inner join services on services.service_id  =sub_services.service_id LEFT JOIN favourite ON sub_services.sub_service_id = favourite.sub_service_id AND favourite.user_id = ?', [id], (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

SubServiceRouter.get("/service/all/:id", (req, res) => {
  const service_id = req.params.id;
  const query = "select sub_service from sub_services WHERE service_id = (select service_id from suppliers WHERE user_id=(select id from users where name=?))";
  mysqlconnection.query(query, [service_id], (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});


SubServiceRouter.get("/getsupplier/all/:id", (req, res) => {
  const service_id = req.params.id;
  const query = "select * from sub_services WHERE service_id = (select service_id from suppliers WHERE user_id=?)";
  mysqlconnection.query(query, [service_id], (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});


SubServiceRouter.get("/image/:id", (req, res) => {
  const imageId = req.params.id;
  const query = "SELECT image FROM sub_services WHERE sub_service_id = ?";

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

SubServiceRouter.get("/image_byname/:id", (req, res) => {
  const imageId = req.params.id;
  const query = "SELECT image FROM sub_services WHERE sub_service = ?";

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

SubServiceRouter.post('/add', upload.fields([{ name: 'image', maxCount: 1 }]), (req, res) => {
  const { sub_service, description, service_id, price, created_at } = req.body;
  const imageBuffer = req.files && req.files.image ? req.files.image[0].buffer : null;
  const query = 'insert into sub_services(sub_service,description,service_id,price,image,created_at) values(?,?,(select service_id from services where name=?),?,?,?);';
  mysqlconnection.query(query,
    [sub_service, description, service_id, price, imageBuffer, created_at
    ], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'inserted' });
      } else {
        console.log(error);
      }
    });
});

// for typescript dashboard
SubServiceRouter.post(
  '/add_new',
  upload.fields([{ name: 'image', maxCount: 1 }]),
  (req, res) => {
    const { sub_service, description, service_id, price,status, created_at } = req.body;
    const imageBuffer = req.files?.image ? req.files.image[0].buffer : null;

    const query = `
      INSERT INTO sub_services 
      (sub_service, description, service_id, price, image,status, created_at) 
      VALUES (?, ?, ?, ?, ?, ?,?)
    `;

    mysqlconnection.query(
      query,
      [sub_service, description, service_id, price, imageBuffer,status, created_at],
      (error, result) => {
        if (error) {
          console.error('MySQL insert error:', error);
          return res.status(500).json({ error: 'Database insert failed', details: error.message });
        }

        res.json({
          status: 'inserted',
          id: result.insertId, // the auto-incremented ID
          sub_service,
          service_id,
          price,
          created_at,
        });
      }
    );
  }
);

SubServiceRouter.put(
  "/update/:id",
  upload.fields([
    { name: 'image', maxCount: 1 },
  ]),
  (req, res) => {
    const id = req.params.id;
    const { sub_service, description, service_id, price } = req.body;

    // Collect file buffers only if present
    const fileFields = {
      image: req.files?.image?.[0]?.buffer,
    };

    // Start query and values
    let query = "UPDATE sub_services SET sub_service = ?, description = ? , service_id=(select service_id from services where name=?),	price=?";
    const values = [sub_service, description, service_id, price];

    // Dynamically append file fields to SQL and values
    for (const [key, buffer] of Object.entries(fileFields)) {
      if (buffer) {
        query += `, ${key} = ?`;
        values.push(buffer);
      }
    }

    query += " WHERE sub_service_id = ?";
    values.push(id);

    mysqlconnection.query(query, values, (err, result) => {
      if (err) {
        console.error("MySQL Error:", err);
        return res.status(500).send("Database update failed");
      }

      if (result.affectedRows === 0) {
        return res.status(404).send("Sub-service not found");
      }

      res.status(200).send("Sub-service updated successfully");
    });
  }
);

SubServiceRouter.put(
  "/updateNew/:id",
  upload.fields([
    { name: 'image', maxCount: 1 },
  ]),
  (req, res) => {
    const id = req.params.id;
    const { sub_service, description, service_id, price ,status} = req.body;

    // Collect file buffers only if present
    const fileFields = {
      image: req.files?.image?.[0]?.buffer,
    };

    // Start query and values
    let query = "UPDATE sub_services SET sub_service = ?, description = ? , service_id=?,	price=?, status=?";
    const values = [sub_service, description, service_id, price,status];

    // Dynamically append file fields to SQL and values
    for (const [key, buffer] of Object.entries(fileFields)) {
      if (buffer) {
        query += `, ${key} = ?`;
        values.push(buffer);
      }
    }

    query += " WHERE sub_service_id = ?";
    values.push(id);

    mysqlconnection.query(query, values, (err, result) => {
      if (err) {
        console.error("MySQL Error:", err);
        return res.status(500).json({ error: 'Database update failed', details: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).send("Sub-service not found");
      }

      res.status(200).send("Sub-service updated successfully");
    });
  }
);



SubServiceRouter.put('/updaterating/:id', (req, res) => {
  const id = req.params.id;
  const { rating_service, num_of_rating } = req.body;
  console.log(req.body);
  mysqlconnection.query('update sub_services set rating_service=?,num_of_rating=? where sub_service_id=?'
    , [rating_service, num_of_rating, id], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'updated' });
      } else {
        console.log(error);
      }
    });
});

// SubServiceRouter.put("/update/:id", upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gl1', maxCount: 1 }, , { name: 'gl2', maxCount: 1 },
//   , { name: 'gl3', maxCount: 1 }, , { name: 'gl4', maxCount: 1 }, , { name: 'gl5', maxCount: 1 }, , { name: 'gl6', maxCount: 1 }
// ]), (req, res) => {
//   const id = req.params.id;
//   const { sub_service, service_id, price } = req.body;
//   const imageBuffer = req.files && req.files.image ? req.files.image[0].buffer : null;
//   const imageBuffer1 = req.files && req.files.gl1 ? req.files.gl1[0].buffer : null;
//   const imageBuffer2 = req.files && req.files.gl2 ? req.files.gl2[0].buffer : null;
//   const imageBuffer3 = req.files && req.files.gl3 ? req.files.gl3[0].buffer : null;
//   const imageBuffer4 = req.files && req.files.gl4 ? req.files.gl4[0].buffer : null;
//   const imageBuffer5 = req.files && req.files.gl5 ? req.files.gl5[0].buffer : null;
//   const imageBuffer6 = req.files && req.files.gl6 ? req.files.gl6[0].buffer : null;
//   const query = 'update sub_services set sub_service=?,service_id=?,price=?,image=?,gl1=?,gl2=?,gl3=?,gl4=?,gl5=?,gl6=? where sub_service_id=?';
//   mysqlconnection.query(query,
//     [sub_service, service_id, price, imageBuffer, imageBuffer1, imageBuffer2, imageBuffer3,
//       imageBuffer4, imageBuffer5, imageBuffer6, id
//     ], (err, rows, fields) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).send("Error updating the testimonial");
//       }

//       if (result.affectedRows === 0) {
//         return res.status(404).send("Testimonial not found");
//       }

//       res.status(200).send("Testimonial updated successfully");
//     });
// });

// SubServiceRouter.put('/update', (req, res) => {
//   const { name, image, secondry_image, created_at, service_id } = req.body;
//   console.log(req.body);
//   mysqlconnection.query('update sub_services set sub_service= ?, service_id= ?, image= ?, created_at=? where sub_service_id=?'
//     , [name, image, secondry_image, created_at, service_id], (error, rows, fields) => {
//       if (!error) {
//         res.json({ status: 'updated' });
//       } else {
//         console.log(error);
//       }
//     });
// });

SubServiceRouter.post('/delete', (req, res) => {
  const { sub_service_id } = req.body;
  console.log(req.body);
  mysqlconnection.query('delete from sub_services where sub_service_id=?'
    , [sub_service_id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        res.json({ status: error });
      }
    });
});

module.exports = SubServiceRouter;