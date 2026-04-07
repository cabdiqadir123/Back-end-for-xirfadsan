const { Router } = require('express')
const path = require('path');
const multer = require('multer');

const DocumentRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

DocumentRouter.get('/', (req, res) => {
  res.status(200).json('server on port 8000 and database is connected');
});

DocumentRouter.get('/all', (req, res) => {

  const query = `
    SELECT
      d.id,
      d.tenant_id,
      d.book_id,
      d.file_type,
      d.status,
      d.created_at,

      u.full_name AS tenant_name,
      u.phone AS tenant_phone,
      u.email AS tenant_email

    FROM documents d
    LEFT JOIN users u ON d.tenant_id = u.id
  `;

  mysqlconnection.query(query, (error, rows) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
      res.status(500).json({ error: "Database error" });
    }
  });

});

DocumentRouter.get('/', (req, res) => {
  res.status(200).json('server on port 8000 and database is connected');
});

DocumentRouter.get("/all/:id", (req, res) => {
  const doc_id = req.params.id;

  const query = `
    SELECT
      d.id,
      d.tenant_id,
      d.book_id,
      d.file_type,
      d.status,
      d.created_at,

      u.full_name AS tenant_name,
      u.phone AS tenant_phone,
      u.email AS tenant_email

    FROM documents d
    LEFT JOIN users u ON d.tenant_id = u.id where u.id=?
  `;

  mysqlconnection.query(query, [doc_id], (error, rows) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
      res.status(500).json({ error: "Database error" });
    }
  });

});

DocumentRouter.get("/allNew/:id", (req, res) => {
  const doc_id = req.params.id;

  const query = `
    SELECT
      d.id,
      d.tenant_id,
      d.book_id,
      d.file_type,
      d.status,
      d.created_at,

      u.full_name AS tenant_name,
      u.phone AS tenant_phone,
      u.email AS tenant_email

    FROM documents d
    LEFT JOIN users u ON d.tenant_id = u.id where u.id=?
  `;

  mysqlconnection.query(query, [doc_id], (error, rows) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
      res.status(500).json({ error: "Database error" });
    }
  });

});

DocumentRouter.get("/image/:id", (req, res) => {
  const imageId = req.params.id;
  const query = "SELECT file FROM documents WHERE id=?";

  mysqlconnection.query(query, [imageId], (err, result) => {
    if (err) {
      return res.status(500).send("Error fetching file");
    }
    if (result.length === 0) {
      return res.status(404).send("file not found");
    }

    res.contentType("image/jpeg");
    res.send(result[0].file); // Send the image buffer back as a response
  });
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

DocumentRouter.post("/add", upload.single("file"), (req, res) => {
  const { tenant_id, book_id, file_type, status, created_at } = req.body;
  const imageBuffer = req.file.buffer;
  const query = "INSERT INTO documents (tenant_id ,book_id  ,file , file_type ,status ,created_at) VALUES (?,?,?,?,?,?)";

  mysqlconnection.query(query, [tenant_id, book_id, imageBuffer, file_type, status, created_at], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Error saving image to database",
        error: err
      });
    }
    res.status(200).send("Image uploaded successfully");
  });
});

//for new typescript dashboard
DocumentRouter.post("/add_New", upload.single("image"), (req, res) => {
  const { tenant_id, book_id, file_type, status, created_at } = req.body;
  const imageBuffer = req.file?.buffer;

  const query = "INSERT INTO documents (tenant_id ,book_id   , file, file_type ,status ,created_at) VALUES (?,?,?,?,?,?)";
  const values = [tenant_id, book_id, imageBuffer || null, , file_type, status, created_at];

  mysqlconnection.query(query, values, (err, result) => {
    if (err) {
      console.error("❌ MySQL insert error:", err);
      return res.status(500).json({
        status: "error",
        message: "Failed to save documents",
        error: err.message,
        reqBody: req.body,
      });
    }

    res.status(200).json({
      status: "success",
      message: "Blog created successfully",
      id: result.insertId,
      reqBody: req.body,
    });
  });
});

DocumentRouter.put("/update/:id", upload.single("image"), (req, res) => {
  const id = req.params.id;
  const { file_type, status } = req.body;

  const imageBuffer = req.file?.buffer;

  // Build dynamic SQL
  let query = `
    UPDATE documents 
    SET file_type=? ,status =?
  `;
  const values = [file_type, status];

  // Only update image if a new one is uploaded
  if (imageBuffer) {
    query += `, file = ?`;
    values.push(imageBuffer);
  }

  query += ` WHERE id = ?`;
  values.push(id);

  mysqlconnection.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Error updating the documents");
    }

    if (result.affectedRows === 0) {
      return res.status(404).send("documents not found");
    }

    res.status(200).send("documents updated successfully");
  });
});

// for new typescript dashboard
DocumentRouter.put("/updateNew/:id", upload.single("image"), (req, res) => {
  const id = req.params.id;
  let { file_type, status } = req.body;


  const imageBuffer = req.file?.buffer;

  // Build dynamic SQL
  let query = `
    UPDATE documents 
    SET file_type=? ,status =?
  `;
  const values = [file_type, status];

  // Only update image if a new one is uploaded
  if (imageBuffer) {
    query += `, file = ?`;
    values.push(imageBuffer);
  }

  query += ` WHERE id = ?`;
  values.push(id);

  mysqlconnection.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error updating the blog", details: err });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Blog not found" });
    }

    // Return updated blog ID
    res.status(200).json({ id, message: "Blog updated successfully" });
  });
});


DocumentRouter.post('/delete', (req, res) => {
  const { id } = req.body;
  console.log(req.body);
  mysqlconnection.query('delete from documents where id=?'
    , [id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        res.json({ status: error });
      }
    });
});

module.exports = DocumentRouter;