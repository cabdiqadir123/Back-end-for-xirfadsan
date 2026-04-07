const { Router } = require('express')

const RentedRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

RentedRouter.get('/', (req, res) => {
  res.status(200).json('server on port 9000 and database is connected');
});

RentedRouter.get('/all', (req, res) => {

  const query = `
    SELECT 
      r.id,
      r.move_in_date,
      r.lease,
      r.period,
      r.created_at,
      r.rentStatus,

      -- tenant
      t.id AS tenant_id,
      t.full_name AS tenant_name,
      t.email AS tenant_email,
      t.phone AS tenant_phone,

      -- property
      p.id AS property_id,
      p.name AS property_name,
      p.property_type,
      p.address AS property_address,
      p.rent,
      p.floor_number,
      p.rooms,
      p.isMasterRoom,
      p.bedroom,
      p.living_rooms,
      p.bathrooms,
      p.size,
      p.parking_available,

      -- owner
      o.id AS owner_id,
      o.full_name AS owner_name,
      o.email AS owner_email,
      o.phone AS owner_phone,

      -- last payment
      MAX(pay.created_at) AS last_payment,

      -- next due date
      DATE_ADD(
          COALESCE(MAX(pay.created_at), r.move_in_date),
          INTERVAL 1 MONTH
      ) AS next_due_date,

      -- automatic status
      CASE
          WHEN DATE_ADD(COALESCE(MAX(pay.created_at), r.move_in_date), INTERVAL 1 MONTH) < CURDATE()
              THEN 'overdue'

          WHEN DATEDIFF(
              DATE_ADD(COALESCE(MAX(pay.created_at), r.move_in_date), INTERVAL 1 MONTH),
              CURDATE()
          ) <= 5
              THEN 'dueSoon'

          ELSE 'paid'
      END AS rent_status,
      -- lease expiry date
DATE_ADD(r.move_in_date, INTERVAL r.period MONTH) AS lease_expiry_date,

-- lease status
CASE
    WHEN DATE_ADD(r.move_in_date, INTERVAL r.period MONTH) < CURDATE()
        THEN 'expired'

    WHEN DATEDIFF(
        DATE_ADD(r.move_in_date, INTERVAL r.period MONTH),
        CURDATE()
    ) <= 5
        THEN 'expiringSoon'

    ELSE 'active'
END AS lease_status

  FROM rented r

  LEFT JOIN payment pay ON pay.rent_id = r.id
  LEFT JOIN users t ON r.tenant_id = t.id
  LEFT JOIN properties p ON r.property_id = p.id
  LEFT JOIN users o ON p.owner_id = o.id

  GROUP BY r.id;
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

RentedRouter.get("/all/:id", (req, res) => {
  const id = req.params.id;
  const query = `
    SELECT 
        r.id,
        r.move_in_date,
        r.lease,
        r.period,
        r.rentStatus,
        r.created_at,

        -- Tenant
        t.id AS tenant_id,
        t.full_name AS tenant_name,
        t.phone AS tenant_phone,

        -- Property
        p.id AS property_id,
        p.name AS property_name,
        p.address AS property_address,
        p.rent,

        -- Owner
        o.id AS owner_id,
        o.full_name AS owner_name,
        o.phone AS owner_phone

    FROM rented r

    LEFT JOIN users t ON r.tenant_id = t.id
    LEFT JOIN properties p ON r.property_id = p.id
    LEFT JOIN users o ON p.owner_id = o.id
    
    where r.tenant_id=?;
  `;

  mysqlconnection.query(query, [id], (error, rows) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
      res.status(500).json({ error: "Database query failed" });
    }
  });

});

RentedRouter.post('/add', (req, res) => {
  const {
    tenant_id,
    property_id,
    move_in_date,
    lease,
    period,
    rentStatus,
    created_at
  } = req.body;

  console.log(req.body);

  const query = `
    INSERT INTO rented
    (tenant_id, property_id, move_in_date, lease, period, rentStatus, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  mysqlconnection.query(
    query,
    [tenant_id, property_id, move_in_date, lease, period, rentStatus, created_at],
    (error, results) => {
      if (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to insert booking" });
      }

      // ✅ Get inserted ID
      const insertedId = results.insertId;

      res.status(200).json({
        message: "Booking created successfully",
        rented_id: insertedId
      });
    }
  );
});

// for new update
RentedRouter.post('/addNew', (req, res) => {
  const {
    tenant_id,
    property_id,
    move_in_date,
    lease,
    period,
    rentStatus,
    created_at
  } = req.body;

  console.log(req.body);

  const query = `
    INSERT INTO rented
    (tenant_id, property_id, move_in_date, lease, period, rentStatus, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  mysqlconnection.query(
    query,
    [tenant_id, property_id, move_in_date, lease, period, rentStatus, created_at],
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



RentedRouter.put('/updatestatus/:id', (req, res) => {
  const id = req.params.id;
  const { rentStatus } = req.body;

  if (!rentStatus) {
    return res.status(400).json({ error: "status is required" });
  }

  const query = `
    UPDATE rented
    SET rentStatus = ?
    WHERE id = ?;
  `;

  mysqlconnection.query(query, [rentStatus, id], (error, result) => {
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

RentedRouter.put('/updatelease /:id', (req, res) => {
  const id = req.params.id;
  const { lease } = req.body;
  console.log(req.body);
  mysqlconnection.query('update rented set lease=? where id=?'
    , [lease, id], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'updated' });
      } else {
        console.log(error);
      }
    });
});

// 

RentedRouter.post('/delete', (req, res) => {
  const { supplier_id } = req.body;
  console.log(req.body);
  mysqlconnection.query('delete from rented where id=?'
    , [supplier_id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        res.json({ status: error });
      }
    });
});

module.exports = RentedRouter;