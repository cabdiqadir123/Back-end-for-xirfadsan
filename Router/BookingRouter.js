const { Router } = require('express')

const BookingRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

BookingRouter.get('/', (req, res) => {
  res.status(200).json('server on port 9000 and database is connected');
});

BookingRouter.get('/all', (req, res) => {
  mysqlconnection.query('select bookings.id,book_id,customer_id,bookings.service_id,services.name,users.name AS customer_name,users.email,users.phone,booking_status,bookings.created_at,Avialable_time,discription,bookings.address,startdate,bookings.staff_id,staff.user_id AS staff_user_id,staff_user.name as staff_name,staff_user.phone AS staff_phone,price_amount,amount,per from users inner join bookings on bookings.customer_id=users.id inner join services on bookings.service_id=services.service_id INNER JOIN staff ON bookings.staff_id = staff.staff_id INNER JOIN users AS staff_user ON staff.user_id = staff_user.id',
    (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        console.log(error);
      }
    });
});

BookingRouter.get('/all_booking_sub_services', (req, res) => {
  mysqlconnection.query("select id,book_id,booking_sub_services.sub_service_id,sub_service,item,price from sub_services inner join booking_sub_services  on booking_sub_services .sub_service_id=sub_services.sub_service_id",
    (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        console.log(error);
      }
    });
});

BookingRouter.get('/all_booking_sub_services/:id', (req, res) => {
  const id = req.params.id;
  mysqlconnection.query("select id,book_id,booking_sub_services.sub_service_id,sub_service,item,price from sub_services inner join booking_sub_services  on booking_sub_services .sub_service_id=sub_services.sub_service_id where book_id=?",
    [id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        console.log(error);
      }
    });
});

BookingRouter.get('/pending/all', (req, res) => {
  mysqlconnection.query('select * from bookings where booking_status="Pending"', (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

BookingRouter.get('/process/all', (req, res) => {
  mysqlconnection.query('select * from bookings where booking_status="Process"', (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

BookingRouter.get('/finished/all', (req, res) => {
  mysqlconnection.query('select * from bookings where booking_status="Finished"', (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

BookingRouter.get('/cancelled/all', (req, res) => {
  mysqlconnection.query('select * from bookings where booking_status="Cancelled"', (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

BookingRouter.post('/add', (req, res) => {
  const {
    book_id,
    customer_id,
    service_id,
    address,
    booking_status,
    price_amount,
    amount,
    per,
    staff_id,
    Avialable_time,
    discription,
    startdate,created_at
  } = req.body;

  console.log(req.body);

  mysqlconnection.query(
    'INSERT INTO bookings(book_id,customer_id,service_id,address,booking_status,price_amount,amount,per,staff_id,Avialable_time,discription,startdate,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?);',
    [book_id, customer_id, service_id, address, booking_status, price_amount, amount, per, staff_id, Avialable_time, discription, startdate,created_at],
    (error, results) => {
      if (!error) {
        // ✅ Return the inserted book_id in the response
        res.json({ book_id: book_id });
      } else {
        console.log(error);
        res.status(500).json({ error: 'Failed to insert booking' });
      }
    }
  );
});

BookingRouter.post('/add_booking_subservices', (req, res) => {
  const { book_id, sub_service_id, item } = req.body;

  const sql = `INSERT INTO booking_sub_services (book_id, sub_service_id, item) VALUES (?, ?, ? )`;

  mysqlconnection.query(
    sql,
    [book_id, sub_service_id, item],
    (error) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ status: "error", error: error.message });
      }
      res.json({ status: "inserted" });
    }
  );
});

BookingRouter.put('/update', (req, res) => {
  const { name, image, secondry_image, created_at, service_id } = req.body;
  console.log(req.body);
  mysqlconnection.query('update services set name= ?, image= ?, secondry_image= ?, created_at=? where service_id=?'
    , [name, image, secondry_image, created_at, service_id], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'updated' });
      } else {
        console.log(error);
      }
    });
});

BookingRouter.put('/updatestatus/:id', (req, res) => {
  const id = req.params.id;
  const { booking_status } = req.body;
  console.log(req.body);
  mysqlconnection.query('update bookings set booking_status= ? where id=?'
    , [booking_status, id], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'updated' });
      } else {
        console.log(error);
      }
    });
});

BookingRouter.put('/updateamount/:id', (req, res) => {
  const id = req.params.id;
  const { price_amount,amount } = req.body;
  console.log(req.body);
  mysqlconnection.query('update bookings set price_amount=?,amount=? where id=?'
    , [price_amount,amount, id], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'updated' });
      } else {
        console.log(error);
      }
    });
});

BookingRouter.post('/delete', (req, res) => {
  const { supplier_id } = req.body;
  console.log(req.body);
  mysqlconnection.query('delete from bookings where id=?'
    , [supplier_id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        res.json({ status: error });
      }
    });
});


BookingRouter.post('/delete_all/:id', (req, res) => {
  const id = req.params.id;

  const sql = `
    DELETE FROM bookings 
    WHERE customer_id = ? 
      AND booking_status IN ('Cancelled', 'Pending')
  `;

  mysqlconnection.query(sql, [id], (error, rows, fields) => {
    if (!error) {
      res.json({ message: 'Deleted successfully', affectedRows: rows.affectedRows });
    } else {
      res.json({ status: error });
    }
  });
});

module.exports = BookingRouter;