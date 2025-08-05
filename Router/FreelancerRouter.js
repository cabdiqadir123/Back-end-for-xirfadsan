const { Router } = require('express')

const FreelancerRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

FreelancerRouter.get('/', (req, res) => {
    res.status(200).json('server on port 9000 and database is connected');
});

FreelancerRouter.get('/all', (req, res) => {
    mysqlconnection.query('select freelancer_id,user_id,supplier_id,sub_service_id,name,email,password,phone,sex,role,status,image from users inner join freelancers on freelancers.user_id=users.id',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
            }
        });
});

FreelancerRouter.get("/image/:id", (req, res) => {
    const imageId = req.params.id;
    const query = 'select image from users inner join freelancers on freelancers.user_id=users.id where user_id=?';

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

FreelancerRouter.post('/add', (req, res) => {
    const { name, supplier_id, sub_service_id } = req.body;
    console.log(req.body);
    mysqlconnection.query(
        'insert into freelancers(user_id,supplier_id,sub_service_id) values((select id from users where name=?),(select supplier_id from suppliers where user_id=(select id from users where name=?)),(select sub_service_id from sub_services where sub_service=?));',
        [name, supplier_id, sub_service_id], (error, rows, fields) => {
            if (!error) {
                res.json({ status: 'inserted' });
            } else {
                console.log(error);
            }
        });
});

FreelancerRouter.put('/update', (req, res) => {
    const { name, image, secondry_image, created_at, service_id } = req.body;
    console.log(req.body);
    mysqlconnection.query('update staff set name= ?, image= ?, secondry_image= ?, created_at=? where service_id=?'
        , [name, image, secondry_image, created_at, service_id], (error, rows, fields) => {
            if (!error) {
                res.json({ status: 'updated' });
            } else {
                console.log(error);
            }
        });
});

FreelancerRouter.post('/delete', (req, res) => {
    const { freelancer_id } = req.body;
    console.log(req.body);
    mysqlconnection.query('delete from freelancers where freelancer_id=?'
        , [freelancer_id], (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                res.json({ status: error });
            }
        });
});

module.exports = FreelancerRouter;