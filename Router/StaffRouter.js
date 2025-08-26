const { Router } = require('express')

const StaffRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

StaffRouter.get('/', (req, res) => {
    res.status(200).json('server on port 9000 and database is connected');
});

StaffRouter.get('/all', (req, res) => {
    mysqlconnection.query('select staff_id,user_id,service_id,services.name as servicename,name,email,password,phone,address,dof,sex,role,status,available,staff.created_at from users inner join staff on staff.user_id=users.id INNER join services on services.service_id =staff.service_id ',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
            }
        });
});

StaffRouter.get('/all_admin', (req, res) => {
    mysqlconnection.query('SELECT staff.staff_id, staff.user_id AS staff_user_id, staff.service_id, u_staff.name AS staff_name,u_staff.email AS staff_email,u_staff.password,u_staff.phone AS staff_phone, u_staff.address AS staff_address,u_staff.dof, u_staff.sex, u_staff.role, u_staff.status, u_staff.image, staff.available,staff.created_at FROM staff INNER JOIN users u_staff ON staff.user_id = u_staff.id INNER join services  on staff.service_id=services.service_id',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
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
    const { name, supplier_id, sub_service_id,available } = req.body;
    console.log(req.body);
    mysqlconnection.query(
        'insert into staff(user_id,service_id,available) values((select id from users where name=?),(select service_id from services s  where name=?),?);',
        [name, supplier_id, sub_service_id,available], (error, rows, fields) => {
            if (!error) {
                res.json({ status: 'inserted' });
            } else {
                console.log(error);
            }
        });
});

StaffRouter.put("/update/:id", (req, res) => {
    const id = req.params.id;
    const { supplier_id, sub_service_id } = req.body;
    console.log(req.body);
    mysqlconnection.query('update staff set service_id=(select service_id from services where name=?) where staff_id=?'
        , [supplier_id, sub_service_id,id], (error, rows, fields) => {
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

module.exports = StaffRouter;