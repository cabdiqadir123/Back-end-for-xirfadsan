const { Router } = require('express')
const path = require('path');
const multer = require('multer');
const generateToken = require("../GenerateToken.js");

const UserRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

UserRouter.get('/', (req, res) => {
  res.status(200).json('server on port 9000 and database is connected');
});

UserRouter.get('/all', (req, res) => {
  mysqlconnection.query('select id,name,email,password,phone,address,sex,role,status,token,created_at from users', (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

// for new dashoard
UserRouter.get('/allNew', (req, res) => {
  const query = `
    SELECT 
      u.id,
      u.name,
      u.email,
      u.password,
      u.phone,
      u.address,
      u.sex,
      u.role,
      u.status,
      u.token,
      u.created_at,
      COUNT(b.id) AS total_bookings
    FROM users u
    LEFT JOIN booking b ON u.id = b.user_id
    GROUP BY 
      u.id,
      u.name,
      u.email,
      u.password,
      u.phone,
      u.address,
      u.sex,
      u.role,
      u.status,
      u.token,
      u.created_at
    ORDER BY u.id ASC;
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


UserRouter.get('/customer/all', (req, res) => {
  mysqlconnection.query('select id,name,email,password,phone,address,sex,role,status,token,created_at from users where role="customer"', (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

UserRouter.get("/userrole/all/:id", (req, res) => {
  const id = req.params.id;
  const query = "select id,name,email,password,phone,address,sex,role,status,token,created_at from users WHERE role = ?";
  mysqlconnection.query(query, [id], (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

UserRouter.get("/customer/image/:id", (req, res) => {
  const imageId = req.params.id;
  const query = 'SELECT image FROM users WHERE id = ? and role="customer"';

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


UserRouter.get("/image/:id", (req, res) => {
  const imageId = req.params.id;
  const query = 'SELECT image FROM users WHERE id = ?';

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
UserRouter.post('/add', upload.single("image"), (req, res) => {
  try {
    const { name, email, password, phone, address, sex, role, status, created_at, token } = req.body;
    const imageBuffer = req.file.buffer;
    // Check if the user already exists
    mysqlconnection.query('SELECT id,name,email,password,phone,address,sex,role,status,token FROM users WHERE email = ? OR phone = ?', [email, phone], (error, rows) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }
      if (rows.length > 0) {
        return res.status(400).json({ message: "User already exists" });
      }
      // Insert new user into MySQL database
      const query = 'insert into users(name,email,password,phone,address,sex,role,status,image,created_at,token) values(?,?,?,?,?,?,?,?,?,?,?);';
      mysqlconnection.query(query, [name, email, password, phone, address, sex, role, status, imageBuffer, created_at, token], (error, result) => {
        if (error) {
          return res.status(500).json({ error: error.message });
        }

        const userId = result.insertId;

        res.status(200).json({
          id: userId,
          name,
          email,
          password,
          phone,
          address,
          sex,
          role,
          status,
          token: generateToken(userId),
        });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });
// UserRouter.post('/add', upload.single("image"), (req, res) => {
//   const { name, email, password, phone, sex, role, status } = req.body;
//   const imageBuffer = req.file.buffer;
//   const query = 'insert into users(name,email,password,phone,sex,role,status,image) values(?,?,?,?,?,?,?,?);';
//   mysqlconnection.query(query, [name, email, password, phone, sex, role, status, imageBuffer], (error, rows, fields) => {
//     if (error) {
//       return res.status(500).send("Error saving image to database");
//     }
//     res.status(200).send("Image uploaded successfully");
//   });
// });

UserRouter.put("/update/:id", upload.single("image"), (req, res) => {
  const id = req.params.id;
  const { name, email, password, phone, address, sex, role, status } = req.body;
  const imageBuffer = req.file?.buffer;

  // ✅ SQL keeps old values when input is null or empty string
  let query = `
    UPDATE users
    SET 
      name = COALESCE(NULLIF(?, ''), name),
      email = COALESCE(NULLIF(?, ''), email),
      password = COALESCE(NULLIF(?, ''), password),
      phone = COALESCE(NULLIF(?, ''), phone),
      address = COALESCE(NULLIF(?, ''), address),
      sex = COALESCE(NULLIF(?, ''), sex),
      role = COALESCE(NULLIF(?, ''), role),
      status = COALESCE(NULLIF(?, ''), status)
  `;

  const values = [name, email, password, phone, address, sex, role, status];

  // ✅ Only update image if provided
  if (imageBuffer) {
    query += `, image = ?`;
    values.push(imageBuffer);
  }

  query += ` WHERE id = ?`;
  values.push(id);

  mysqlconnection.query(query, values, (err, result) => {
    if (err) {
      console.error("❌ MySQL Error:", err);
      return res.status(500).json({
        error: "Database update failed",
        details: err.message,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Return success
    res.status(200).json({
      message: "User updated successfully",
      id,
      updatedFields: req.body,
    });
  });
});


UserRouter.put('/editphone/:id', (req, res) => {
  const id = req.params.id;
  const { phone } = req.body;
  console.log(req.body);
  mysqlconnection.query('update users set  phone= ? where id=?'
    , [phone, id], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'updated' });
      } else {
        console.log(error);
      }
    });
});

UserRouter.put('/status/:id', (req, res) => {
  const id = req.params.id;
  const { status } = req.body;
  console.log(req.body);
  mysqlconnection.query('update users set  status= ? where id=?'
    , [status, id], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'updated' });
      } else {
        console.log(error);
      }
    });
});

UserRouter.put('/updatepassword/:id', (req, res) => {
  const id = req.params.id;
  const { password } = req.body;
  console.log(req.body);
  mysqlconnection.query('update users set  password= ? where id=?'
    , [password, id], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'updated' });
      } else {
        console.log(error);
      }
    });
});

UserRouter.put('/forgetpassword/:id', (req, res) => {
  const id = req.params.id;
  const { password } = req.body;
  console.log(req.body);
  mysqlconnection.query('update users set  password= ? where email=?'
    , [password, id], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'updated' });
      } else {
        console.log(error);
      }
    });
});

UserRouter.put('/updatetoken/:id', (req, res) => {
  const id = req.params.id;
  const { token } = req.body;
  console.log(req.body);
  mysqlconnection.query('update users set token=? where phone=?'
    , [token, id], (error, rows, fields) => {
      if (!error) {
        res.json({ status: token });
      } else {
        console.log(error);
      }
    });
});

UserRouter.post('/delete', (req, res) => {
  const { id } = req.body;
  console.log(req.body);
  mysqlconnection.query('delete from users where id=?'
    , [id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        res.json({ status: error });
      }
    });
});

UserRouter.post('/login', (req, res) => {
  try {
    const { phone, password } = req.body;

    mysqlconnection.query('SELECT id,name,email,password,phone,address,sex,role,status,token,created_at FROM users WHERE phone = ?', [phone], (error, rows) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (rows.length > 0) {
        const user = rows[0];
        if (password === user.password) {
          if (user.status === "Active") {
            res.status(200).json({
              id: user.id,
              name: user.name,
              email: user.email,
              password: user.password,
              phone: user.phone,
              address: user.address,
              sex: user.sex,
              role: user.role,
              status: user.status,
              created_at: user.created_at,
              token: generateToken(user.id),
            });
          } else {
            res.status(201).json({ message: "blocked, ask admin permission" });
          }
        } else {
          res.status(404).json({ message: "Invalid email or password" });
        }
      } else {
        res.status(405).json({ message: "User not found" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

UserRouter.post('/profile', (req, res) => {
  try {
    const { email, token } = req.body;

    mysqlconnection.query('SELECT id,name,email,password,phone,address,sex,role,status,token,created_at FROM users WHERE email = ?', [email], (error, rows) => {
      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (rows.length > 0) {
        const user = rows[0];
        res.status(200).json({
          id: user.id,
          name: user.name,
          email: user.email,
          password: user.password,
          phone: user.phone,
          address: user.address,
          sex: user.sex,
          role: user.role,
          status: user.status,
          created_at: user.created_at,
          token,
        });
      } else {
        res.status(404).json({ message: "User not found" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = UserRouter;