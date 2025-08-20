const { Router } = require('express')

const SupplierRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

SupplierRouter.get('/', (req, res) => {
    res.status(200).json('server on port 9000 and database is connected');
});

SupplierRouter.get('/all', (req, res) => {
    mysqlconnection.query('select supplier_id,user_id,suppliers.service_id,services.name as service_name,users.name,email,password,phone,address,sex,role,status from users inner join suppliers on suppliers.user_id=users.id INNER JOIN services on services.service_id=suppliers.service_id',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
            }
        });
});

SupplierRouter.get("/image/:id", (req, res) => {
    const imageId = req.params.id;
    const query = 'select image from users inner join suppliers on suppliers.user_id=users.id where user_id=?';

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

SupplierRouter.post('/add', (req, res) => {
    const { name, service_id } = req.body;
    console.log(req.body);
    mysqlconnection.query('insert into suppliers(user_id,service_id) values((select id from users where name=?),(select service_id from services where name=?));',
        [name, service_id], (error, rows, fields) => {
            if (!error) {
                res.json({ status: 'inserted' });
            } else {
                console.log(error);
            }
        });
});

SupplierRouter.put("/update/:id", (req, res) => {
    const id = req.params.id;
    const { service_id } = req.body;
    console.log(req.body);
    mysqlconnection.query('update suppliers set service_id= (select service_id from services where name=?) where supplier_id=?'
        , [service_id,id], (error, rows, fields) => {
            if (!error) {
                res.json({ status: 'updated' });
            } else {
                console.log(error);
            }
        });
});

SupplierRouter.post('/delete', (req, res) => {
    const { supplier_id } = req.body;
    console.log(req.body);
    mysqlconnection.query('delete from suppliers where supplier_id=?'
        , [supplier_id], (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                res.json({ status: error });
            }
        });
});

module.exports = SupplierRouter;