const { Router } = require('express')

const StaffRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

StaffRouter.get('/', (req, res) => {
    res.status(200).json('server on port 9000 and database is connected');
});

StaffRouter.get('/all', (req, res) => {
    mysqlconnection.query('select staff_id,user_id,supplier_id,sub_service_id,name,email,password,phone,address,sex,role,status,image,available,staff.created_at from users inner join staff on staff.user_id=users.id',
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
    const { name, supplier_id, sub_service_id } = req.body;
    console.log(req.body);
    mysqlconnection.query(
        'insert into staff(user_id,supplier_id,sub_service_id) values((select id from users where name=?),(select supplier_id from suppliers where user_id=(select id from users where name=?)),(select sub_service_id from sub_services where sub_service=?));',
        [name, supplier_id, sub_service_id], (error, rows, fields) => {
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
    mysqlconnection.query('update staff set supplier_id=(select supplier_id from suppliers where user_id=(select id from users where name=?)), sub_service_id= (select sub_service_id from sub_services where sub_service=?) where staff_id=?'
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