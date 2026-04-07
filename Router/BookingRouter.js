const { Router } = require('express')

const BookingRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

BookingRouter.get('/', (req, res) => {
  res.status(200).json('server on port 9000 and database is connected');
});

BookingRouter.get('/all', (req, res) => {

  const query = `
  SELECT 
      b.id,
      b.move_in_date,
      b.duration,
      b.desciption,
      b.status,
      b.created_at,

      -- Tenant info
      tenant.id AS tenant_id,
      tenant.full_name AS tenant_name,
      tenant.phone AS tenant_phone,
      tenant.email AS tenant_email,
      tenant.region AS tenant_region,
      tenant.district AS tenant_district,

      -- Property info
      p.id AS property_id,
      p.name AS property_name,
      p.property_type,
      p.address,
      p.rent,
      p.deposit,

      -- Region & District
      r.name AS region_name,
      d.name AS district_name,

      -- Owner info
      owner.id AS owner_id,
      owner.full_name AS owner_name,
      owner.phone AS owner_phone,
      owner.email AS owner_email,
      owner.region AS owner_region,
      owner.district AS owner_district

  FROM bookings b

  INNER JOIN users tenant 
      ON b.tenant_id = tenant.id

  INNER JOIN properties p 
      ON b.property_id = p.id

  INNER JOIN users owner 
      ON p.owner_id = owner.id

  LEFT JOIN regions r 
      ON p.region_id = r.id

  LEFT JOIN districts d 
      ON p.district_id = d.id

  ORDER BY b.id DESC
  `;

  mysqlconnection.query(query, (error, rows) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
      res.status(500).json({ error: "Database query failed" });
    }
  });

});

BookingRouter.get("/all/:id", (req, res) => {
  const book_id = req.params.id;
  const query = `
  SELECT 
      b.id,
      b.move_in_date,
      b.duration,
      b.desciption,
      b.status,
      b.created_at,

      -- Tenant info
      tenant.id AS tenant_id,
      tenant.full_name AS tenant_name,
      tenant.phone AS tenant_phone,
      tenant.email AS tenant_email,
      tenant.region AS tenant_region,
      tenant.district AS tenant_district,

      -- Property info
      p.id AS property_id,
      p.name AS property_name,
      p.address,
      p.rent,
      p.deposit,

      -- Region & District
      r.name AS region_name,
      d.name AS district_name,

      -- Owner info
      owner.id AS owner_id,
      owner.full_name AS owner_name,
      owner.phone AS owner_phone,
      owner.email AS owner_email,
      owner.region AS owner_region,
      owner.district AS owner_district

  FROM bookings b

  INNER JOIN users tenant 
      ON b.tenant_id = tenant.id

  INNER JOIN properties p 
      ON b.property_id = p.id

  INNER JOIN users owner 
      ON p.owner_id = owner.id

  LEFT JOIN regions r 
      ON p.region_id = r.id

  LEFT JOIN districts d 
      ON p.district_id = d.id

    WHERE b.tenant_id = ?

  ORDER BY b.id DESC
  `;

  mysqlconnection.query(query,[book_id], (error, rows) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
      res.status(500).json({ error: "Database query failed" });
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
  mysqlconnection.query('select * from bookings where status="Pending"', (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

BookingRouter.get('/progress/all', (req, res) => {
  mysqlconnection.query('select * from bookings where status="in-progress"', (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

BookingRouter.get('/approved/all', (req, res) => {
  mysqlconnection.query('select * from bookings where status="approved"', (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

BookingRouter.get('/rejected/all', (req, res) => {
  mysqlconnection.query('select * from bookings where status="rejected"', (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

BookingRouter.post('/add', (req, res) => {
  const {
    tenant_id,
    property_id,
    move_in_date,
    duration,
    desciption,
    status,
    created_at
  } = req.body;

  console.log(req.body);

  const query = `
    INSERT INTO bookings
    (tenant_id, property_id, move_in_date, duration, desciption, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  mysqlconnection.query(
    query,
    [tenant_id, property_id, move_in_date, duration, desciption, status, created_at],
    (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to insert booking" });
      }

      // ✅ Get inserted ID
      const insertedId = results.insertId;

      res.status(200).json({
        message: "Booking created successfully",
        booking_id: insertedId
      });
    }
  );
});

// for new update
BookingRouter.post('/addNew', (req, res) => {
  const {
    tenant_id,
    property_id,
    move_in_date,
    duration,
    desciption,
    status,
    created_at
  } = req.body;

  console.log(req.body);

  const query = `
    INSERT INTO bookings
    (tenant_id, property_id, move_in_date, duration, desciption, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  mysqlconnection.query(
    query,
    [tenant_id, property_id, move_in_date, duration, desciption, status, created_at],
    (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to insert booking" });
      }

      // ✅ Get inserted ID
      const insertedId = results.insertId;

      res.status(200).json({
        message: "Booking created successfully",
        booking_id: insertedId
      });
    }
  );
});



BookingRouter.put('/updatestatus/:id', (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: "status is required" });
  }

  const query = `
    UPDATE bookings
    SET status = ?
    WHERE id = ?;
  `;

  mysqlconnection.query(query, [status, id], (error, result) => {
    if (error) {
      console.error("Error updating status:", error);
      return res.status(500).json({ error: "Failed to update status", details: error });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.status(200).json({
      message: "Booking status updated successfully",
      id: id,
      new_status: status
    });
  });
});

BookingRouter.put('/updateduration /:id', (req, res) => {
  const id = req.params.id;
  const { duration } = req.body;
  console.log(req.body);
  mysqlconnection.query('update bookings set duration=? where id=?'
    , [duration, id], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'updated' });
      } else {
        console.log(error);
      }
    });
});

// 
BookingRouter.put('/updateduration New/:id', (req, res) => {
  const id = req.params.id;
  const { duration } = req.body; // get price_amount too

  console.log(req.body);

  mysqlconnection.query(
    'UPDATE bookings SET  duration =? WHERE id=?',
    [duration, id], // pass 4 values in correct order
    (error, results) => {
      if (!error) {
        res.json({ status: 'updated', id }); // return id as requested
      } else {
        console.log(error);
        res.status(500).json({ status: 'error', error: error.message });
      }
    }
  );
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

module.exports = BookingRouter;