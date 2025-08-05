[33mcommit c6959f04b3b9eff404c3cdd59d28614e42017de3[m[33m ([m[1;36mHEAD -> [m[1;32mmain[m[33m)[m
Author: cabdiqaadir123 <khadarqaalid809@gmail.com>
Date:   Mon Aug 4 18:42:53 2025 +0300

    first commit

[1mdiff --git a/.env b/.env[m
[1mnew file mode 100644[m
[1mindex 0000000..cc2b173[m
[1m--- /dev/null[m
[1m+++ b/.env[m
[36m@@ -0,0 +1 @@[m
[32m+[m[32mMONGODB_URL= mongodb://localhost:27017/banaadirzoneapp[m
\ No newline at end of file[m
[1mdiff --git a/Controler.js b/Controler.js[m
[1mnew file mode 100644[m
[1mindex 0000000..fca062c[m
[1m--- /dev/null[m
[1m+++ b/Controler.js[m
[36m@@ -0,0 +1,85 @@[m
[32m+[m[32mimport generateToken from "./GenerateToken.js";[m
[32m+[m[32mimport Users from "./models/Usermodel.js";[m
[32m+[m
[32m+[m[32mexport const login = async (req, res) => {[m
[32m+[m[32m  try {[m
[32m+[m[32m    const { email, password } = req.body;[m
[32m+[m
[32m+[m[32m    const users = await Users.findOne({ email });[m
[32m+[m[32m    if (users && password == users.password) {[m
[32m+[m[32m      res.status(200).json({[m
[32m+[m[32m        _id: users._id,[m
[32m+[m[32m        username: users.username,[m
[32m+[m[32m        email: users.email,[m
[32m+[m[32m        password: users.password,[m
[32m+[m[32m        number: users.number,[m
[32m+[m[32m        address: users.address,[m
[32m+[m[32m        role: users.role,[m
[32m+[m[32m        token: generateToken(users._id),[m
[32m+[m[32m      });[m
[32m+[m[32m    } else {[m
[32m+[m[32m      res.status(404).json({ message: "invalid email or password" });[m
[32m+[m[32m    }[m
[32m+[m[32m  } catch (error) {[m
[32m+[m[32m    res.status(500).json({ error: error.message });[m
[32m+[m[32m  }[m
[32m+[m[32m};[m
[32m+[m
[32m+[m[32mexport const register = async (req, res) => {[m
[32m+[m[32m  try {[m
[32m+[m[32m    const { username, email, password, number, address,role } = req.body;[m
[32m+[m[32m    const userExists = await Users.findOne({ email,username });[m
[32m+[m[32m    if (userExists) {[m
[32m+[m[32m      res.status(400).json({ message: "user already exists" });[m
[32m+[m[32m    } else {[m
[32m+[m[32m      const user = Users.create({[m
[32m+[m[32m        username,[m
[32m+[m[32m        email,[m
[32m+[m[32m        password,[m
[32m+[m[32m        number,[m
[32m+[m[32m        address,[m
[32m+[m[32m        role,[m
[32m+[m[32m      });[m
[32m+[m
[32m+[m[32m      if (user) {[m
[32m+[m[32m        res.status(201).json({[m
[32m+[m[32m          _id: user._id,[m
[32m+[m[32m          username: user.username,[m
[32m+[m[32m          email: user.email,[m
[32m+[m[32m          password: user.password,[m
[32m+[m[32m          number: user.number,[m
[32m+[m[32m          address: user.address,[m
[32m+[m[32m          role: user.role,[m
[32m+[m[32m          token: generateToken(user._id),[m
[32m+[m[32m        });[m
[32m+[m[32m      } else {[m
[32m+[m[32m        res.status(401).json({ message: "Invalid User Data" });[m
[32m+[m[32m      }[m
[32m+[m[32m    }[m
[32m+[m[32m  } catch (error) {[m
[32m+[m[32m    res.status(500).json({ error: error.message });[m
[32m+[m[32m  }[m
[32m+[m[32m};[m
[32m+[m
[32m+[m[32mexport const getUserprofile = async (req, res) => {[m
[32m+[m[32m  try {[m
[32m+[m[32m    const { id, token } = req.body;[m
[32m+[m[32m    const user = await Users.findById(id);[m
[32m+[m[32m    if (user) {[m
[32m+[m[32m      res.status(200).json({[m
[32m+[m[32m        _id: user._id,[m
[32m+[m[32m        username: user.username,[m
[32m+[m[32m        email: user.email,[m
[32m+[m[32m        password: user.password,[m
[32m+[m[32m        number: user.number,[m
[32m+[m[32m        address: user.address,[m
[32m+[m[32m        role: user.role,[m
[32m+[m[32m        token,[m
[32m+[m[32m      });[m
[32m+[m[32m    } else {[m
[32m+[m[32m      res.status(404).json({ message: "invalid data" });[m
[32m+[m[32m    }[m
[32m+[m[32m  } catch (error) {[m
[32m+[m[32m    res.status(500).json({ error: error.message });[m
[32m+[m[32m  }[m
[32m+[m[32m};[m
[1mdiff --git a/GenerateToken.js b/GenerateToken.js[m
[1mnew file mode 100644[m
[1mindex 0000000..23778ac[m
[1m--- /dev/null[m
[1m+++ b/GenerateToken.js[m
[36m@@ -0,0 +1,6 @@[m
[32m+[m[32mconst JWT = require('jsonwebtoken');[m
[32m+[m
[32m+[m[32mconst generateToken=(id )=>{[m
[32m+[m[32m    return JWT.sign({id},"group72")[m
[32m+[m[32m}[m
[32m+[m[32mmodule.exports = generateToken;[m
[1mdiff --git a/Router/BannerRouter.js b/Router/BannerRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..05afeeb[m
[1m--- /dev/null[m
[1m+++ b/Router/BannerRouter.js[m
[36m@@ -0,0 +1,81 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m[32mconst path = require('path');[m
[32m+[m[32mconst multer = require('multer');[m
[32m+[m
[32m+[m[32mconst BannerRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mBannerRouter.get('/', (req, res) => {[m
[32m+[m[32m  res.status(200).json('server on port 8000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mBannerRouter.get('/all', (req, res) => {[m
[32m+[m[32m  mysqlconnection.query('select * from banners', (error, rows, fields) => {[m
[32m+[m[32m    if (!error) {[m
[32m+[m[32m      res.json(rows);[m
[32m+[m[32m    } else {[m
[32m+[m[32m      console.log(error);[m
[32m+[m[32m    }[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mBannerRouter.get("/image/:id", (req, res) => {[m
[32m+[m[32m  const imageId = req.params.id;[m
[32m+[m[32m  const query = "SELECT image FROM banners WHERE banner_id = ?";[m
[32m+[m
[32m+[m[32m  mysqlconnection.query(query, [imageId], (err, result) => {[m
[32m+[m[32m    if (err) {[m
[32m+[m[32m      return res.status(500).send("Error fetching image");[m
[32m+[m[32m    }[m
[32m+[m[32m    if (result.length === 0) {[m
[32m+[m[32m      return res.status(404).send("Image not found");[m
[32m+[m[32m    }[m
[32m+[m[41m    [m
[32m+[m[32m    res.contentType("image/jpeg");[m
[32m+[m[32m    res.send(result[0].image); // Send the image buffer back as a response[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mconst storage = multer.memoryStorage();[m
[32m+[m[32mconst upload = multer({ storage: storage });[m
[32m+[m
[32m+[m[32mBannerRouter.post("/add", upload.single("image"), (req, res) => {[m
[32m+[m[32m  const imageBuffer = req.file.buffer;[m
[32m+[m[32m  const query = "INSERT INTO banners (image) VALUES (?)";[m
[32m+[m
[32m+[m[32m  mysqlconnection.query(query, [imageBuffer], (err, result) => {[m
[32m+[m[32m    if (err) {[m
[32m+[m[32m      return res.status(500).send("Error saving image to database");[m
[32m+[m[32m    }[m
[32m+[m[32m    res.status(200).send("Image uploaded successfully");[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mBannerRouter.put('/update', (req, res) => {[m
[32m+[m[32m  const { image, banner_id } = req.body;[m
[32m+[m[32m  console.log(req.body);[m
[32m+[m[32m  mysqlconnection.query('update banners set image=? ,created_at=? where banner_id=?'[m
[32m+[m[32m    , [image, banner_id], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json({ status: 'updated' });[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.log(error);[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mBannerRouter.delete('/delete', (req, res) => {[m
[32m+[m[32m  const { banner_id } = req.body;[m
[32m+[m[32m  console.log(req.body);[m
[32m+[m[32m  mysqlconnection.query('delete from banners where banner_id=?'[m
[32m+[m[32m    , [banner_id], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json(rows);[m
[32m+[m[32m      } else {[m
[32m+[m[32m        res.json({ status: error });[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = BannerRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Router/BlogRouter.js b/Router/BlogRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..e7f3a0c[m
[1m--- /dev/null[m
[1m+++ b/Router/BlogRouter.js[m
[36m@@ -0,0 +1,107 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m[32mconst path = require('path');[m
[32m+[m[32mconst multer = require('multer');[m
[32m+[m
[32m+[m[32mconst BlogRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mBlogRouter.get('/', (req, res) => {[m
[32m+[m[32m    res.status(200).json('server on port 8000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mBlogRouter.get('/all', (req, res) => {[m
[32m+[m[32m    mysqlconnection.query('select * from blog', (error, rows, fields) => {[m
[32m+[m[32m        if (!error) {[m
[32m+[m[32m            res.json(rows);[m
[32m+[m[32m        } else {[m
[32m+[m[32m            console.log(error);[m
[32m+[m[32m        }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mBlogRouter.get("/image/:id", (req, res) => {[m
[32m+[m[32m    const imageId = req.params.id;[m
[32m+[m[32m    const query = "SELECT image FROM blog WHERE id=?";[m
[32m+[m
[32m+[m[32m    mysqlconnection.query(query, [imageId], (err, result) => {[m
[32m+[m[32m        if (err) {[m
[32m+[m[32m            return res.status(500).send("Error fetching image");[m
[32m+[m[32m        }[m
[32m+[m[32m        if (result.length === 0) {[m
[32m+[m[32m            return res.status(404).send("Image not found");[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m        res.contentType("image/jpeg");[m
[32m+[m[32m        res.send(result[0].image); // Send the image buffer back as a response[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mconst storage = multer.memoryStorage();[m
[32m+[m[32mconst upload = multer({ storage: storage });[m
[32m+[m
[32m+[m[32mBlogRouter.post("/add", upload.single("image"), (req, res) => {[m
[32m+[m[32m    const { title, blog } = req.body;[m
[32m+[m[32m    const imageBuffer = req.file.buffer;[m
[32m+[m[32m    const query = "INSERT INTO blog (title, blog, image) VALUES (?,?,?)";[m
[32m+[m
[32m+[m[32m    mysqlconnection.query(query, [title, blog, imageBuffer], (err, result) => {[m
[32m+[m[32m        if (err) {[m
[32m+[m[32m            return res.status(500).send("Error saving image to database");[m
[32m+[m[32m        }[m
[32m+[m[32m        res.status(200).send("Image uploaded successfully");[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mBlogRouter.put("/update/:id", upload.single("image"), (req, res) => {[m
[32m+[m[32m  const id = req.params.id;[m
[32m+[m[32m  const { title, blog  } = req.body;[m
[32m+[m
[32m+[m[32m  const imageBuffer = req.file?.buffer;[m
[32m+[m
[32m+[m[32m  // Build dynamic SQL[m
[32m+[m[32m  let query = `[m
[32m+[m[32m    UPDATE blog[m[41m [m
[32m+[m[32m    SET title =?, blog =?[m
[32m+[m[32m  `;[m
[32m+[m[32m  const values = [title, blog ];[m
[32m+[m
[32m+[m[32m  // Only update image if a new one is uploaded[m
[32m+[m[32m  if (imageBuffer) {[m
[32m+[m[32m    query += `, image = ?`;[m
[32m+[m[32m    values.push(imageBuffer);[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  query += ` WHERE id = ?`;[m
[32m+[m[32m  values.push(id);[m
[32m+[m
[32m+[m[32m  mysqlconnection.query(query, values, (err, result) => {[m
[32m+[m[32m    if (err) {[m
[32m+[m[32m      console.error(err);[m
[32m+[m[32m      return res.status(500).send("Error updating the blog");[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    if (result.affectedRows === 0) {[m
[32m+[m[32m      return res.status(404).send("Discount not found");[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    res.status(200).send("blog updated successfully");[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m
[32m+[m
[32m+[m[32mBlogRouter.delete('/delete', (req, res) => {[m
[32m+[m[32m    const { banner_id } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('delete from blog where id=?'[m
[32m+[m[32m        , [banner_id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                res.json({ status: error });[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = BlogRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Router/BookingRouter.js b/Router/BookingRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..fefa272[m
[1m--- /dev/null[m
[1m+++ b/Router/BookingRouter.js[m
[36m@@ -0,0 +1,115 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m
[32m+[m[32mconst BookingRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mBookingRouter.get('/', (req, res) => {[m
[32m+[m[32m    res.status(200).json('server on port 9000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mBookingRouter.get('/all', (req, res) => {[m
[32m+[m[32m    mysqlconnection.query('select bookings.id,book_id,customer_id,bookings.sub_service_id,sub_service,bookings.sub_service_id,name,email,password,phone,booking_status,bookings.created_at,startdate,bookings.staff_id,amount from users inner join bookings on bookings.customer_id=users.id inner join sub_services on bookings.sub_service_id=sub_services.sub_service_id',[m
[32m+[m[32m        (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mBookingRouter.get('/pending/all', (req, res) => {[m
[32m+[m[32m    mysqlconnection.query('select * from bookings where booking_status="Pending"', (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json(rows);[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.log(error);[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m  });[m
[32m+[m[41m  [m
[32m+[m[32m  BookingRouter.get('/process/all', (req, res) => {[m
[32m+[m[32m    mysqlconnection.query('select * from bookings where booking_status="Process"', (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json(rows);[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.log(error);[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m  });[m
[32m+[m[41m  [m
[32m+[m[32m  BookingRouter.get('/finished/all', (req, res) => {[m
[32m+[m[32m    mysqlconnection.query('select * from bookings where booking_status="Finished"', (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json(rows);[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.log(error);[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m  });[m
[32m+[m[41m  [m
[32m+[m[32m  BookingRouter.get('/cancelled/all', (req, res) => {[m
[32m+[m[32m    mysqlconnection.query('select * from bookings where booking_status="Cancelled"', (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json(rows);[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.log(error);[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m  });[m
[32m+[m
[32m+[m[32mBookingRouter.post('/add', (req, res) => {[m
[32m+[m[32m    const { book_id,customer_id, sub_service_id,address, booking_status,amount,staff_id,startdate} = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('insert into bookings(book_id,customer_id,sub_service_id,address,booking_status,amount,staff_id,startdate) values(?,?,?,?,?,?,?,?);',[m
[32m+[m[32m        [book_id,customer_id, sub_service_id, address, booking_status,amount,staff_id,startdate], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'inserted' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mBookingRouter.put('/update', (req, res) => {[m
[32m+[m[32m    const { name, image, secondry_image, created_at, service_id } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('update services set name= ?, image= ?, secondry_image= ?, created_at=? where service_id=?'[m
[32m+[m[32m        , [name, image, secondry_image, created_at, service_id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'updated' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mBookingRouter.put('/updatestatus/:id', (req, res) => {[m
[32m+[m[32m  const id = req.params.id;[m
[32m+[m[32m  const { booking_status } = req.body;[m
[32m+[m[32m  console.log(req.body);[m
[32m+[m[32m  mysqlconnection.query('update Bookings set booking_status= ? where id=?'[m
[32m+[m[32m      , [booking_status,  id], (error, rows, fields) => {[m
[32m+[m[32m          if (!error) {[m
[32m+[m[32m              res.json({ status: 'updated' });[m
[32m+[m[32m          } else {[m
[32m+[m[32m              console.log(error);[m
[32m+[m[32m          }[m
[32m+[m[32m      });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mBookingRouter.post('/delete', (req, res) => {[m
[32m+[m[32m    const { supplier_id } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('delete from bookings where id=?'[m
[32m+[m[32m        , [supplier_id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                res.json({ status: error });[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = BookingRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Router/ComplaintRouter.js b/Router/ComplaintRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..42429d3[m
[1m--- /dev/null[m
[1m+++ b/Router/ComplaintRouter.js[m
[36m@@ -0,0 +1,61 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m
[32m+[m[32mconst ComplaintRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mComplaintRouter.get('/', (req, res) => {[m
[32m+[m[32m    res.status(200).json('server on port 9000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mComplaintRouter.get('/all', (req, res) => {[m
[32m+[m[32m    mysqlconnection.query('select complaint_id,user_id,name,complaint,book_id,complaint.created_at from users inner join complaint on complaint.user_id=users.id',[m
[32m+[m[32m        (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mComplaintRouter.post('/add', (req, res) => {[m
[32m+[m[32m    const { user_id, complaint, book_id} = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('insert into complaint(user_id,complaint,book_id) values(?,?,?);',[m
[32m+[m[32m        [user_id, complaint,book_id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'inserted' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mComplaintRouter.put('/update', (req, res) => {[m
[32m+[m[32m    const { name, image, secondry_image, created_at, service_id } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('update staff set name= ?, image= ?, secondry_image= ?, created_at=? where service_id=?'[m
[32m+[m[32m        , [name, image, secondry_image, created_at, service_id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'updated' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mComplaintRouter.post('/delete', (req, res) => {[m
[32m+[m[32m    const { staff_id } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('delete from complaint where complaint_id=?'[m
[32m+[m[32m        , [staff_id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                res.json({ status: error });[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = ComplaintRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Router/DiscountRouter.js b/Router/DiscountRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..035d8d0[m
[1m--- /dev/null[m
[1m+++ b/Router/DiscountRouter.js[m
[36m@@ -0,0 +1,107 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m[32mconst path = require('path');[m
[32m+[m[32mconst multer = require('multer');[m
[32m+[m
[32m+[m[32mconst DiscountRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mDiscountRouter.get('/', (req, res) => {[m
[32m+[m[32m    res.status(200).json('server on port 8000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mDiscountRouter.get('/all', (req, res) => {[m
[32m+[m[32m    mysqlconnection.query('select id, discount.sub_service_id,sub_service,sub_services.description,promocode,discount.description,per,end_date,color,discount.created_at from discount INNER JOIN sub_services on discount.sub_service_id=sub_services.sub_service_id', (error, rows, fields) => {[m
[32m+[m[32m        if (!error) {[m
[32m+[m[32m            res.json(rows);[m
[32m+[m[32m        } else {[m
[32m+[m[32m            console.log(error);[m
[32m+[m[32m        }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mDiscountRouter.get("/image/:id", (req, res) => {[m
[32m+[m[32m    const imageId = req.params.id;[m
[32m+[m[32m    const query = "SELECT image FROM discount WHERE id=?";[m
[32m+[m
[32m+[m[32m    mysqlconnection.query(query, [imageId], (err, result) => {[m
[32m+[m[32m        if (err) {[m
[32m+[m[32m            return res.status(500).send("Error fetching image");[m
[32m+[m[32m        }[m
[32m+[m[32m        if (result.length === 0) {[m
[32m+[m[32m            return res.status(404).send("Image not found");[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m        res.contentType("image/jpeg");[m
[32m+[m[32m        res.send(result[0].image); // Send the image buffer back as a response[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mconst storage = multer.memoryStorage();[m
[32m+[m[32mconst upload = multer({ storage: storage });[m
[32m+[m
[32m+[m[32mDiscountRouter.post("/add", upload.single("image"), (req, res) => {[m
[32m+[m[32m    const { sub_service_id, promocode, description, per, end_date,color } = req.body;[m
[32m+[m[32m    const imageBuffer = req.file.buffer;[m
[32m+[m[32m    const query = "INSERT INTO discount (sub_service_id, promocode, description, per, image, end_date,color) VALUES ((select sub_service_id from sub_services where sub_service=?),?,?,?,?,?,?)";[m
[32m+[m
[32m+[m[32m    mysqlconnection.query(query, [sub_service_id, promocode, description, per, imageBuffer, end_date,color], (err, result) => {[m
[32m+[m[32m        if (err) {[m
[32m+[m[32m            return res.status(500).send("Error saving image to database");[m
[32m+[m[32m        }[m
[32m+[m[32m        res.status(200).send("Image uploaded successfully");[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mDiscountRouter.put("/update/:id", upload.single("image"), (req, res) => {[m
[32m+[m[32m  const id = req.params.id;[m
[32m+[m[32m  const { sub_service_id, promocode, description, per, end_date, color } = req.body;[m
[32m+[m
[32m+[m[32m  const imageBuffer = req.file?.buffer;[m
[32m+[m
[32m+[m[32m  // Build dynamic SQL[m
[32m+[m[32m  let query = `[m
[32m+[m[32m    UPDATE discount[m[41m [m
[32m+[m[32m    SET sub_service_id = ?, promocode = ?, description = ?, per = ?, end_date = ?, color = ?[m
[32m+[m[32m  `;[m
[32m+[m[32m  const values = [sub_service_id, promocode, description, per, end_date, color];[m
[32m+[m
[32m+[m[32m  // Only update image if a new one is uploaded[m
[32m+[m[32m  if (imageBuffer) {[m
[32m+[m[32m    query += `, image = ?`;[m
[32m+[m[32m    values.push(imageBuffer);[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  query += ` WHERE id = ?`;[m
[32m+[m[32m  values.push(id);[m
[32m+[m
[32m+[m[32m  mysqlconnection.query(query, values, (err, result) => {[m
[32m+[m[32m    if (err) {[m
[32m+[m[32m      console.error(err);[m
[32m+[m[32m      return res.status(500).send("Error updating the discount");[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    if (result.affectedRows === 0) {[m
[32m+[m[32m      return res.status(404).send("Discount not found");[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    res.status(200).send("Discount updated successfully");[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m
[32m+[m
[32m+[m[32mDiscountRouter.delete('/delete', (req, res) => {[m
[32m+[m[32m    const { banner_id } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('delete from discount where id=?'[m
[32m+[m[32m        , [banner_id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                res.json({ status: error });[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = DiscountRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Router/EarningRouter.js b/Router/EarningRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..8a13961[m
[1m--- /dev/null[m
[1m+++ b/Router/EarningRouter.js[m
[36m@@ -0,0 +1,74 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m[32mconst path = require('path');[m
[32m+[m[32mconst multer = require('multer');[m
[32m+[m
[32m+[m[32mconst EarningRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mEarningRouter.get('/', (req, res) => {[m
[32m+[m[32m    res.status(200).json('server on port 9000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mEarningRouter.get('/all', (req, res) => {[m
[32m+[m[32m    mysqlconnection.[m
[32m+[m[32m    query( 'SELECT earnings.id, earnings.user_id, users.name AS customer_name, earnings.booking_id,book_id, bookings.booking_status, bookings.amount, bookings.staff_id, earnings.amount, earnings.status, earnings.created_at, staff_user.name as staff_name FROM earnings INNER JOIN users ON earnings.user_id = users.id INNER JOIN bookings ON bookings.id = earnings.booking_id INNER JOIN staff ON bookings.staff_id = staff.staff_id INNER JOIN users AS staff_user ON staff.user_id = staff_user.id', (error, rows, fields) => {[m
[32m+[m[32m        if (!error) {[m
[32m+[m[32m            res.json(rows);[m
[32m+[m[32m        } else {[m
[32m+[m[32m            console.log(error);[m
[32m+[m[32m        }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mEarningRouter.get('/earningstaff', (req, res) => {[m
[32m+[m[32m    mysqlconnection.query('select earnings.id,earnings.user_id,users.name,booking_id,earnings.amount,staff_id,earnings.status,earnings.created_at,booking_status from earnings inner join users on earnings.user_id=users.id inner join bookings on bookings.id=earnings.booking_id', (error, rows, fields) => {[m
[32m+[m[32m        if (!error) {[m
[32m+[m[32m            res.json(rows);[m
[32m+[m[32m        } else {[m
[32m+[m[32m            console.log(error);[m
[32m+[m[32m        }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mEarningRouter.post('/add', (req, res) => {[m
[32m+[m[32m    const { name, booking_id, amount,status } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query([m
[32m+[m[32m        'insert into earnings(user_id,booking_id,amount,status) values((select id from users where name=?),?,?,?);',[m
[32m+[m[32m        [name, booking_id, amount, status], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'inserted' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mEarningRouter.put('/update', (req, res) => {[m
[32m+[m[32m    const { name, image, secondry_image, created_at, service_id } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('update sub_services set sub_service= ?, service_id= ?, image= ?, created_at=? where sub_service_id=?'[m
[32m+[m[32m        , [name, image, secondry_image, created_at, service_id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'updated' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mEarningRouter.post('/delete', (req, res) => {[m
[32m+[m[32m    const { sub_service_id } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('delete from sub_services where sub_service_id=?'[m
[32m+[m[32m        , [sub_service_id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                res.json({ status: error });[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = EarningRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Router/FaqRouter.js b/Router/FaqRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..8e29eb4[m
[1m--- /dev/null[m
[1m+++ b/Router/FaqRouter.js[m
[36m@@ -0,0 +1,62 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m
[32m+[m[32mconst FaqRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mFaqRouter.get('/', (req, res) => {[m
[32m+[m[32m    res.status(200).json('server on port 9000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mFaqRouter.get('/all', (req, res) => {[m
[32m+[m[32m    mysqlconnection.query('select * from faq',[m
[32m+[m[32m        (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mFaqRouter.post('/add', (req, res) => {[m
[32m+[m[32m    const { question, answer } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query([m
[32m+[m[32m        'insert into faq(question,answer) values(?,?);',[m
[32m+[m[32m        [question, answer], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'inserted' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mFaqRouter.put('/update/:id', (req, res) => {[m
[32m+[m[32m    const id = req.params.id;[m
[32m+[m[32m    const { question, answer } = req.body;[m
[32m+[m[32m    mysqlconnection.query('update faq set question=?, answer=? where faq_id=?'[m
[32m+[m[32m        , [question, answer, id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'updated' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mFaqRouter.post('/delete', (req, res) => {[m
[32m+[m[32m    const { staff_id } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('delete from faq where faq_id=?'[m
[32m+[m[32m        , [staff_id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                res.json({ status: error });[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = FaqRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Router/FavRouter.js b/Router/FavRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..6f0316d[m
[1m--- /dev/null[m
[1m+++ b/Router/FavRouter.js[m
[36m@@ -0,0 +1,59 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m
[32m+[m[32mconst FavourRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mFavourRouter.get('/', (req, res) => {[m
[32m+[m[32m  res.status(200).json('server on port 9000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mFavourRouter.get('/all', (req, res) => {[m
[32m+[m[32m  mysqlconnection.query('select id,favourite.sub_service_id,user_id,sub_service,rating_service,num_of_rating,service_id,price,favourite.created_at from favourite INNER JOIN sub_services on favourite.sub_service_id=sub_services.sub_service_id', (error, rows, fields) => {[m
[32m+[m[32m    if (!error) {[m
[32m+[m[32m      res.json(rows);[m
[32m+[m[32m    } else {[m
[32m+[m[32m      console.log(error);[m
[32m+[m[32m    }[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mFavourRouter.post('/add', (req, res) => {[m
[32m+[m[32m  const { sub_service_id ,user_id } = req.body;[m
[32m+[m[32m  console.log(req.body);[m
[32m+[m[32m  mysqlconnection.query('insert into favourite(sub_service_id ,user_id) values(?,?);',[m
[32m+[m[32m    [sub_service_id ,user_id], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json({ status: 'inserted' });[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.log(error);[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mFavourRouter.put('/update', (req, res) => {[m
[32m+[m[32m  const { name,ismultiple,unit_id } = req.body;[m
[32m+[m[32m  console.log(req.body);[m
[32m+[m[32m  mysqlconnection.query('update favourite set sub_service_id= ?, user_id= ? where id=?'[m
[32m+[m[32m    , [name,ismultiple, unit_id], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json({ status: 'updated' });[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.log(error);[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mFavourRouter.post('/delete:id', (req, res) => {[m
[32m+[m[32m  const id = req.params.id;[m
[32m+[m[32m  mysqlconnection.query('delete from favourite where id=?'[m
[32m+[m[32m    , [id], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json(rows);[m
[32m+[m[32m      } else {[m
[32m+[m[32m        res.json({ status: error });[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = FavourRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Router/FeedbackRouter.js b/Router/FeedbackRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..e69de29[m
[1mdiff --git a/Router/FreelancerRouter.js b/Router/FreelancerRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..67683f6[m
[1m--- /dev/null[m
[1m+++ b/Router/FreelancerRouter.js[m
[36m@@ -0,0 +1,78 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m
[32m+[m[32mconst FreelancerRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mFreelancerRouter.get('/', (req, res) => {[m
[32m+[m[32m    res.status(200).json('server on port 9000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mFreelancerRouter.get('/all', (req, res) => {[m
[32m+[m[32m    mysqlconnection.query('select freelancer_id,user_id,supplier_id,sub_service_id,name,email,password,phone,sex,role,status,image from users inner join freelancers on freelancers.user_id=users.id',[m
[32m+[m[32m        (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mFreelancerRouter.get("/image/:id", (req, res) => {[m
[32m+[m[32m    const imageId = req.params.id;[m
[32m+[m[32m    const query = 'select image from users inner join freelancers on freelancers.user_id=users.id where user_id=?';[m
[32m+[m
[32m+[m[32m    mysqlconnection.query(query, [imageId], (err, result) => {[m
[32m+[m[32m        if (err) {[m
[32m+[m[32m            return res.status(500).send("Error fetching image");[m
[32m+[m[32m        }[m
[32m+[m[32m        if (result.length === 0) {[m
[32m+[m[32m            return res.status(404).send("Image not found");[m
[32m+[m[32m        }[m
[32m+[m[32m        res.contentType("image/jpeg");[m
[32m+[m[32m        res.send(result[0].image); // Send the image buffer back as a response[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mFreelancerRouter.post('/add', (req, res) => {[m
[32m+[m[32m    const { name, supplier_id, sub_service_id } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query([m
[32m+[m[32m        'insert into freelancers(user_id,supplier_id,sub_service_id) values((select id from users where name=?),(select supplier_id from suppliers where user_id=(select id from users where name=?)),(select sub_service_id from sub_services where sub_service=?));',[m
[32m+[m[32m        [name, supplier_id, sub_service_id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'inserted' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mFreelancerRouter.put('/update', (req, res) => {[m
[32m+[m[32m    const { name, image, secondry_image, created_at, service_id } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('update staff set name= ?, image= ?, secondry_image= ?, created_at=? where service_id=?'[m
[32m+[m[32m        , [name, image, secondry_image, created_at, service_id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'updated' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mFreelancerRouter.post('/delete', (req, res) => {[m
[32m+[m[32m    const { freelancer_id } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('delete from freelancers where freelancer_id=?'[m
[32m+[m[32m        , [freelancer_id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                res.json({ status: error });[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = FreelancerRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Router/NotificationRouter.js b/Router/NotificationRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..0783232[m
[1m--- /dev/null[m
[1m+++ b/Router/NotificationRouter.js[m
[36m@@ -0,0 +1,88 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m
[32m+[m[32mconst NotificationRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mNotificationRouter.get('/', (req, res) => {[m
[32m+[m[32m    res.status(200).json('server on port 9000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mNotificationRouter.get('/all', (req, res) => {[m
[32m+[m[32m    mysqlconnection.query('select * from notifications',[m
[32m+[m[32m        (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mNotificationRouter.post('/add', (req, res) => {[m
[32m+[m[32m    const { recipient_role,user_id,title, message, hasButton } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query([m
[32m+[m[32m        'insert into notifications(recipient_role,user_id,title,message,hasButton) values(?,?,?,?,?);',[m
[32m+[m[32m        [recipient_role,user_id,title, message, hasButton], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'inserted' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mNotificationRouter.put('/update', (req, res) => {[m
[32m+[m[32m    const { recipient_role, message,notification_id } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('update notifications set recipient_role= ?, message= ? where notification_id=?'[m
[32m+[m[32m        , [recipient_role, message,notification_id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'updated' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mNotificationRouter.put('/update-message-open/:id', (req, res) => {[m
[32m+[m[32m  const id = req.params.id;[m
[32m+[m[32m  const { message_open } = req.body;[m
[32m+[m[32m  mysqlconnection.query('update notifications set message_open=? where notification_id=?'[m
[32m+[m[32m    , [message_open, id], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json({ status: 'updated' });[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.log(error);[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mNotificationRouter.put('/update-book_status/:id', (req, res) => {[m
[32m+[m[32m  const id = req.params.id;[m
[32m+[m[32m  const { hasBook_started } = req.body;[m
[32m+[m[32m  mysqlconnection.query('update notifications set hasBook_started=? where hasBook_id=?'[m
[32m+[m[32m    , [hasBook_started, id], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json({ status: 'updated' });[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.log(error);[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mNotificationRouter.post('/delete', (req, res) => {[m
[32m+[m[32m    const { notification_id } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('delete from notifications where notification_id=?'[m
[32m+[m[32m        , [notification_id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                res.json({ status: error });[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = NotificationRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Router/PrivacyRouter.js b/Router/PrivacyRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..6e1b07b[m
[1m--- /dev/null[m
[1m+++ b/Router/PrivacyRouter.js[m
[36m@@ -0,0 +1,61 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m
[32m+[m[32mconst PrivacyRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mPrivacyRouter.get('/', (req, res) => {[m
[32m+[m[32m    res.status(200).json('server on port 9000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mPrivacyRouter.get('/all', (req, res) => {[m
[32m+[m[32m    mysqlconnection.query('select * from privacy',[m
[32m+[m[32m        (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mPrivacyRouter.post('/add', (req, res) => {[m
[32m+[m[32m    const { privacy_policy } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query([m
[32m+[m[32m        'insert into privacy(privacy_policy) values(?);',[m
[32m+[m[32m        [privacy_policy], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'inserted' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mPrivacyRouter.put('/update', (req, res) => {[m
[32m+[m[32m    const { privacy_policy } = req.body;[m
[32m+[m[32m    mysqlconnection.query('update privacy set privacy_policy=?'[m
[32m+[m[32m        , [privacy_policy], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'updated' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mPrivacyRouter.post('/delete/:id', (req, res) => {[m
[32m+[m[32m    const id = req.params.id;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('delete from privacy where id=?'[m
[32m+[m[32m        , [id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                res.json({ status: error });[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = PrivacyRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Router/ProductsRouter.js b/Router/ProductsRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..0470a5f[m
[1m--- /dev/null[m
[1m+++ b/Router/ProductsRouter.js[m
[36m@@ -0,0 +1,79 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m[32mconst path = require('path');[m
[32m+[m[32mconst multer = require('multer');[m
[32m+[m
[32m+[m[32mconst ProductRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mProductRouter.get('/', (req, res) => {[m
[32m+[m[32m  res.status(200).json('server on port 9000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mProductRouter.get('/all', (req, res) => {[m
[32m+[m[32m  mysqlconnection.query('select * from product', (error, rows, fields) => {[m
[32m+[m[32m    if (!error) {[m
[32m+[m[32m      res.json(rows);[m
[32m+[m[32m    } else {[m
[32m+[m[32m      console.log(error);[m
[32m+[m[32m    }[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mProductRouter.get("/image/:id", (req, res) => {[m
[32m+[m[32m  const imageId = req.params.id;[m
[32m+[m[32m  const query = "SELECT image FROM product WHERE product_id = ?";[m
[32m+[m
[32m+[m[32m  mysqlconnection.query(query, [imageId], (err, result) => {[m
[32m+[m[32m      if (err) {[m
[32m+[m[32m          return res.status(500).send("Error fetching image");[m
[32m+[m[32m      }[m
[32m+[m[32m      if (result.length === 0) {[m
[32m+[m[32m          return res.status(404).send("Image not found");[m
[32m+[m[32m      }[m
[32m+[m[32m      res.contentType("image/jpeg");[m
[32m+[m[32m      res.send(result[0].image); // Send the image buffer back as a response[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mconst storage = multer.memoryStorage();[m
[32m+[m[32mconst upload = multer({ storage: storage });[m
[32m+[m[32mProductRouter.post('/add', upload.single("image"), (req, res) => {[m
[32m+[m[32m  const { name, sub_service_id, unit_id, descibtion } = req.body;[m
[32m+[m[32m  const imageBuffer = req.file.buffer;[m
[32m+[m[32m  const query= 'insert into product(name,sub_service_id,unit_id,Descibtion,image) values(?,(select sub_service_id from sub_services where sub_service=?),(select unit_id from units where name=?),?,?);';[m
[32m+[m[32m  mysqlconnection.query(query,[name, sub_service_id, unit_id, descibtion,imageBuffer], (error, rows, fields) => {[m
[32m+[m[32m      if (error) {[m
[32m+[m[32m        return res.status(500).send("Error saving image to database");[m
[32m+[m[32m      }[m
[32m+[m[32m      res.status(200).send("Image uploaded successfully");[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mProductRouter.put('/update', (req, res) => {[m
[32m+[m[32m  const { name, service_id, sub_service_id, unit_id, Descibtion, image, product_id } = req.body;[m
[32m+[m[32m  console.log(req.body);[m
[32m+[m[32m  mysqlconnection.query('update product set name= ?, service_id= ?, sub_service_id= ?, unit_id=?, Descibtion=?, image=? where product_id=?'[m
[32m+[m[32m    , [name, service_id, sub_service_id, unit_id, Descibtion, image, product_id], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json({ status: 'updated' });[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.log(error);[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mProductRouter.post('/delete', (req, res) => {[m
[32m+[m[32m  const { product_id } = req.body;[m
[32m+[m[32m  console.log(req.body);[m
[32m+[m[32m  mysqlconnection.query('delete from product where product_id=?'[m
[32m+[m[32m    , [product_id], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json(rows);[m
[32m+[m[32m      } else {[m
[32m+[m[32m        res.json({ status: error });[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = ProductRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Router/ReviewRouter.js b/Router/ReviewRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..37dabff[m
[1m--- /dev/null[m
[1m+++ b/Router/ReviewRouter.js[m
[36m@@ -0,0 +1,60 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m
[32m+[m[32mconst RatingRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mRatingRouter.get('/', (req, res) => {[m
[32m+[m[32m  res.status(200).json('server on port 9000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mRatingRouter.get('/all', (req, res) => {[m
[32m+[m[32m  mysqlconnection.query('select review.id,review.sub_service_id,user_id,name,comment,rating,sub_service,service_id,price,review.created_at from users inner join review on review.user_id=users.id INNER JOIN sub_services on review.sub_service_id=sub_services.sub_service_id', (error, rows, fields) => {[m
[32m+[m[32m    if (!error) {[m
[32m+[m[32m      res.json(rows);[m
[32m+[m[32m    } else {[m
[32m+[m[32m      console.log(error);[m
[32m+[m[32m    }[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mRatingRouter.post('/add', (req, res) => {[m
[32m+[m[32m  const { sub_service_id ,user_id,comment,rating } = req.body;[m
[32m+[m[32m  console.log(req.body);[m
[32m+[m[32m  mysqlconnection.query('insert into review(sub_service_id ,user_id,comment,rating) values(?,?,?,?);',[m
[32m+[m[32m    [sub_service_id ,user_id,comment,rating], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json({ status: 'inserted' });[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.log(error);[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mRatingRouter.put('/updatereview/:id', (req, res) => {[m
[32m+[m[32m  const id = req.params.id;[m
[32m+[m[32m  const { rating , comment } = req.body;[m
[32m+[m[32m  console.log(req.body);[m
[32m+[m[32m  mysqlconnection.query('update review set rating=?,comment=? where id=?'[m
[32m+[m[32m    , [rating,comment,id], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json({ status: 'updated' });[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.log(error);[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mRatingRouter.post('/delete:id', (req, res) => {[m
[32m+[m[32m  const id = req.params.id;[m
[32m+[m[32m  mysqlconnection.query('delete from review where id=?'[m
[32m+[m[32m    , [id], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json(rows);[m
[32m+[m[32m      } else {[m
[32m+[m[32m        res.json({ status: error });[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = RatingRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Router/SendRouter.js b/Router/SendRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..d6cf18d[m
[1m--- /dev/null[m
[1m+++ b/Router/SendRouter.js[m
[36m@@ -0,0 +1,146 @@[m
[32m+[m[32mconst { Router } = require('express');[m
[32m+[m[32mconst admin = require('firebase-admin');[m
[32m+[m[32mconst { getMessaging } = require('firebase-admin/messaging');[m
[32m+[m[32mconst sendnotify = Router();[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mconst serviceAccount = require('../serviceAccountKey.json');[m
[32m+[m
[32m+[m[32mif (!admin.apps.length) {[m
[32m+[m[32m  admin.initializeApp({[m
[32m+[m[32m    credential: admin.credential.cert(serviceAccount),[m
[32m+[m[32m  });[m
[32m+[m[32m}[m
[32m+[m
[32m+[m[32m// ✅ Single user notification - this still works fine[m
[32m+[m[32msendnotify.post('/send-data', async (req, res, next) => {[m
[32m+[m[32m  const { title, body, token } = req.body;[m
[32m+[m
[32m+[m[32m  try {[m
[32m+[m[32m    const message = {[m
[32m+[m[32m      notification: {[m
[32m+[m[32m        title,[m
[32m+[m[32m        body[m
[32m+[m[32m      },[m
[32m+[m[32m      android: {[m
[32m+[m[32m        priority: 'high',[m
[32m+[m[32m        notification: {[m
[32m+[m[32m          sound: 'default',[m
[32m+[m[32m          clickAction: 'FLUTTER_NOTIFICATION_CLICK'[m
[32m+[m[32m        }[m
[32m+[m[32m      },[m
[32m+[m[32m      apns: {[m
[32m+[m[32m        headers: {[m
[32m+[m[32m          'apns-priority': '10'[m
[32m+[m[32m        },[m
[32m+[m[32m        payload: {[m
[32m+[m[32m          aps: {[m
[32m+[m[32m            sound: 'default',[m
[32m+[m[32m            badge: 1,[m
[32m+[m[32m            alert: {[m
[32m+[m[32m              title,[m
[32m+[m[32m              body[m
[32m+[m[32m            }[m
[32m+[m[32m          }[m
[32m+[m[32m        }[m
[32m+[m[32m      },[m
[32m+[m[32m      data: {[m
[32m+[m[32m        orderid: "test order",[m
[32m+[m[32m        orderdate: "date",[m
[32m+[m[32m        timestamp: Date.now().toString()[m
[32m+[m[32m      },[m
[32m+[m[32m      token[m
[32m+[m[32m    };[m
[32m+[m
[32m+[m[32m    const response = await getMessaging().send(message);[m[41m [m
[32m+[m[32m    return res.status(200).send({[m
[32m+[m[32m      message: "Notification sent",[m
[32m+[m[32m      response[m
[32m+[m[32m    });[m
[32m+[m[32m  } catch (err) {[m
[32m+[m[32m    console.error("Error sending notification:", err);[m
[32m+[m[32m    return res.status(500).send({[m
[32m+[m[32m      message: "Failed to send notification",[m
[32m+[m[32m      error: err.message[m
[32m+[m[32m    });[m
[32m+[m[32m  }[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32m// Multicast notification using getMessaging().sendEachForMulticast[m
[32m+[m[32msendnotify.post('/send-data-to-all', async (req, res, next) => {[m
[32m+[m[32m  const { title, body, role } = req.body;[m
[32m+[m
[32m+[m[32m  if (!role) {[m
[32m+[m[32m    return res.status(400).send({ message: "Missing 'role' in request body" });[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  try {[m
[32m+[m[32m    mysqlconnection.query([m
[32m+[m[32m      "SELECT token FROM users WHERE role = ? AND token IS NOT NULL",[m
[32m+[m[32m      [role],[m
[32m+[m[32m      async (error, rows, fields) => {[m
[32m+[m[32m        if (error) {[m
[32m+[m[32m          console.error("Database query error:", error);[m
[32m+[m[32m          return res.status(500).send({ message: "Database error", error: error.message });[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m        if (rows.length === 0) {[m
[32m+[m[32m          return res.status(404).send({ message: `No tokens found for role '${role}'` });[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m        const tokens = rows.map(row => row.token);[m
[32m+[m
[32m+[m[32m        const multicastMessage = {[m
[32m+[m[32m          tokens,[m
[32m+[m[32m          notification: { title, body },[m
[32m+[m[32m          android: {[m
[32m+[m[32m            priority: 'high',[m
[32m+[m[32m            notification: {[m
[32m+[m[32m              sound: 'default',[m
[32m+[m[32m              clickAction: 'FLUTTER_NOTIFICATION_CLICK'[m
[32m+[m[32m            }[m
[32m+[m[32m          },[m
[32m+[m[32m          apns: {[m
[32m+[m[32m            headers: { 'apns-priority': '10' },[m
[32m+[m[32m            payload: {[m
[32m+[m[32m              aps: {[m
[32m+[m[32m                sound: 'default',[m
[32m+[m[32m                badge: 1,[m
[32m+[m[32m                alert: { title, body }[m
[32m+[m[32m              }[m
[32m+[m[32m            }[m
[32m+[m[32m          },[m
[32m+[m[32m          data: {[m
[32m+[m[32m            orderid: "test order",[m
[32m+[m[32m            orderdate: "date",[m
[32m+[m[32m            timestamp: Date.now().toString()[m
[32m+[m[32m          }[m
[32m+[m[32m        };[m
[32m+[m
[32m+[m[32m        try {[m
[32m+[m[32m          const response = await getMessaging().sendEachForMulticast(multicastMessage);[m
[32m+[m[32m          return res.status(200).send({[m
[32m+[m[32m            message: `Notification sent to '${role}'`,[m
[32m+[m[32m            successCount: response.successCount,[m
[32m+[m[32m            failureCount: response.failureCount,[m
[32m+[m[32m            responses: response.responses[m
[32m+[m[32m          });[m
[32m+[m[32m        } catch (messagingError) {[m
[32m+[m[32m          console.error("Messaging error:", messagingError);[m
[32m+[m[32m          return res.status(500).send({[m
[32m+[m[32m            message: "Failed to send notification",[m
[32m+[m[32m            error: messagingError.message[m
[32m+[m[32m          });[m
[32m+[m[32m        }[m
[32m+[m[32m      }[m
[32m+[m[32m    );[m
[32m+[m[32m  } catch (err) {[m
[32m+[m[32m    console.error("Unexpected error:", err);[m
[32m+[m[32m    return res.status(500).send({[m
[32m+[m[32m      message: "Unexpected error",[m
[32m+[m[32m      error: err.message[m
[32m+[m[32m    });[m
[32m+[m[32m  }[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = sendnotify;[m
[1mdiff --git a/Router/ServiceRouter.js b/Router/ServiceRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..b814de9[m
[1m--- /dev/null[m
[1m+++ b/Router/ServiceRouter.js[m
[36m@@ -0,0 +1,151 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m[32mconst path = require('path');[m
[32m+[m[32mconst multer = require('multer');[m
[32m+[m
[32m+[m[32mconst ServiceRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mServiceRouter.get('/', (req, res) => {[m
[32m+[m[32m  res.status(200).json('server on port 9000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mServiceRouter.get('/all', (req, res) => {[m
[32m+[m[32m  mysqlconnection.query('select * from services', (error, rows, fields) => {[m
[32m+[m[32m    if (!error) {[m
[32m+[m[32m      res.json(rows);[m
[32m+[m[32m    } else {[m
[32m+[m[32m      console.log(error);[m
[32m+[m[32m    }[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mServiceRouter.get("/getbyservice/all/:id", (req, res) => {[m
[32m+[m[32m  const service_id = req.params.id;[m
[32m+[m[32m  const query = "select * from services WHERE service_id = (select service_id from suppliers WHERE user_id=?)";[m
[32m+[m[32m  mysqlconnection.query(query, [service_id], (error, rows, fields) => {[m
[32m+[m[32m    if (!error) {[m
[32m+[m[32m      res.json(rows);[m
[32m+[m[32m    } else {[m
[32m+[m[32m      console.log(error);[m
[32m+[m[32m    }[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mServiceRouter.get("/image/:id", (req, res) => {[m
[32m+[m[32m  const imageId = req.params.id;[m
[32m+[m[32m  const query = "SELECT image FROM services WHERE service_id = ?";[m
[32m+[m[32m  mysqlconnection.query(query, [imageId], (err, result) => {[m
[32m+[m[32m    if (err) {[m
[32m+[m[32m      return res.status(500).send("Error fetching image");[m
[32m+[m[32m    }[m
[32m+[m[32m    res.contentType("image/jpeg");[m
[32m+[m[32m    res.send(result[0].image); // Send the image buffer back as a response[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mServiceRouter.get("/secondry_image/:id", (req, res) => {[m
[32m+[m[32m  const imageId = req.params.id;[m
[32m+[m[32m  const query = "SELECT secondry_image FROM services WHERE service_id=?";[m
[32m+[m[32m  mysqlconnection.query(query, [imageId], (err, result) => {[m
[32m+[m[32m    if (err) {[m
[32m+[m[32m      return res.status(500).send("Error fetching image");[m
[32m+[m[32m    }[m
[32m+[m[32m    res.contentType("image/jpeg");[m
[32m+[m[32m    res.send(result[0].secondry_image); // Send the image buffer back as a response[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mconst storage = multer.memoryStorage();[m
[32m+[m[32mconst upload = multer({ storage: storage });[m
[32m+[m
[32m+[m[32mServiceRouter.post('/add', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'secondry_image', maxCount: 1 }[m
[32m+[m[32m]), (req, res) => {[m
[32m+[m[32m  const { name, color } = req.body;[m
[32m+[m[32m  const imageBuffer1 = req.files && req.files.image ? req.files.image[0].buffer : null;[m
[32m+[m[32m  const imageBuffer2 = req.files && req.files.secondry_image ? req.files.secondry_image[0].buffer : null;[m
[32m+[m[32m  mysqlconnection.query('insert into services(name,image,secondry_image,color) values(?,?,?,?);',[m
[32m+[m[32m    [name, imageBuffer1, imageBuffer2, color], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json({ status: 'inserted' });[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.log(error);[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mServiceRouter.put([m
[32m+[m[32m  "/update/:id",[m
[32m+[m[32m  upload.fields([[m
[32m+[m[32m    { name: 'image', maxCount: 1 },[m
[32m+[m[32m    { name: 'secondry_image', maxCount: 1 },[m
[32m+[m[32m  ]),[m
[32m+[m[32m  (req, res) => {[m
[32m+[m[32m    const id = req.params.id;[m
[32m+[m[32m    const { name, color } = req.body;[m
[32m+[m
[32m+[m[32m    const imageBuffer = req.files?.image?.[0]?.buffer;[m
[32m+[m[32m    const secondryImageBuffer = req.files?.secondry_image?.[0]?.buffer;[m
[32m+[m
[32m+[m[32m    // Start SQL and values[m
[32m+[m[32m    let sql = "UPDATE services SET name = ?, color = ?";[m
[32m+[m[32m    const values = [name, color];[m
[32m+[m
[32m+[m[32m    // Conditionally add image fields[m
[32m+[m[32m    if (imageBuffer) {[m
[32m+[m[32m      sql += ", image = ?";[m
[32m+[m[32m      values.push(imageBuffer);[m
[32m+[m[32m    }[m
[32m+[m[32m    if (secondryImageBuffer) {[m
[32m+[m[32m      sql += ", secondry_image = ?";[m
[32m+[m[32m      values.push(secondryImageBuffer);[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    sql += " WHERE service_id = ?";[m
[32m+[m[32m    values.push(id);[m
[32m+[m
[32m+[m[32m    mysqlconnection.query(sql, values, (err, result) => {[m
[32m+[m[32m      if (err) {[m
[32m+[m[32m        console.error(err);[m
[32m+[m[32m        return res.status(500).send("Error updating the service");[m
[32m+[m[32m      }[m
[32m+[m
[32m+[m[32m      if (result.affectedRows === 0) {[m
[32m+[m[32m        return res.status(404).send("Service not found");[m
[32m+[m[32m      }[m
[32m+[m
[32m+[m[32m      res.status(200).send("Service updated successfully");[m
[32m+[m[32m    });[m
[32m+[m[32m  }[m
[32m+[m[32m);[m
[32m+[m
[32m+[m
[32m+[m
[32m+[m
[32m+[m[32m// ServiceRouter.put('/update', (req, res) => {[m
[32m+[m[32m//   const { name, image, secondry_image, created_at, service_id } = req.body;[m
[32m+[m[32m//   console.log(req.body);[m
[32m+[m[32m//   mysqlconnection.query('update services set name= ?, image= ?, secondry_image= ?, created_at=? where service_id=?'[m
[32m+[m[32m//     , [name, image, secondry_image, created_at, service_id], (error, rows, fields) => {[m
[32m+[m[32m//       if (!error) {[m
[32m+[m[32m//         res.json({ status: 'updated' });[m
[32m+[m[32m//       } else {[m
[32m+[m[32m//         console.log(error);[m
[32m+[m[32m//       }[m
[32m+[m[32m//     });[m
[32m+[m[32m// });[m
[32m+[m
[32m+[m[32mServiceRouter.post('/delete', (req, res) => {[m
[32m+[m[32m  const { service_id } = req.body;[m
[32m+[m[32m  console.log(req.body);[m
[32m+[m[32m  mysqlconnection.query('delete from services where service_id=?'[m
[32m+[m[32m    , [service_id], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json(rows);[m
[32m+[m[32m      } else {[m
[32m+[m[32m        res.json({ status: error });[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = ServiceRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Router/StaffRouter.js b/Router/StaffRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..0f2f407[m
[1m--- /dev/null[m
[1m+++ b/Router/StaffRouter.js[m
[36m@@ -0,0 +1,79 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m
[32m+[m[32mconst StaffRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mStaffRouter.get('/', (req, res) => {[m
[32m+[m[32m    res.status(200).json('server on port 9000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mStaffRouter.get('/all', (req, res) => {[m
[32m+[m[32m    mysqlconnection.query('select staff_id,user_id,supplier_id,sub_service_id,name,email,password,phone,address,sex,role,status,image,rating,available,staff.created_at from users inner join staff on staff.user_id=users.id',[m
[32m+[m[32m        (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mStaffRouter.get("/image/:id", (req, res) => {[m
[32m+[m[32m    const imageId = req.params.id;[m
[32m+[m[32m    const query = 'select image from users inner join staff on staff.user_id=users.id where user_id=?';[m
[32m+[m
[32m+[m[32m    mysqlconnection.query(query, [imageId], (err, result) => {[m
[32m+[m[32m        if (err) {[m
[32m+[m[32m            return res.status(500).send("Error fetching image");[m
[32m+[m[32m        }[m
[32m+[m[32m        if (result.length === 0) {[m
[32m+[m[32m            return res.status(404).send("Image not found");[m
[32m+[m[32m        }[m
[32m+[m[32m        res.contentType("image/jpeg");[m
[32m+[m[32m        res.send(result[0].image); // Send the image buffer back as a response[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mStaffRouter.post('/add', (req, res) => {[m
[32m+[m[32m    const { name, supplier_id, sub_service_id } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query([m
[32m+[m[32m        'insert into staff(user_id,supplier_id,sub_service_id) values((select id from users where name=?),(select supplier_id from suppliers where user_id=(select id from users where name=?)),(select sub_service_id from sub_services where sub_service=?));',[m
[32m+[m[32m        [name, supplier_id, sub_service_id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'inserted' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mStaffRouter.put("/update/:id", (req, res) => {[m
[32m+[m[32m    const id = req.params.id;[m
[32m+[m[32m    const { supplier_id, sub_service_id } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('update staff set supplier_id=(select supplier_id from suppliers where user_id=(select id from users where name=?)), sub_service_id= (select sub_service_id from sub_services where sub_service=?) where staff_id=?'[m
[32m+[m[32m        , [supplier_id, sub_service_id,id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'updated' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mStaffRouter.post('/delete', (req, res) => {[m
[32m+[m[32m    const { staff_id } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('delete from staff where staff_id=?'[m
[32m+[m[32m        , [staff_id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                res.json({ status: error });[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = StaffRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Router/SubServiceRouter.js b/Router/SubServiceRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..c5bdb46[m
[1m--- /dev/null[m
[1m+++ b/Router/SubServiceRouter.js[m
[36m@@ -0,0 +1,291 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m[32mconst path = require('path');[m
[32m+[m[32mconst multer = require('multer');[m
[32m+[m
[32m+[m[32mconst SubServiceRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mSubServiceRouter.get('/', (req, res) => {[m
[32m+[m[32m  res.status(200).json('server on port 9000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mSubServiceRouter.get('/all', (req, res) => {[m
[32m+[m[32m  mysqlconnection.query('select * from sub_services', (error, rows, fields) => {[m
[32m+[m[32m    if (!error) {[m
[32m+[m[32m      res.json(rows);[m
[32m+[m[32m    } else {[m
[32m+[m[32m      console.log(error);[m
[32m+[m[32m    }[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mSubServiceRouter.get("/service/all/:id", (req, res) => {[m
[32m+[m[32m  const service_id = req.params.id;[m
[32m+[m[32m  const query = "select * from sub_services WHERE service_id = (select service_id from services WHERE name=?)";[m
[32m+[m[32m  mysqlconnection.query(query, [service_id], (error, rows, fields) => {[m
[32m+[m[32m    if (!error) {[m
[32m+[m[32m      res.json(rows);[m
[32m+[m[32m    } else {[m
[32m+[m[32m      console.log(error);[m
[32m+[m[32m    }[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m
[32m+[m[32mSubServiceRouter.get("/getsupplier/all/:id", (req, res) => {[m
[32m+[m[32m  const service_id = req.params.id;[m
[32m+[m[32m  const query = "select * from sub_services WHERE service_id = (select service_id from suppliers WHERE user_id=?)";[m
[32m+[m[32m  mysqlconnection.query(query, [service_id], (error, rows, fields) => {[m
[32m+[m[32m    if (!error) {[m
[32m+[m[32m      res.json(rows);[m
[32m+[m[32m    } else {[m
[32m+[m[32m      console.log(error);[m
[32m+[m[32m    }[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m
[32m+[m[32mSubServiceRouter.get("/image/:id", (req, res) => {[m
[32m+[m[32m  const imageId = req.params.id;[m
[32m+[m[32m  const query = "SELECT image FROM sub_services WHERE sub_service_id = ?";[m
[32m+[m
[32m+[m[32m  mysqlconnection.query(query, [imageId], (err, result) => {[m
[32m+[m[32m    if (err) {[m
[32m+[m[32m      return res.status(500).send("Error fetching image");[m
[32m+[m[32m    }[m
[32m+[m[32m    if (result.length === 0) {[m
[32m+[m[32m      return res.status(404).send("Image not found");[m
[32m+[m[32m    }[m
[32m+[m[32m    res.contentType("image/jpeg");[m
[32m+[m[32m    res.send(result[0].image); // Send the image buffer back as a response[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mSubServiceRouter.get("/gl1/:id", (req, res) => {[m
[32m+[m[32m  const imageId = req.params.id;[m
[32m+[m[32m  const query = "SELECT gl1 FROM sub_services WHERE sub_service_id = ?";[m
[32m+[m[32m  mysqlconnection.query(query, [imageId], (err, result) => {[m
[32m+[m[32m    if (err) {[m
[32m+[m[32m      return res.status(500).send("Error fetching image");[m
[32m+[m[32m    }[m
[32m+[m[32m    res.contentType("image/jpeg");[m
[32m+[m[32m    res.send(result[0].gl1); // Send the image buffer back as a response[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mSubServiceRouter.get("/gl2/:id", (req, res) => {[m
[32m+[m[32m  const imageId = req.params.id;[m
[32m+[m[32m  const query = "SELECT gl2 FROM sub_services WHERE sub_service_id = ?";[m
[32m+[m[32m  mysqlconnection.query(query, [imageId], (err, result) => {[m
[32m+[m[32m    if (err) {[m
[32m+[m[32m      return res.status(500).send("Error fetching image");[m
[32m+[m[32m    }[m
[32m+[m[32m    res.contentType("image/jpeg");[m
[32m+[m[32m    res.send(result[0].gl2); // Send the image buffer back as a response[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mSubServiceRouter.get("/gl3/:id", (req, res) => {[m
[32m+[m[32m  const imageId = req.params.id;[m
[32m+[m[32m  const query = "SELECT gl3 FROM sub_services WHERE sub_service_id = ?";[m
[32m+[m[32m  mysqlconnection.query(query, [imageId], (err, result) => {[m
[32m+[m[32m    if (err) {[m
[32m+[m[32m      return res.status(500).send("Error fetching image");[m
[32m+[m[32m    }[m
[32m+[m[32m    res.contentType("image/jpeg");[m
[32m+[m[32m    res.send(result[0].gl3); // Send the image buffer back as a response[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mSubServiceRouter.get("/gl4/:id", (req, res) => {[m
[32m+[m[32m  const imageId = req.params.id;[m
[32m+[m[32m  const query = "SELECT gl4 FROM sub_services WHERE sub_service_id = ?";[m
[32m+[m[32m  mysqlconnection.query(query, [imageId], (err, result) => {[m
[32m+[m[32m    if (err) {[m
[32m+[m[32m      return res.status(500).send("Error fetching image");[m
[32m+[m[32m    }[m
[32m+[m[32m    res.contentType("image/jpeg");[m
[32m+[m[32m    res.send(result[0].gl4); // Send the image buffer back as a response[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mSubServiceRouter.get("/gl5/:id", (req, res) => {[m
[32m+[m[32m  const imageId = req.params.id;[m
[32m+[m[32m  const query = "SELECT gl5 FROM sub_services WHERE sub_service_id = ?";[m
[32m+[m[32m  mysqlconnection.query(query, [imageId], (err, result) => {[m
[32m+[m[32m    if (err) {[m
[32m+[m[32m      return res.status(500).send("Error fetching image");[m
[32m+[m[32m    }[m
[32m+[m[32m    res.contentType("image/jpeg");[m
[32m+[m[32m    res.send(result[0].gl5); // Send the image buffer back as a response[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mSubServiceRouter.get("/gl6/:id", (req, res) => {[m
[32m+[m[32m  const imageId = req.params.id;[m
[32m+[m[32m  const query = "SELECT gl6 FROM sub_services WHERE sub_service_id = ?";[m
[32m+[m[32m  mysqlconnection.query(query, [imageId], (err, result) => {[m
[32m+[m[32m    if (err) {[m
[32m+[m[32m      return res.status(500).send("Error fetching image");[m
[32m+[m[32m    }[m
[32m+[m[32m    res.contentType("image/jpeg");[m
[32m+[m[32m    res.send(result[0].gl6); // Send the image buffer back as a response[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m
[32m+[m[32mconst storage = multer.memoryStorage();[m
[32m+[m[32mconst upload = multer({ storage: storage });[m
[32m+[m
[32m+[m[32mSubServiceRouter.post('/add', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gl1', maxCount: 1 }, { name: 'gl2', maxCount: 1 }[m
[32m+[m[32m  , { name: 'gl3', maxCount: 1 },  { name: 'gl4', maxCount: 1 }, { name: 'gl5', maxCount: 1 }, { name: 'gl6', maxCount: 1 }[m
[32m+[m[32m]), (req, res) => {[m
[32m+[m[32m  const { sub_service,description, service_id, price } = req.body;[m
[32m+[m[32m  const imageBuffer = req.files && req.files.image ? req.files.image[0].buffer : null;[m
[32m+[m[32m  const imageBuffer1 = req.files && req.files.gl1 ? req.files.gl1[0].buffer : null;[m
[32m+[m[32m  const imageBuffer2 = req.files && req.files.gl2 ? req.files.gl2[0].buffer : null;[m
[32m+[m[32m  const imageBuffer3 = req.files && req.files.gl3 ? req.files.gl3[0].buffer : null;[m
[32m+[m[32m  const imageBuffer4 = req.files && req.files.gl4 ? req.files.gl4[0].buffer : null;[m
[32m+[m[32m  const imageBuffer5 = req.files && req.files.gl5 ? req.files.gl5[0].buffer : null;[m
[32m+[m[32m  const imageBuffer6 = req.files && req.files.gl6 ? req.files.gl6[0].buffer : null;[m
[32m+[m[32m  const query = 'insert into sub_services(sub_service,description,service_id,price,image,gl1,gl2,gl3,gl4,gl5,gl6) values(?,?,(select service_id from services where name=?),?,?,?,?,?,?,?,?);';[m
[32m+[m[32m  mysqlconnection.query(query,[m
[32m+[m[32m    [sub_service,description, service_id, price, imageBuffer, imageBuffer1, imageBuffer2, imageBuffer3,[m
[32m+[m[32m      imageBuffer4, imageBuffer5, imageBuffer6[m
[32m+[m[32m    ], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json({ status: 'inserted' });[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.log(error);[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mSubServiceRouter.put([m
[32m+[m[32m  "/update/:id",[m
[32m+[m[32m  upload.fields([[m
[32m+[m[32m    { name: 'image', maxCount: 1 },[m
[32m+[m[32m    { name: 'gl1', maxCount: 1 },[m
[32m+[m[32m    { name: 'gl2', maxCount: 1 },[m
[32m+[m[32m    { name: 'gl3', maxCount: 1 },[m
[32m+[m[32m    { name: 'gl4', maxCount: 1 },[m
[32m+[m[32m    { name: 'gl5', maxCount: 1 },[m
[32m+[m[32m    { name: 'gl6', maxCount: 1 },[m
[32m+[m[32m  ]),[m
[32m+[m[32m  (req, res) => {[m
[32m+[m[32m    const id = req.params.id;[m
[32m+[m[32m    const { sub_service, description } = req.body;[m
[32m+[m
[32m+[m[32m    // Collect file buffers only if present[m
[32m+[m[32m    const fileFields = {[m
[32m+[m[32m      image: req.files?.image?.[0]?.buffer,[m
[32m+[m[32m      gl1: req.files?.gl1?.[0]?.buffer,[m
[32m+[m[32m      gl2: req.files?.gl2?.[0]?.buffer,[m
[32m+[m[32m      gl3: req.files?.gl3?.[0]?.buffer,[m
[32m+[m[32m      gl4: req.files?.gl4?.[0]?.buffer,[m
[32m+[m[32m      gl5: req.files?.gl5?.[0]?.buffer,[m
[32m+[m[32m      gl6: req.files?.gl6?.[0]?.buffer,[m
[32m+[m[32m    };[m
[32m+[m
[32m+[m[32m    // Start query and values[m
[32m+[m[32m    let query = "UPDATE sub_services SET sub_service = ?, description = ?";[m
[32m+[m[32m    const values = [sub_service, description];[m
[32m+[m
[32m+[m[32m    // Dynamically append file fields to SQL and values[m
[32m+[m[32m    for (const [key, buffer] of Object.entries(fileFields)) {[m
[32m+[m[32m      if (buffer) {[m
[32m+[m[32m        query += `, ${key} = ?`;[m
[32m+[m[32m        values.push(buffer);[m
[32m+[m[32m      }[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    query += " WHERE sub_service_id = ?";[m
[32m+[m[32m    values.push(id);[m
[32m+[m
[32m+[m[32m    mysqlconnection.query(query, values, (err, result) => {[m
[32m+[m[32m      if (err) {[m
[32m+[m[32m        console.error("MySQL Error:", err);[m
[32m+[m[32m        return res.status(500).send("Database update failed");[m
[32m+[m[32m      }[m
[32m+[m
[32m+[m[32m      if (result.affectedRows === 0) {[m
[32m+[m[32m        return res.status(404).send("Sub-service not found");[m
[32m+[m[32m      }[m
[32m+[m
[32m+[m[32m      res.status(200).send("Sub-service updated successfully");[m
[32m+[m[32m    });[m
[32m+[m[32m  }[m
[32m+[m[32m);[m
[32m+[m
[32m+[m[32mSubServiceRouter.put('/updaterating/:id', (req, res) => {[m
[32m+[m[32m  const id = req.params.id;[m
[32m+[m[32m  const { rating_service , num_of_rating } = req.body;[m
[32m+[m[32m  console.log(req.body);[m
[32m+[m[32m  mysqlconnection.query('update sub_services set rating_service=?,num_of_rating=? where sub_service_id=?'[m
[32m+[m[32m    , [rating_service,num_of_rating,id], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json({ status: 'updated' });[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.log(error);[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32m// SubServiceRouter.put("/update/:id", upload.fields([{ name: 'image', maxCount: 1 }, { name: 'gl1', maxCount: 1 }, , { name: 'gl2', maxCount: 1 },[m
[32m+[m[32m//   , { name: 'gl3', maxCount: 1 }, , { name: 'gl4', maxCount: 1 }, , { name: 'gl5', maxCount: 1 }, , { name: 'gl6', maxCount: 1 }[m
[32m+[m[32m// ]), (req, res) => {[m
[32m+[m[32m//   const id = req.params.id;[m
[32m+[m[32m//   const { sub_service, service_id, price } = req.body;[m
[32m+[m[32m//   const imageBuffer = req.files && req.files.image ? req.files.image[0].buffer : null;[m
[32m+[m[32m//   const imageBuffer1 = req.files && req.files.gl1 ? req.files.gl1[0].buffer : null;[m
[32m+[m[32m//   const imageBuffer2 = req.files && req.files.gl2 ? req.files.gl2[0].buffer : null;[m
[32m+[m[32m//   const imageBuffer3 = req.files && req.files.gl3 ? req.files.gl3[0].buffer : null;[m
[32m+[m[32m//   const imageBuffer4 = req.files && req.files.gl4 ? req.files.gl4[0].buffer : null;[m
[32m+[m[32m//   const imageBuffer5 = req.files && req.files.gl5 ? req.files.gl5[0].buffer : null;[m
[32m+[m[32m//   const imageBuffer6 = req.files && req.files.gl6 ? req.files.gl6[0].buffer : null;[m
[32m+[m[32m//   const query = 'update sub_services set sub_service=?,service_id=?,price=?,image=?,gl1=?,gl2=?,gl3=?,gl4=?,gl5=?,gl6=? where sub_service_id=?';[m
[32m+[m[32m//   mysqlconnection.query(query,[m
[32m+[m[32m//     [sub_service, service_id, price, imageBuffer, imageBuffer1, imageBuffer2, imageBuffer3,[m
[32m+[m[32m//       imageBuffer4, imageBuffer5, imageBuffer6, id[m
[32m+[m[32m//     ], (err, rows, fields) => {[m
[32m+[m[32m//       if (err) {[m
[32m+[m[32m//         console.error(err);[m
[32m+[m[32m//         return res.status(500).send("Error updating the testimonial");[m
[32m+[m[32m//       }[m
[32m+[m
[32m+[m[32m//       if (result.affectedRows === 0) {[m
[32m+[m[32m//         return res.status(404).send("Testimonial not found");[m
[32m+[m[32m//       }[m
[32m+[m
[32m+[m[32m//       res.status(200).send("Testimonial updated successfully");[m
[32m+[m[32m//     });[m
[32m+[m[32m// });[m
[32m+[m
[32m+[m[32m// SubServiceRouter.put('/update', (req, res) => {[m
[32m+[m[32m//   const { name, image, secondry_image, created_at, service_id } = req.body;[m
[32m+[m[32m//   console.log(req.body);[m
[32m+[m[32m//   mysqlconnection.query('update sub_services set sub_service= ?, service_id= ?, image= ?, created_at=? where sub_service_id=?'[m
[32m+[m[32m//     , [name, image, secondry_image, created_at, service_id], (error, rows, fields) => {[m
[32m+[m[32m//       if (!error) {[m
[32m+[m[32m//         res.json({ status: 'updated' });[m
[32m+[m[32m//       } else {[m
[32m+[m[32m//         console.log(error);[m
[32m+[m[32m//       }[m
[32m+[m[32m//     });[m
[32m+[m[32m// });[m
[32m+[m
[32m+[m[32mSubServiceRouter.post('/delete', (req, res) => {[m
[32m+[m[32m  const { sub_service_id } = req.body;[m
[32m+[m[32m  console.log(req.body);[m
[32m+[m[32m  mysqlconnection.query('delete from sub_services where sub_service_id=?'[m
[32m+[m[32m    , [sub_service_id], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json(rows);[m
[32m+[m[32m      } else {[m
[32m+[m[32m        res.json({ status: error });[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = SubServiceRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Router/SubscriberRouter.js b/Router/SubscriberRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..de3336c[m
[1m--- /dev/null[m
[1m+++ b/Router/SubscriberRouter.js[m
[36m@@ -0,0 +1,61 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m
[32m+[m[32mconst SubscriberRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mSubscriberRouter.get('/', (req, res) => {[m
[32m+[m[32m    res.status(200).json('server on port 9000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mSubscriberRouter.get('/all', (req, res) => {[m
[32m+[m[32m    mysqlconnection.query('select * from subscribers',[m
[32m+[m[32m        (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mSubscriberRouter.post('/add', (req, res) => {[m
[32m+[m[32m    const { email } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query([m
[32m+[m[32m        'insert into subscribers(email) values(?);',[m
[32m+[m[32m        [email], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'inserted' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mSubscriberRouter.put('/update', (req, res) => {[m
[32m+[m[32m    const { email } = req.body;[m
[32m+[m[32m    mysqlconnection.query('update subscribers set email=?'[m
[32m+[m[32m        , [email ], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'updated' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mSubscriberRouter.post('/delete/:id', (req, res) => {[m
[32m+[m[32m    const id = req.params.id;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('delete from subscribers where id=?'[m
[32m+[m[32m        , [id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                res.json({ status: error });[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = SubscriberRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Router/SupplierRouter.js b/Router/SupplierRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..fdabe56[m
[1m--- /dev/null[m
[1m+++ b/Router/SupplierRouter.js[m
[36m@@ -0,0 +1,78 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m
[32m+[m[32mconst SupplierRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mSupplierRouter.get('/', (req, res) => {[m
[32m+[m[32m    res.status(200).json('server on port 9000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mSupplierRouter.get('/all', (req, res) => {[m
[32m+[m[32m    mysqlconnection.query('select supplier_id,user_id,service_id,team_size,name,email,password,phone,address,sex,role,status,image from users inner join suppliers on suppliers.user_id=users.id',[m
[32m+[m[32m        (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mSupplierRouter.get("/image/:id", (req, res) => {[m
[32m+[m[32m    const imageId = req.params.id;[m
[32m+[m[32m    const query = 'select image from users inner join suppliers on suppliers.user_id=users.id where user_id=?';[m
[32m+[m
[32m+[m[32m    mysqlconnection.query(query, [imageId], (err, result) => {[m
[32m+[m[32m        if (err) {[m
[32m+[m[32m            return res.status(500).send("Error fetching image");[m
[32m+[m[32m        }[m
[32m+[m[32m        if (result.length === 0) {[m
[32m+[m[32m            return res.status(404).send("Image not found");[m
[32m+[m[32m        }[m
[32m+[m[32m        res.contentType("image/jpeg");[m
[32m+[m[32m        res.send(result[0].image); // Send the image buffer back as a response[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mSupplierRouter.post('/add', (req, res) => {[m
[32m+[m[32m    const { name, service_id } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('insert into suppliers(user_id,service_id) values((select id from users where name=?),(select service_id from services where name=?));',[m
[32m+[m[32m        [name, service_id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'inserted' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mSupplierRouter.put("/update/:id", (req, res) => {[m
[32m+[m[32m    const id = req.params.id;[m
[32m+[m[32m    const { service_id } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('update suppliers set service_id= (select service_id from services where name=?) where supplier_id=?'[m
[32m+[m[32m        , [service_id,id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'updated' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mSupplierRouter.post('/delete', (req, res) => {[m
[32m+[m[32m    const { supplier_id } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('delete from suppliers where supplier_id=?'[m
[32m+[m[32m        , [supplier_id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                res.json({ status: error });[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = SupplierRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Router/TermsRouter.js b/Router/TermsRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..7856560[m
[1m--- /dev/null[m
[1m+++ b/Router/TermsRouter.js[m
[36m@@ -0,0 +1,61 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m
[32m+[m[32mconst TermsRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mTermsRouter.get('/', (req, res) => {[m
[32m+[m[32m    res.status(200).json('server on port 9000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mTermsRouter.get('/all', (req, res) => {[m
[32m+[m[32m    mysqlconnection.query('select * from terms',[m
[32m+[m[32m        (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mTermsRouter.post('/add', (req, res) => {[m
[32m+[m[32m    const { term } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query([m
[32m+[m[32m        'insert into terms(term) values(?);',[m
[32m+[m[32m        [term], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'inserted' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mTermsRouter.put('/update', (req, res) => {[m
[32m+[m[32m    const { term } = req.body;[m
[32m+[m[32m    mysqlconnection.query('update terms set term=?'[m
[32m+[m[32m        , [term], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json({ status: 'updated' });[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mTermsRouter.post('/delete/:id', (req, res) => {[m
[32m+[m[32m    const id = req.params.id;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('delete from terms where id=?'[m
[32m+[m[32m        , [id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                res.json({ status: error });[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = TermsRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Router/TestimonialRouter.js b/Router/TestimonialRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..2bd9236[m
[1m--- /dev/null[m
[1m+++ b/Router/TestimonialRouter.js[m
[36m@@ -0,0 +1,103 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m[32mconst path = require('path');[m
[32m+[m[32mconst multer = require('multer');[m
[32m+[m
[32m+[m[32mconst TestimonialRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mTestimonialRouter.get('/', (req, res) => {[m
[32m+[m[32m    res.status(200).json('server on port 9000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mTestimonialRouter.get('/all', (req, res) => {[m
[32m+[m[32m    mysqlconnection.query('select * from testimonials',[m
[32m+[m[32m        (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                console.log(error);[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mTestimonialRouter.get("/image/:id", (req, res) => {[m
[32m+[m[32m    const imageId = req.params.id;[m
[32m+[m[32m    const query = "SELECT image FROM testimonials WHERE testimonial_id = ?";[m
[32m+[m
[32m+[m[32m    mysqlconnection.query(query, [imageId], (err, result) => {[m
[32m+[m[32m        if (err) {[m
[32m+[m[32m            return res.status(500).send("Error fetching image");[m
[32m+[m[32m        }[m
[32m+[m[32m        if (result.length === 0) {[m
[32m+[m[32m            return res.status(404).send("Image not found");[m
[32m+[m[32m        }[m
[32m+[m[32m        res.contentType("image/jpeg");[m
[32m+[m[32m        res.send(result[0].image); // Send the image buffer back as a response[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mconst storage = multer.memoryStorage();[m
[32m+[m[32mconst upload = multer({ storage: storage });[m
[32m+[m[32mTestimonialRouter.post("/add", upload.single("image"), (req, res) => {[m
[32m+[m[32m    const { name, description } = req.body;[m
[32m+[m[32m    const imageBuffer = req.file.buffer;[m
[32m+[m[32m    const query = "insert into testimonials(name, description,image) values(?,?,?);";[m
[32m+[m[32m    mysqlconnection.query(query, [name, description, imageBuffer], (err, result) => {[m
[32m+[m[32m        if (err) {[m
[32m+[m[32m            return res.status(500).send("Error saving image to database");[m
[32m+[m[32m        }[m
[32m+[m[32m        res.status(200).send("Image uploaded successfully");[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mTestimonialRouter.put("/update/:id", upload.single("image"), (req, res) => {[m
[32m+[m[32m    const id = req.params.id;[m
[32m+[m[32m    const { name, description } = req.body;[m
[32m+[m
[32m+[m[32m    const imageBuffer = req.file?.buffer;[m
[32m+[m
[32m+[m[32m    // Build dynamic SQL[m
[32m+[m[32m    let query = `[m
[32m+[m[32m    UPDATE testimonials[m[41m [m
[32m+[m[32m    SET name = ?, description = ?[m
[32m+[m[32m  `;[m
[32m+[m[32m    const values = [name, description];[m
[32m+[m
[32m+[m[32m    // Only update image if a new one is uploaded[m
[32m+[m[32m    if (imageBuffer) {[m
[32m+[m[32m        query += `, image = ?`;[m
[32m+[m[32m        values.push(imageBuffer);[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    query += ` WHERE testimonial_id  = ?`;[m
[32m+[m[32m    values.push(id);[m
[32m+[m
[32m+[m[32m    mysqlconnection.query(query, values, (err, result) => {[m
[32m+[m[32m        if (err) {[m
[32m+[m[32m            console.error(err);[m
[32m+[m[32m            return res.status(500).send("Error updating the testimonial");[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m        if (result.affectedRows === 0) {[m
[32m+[m[32m            return res.status(404).send("Discount not found");[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m        res.status(200).send("testimonial updated successfully");[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mTestimonialRouter.post('/delete', (req, res) => {[m
[32m+[m[32m    const { testimonial_id } = req.body;[m
[32m+[m[32m    console.log(req.body);[m
[32m+[m[32m    mysqlconnection.query('delete from testimonials where testimonial_id=?'[m
[32m+[m[32m        , [testimonial_id], (error, rows, fields) => {[m
[32m+[m[32m            if (!error) {[m
[32m+[m[32m                res.json(rows);[m
[32m+[m[32m            } else {[m
[32m+[m[32m                res.json({ status: error });[m
[32m+[m[32m            }[m
[32m+[m[32m        });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = TestimonialRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Router/UnitRouter.js b/Router/UnitRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..5aa2840[m
[1m--- /dev/null[m
[1m+++ b/Router/UnitRouter.js[m
[36m@@ -0,0 +1,60 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m
[32m+[m[32mconst UnitRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mUnitRouter.get('/', (req, res) => {[m
[32m+[m[32m  res.status(200).json('server on port 9000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mUnitRouter.get('/all', (req, res) => {[m
[32m+[m[32m  mysqlconnection.query('select * from units', (error, rows, fields) => {[m
[32m+[m[32m    if (!error) {[m
[32m+[m[32m      res.json(rows);[m
[32m+[m[32m    } else {[m
[32m+[m[32m      console.log(error);[m
[32m+[m[32m    }[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mUnitRouter.post('/add', (req, res) => {[m
[32m+[m[32m  const { name,ismultiple } = req.body;[m
[32m+[m[32m  console.log(req.body);[m
[32m+[m[32m  mysqlconnection.query('insert into units(name,ismultiple) values(?,?);',[m
[32m+[m[32m    [name,ismultiple], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json({ status: 'inserted' });[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.log(error);[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mUnitRouter.put('/update', (req, res) => {[m
[32m+[m[32m  const { name,ismultiple,unit_id } = req.body;[m
[32m+[m[32m  console.log(req.body);[m
[32m+[m[32m  mysqlconnection.query('update units set name= ?, ismultiple= ? where unit_id=?'[m
[32m+[m[32m    , [name,ismultiple, unit_id], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json({ status: 'updated' });[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.log(error);[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mUnitRouter.post('/delete', (req, res) => {[m
[32m+[m[32m  const { unit_id } = req.body;[m
[32m+[m[32m  console.log(req.body);[m
[32m+[m[32m  mysqlconnection.query('delete from units where unit_id=?'[m
[32m+[m[32m    , [unit_id], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json(rows);[m
[32m+[m[32m      } else {[m
[32m+[m[32m        res.json({ status: error });[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = UnitRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Router/UserRouter.js b/Router/UserRouter.js[m
[1mnew file mode 100644[m
[1mindex 0000000..dc89245[m
[1m--- /dev/null[m
[1m+++ b/Router/UserRouter.js[m
[36m@@ -0,0 +1,302 @@[m
[32m+[m[32mconst { Router } = require('express')[m
[32m+[m[32mconst path = require('path');[m
[32m+[m[32mconst multer = require('multer');[m
[32m+[m[32mconst generateToken = require("../GenerateToken.js");[m
[32m+[m
[32m+[m[32mconst UserRouter = Router();[m
[32m+[m
[32m+[m[32mconst mysqlconnection = require('../dstsbase/database.js');[m
[32m+[m
[32m+[m[32mUserRouter.get('/', (req, res) => {[m
[32m+[m[32m  res.status(200).json('server on port 9000 and database is connected');[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mUserRouter.get('/all', (req, res) => {[m
[32m+[m[32m  mysqlconnection.query('select * from users', (error, rows, fields) => {[m
[32m+[m[32m    if (!error) {[m
[32m+[m[32m      res.json(rows);[m
[32m+[m[32m    } else {[m
[32m+[m[32m      console.log(error);[m
[32m+[m[32m    }[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m
[32m+[m[32mUserRouter.get('/customer/all', (req, res) => {[m
[32m+[m[32m  mysqlconnection.query('select * from users where role="customer"', (error, rows, fields) => {[m
[32m+[m[32m    if (!error) {[m
[32m+[m[32m      res.json(rows);[m
[32m+[m[32m    } else {[m
[32m+[m[32m      console.log(error);[m
[32m+[m[32m    }[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mUserRouter.get("/userrole/all/:id", (req, res) => {[m
[32m+[m[32m  const id = req.params.id;[m
[32m+[m[32m  const query = "select * from users WHERE role = ?";[m
[32m+[m[32m  mysqlconnection.query(query, [id], (error, rows, fields) => {[m
[32m+[m[32m    if (!error) {[m
[32m+[m[32m      res.json(rows);[m
[32m+[m[32m    } else {[m
[32m+[m[32m      console.log(error);[m
[32m+[m[32m    }[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mUserRouter.get("/customer/image/:id", (req, res) => {[m
[32m+[m[32m  const imageId = req.params.id;[m
[32m+[m[32m  const query = 'SELECT image FROM users WHERE id = ? and role="customer"';[m
[32m+[m
[32m+[m[32m  mysqlconnection.query(query, [imageId], (err, result) => {[m
[32m+[m[32m    if (err) {[m
[32m+[m[32m      return res.status(500).send("Error fetching image");[m
[32m+[m[32m    }[m
[32m+[m[32m    if (result.length === 0) {[m
[32m+[m[32m      return res.status(404).send("Image not found");[m
[32m+[m[32m    }[m
[32m+[m[32m    res.contentType("image/jpeg");[m
[32m+[m[32m    res.send(result[0].image); // Send the image buffer back as a response[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m
[32m+[m[32mUserRouter.get("/image/:id", (req, res) => {[m
[32m+[m[32m  const imageId = req.params.id;[m
[32m+[m[32m  const query = 'SELECT image FROM users WHERE id = ?';[m
[32m+[m
[32m+[m[32m  mysqlconnection.query(query, [imageId], (err, result) => {[m
[32m+[m[32m    if (err) {[m
[32m+[m[32m      return res.status(500).send("Error fetching image");[m
[32m+[m[32m    }[m
[32m+[m[32m    if (result.length === 0) {[m
[32m+[m[32m      return res.status(404).send("Image not found");[m
[32m+[m[32m    }[m
[32m+[m[32m    res.contentType("image/jpeg");[m
[32m+[m[32m    res.send(result[0].image); // Send the image buffer back as a response[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m
[32m+[m[32mconst storage = multer.memoryStorage();[m
[32m+[m[32mconst upload = multer({ storage: storage });[m
[32m+[m[32mUserRouter.post('/add', upload.single("image"), (req, res) => {[m
[32m+[m[32m  try {[m
[32m+[m[32m    const { name, email, password, phone, address, sex, role, status } = req.body;[m
[32m+[m[32m    const imageBuffer = req.file.buffer;[m
[32m+[m[32m    // Check if the user already exists[m
[32m+[m[32m    mysqlconnection.query('SELECT * FROM users WHERE email = ? OR name = ?', [email, name], (error, rows) => {[m
[32m+[m[32m      if (error) {[m
[32m+[m[32m        return res.status(500).json({ error: error.message });[m
[32m+[m[32m      }[m
[32m+[m[32m      if (rows.length > 0) {[m
[32m+[m[32m        return res.status(400).json({ message: "User already exists" });[m
[32m+[m[32m      }[m
[32m+[m[32m      // Insert new user into MySQL database[m
[32m+[m[32m      const query = 'insert into users(name,email,password,phone,address,sex,role,status,image) values(?,?,?,?,?,?,?,?,?);';[m
[32m+[m[32m      mysqlconnection.query(query, [name, email, password, phone, address, sex, role, status, imageBuffer], (error, result) => {[m
[32m+[m[32m        if (error) {[m
[32m+[m[32m          return res.status(500).json({ error: error.message });[m
[32m+[m[32m        }[m
[32m+[m
[32m+[m[32m        const userId = result.insertId;[m
[32m+[m
[32m+[m[32m        res.status(201).json({[m
[32m+[m[32m          id: userId,[m
[32m+[m[32m          name,[m
[32m+[m[32m          email,[m
[32m+[m[32m          password,[m
[32m+[m[32m          phone,[m
[32m+[m[32m          address,[m
[32m+[m[32m          sex,[m
[32m+[m[32m          role,[m
[32m+[m[32m          status,[m
[32m+[m[32m          token: generateToken(userId),[m
[32m+[m[32m        });[m
[32m+[m[32m      });[m
[32m+[m[32m    });[m
[32m+[m[32m  } catch (error) {[m
[32m+[m[32m    res.status(500).json({ error: error.message });[m
[32m+[m[32m  }[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32m// const storage = multer.memoryStorage();[m
[32m+[m[32m// const upload = multer({ storage: storage });[m
[32m+[m[32m// UserRouter.post('/add', upload.single("image"), (req, res) => {[m
[32m+[m[32m//   const { name, email, password, phone, sex, role, status } = req.body;[m
[32m+[m[32m//   const imageBuffer = req.file.buffer;[m
[32m+[m[32m//   const query = 'insert into users(name,email,password,phone,sex,role,status,image) values(?,?,?,?,?,?,?,?);';[m
[32m+[m[32m//   mysqlconnection.query(query, [name, email, password, phone, sex, role, status, imageBuffer], (error, rows, fields) => {[m
[32m+[m[32m//     if (error) {[m
[32m+[m[32m//       return res.status(500).send("Error saving image to database");[m
[32m+[m[32m//     }[m
[32m+[m[32m//     res.status(200).send("Image uploaded successfully");[m
[32m+[m[32m//   });[m
[32m+[m[32m// });[m
[32m+[m
[32m+[m[32mUserRouter.put("/update/:id", upload.single("image"), (req, res) => {[m
[32m+[m[32m  const id = req.params.id;[m
[32m+[m[32m  const { name, email, password, phone, address, sex, role, status } = req.body;[m
[32m+[m
[32m+[m[32m  const imageBuffer = req.file?.buffer;[m
[32m+[m
[32m+[m[32m  // Build dynamic SQL[m
[32m+[m[32m  let query = `[m
[32m+[m[32m    UPDATE users[m[41m [m
[32m+[m[32m    SET name= ?, email= ?, password= ?,phone= ?, address=? ,sex= ?,role= ?,status=?[m
[32m+[m[32m  `;[m
[32m+[m[32m  const values = [name, email, password, phone, address, sex, role, status];[m
[32m+[m
[32m+[m[32m  // Only update image if a new one is uploaded[m
[32m+[m[32m  if (imageBuffer) {[m
[32m+[m[32m    query += `, image = ?`;[m
[32m+[m[32m    values.push(imageBuffer);[m
[32m+[m[32m  }[m
[32m+[m
[32m+[m[32m  query += ` WHERE id = ?`;[m
[32m+[m[32m  values.push(id);[m
[32m+[m
[32m+[m[32m  mysqlconnection.query(query, values, (err, result) => {[m
[32m+[m[32m    if (err) {[m
[32m+[m[32m      console.error(err);[m
[32m+[m[32m      return res.status(500).send("Error updating the user");[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    if (result.affectedRows === 0) {[m
[32m+[m[32m      return res.status(404).send("User not found");[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    res.status(200).send("user updated successfully");[m
[32m+[m[32m  });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mUserRouter.put('/status/:id', (req, res) => {[m
[32m+[m[32m  const id = req.params.id;[m
[32m+[m[32m  const { status } = req.body;[m
[32m+[m[32m  console.log(req.body);[m
[32m+[m[32m  mysqlconnection.query('update users set  status= ? where id=?'[m
[32m+[m[32m    , [status, id], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json({ status: 'updated' });[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.log(error);[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mUserRouter.put('/updatepassword/:id', (req, res) => {[m
[32m+[m[32m  const id = req.params.id;[m
[32m+[m[32m  const { password } = req.body;[m
[32m+[m[32m  console.log(req.body);[m
[32m+[m[32m  mysqlconnection.query('update users set  password= ? where id=?'[m
[32m+[m[32m    , [password, id], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json({ status: 'updated' });[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.log(error);[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mUserRouter.put('/updatetoken/:id', (req, res) => {[m
[32m+[m[32m  const id = req.params.id;[m
[32m+[m[32m  const { token } = req.body;[m
[32m+[m[32m  console.log(req.body);[m
[32m+[m[32m  mysqlconnection.query('update users set  token= ? where id=(select id from users where phone=?)'[m
[32m+[m[32m    , [token, id], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json({ status: 'updated' });[m
[32m+[m[32m      } else {[m
[32m+[m[32m        console.log(error);[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mUserRouter.delete('/:users/delete/:id', (req, res) => {[m
[32m+[m[32m  const { id } = req.body;[m
[32m+[m[32m  console.log(req.body);[m
[32m+[m[32m  mysqlconnection.query('delete from users where id=?'[m
[32m+[m[32m    , [id], (error, rows, fields) => {[m
[32m+[m[32m      if (!error) {[m
[32m+[m[32m        res.json(rows);[m
[32m+[m[32m      } else {[m
[32m+[m[32m        res.json({ status: error });[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mUserRouter.post('/login', (req, res) => {[m
[32m+[m[32m  try {[m
[32m+[m[32m    const { phone, password } = req.body;[m
[32m+[m
[32m+[m[32m    mysqlconnection.query('SELECT * FROM users WHERE phone = ?', [phone], (error, rows) => {[m
[32m+[m[32m      if (error) {[m
[32m+[m[32m        return res.status(500).json({ error: error.message });[m
[32m+[m[32m      }[m
[32m+[m
[32m+[m[32m      if (rows.length > 0) {[m
[32m+[m[32m        const user = rows[0];[m
[32m+[m[32m        if (password === user.password) {[m
[32m+[m[32m          if (user.status === "Active") {[m
[32m+[m[32m            res.status(200).json({[m
[32m+[m[32m              id: user.id,[m
[32m+[m[32m              name: user.name,[m
[32m+[m[32m              email: user.email,[m
[32m+[m[32m              password: user.password,[m
[32m+[m[32m              phone: user.phone,[m
[32m+[m[32m              address: user.address,[m
[32m+[m[32m              sex: user.sex,[m
[32m+[m[32m              role: user.role,[m
[32m+[m[32m              status: user.status,[m
[32m+[m[32m              created_at: user.created_at,[m
[32m+[m[32m              token: generateToken(user.id),[m
[32m+[m[32m            });[m
[32m+[m[32m          } else {[m
[32m+[m[32m            res.status(201).json({ message: "blocked, ask admin permission" });[m
[32m+[m[32m          }[m
[32m+[m[32m        } else {[m
[32m+[m[32m          res.status(404).json({ message: "Invalid email or password" });[m
[32m+[m[32m        }[m
[32m+[m[32m      } else {[m
[32m+[m[32m        res.status(405).json({ message: "User not found" });[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m  } catch (error) {[m
[32m+[m[32m    res.status(500).json({ error: error.message });[m
[32m+[m[32m  }[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mUserRouter.post('/profile', (req, res) => {[m
[32m+[m[32m  try {[m
[32m+[m[32m    const { id, token } = req.body;[m
[32m+[m
[32m+[m[32m    mysqlconnection.query('SELECT * FROM users WHERE id = ?', [id], (error, rows) => {[m
[32m+[m[32m      if (error) {[m
[32m+[m[32m        return res.status(500).json({ error: error.message });[m
[32m+[m[32m      }[m
[32m+[m
[32m+[m[32m      if (rows.length > 0) {[m
[32m+[m[32m        const user = rows[0];[m
[32m+[m[32m        res.status(200).json({[m
[32m+[m[32m          id: user.id,[m
[32m+[m[32m          name: user.name,[m
[32m+[m[32m          email: user.email,[m
[32m+[m[32m          password: user.password,[m
[32m+[m[32m          phone: user.phone,[m
[32m+[m[32m          address: user.address,[m
[32m+[m[32m          sex: user.sex,[m
[32m+[m[32m          role: user.role,[m
[32m+[m[32m          status: user.status,[m
[32m+[m[32m          created_at: user.created_at,[m
[32m+[m[32m          token,[m
[32m+[m[32m        });[m
[32m+[m[32m      } else {[m
[32m+[m[32m        res.status(404).json({ message: "User not found" });[m
[32m+[m[32m      }[m
[32m+[m[32m    });[m
[32m+[m[32m  } catch (error) {[m
[32m+[m[32m    res.status(500).json({ error: error.message });[m
[32m+[m[32m  }[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports = UserRouter;[m
\ No newline at end of file[m
[1mdiff --git a/Sends.js b/Sends.js[m
[1mnew file mode 100644[m
[1mindex 0000000..296acc7[m
[1m--- /dev/null[m
[1m+++ b/Sends.js[m
[36m@@ -0,0 +1,44 @@[m
[32m+[m[32mconst admin = require('firebase-admin');[m
[32m+[m
[32m+[m[32mconst serviceAccount = require('./serviceAccountKey.json');[m
[32m+[m
[32m+[m[32madmin.initializeApp({[m
[32m+[m[32m    credential: admin.credential.cert(serviceAccount),[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mexports.SendPushNotification = (req, res, next) => {[m
[32m+[m[32m    try {[m
[32m+[m[32m        const message = {[m
[32m+[m[32m            notification: {[m
[32m+[m[32m                title: "test",[m
[32m+[m[32m                body: "message"[m
[32m+[m[32m            },[m
[32m+[m[32m            data: {[m
[32m+[m[32m                orderid: "test order",[m
[32m+[m[32m                orderdate: "date"[m
[32m+[m[32m            },[m
[32m+[m[32m            token: req.body.fcn_token[m
[32m+[m[32m        };[m
[32m+[m
[32m+[m[32m        admin.messaging().send(message)[m
[32m+[m[32m            .then((response) => {[m
[32m+[m[32m                return res.status(200).send({[m
[32m+[m[32m                    message: "Notification sent",[m
[32m+[m[32m                    response[m
[32m+[m[32m                });[m
[32m+[m[32m            })[m
[32m+[m[32m            .catch((error) => {[m
[32m+[m[32m                console.error("Error sending message:", error);[m
[32m+[m[32m                return res.status(500).send({[m
[32m+[m[32m                    message: "Failed to send notification",[m
[32m+[m[32m                    error: error.message[m
[32m+[m[32m                });[m
[32m+[m[32m            });[m
[32m+[m[32m    } catch (err) {[m
[32m+[m[32m        console.error("Unexpected error:", err);[m
[32m+[m[32m        return res.status(500).send({[m
[32m+[m[32m            message: "Internal server error",[m
[32m+[m[32m            error: err.message[m
[32m+[m[32m        });[m
[32m+[m[32m    }[m
[32m+[m[32m};[m
[1mdiff --git a/Uploud.js b/Uploud.js[m
[1mnew file mode 100644[m
[1mindex 0000000..109ba98[m
[1m--- /dev/null[m
[1m+++ b/Uploud.js[m
[36m@@ -0,0 +1,88 @@[m
[32m+[m[32mconst express = require("express");[m
[32m+[m[32mconst mysql = require("mysql2");[m
[32m+[m[32mconst multer = require("multer");[m
[32m+[m[32mconst cors = require("cors");[m
[32m+[m[32mconst path = require("path");[m
[32m+[m
[32m+[m[32m// Create a new express app[m
[32m+[m[32mconst app = express();[m
[32m+[m
[32m+[m[32m// Enable CORS[m
[32m+[m[32mapp.use(cors());[m
[32m+[m
[32m+[m[32m// Setup multer storage engine to store the uploaded image in memory[m
[32m+[m[32mconst storage = multer.memoryStorage();[m
[32m+[m[32mconst upload = multer({ storage: storage });[m
[32m+[m
[32m+[m[32m// MySQL database connection[m
[32m+[m[32mconst pool = mysql.createPool({[m
[32m+[m[32m    host: "localhost",[m
[32m+[m[32m    user: "root",[m
[32m+[m[32m    password: "", // replace with your MySQL password[m
[32m+[m[32m    database: "servicemanagementsystem", // replace with your database name[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32m// Create a table to store the image (if not exists)[m
[32m+[m[32mconst createTableQuery = `[m
[32m+[m[32m  CREATE TABLE IF NOT EXISTS images ([m
[32m+[m[32m    id INT AUTO_INCREMENT PRIMARY KEY,[m
[32m+[m[32m    image LONGBLOB NOT NULL[m
[32m+[m[32m  );[m
[32m+[m[32m`;[m
[32m+[m
[32m+[m[32mpool.query(createTableQuery, (err, result) => {[m
[32m+[m[32m    if (err) throw err;[m
[32m+[m[32m    console.log("Table 'images' is ready!");[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32m// Endpoint to upload image[m
[32m+[m[32mapp.post("/upload", upload.single("image"), (req, res) => {[m
[32m+[m[32m    if (!req.file) {[m
[32m+[m[32m        return res.status(400).send("No file uploaded");[m
[32m+[m[32m    }[m
[32m+[m
[32m+[m[32m    // Insert the image buffer into the database[m
[32m+[m[32m    const imageBuffer = req.file.buffer;[m
[32m+[m[32m    const query = "INSERT INTO images (image) VALUES (?)";[m
[32m+[m
[32m+[m[32m    pool.query(query, [imageBuffer], (err, result) => {[m
[32m+[m[32m        if (err) {[m
[32m+[m[32m            return res.status(500).send("Error saving image to database");[m
[32m+[m[32m        }[m
[32m+[m[32m        res.status(200).send("Image uploaded successfully");[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32m// Endpoint to fetch image from the database[m
[32m+[m[32mapp.get("/images", (req, res) => {[m
[32m+[m[32m    const query = "SELECT id FROM images";[m
[32m+[m
[32m+[m[32m    pool.query(query, (err, result) => {[m
[32m+[m[32m        if (err) {[m
[32m+[m[32m            return res.status(500).send("Error fetching images");[m
[32m+[m[32m        }[m
[32m+[m[32m        res.status(200).send(result); // Send back the list of image IDs[m
[32m+[m[32m    });[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mapp.get("/image/:id", (req, res) => {[m
[32m+[m[32m    const imageId = req.params.id;[m
[32m+[m[32m    const query = "SELECT image FROM images WHERE id = ?";[m
[32m+[m[41m  [m
[32m+[m[32m    pool.query(query, [imageId], (err, result) => {[m
[32m+[m[32m      if (err) {[m
[32m+[m[32m        return res.status(500).send("Error fetching image");[m
[32m+[m[32m      }[m
[32m+[m[32m      if (result.length === 0) {[m
[32m+[m[32m        return res.status(404).send("Image not found");[m
[32m+[m[32m      }[m
[32m+[m[41m      [m
[32m+[m[32m      res.contentType("image/jpeg");[m
[32m+[m[32m      res.send(result[0].image); // Send the image buffer back as a response[m
[32m+[m[32m    });[m
[32m+[m[32m  });[m
[32m+[m
[32m+[m[32m// Start the server[m
[32m+[m[32mapp.listen(5000, () => {[m
[32m+[m[32m    console.log("Server is running on port 5000");[m
[32m+[m[32m});[m
[1mdiff --git a/dstsbase/database.js b/dstsbase/database.js[m
[1mnew file mode 100644[m
[1mindex 0000000..e5d7fef[m
[1m--- /dev/null[m
[1m+++ b/dstsbase/database.js[m
[36m@@ -0,0 +1,18 @@[m
[32m+[m[32mconst mysql = require('mysql2');[m
[32m+[m
[32m+[m[32mconst mysqlconnection = mysql.createConnection({[m
[32m+[m[32m    host: 'localhost',[m
[32m+[m[32m    user: 'root',[m
[32m+[m[32m    password: '',[m
[32m+[m[32m    database: 'servicemanagementsystem'[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmysqlconnection.connect(function (error){[m
[32m+[m[32m    if(error){[m
[32m+[m[32m        console.log(error);[m
[32m+[m[32m    } else{[m
[32m+[m[32m        console.log('Database is connected');[m
[32m+[m[32m    }[m
[32m+[m[32m});[m
[32m+[m
[32m+[m[32mmodule.exports= mysqlconnection;[m
\ No newline at end of file[m
[1mdiff --git a/img1.png b/img1.png[m
[1mnew file mode 100644[m
[1mindex 0000000..95555e8[m
Binary files /dev/null and b/img1.png differ
[1mdiff --git a/node_modules/.bin/acorn b/node_modules/.bin/acorn[m
[1mnew file mode 100644[m
[1mindex 0000000..679bd16[m
[1m--- /dev/null[m
[1m+++ b/node_modules/.bin/acorn[m
[36m@@ -0,0 +1,16 @@[m
[32m+[m[32m#!/bin/sh[m
[32m+[m[32mbasedir=$(dirname "$(echo "$0" | sed -e 's,\\,/,g')")[m
[32m+[m
[32m+[m[32mcase `uname` in[m
[32m+[m[32m    *CYGWIN*|*MINGW*|*MSYS*)[m
[32m+[m[32m        if command -v cygpath > /dev/null 2>&1; then[m
[32m+[m[32m            basedir=`cygpath -w "$basedir"`[m
[32m+[m[32m        fi[m
[32m+[m[32m    ;;[m
[32m+[m[32mesac[m
[32m+[m
[32m+[m[32mif [ -x "$basedir/node" ]; then[m
[32m+[m[32m  exec "$basedir/node"  "$basedir/../acorn/bin/acorn" "$@"[m
[32m+[m[32melse[m[41m [m
[32m+[m[32m  exec node  "$basedir/../acorn/bin/acorn" "$@"[m
[32m+[m[32mfi[m
[1mdiff --git a/node_modules/.bin/acorn.cmd b/node_modules/.bin/acorn.cmd[m
[1mnew file mode 100644[m
[1mindex 0000000..a9324df[m
[1m--- /dev/null[m
[1m+++ b/node_modules/.bin/acorn.cmd[m
[36m@@ -0,0 +1,17 @@[m
[32m+[m[32m@ECHO off[m
[32m+[m[32mGOTO start[m
[32m+[m[32m:find_dp0[m
[32m+[m[32mSET dp0=%~dp0[m
[32m+[m[32mEXIT /b[m
[32m+[m[32m:start[m
[32m+[m[32mSETLOCAL[m
[32m+[m[32mCALL :find_dp0[m
[32m+[m
[32m+[m[32mIF EXIST "%dp0%\node.exe" ([m
[32m+[m[32m  SET "_prog=%dp0%\node.exe"[m
[32m+[m[32m) ELSE ([m
[32m+[m[32m  SET "_prog=node"[m
[32m+[m[32m  SET PATHEXT=%PATHEXT:;.JS;=;%[m
[32m+[m[32m)[m
[32m+[m
[32m+[m[32mendLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"  "%dp0%\..\acorn\bin\acorn" %*[m
[1mdiff --git a/node_modules/.bin/acorn.ps1 b/node_modules/.bin/acorn.ps1[m
[1mnew file mode 100644[m
[1mindex 0000000..6f6dcdd[m
[1m--- /dev/null[m
[1m+++ b/node_modules/.bin/acorn.ps1[m
[36m@@ -0,0 +1,28 @@[m
[32m+[m[32m#!/usr/bin/env pwsh[m
[32m+[m[32m$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent[m
[32m+[m
[32m+[m[32m$exe=""[m
[32m+[m[32mif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {[m
[32m+[m[32m  # Fix case when both the Windows and Linux builds of Node[m
[32m+[m[32m  # are installed in the same directory[m
[32m+[m[32m  $exe=".exe"[m
[32m+[m[32m}[m
[32m+[m[32m$ret=0[m
[32m+[m[32mif (Test-Path "$basedir/node$exe") {[m
[32m+[m[32m  # Support pipeline input[m
[32m+[m[32m  if ($MyInvocation.ExpectingInput) {[m
[32m+[m[32m    $input | & "$basedir/node$exe"  "$basedir/../acorn/bin/acorn" $args[m
[32m+[m[32m  } else {[m
[32m+[m[32m    & "$basedir/node$exe"  "$basedir/../acorn/bin/acorn" $args[m
[32m+[m[32m  }[m
[32m+[m[32m  $ret=$LASTEXITCODE[m
[32m+[m[32m} else {[m
[32m+[m[32m  # Support pipeline input[m
[32m+[m[32m  if ($MyInvocation.ExpectingInput) {[m
[32m+[m[32m    $input | & "node$exe"  "$basedir/../acorn/bin/acorn" $args[m
[32m+[m[32m  } else {[m
[32m+[m[32m    & "node$exe"  "$basedir/../acorn/bin/acorn" $args[m
[32m+[m[32m  }[m
[32m+[m[32m  $ret=$LASTEXITCODE[m
[32m+[m[32m}[m
[32m+[m[32mexit $ret[m
[1mdiff --git a/node_modules/.bin/atob b/node_modules/.bin/atob[m
[1mnew file mode 100644[m
[1mindex 0000000..bcdbad1[m
[1m--- /dev/null[m
[1m+++ b/node_modules/.bin/atob[m
[36m@@ -0,0 +1,16 @@[m
[32m+[m[32m#!/bin/sh[m
[32m+[m[32mbasedir=$(dirname "$(echo "$0" | sed -e 's,\\,/,g')")[m
[32m+[m
[32m+[m[32mcase `uname` in[m
[32m+[m[32m    *CYGWIN*|*MINGW*|*MSYS*)[m
[32m+[m[32m        if command -v cygpath > /dev/null 2>&1; then[m
[32m+[m[32m            basedir=`cygpath -w "$basedir"`[m
[32m+[m[32m        fi[m
[32m+[m[32m    ;;[m
[32m+[m[32mesac[m
[32m+[m
[32m+[m[32mif [ -x "$basedir/node" ]; then[m
[32m+[m[32m  exec "$basedir/node"  "$basedir/../atob/bin/atob.js" "$@"[m
[32m+[m[32melse[m[41m [m
[32m+[m[32m  exec node  "$basedir/../atob/bin/atob.js" "$@"[m
[32m+[m[32mfi[m
[1mdiff --git a/node_modules/.bin/atob.cmd b/node_modules/.bin/atob.cmd[m
[1mnew file mode 100644[m
[1mindex 0000000..850a60b[m
[1m--- /dev/null[m
[1m+++ b/node_modules/.bin/atob.cmd[m
[36m@@ -0,0 +1,17 @@[m
[32m+[m[32m@ECHO off[m
[32m+[m[32mGOTO start[m
[32m+[m[32m:find_dp0[m
[32m+[m[32mSET dp0=%~dp0[m
[32m+[m[32mEXIT /b[m
[32m+[m[32m:start[m
[32m+[m[32mSETLOCAL[m
[32m+[m[32mCALL :find_dp0[m
[32m+[m
[32m+[m[32mIF EXIST "%dp0%\node.exe" ([m
[32m+[m[32m  SET "_prog=%dp0%\node.exe"[m
[32m+[m[32m) ELSE ([m
[32m+[m[32m  SET "_prog=node"[m
[32m+[m[32m  SET PATHEXT=%PATHEXT:;.JS;=;%[m
[32m+[m[32m)[m
[32m+[m
[32m+[m[32mendLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"  "%dp0%\..\atob\bin\atob.js" %*[m
[1mdiff --git a/node_modules/.bin/atob.ps1 b/node_modules/.bin/atob.ps1[m
[1mnew file mode 100644[m
[1mindex 0000000..4a9f311[m
[1m--- /dev/null[m
[1m+++ b/node_modules/.bin/atob.ps1[m
[36m@@ -0,0 +1,28 @@[m
[32m+[m[32m#!/usr/bin/env pwsh[m
[32m+[m[32m$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent[m
[32m+[m
[32m+[m[32m$exe=""[m
[32m+[m[32mif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {[m
[32m+[m[32m  # Fix case when both the Windows and Linux builds of Node[m
[32m+[m[32m  # are installed in the same directory[m
[32m+[m[32m  $exe=".exe"[m
[32m+[m[32m}[m
[32m+[m[32m$ret=0[m
[32m+[m[32mif (Test-Path "$basedir/node$exe") {[m
[32m+[m[32m  # Support pipeline input[m
[32m+[m[32m  if ($MyInvocation.ExpectingInput) {[m
[32m+[m[32m    $input | & "$basedir/node$exe"  "$basedir/../atob/bin/atob.js" $args[m
[32m+[m[32m  } else {[m
[32m+[m[32m    & "$basedir/node$exe"  "$basedir/../atob/bin/atob.js" $args[m
[32m+[m[32m  }[m
[32m+[m[32m  $ret=$LASTEXITCODE[m
[32m+[m[32m} else {[m
[32m+[m[32m  # Support pipeline input[m
[32m+[m[32m  if ($MyInvocation.ExpectingInput) {[m
[32m+[m[32m    $input | & "node$exe"  "$basedir/../atob/bin/atob.js" $args[m
[32m+[m[32m  } else {[m
[32m+[m[32m    & "node$exe"  "$basedir/../atob/bin/atob.js" $args[m
[32m+[m[32m  }[m
[32m+[m[32m  $ret=$LASTEXITCODE[m
[32m+[m[32m}[m
[32m+[m[32mexit $ret[m
[1mdiff --git a/node_modules/.bin/color-support b/node_modules/.bin/color-support[m
[1mnew file mode 100644[m
[1mindex 0000000..f77f9d5[m
[1m--- /dev/null[m
[1m+++ b/node_modules/.bin/color-support[m
[36m@@ -0,0 +1,16 @@[m
[32m+[m[32m#!/bin/sh[m
[32m+[m[32mbasedir=$(dirname "$(echo "$0" | sed -e 's,\\,/,g')")[m
[32m+[m
[32m+[m[32mcase `uname` in[m
[32m+[m[32m    *CYGWIN*|*MINGW*|*MSYS*)[m
[32m+[m[32m        if command -v cygpath > /dev/null 2>&1; then[m
[32m+[m[32m            basedir=`cygpath -w "$basedir"`[m
[32m+[m[32m        fi[m
[32m+[m[32m    ;;[m
[32m+[m[32mesac[m
[32m+[m
[32m+[m[32mif [ -x "$basedir/node" ]; then[m
[32m+[m[32m  exec "$basedir/node"  "$basedir/../color-support/bin.js" "$@"[m
[32m+[m[32melse[m[41m [m
[32m+[m[32m  exec node  "$basedir/../color-support/bin.js" "$@"[m
[32m+[m[32mfi[m
[1mdiff --git a/node_modules/.bin/color-support.cmd b/node_modules/.bin/color-support.cmd[m
[1mnew file mode 100644[m
[1mindex 0000000..005f9a5[m
[1m--- /dev/null[m
[1m+++ b/node_modules/.bin/color-support.cmd[m
[36m@@ -0,0 +1,17 @@[m
[32m+[m[32m@ECHO off[m
[32m+[m[32mGOTO start[m
[32m+[m[32m:find_dp0[m
[32m+[m[32mSET dp0=%~dp0[m
[32m+[m[32mEXIT /b[m
[32m+[m[32m:start[m
[32m+[m[32mSETLOCAL[m
[32m+[m[32mCALL :find_dp0[m
[32m+[m
[32m+[m[32mIF EXIST "%dp0%\node.exe" ([m
[32m+[m[32m  SET "_prog=%dp0%\node.exe"[m
[32m+[m[32m) ELSE ([m
[32m+[m[32m  SET "_prog=node"[m
[32m+[m[32m  SET PATHEXT=%PATHEXT:;.JS;=;%[m
[32m+[m[32m)[m
[32m+[m
[32m+[m[32mendLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"  "%dp0%\..\color-support\bin.js" %*[m
[1mdiff --git a/node_modules/.bin/color-support.ps1 b/node_modules/.bin/color-support.ps1[m
[1mnew file mode 100644[m
[1mindex 0000000..f5c9fe4[m
[1m--- /dev/null[m
[1m+++ b/node_modules/.bin/color-support.ps1[m
[36m@@ -0,0 +1,28 @@[m
[32m+[m[32m#!/usr/bin/env pwsh[m
[32m+[m[32m$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent[m
[32m+[m
[32m+[m[32m$exe=""[m
[32m+[m[32mif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {[m
[32m+[m[32m  # Fix case when both the Windows and Linux builds of Node[m
[32m+[m[32m  # are installed in the same directory[m
[32m+[m[32m  $exe=".exe"[m
[32m+[m[32m}[m
[32m+[m[32m$ret=0[m
[32m+[m[32mif (Test-Path "$basedir/node$exe") {[m
[32m+[m[32m  # Support pipeline input[m
[32m+[m[32m  if ($MyInvocation.ExpectingInput) {[m
[32m+[m[32m    $input | & "$basedir/node$exe"  "$basedir/../color-support/bin.js" $args[m
[32m+[m[32m  } else {[m
[32m+[m[32m    & "$basedir/node$exe"  "$basedir/../color-support/bin.js" $args[m
[32m+[m[32m  }[m
[32m+[m[32m  $ret=$LASTEXITCODE[m
[32m+[m[32m} else {[m
[32m+[m[32m  # Support pipeline input[m
[32m+[m[32m  if ($MyInvocation.ExpectingInput) {[m
[32m+[m[32m    $input | & "node$exe"  "$basedir/../color-support/bin.js" $args[m
[32m+[m[32m  } else {[m
[32m+[m[32m    & "node$exe"  "$basedir/../color-support/bin.js" $args[m
[32m+[m[32m  }[m
[32m+[m[32m  $ret=$LASTEXITCODE[m
[32m+[m[32m}[m
[32m+[m[32mexit $ret[m
[1mdiff --git a/node_modules/.bin/fxparser b/node_modules/.bin/fxparser[m
[1mnew file mode 100644[m
[1mindex 0000000..c722e41[m
[1m--- /dev/null[m
[1m+++ b/node_modules/.bin/fxparser[m
[36m@@ -0,0 +1,16 @@[m
[32m+[m[32m#!/bin/sh[m
[32m+[m[32mbasedir=$(dirname "$(echo "$0" | sed -e 's,\\,/,g')")[m
[32m+[m
[32m+[m[32mcase `uname` in[m
[32m+[m[32m    *CYGWIN*|*MINGW*|*MSYS*)[m
[32m+[m[32m        if command -v cygpath > /dev/null 2>&1; then[m
[32m+[m[32m            basedir=`cygpath -w "$basedir"`[m
[32m+[m[32m        fi[m
[32m+[m[32m    ;;[m
[32m+[m[32mesac[m
[32m+[m
[32m+[m[32mif [ -x "$basedir/node" ]; then[m
[32m+[m[32m  exec "$basedir/node"  "$basedir/../fast-xml-parser/src/cli/cli.js" "$@"[m
[32m+[m[32melse[m[41m [m
[32m+[m[32m  exec node  "$basedir/../fast-xml-parser/src/cli/cli.js" "$@"[m
[32m+[m[32mfi[m
[1mdiff --git a/node_modules/.bin/fxparser.cmd b/node_modules/.bin/fxparser.cmd[m
[1mnew file mode 100644[m
[1mindex 0000000..043b763[m
[1m--- /dev/null[m
[1m+++ b/node_modules/.bin/fxparser.cmd[m
[36m@@ -0,0 +1,17 @@[m
[32m+[m[32m@ECHO off[m
[32m+[m[32mGOTO start[m
[32m+[m[32m:find_dp0[m
[32m+[m[32mSET dp0=%~dp0[m
[32m+[m[32mEXIT /b[m
[32m+[m[32m:start[m
[32m+[m[32mSETLOCAL[m
[32m+[m[32mCALL :find_dp0[m
[32m+[m
[32m+[m[32mIF EXIST "%dp0%\node.exe" ([m
[32m+[m[32m  SET "_prog=%dp0%\node.exe"[m
[32m+[m[32m) ELSE ([m
[32m+[m[32m  SET "_prog=node"[m
[32m+[m[32m  SET PATHEXT=%PATHEXT:;.JS;=;%[m
[32m+[m[32m)[m
[32m+[m
[32m+[m[32mendLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"  "%dp0%\..\fast-xml-parser\src\cli\cli.js" %*[m
[1mdiff --git a/node_modules/.bin/fxparser.ps1 b/node_modules/.bin/fxparser.ps1[m
[1mnew file mode 100644[m
[1mindex 0000000..3e7252a[m
[1m--- /dev/null[m
[1m+++ b/node_modules/.bin/fxparser.ps1[m
[36m@@ -0,0 +1,28 @@[m
[32m+[m[32m#!/usr/bin/env pwsh[m
[32m+[m[32m$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent[m
[32m+[m
[32m+[m[32m$exe=""[m
[32m+[m[32mif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {[m
[32m+[m[32m  # Fix case when both the Windows and Linux builds of Node[m
[32m+[m[32m  # are installed in the same directory[m
[32m+[m[32m  $exe=".exe"[m
[32m+[m[32m}[m
[32m+[m[32m$ret=0[m
[32m+[m[32mif (Test-Path "$basedir/node$exe") {[m
[32m+[m[32m  # Support pipeline input[m
[32m+[m[32m  if ($MyInvocation.ExpectingInput) {[m
[32m+[m[32m    $input | & "$basedir/node$exe"  "$basedir/../fast-xml-parser/src/cli/cli.js" $args[m
[32m+[m[32m  } else {[m
[32m+[m[32m    & "$basedir/node$exe"  "$basedir/../fast-xml-parser/src/cli/cli.js" $args[m
[32m+[m[32m  }[m
[32m+[m[32m  $ret=$LASTEXITCODE[m
[32m+[m[32m} else {[m
[32m+[m[32m  # Support pipeline input[m
[32m+[m[32m  if ($MyInvocation.ExpectingInput) {[m
[32m+[m[32m    $input | & "node$exe"  "$basedir/../fast-xml-parser/src/cli/cli.js" $args[m
[32m+[m[32m  } else {[m
[32m+[m[32m    & "node$exe"  "$basedir/../fast-xml-parser/src/cli/cli.js" $args[m
[32m+[m[32m  }[m
[32m+[m[32m  $ret=$LASTEXITCODE[m
[32m+[m[32m}[m
[32m+[m[32mexit $ret[m
[1mdiff --git a/node_modules/.bin/gcs-upload b/node_modules/.bin/gcs-upload[m
[1mnew file mode 100644[m
[1mindex 0000000..2425066[m
[1m--- /dev/null[m
[1m+++ b/node_modules/.bin/gcs-upload[m
[36m@@ -0,0 +1,16 @@[m
[32m+[m[32m#!/bin/sh[m
[32m+[m[32mbasedir=$(dirname "$(echo "$0" | sed -e 's,\\,/,g')")[m
[32m+[m
[32m+[m[32mcase `uname` in[m
[32m+[m[32m    *CYGWIN*|*MINGW*|*MSYS*)[m
[32m+[m[32m        if command -v cygpath > /dev/null 2>&1; then[m
[32m+[m[32m            basedir=`cygpath -w "$basedir"`[m
[32m+[m[32m        fi[m
[32m+[m[32m    ;;[m
[32m+[m[32mesac[m
[32m+[m
[32m+[m[32mif [ -x "$basedir/node" ]; then[m
[32m+[m[32m  exec "$basedir/node"  "$basedir/../gcs-resumable-upload/build/src/cli.js" "$@"[m
[32m+[m[32melse[m[41m [m
[32m+[m[32m  exec node  "$basedir/../gcs-resumable-upload/build/src/cli.js" "$@"[m
[32m+[m[32mfi[m
[1mdiff --git a/node_modules/.bin/gcs-upload.cmd b/node_modules/.bin/gcs-upload.cmd[m
[1mnew file mode 100644[m
[1mindex 0000000..5cf8026[m
[1m--- /dev/null[m
[1m+++ b/node_modules/.bin/gcs-upload.cmd[m
[36m@@ -0,0 +1,17 @@[m
[32m+[m[32m@ECHO off[m
[32m+[m[32mGOTO start[m
[32m+[m[32m:find_dp0[m
[32m+[m[32mSET dp0=%~dp0[m
[32m+[m[32mEXIT /b[m
[32m+[m[32m:start[m
[32m+[m[32mSETLOCAL[m
[32m+[m[32mCALL :find_dp0[m
[32m+[m
[32m+[m[32mIF EXIST "%dp0%\node.exe" ([m
[32m+[m[32m  SET "_prog=%dp0%\node.exe"[m
[32m+[m[32m) ELSE ([m
[32m+[m[32m  SET "_prog=node"[m
[32m+[m[32m  SET PATHEXT=%PATHEXT:;.JS;=;%[m
[32m+[m[32m)[m
[32m+[m
[32m+[m[32mendLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"  "%dp0%\..\gcs-resumable-upload\build\src\cli.js" %*[m
[1mdiff --git a/node_modules/.bin/gcs-upload.ps1 b/node_modules/.bin/gcs-upload.ps1[m
[1mnew file mode 100644[m
[1mindex 0000000..5488197[m
[1m--- /dev/null[m
[1m+++ b/node_modules/.bin/gcs-upload.ps1[m
[36m@@ -0,0 +1,28 @@[m
[32m+[m[32m#!/usr/bin/env pwsh[m
[32m+[m[32m$basedir=Split-Path $MyInvocation.MyCommand.Definition -Parent[m
[32m+[m
[32m+[m[32m$exe=""[m
[32m+[m[32mif ($PSVersionTable.PSVersion -lt "6.0" -or $IsWindows) {[m
[32m+[m[32m  # Fix case when both the Windows and Linux builds of Node[m
[32m+[m[32m  # are installed in the same directory[m
[32m+[m[32m  $exe=".exe"[m
[32m+[m[32m}[m
[32m+[m[32m$ret=0[m
[32m+[m[32mif (Test-Path "$basedir/node$exe") {[m
[32m+[m[32m  # Support pipeline input[m
[32m+[m[32m  if ($MyInvocation.ExpectingInput) {[m
[32m+[m[32m    $input | & "$basedir/node$exe"  "$basedir/../gcs-resumable-upload/build/src/cli.js" $args[m
[32m+[m[32m  } else {[m
[32m+[m[32m    & "$basedir/node$exe"  "$basedir/../gcs-resumable-upload/build/src/cli.js" $args[m
[32m+[m[32m  }[m
[32m+[m[32m  $ret=$LASTEXITCODE[m
[32m+[m[32m} else {[m
[32m+[m[32m  # Support pipeline input[m
[32m+[m[32m  if ($MyInvocation.ExpectingInput) {[m
[32m+[m[32m    $input | & "node$exe"  "$basedir/../gcs-resumable-upload/build/src/cli.js" $args[m
[32m+[m[32m  } else {[m
[32m+[m[32m    & "node$exe"  "$basedir/../gcs-resumable-upload/build/src/cli.js" $args[m
[32m+[m[32m  }[m
[32m+[m[32m  $ret=$LASTEXITCODE[m
[32m+[m[32m}[m
[32m+[m[32mexit $ret[m
[1mdiff --git a/node_modules/.bin/gp12-pem b/node_modules/.bin/gp12-pem[m
[1mnew file mode 100644[m
[1mindex 0000000..6f8bde5[m
[1m--- /dev/null[m
[1m+++ b/node_modules/.bin/gp12-pem[m
[36m@@ -0,0 +1,16 @@[m
[32m+[m[32m#!/bin/sh[m
[32m+[m[32mbasedir=$(dirname "$(echo "$0" | sed -e 's,\\,/,g')")[m
[32m+[m
[32m+[m[32mcase `uname` in[m
[32m+[m[32m    *CYGWIN*|*MINGW*|*MSYS*)[m
[32m+[m[32m        if command -v cygpath > /dev/null 2>&1; then[m
[32m+[m[32m            basedir=`cygpath -w "$basedir"`[m
[32m+[m[32m        fi[m
[32m+[m[32m    ;;[m
[32m+[m[32mesac[m
[32m+[m
[32m+[m[32mif [ -x "$basedir/node" ]; then[m
[32m+[m[32m  exec "$basedir/node"  "$basedir/../google-p12-pem/build/src/bin/gp12-pem.js" "$@"[m
[32m+[m[32melse[m[41m [m
[32m+[m[32m  exec node  "$basedir/../google-p12-pem/build/src/bin/gp12-pem.js" "$@"[m
[32m+[m[32mfi[m
[1mdiff --git a/node_modules/.bin/gp12-pem.cmd b/node_modules/.bin/gp12-pem.cmd[m
[1mnew file mode 100644[m
[1mindex 0000000..c9fc12a[m
[1m--- /dev/null[m
[1m+++ b/node_modules/.bin/gp12-pem.cmd[m
[36m@@ -0,0 +1,17 @@[m
[32m+[m[32m@ECHO off[m
[32m+[m[32mGOTO start[m
[32m+[m[32m:find_dp0[m
[32m+[m[32mSET dp0=%~dp0[m
[32m+[m[32mEXIT /b[m
[32m+[m[32m:start[m
[32m+[m[32mSETLOCAL[m
[32m+[m[32mCALL :find_dp0[m
[32m+[m
[32m+[m[32mIF EXIST "%dp0%\node.exe" ([m
[32m+[m[32m  SET "_prog=%dp0%\node.exe"[m
[32m+[m[32m) ELSE ([m
[32m+[m[32m  SET "_prog=node"[m
[32m+[m[32m  SET PATHEXT=%PATHEXT:;.JS;=;%[m
[32m+[m[32m)[m
[32m+[m
[32m+[m[32mendLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"  "%dp0%\..\google-p12-pem\build\src\bin\gp12-pem.js" %*[m
[1mdiff --git a/node_module