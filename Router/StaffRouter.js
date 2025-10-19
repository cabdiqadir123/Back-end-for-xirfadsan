const { Router } = require('express')

const StaffRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

StaffRouter.get('/', (req, res) => {
    res.status(200).json('server on port 9000 and database is connected');
});

StaffRouter.get('/all', (req, res) => {
    mysqlconnection.query('select staff_id,user_id, services.service_id,services.name as servicename,users.name,email, password,phone,address,sex,role,users.status,available,staff.created_at from users inner join staff on staff.user_id=users.id INNER join services on services.service_id =staff.service_id',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
            }
        });
});

StaffRouter.get('/all_admin', (req, res) => {
    const query = `
    SELECT 
    s.staff_id,
    s.user_id AS staff_user_id,
    s.service_id,
    srv.name AS servicename,
    u.name AS staff_name,
    u.email AS staff_email,
    u.password,
    u.phone AS staff_phone,
    u.address AS staff_address,
    u.sex,
    u.role,
    u.status,
    s.available,
    s.created_at,
    -- Total earnings from completed bookings
    IFNULL(SUM(CASE WHEN b.booking_status = 'Completed' THEN b.amount ELSE 0 END), 0) AS total_earning,
    -- Total number of all bookings (completed or not)
    COUNT(b.id) AS total_job
    FROM staff s
    INNER JOIN users u ON s.user_id = u.id
    INNER JOIN services srv ON s.service_id = srv.service_id
    LEFT JOIN bookings b ON s.staff_id = b.staff_id
    GROUP BY 
        s.staff_id,
        s.user_id,
        s.service_id,
        srv.name,
        u.name,
        u.email,
        u.password,
        u.phone,
        u.address,
        u.sex,
        u.role,
        u.status,
        s.available,
        s.created_at
    ORDER BY s.staff_id ASC;
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


StaffRouter.get("/image/:id", (req, res) => {
    const imageId = req.params.id;
    const query = 'select image from users inner join staff on staff.user_id=users.id where user_id=?';

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

StaffRouter.post('/add', (req, res) => {
    const { name, service_id, available, created_at } = req.body;
    console.log(req.body);
    mysqlconnection.query(
        'insert into staff(user_id,service_id,available,created_at) values((select id from users where name=?),(select service_id from services where name=?),?,?);',
        [name, service_id, available, created_at], (error, rows, fields) => {
            if (!error) {
                res.json({ status: 'inserted' });
            } else {
                console.log(error);
            }
        });
});

// for new typescript dashboard
StaffRouter.post('/addNew', (req, res) => {
    const { name, service_id, available, created_at } = req.body;
    console.log(req.body);
    mysqlconnection.query(
        'insert into staff(user_id,service_id,available,created_at) values((select id from users where name=?),?,?,?);',
        [name, service_id, available, created_at], (error, rows, fields) => {
            if (!error) {
                res.json({ status: 'inserted' });
            } else {
                console.log(error);
            }
        });
});

StaffRouter.put("/update/:id", (req, res) => {
    const id = req.params.id;
    const { service_id, available } = req.body;
    console.log(req.body);
    mysqlconnection.query('update staff set service_id=(select service_id from services where name=?),available=? where staff_id=?'
        , [service_id, available, id], (error, rows, fields) => {
            if (!error) {
                res.json({ status: 'updated' });
            } else {
                console.log(error);
            }
        });
});

// for updating of new typescript dashboard
StaffRouter.put("/updateNew/:id", (req, res) => {
    const id = req.params.id;
    const { service_id, available } = req.body;
    console.log(req.body);
    mysqlconnection.query('update staff set service_id=?,available=? where user_id=?'
        , [service_id, available, id], (error, rows, fields) => {
            if (!error) {
                res.json({ status: 'updated' });
            } else {
                console.log(error);
            }
        });
});

StaffRouter.post('/delete', (req, res) => {
    const { staff_id } = req.body;
    console.log(req.body);
    mysqlconnection.query('delete from staff where staff_id=?'
        , [staff_id], (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                res.json({ status: error });
            }
        });
});

// for new typescript dashboard 
StaffRouter.post('/deleteNew', (req, res) => {
    const { staff_id } = req.body;
    console.log(req.body);
    mysqlconnection.query('delete from staff where user_id=?'
        , [staff_id], (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                res.json({ status: error });
            }
        });
});

module.exports = StaffRouter;