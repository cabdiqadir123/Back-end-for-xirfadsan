const { Router } = require('express')
const path = require('path');
const multer = require('multer');

const EarningRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

EarningRouter.get('/', (req, res) => {
    res.status(200).json('server on port 9000 and database is connected');
});

EarningRouter.get('/all', (req, res) => {
    mysqlconnection.
    query( 'SELECT earnings.id, earnings.user_id, users.name AS customer_name, earnings.booking_id,book_id, bookings.booking_status, bookings.amount, bookings.staff_id, earnings.amount, earnings.status, earnings.created_at, staff_user.name as staff_name FROM earnings INNER JOIN users ON earnings.user_id = users.id INNER JOIN bookings ON bookings.id = earnings.booking_id INNER JOIN staff ON bookings.staff_id = staff.staff_id INNER JOIN users AS staff_user ON staff.user_id = staff_user.id', (error, rows, fields) => {
        if (!error) {
            res.json(rows);
        } else {
            console.log(error);
        }
    });
});

EarningRouter.get('/earningstaff', (req, res) => {
    mysqlconnection.query('select earnings.id,earnings.user_id,users.name,booking_id,earnings.amount,staff_id,earnings.status,earnings.created_at,booking_status from earnings inner join users on earnings.user_id=users.id inner join bookings on bookings.id=earnings.booking_id', (error, rows, fields) => {
        if (!error) {
            res.json(rows);
        } else {
            console.log(error);
        }
    });
});

BookingRouter.post('/add', (req, res) => {
    const { user_id, booking_id , amount,status} = req.body;
    console.log(req.body);
    mysqlconnection.query(
        'insert into earnings(user_id,booking_id,amount,status) values(?,?,?,?);',
        [user_id, booking_id,amount,status ], (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                res.json({ status: error });
            }
        });
});

EarningRouter.post('/add', (req, res) => {
    const { user_id, booking_id , amount,status} = req.body;
    console.log(req.body);
    mysqlconnection.query(
        'insert into earnings(user_id,booking_id,amount,status) values(?,?,?,?);',
        [user_id, booking_id,amount,status ], (error, rows, fields) => {
            if (!error) {
                res.json({ status: 'inserted' });
            } else {
                console.log(error);
            }
        });
});

EarningRouter.put('/update', (req, res) => {
    const { name, image, secondry_image, created_at, service_id } = req.body;
    console.log(req.body);
    mysqlconnection.query('update sub_services set sub_service= ?, service_id= ?, image= ?, created_at=? where sub_service_id=?'
        , [name, image, secondry_image, created_at, service_id], (error, rows, fields) => {
            if (!error) {
                res.json({ status: 'updated' });
            } else {
                console.log(error);
            }
        });
});

EarningRouter.post('/delete', (req, res) => {
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

module.exports = EarningRouter;