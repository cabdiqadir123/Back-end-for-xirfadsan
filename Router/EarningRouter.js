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
    query( 'SELECT earnings.id, earnings.user_id, users.name AS customer_name,earnings.booking_id,book_id,bookings.service_id,services.name AS service_name,bookings.booking_status, bookings.amount, bookings.staff_id, earnings.amount, earnings.status, earnings.created_at, staff_user.name as staff_name FROM earnings INNER JOIN users ON earnings.user_id = users.id INNER JOIN bookings ON bookings.book_id = earnings.booking_id INNER JOIN staff ON bookings.staff_id = staff.staff_id INNER JOIN users AS staff_user ON staff.user_id = staff_user.id INNER JOIN services ON services.service_id  = bookings.service_id', (error, rows, fields) => {
        if (!error) {
            res.json(rows);
        } else {
            console.log(error);
        }
    });
});

EarningRouter.get('/all_by_app', (req, res) => {
    mysqlconnection.
    query( 'select * from earnings', (error, rows, fields) => {
        if (!error) {
            res.json(rows);
        } else {
            console.log(error);
        }
    });
});

EarningRouter.get('/earningstaff', (req, res) => {
    mysqlconnection.query('select earnings.id,earnings.user_id,users.name,booking_id,earnings.amount,staff_id,earnings.status,earnings.created_at,booking_status from earnings inner join users on earnings.user_id=users.id inner join bookings on bookings.book_id=earnings.booking_id', (error, rows, fields) => {
        if (!error) {
            res.json(rows);
        } else {
            console.log(error);
        }
    });
});

EarningRouter.post('/add', (req, res) => {
    const { user_id, booking_id , amount,status,created_at} = req.body;
    console.log(req.body);
    mysqlconnection.query(
        'insert into earnings(user_id,booking_id,amount,status,created_at) values(?,?,?,?,?);',
        [user_id, booking_id,amount,status,created_at ], (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                res.json({ status: error });
            }
        });
});

EarningRouter.put('/update/:id', (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "status is required" });
  }

  const query = `
    UPDATE earnings
    SET status = ?
    WHERE id = ?;
  `;

  mysqlconnection.query(query, [status, id], (error, result) => {
    if (error) {
      console.error("Error updating booking status:", error);
      return res.status(500).json({ error: "Failed to update earning status", details: error });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "earning not found" });
    }

    res.status(200).json({
      message: "earning status updated successfully",
      id: id,
      new_status: status
    });
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