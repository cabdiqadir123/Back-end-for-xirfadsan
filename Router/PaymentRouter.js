const { Router } = require('express')

const PaymentRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

PaymentRouter.get('/', (req, res) => {
  res.status(200).json('server on port 9000 and database is connected');
});

PaymentRouter.get('/all', (req, res) => {
  const query = `
    SELECT 
      p.*,
      r.property_id,
      pr.owner_id,
      pr.name,
      u.full_name as tenant_name
    FROM payment p
    JOIN rented r ON p.rent_id = r.id
    JOIN properties pr ON r.property_id = pr.id
    JOIN users u ON r.tenant_id = u.id
  `;

  mysqlconnection.query(query, (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
      res.status(500).json(error);
    }
  });
});

PaymentRouter.get('/by-rent/:id', (req, res) => {
  const { id } = req.params;
  mysqlconnection.
    query('select * from payment where rent_id=?', [id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        console.log(error);
      }
    });
});

PaymentRouter.post('/add', (req, res) => {
  const { tenant_id, rent_id, type, amount, method, created_at } = req.body;
  console.log(req.body);
  mysqlconnection.query('insert into payment (tenant_id,rent_id,type, amount ,method  , created_at) values(?,?,?,?,?,?);',
    [tenant_id, rent_id, type, amount, method, created_at], (error, rows, fields) => {
      if (!error) {
        const insertedId = rows.insertId;

        res.status(200).json({
          message: "payment created successfully",
          payment_id: insertedId
        });
      } else {
        console.log(error);
      }
    });
});

PaymentRouter.put('/update/:id', (req, res) => {
  const id = req.params.id;
  const { method } = req.body;

  const query = `
    UPDATE payment  
    SET  method = ?
    WHERE id = ?;
  `;

  mysqlconnection.query(query, [method, id], (error, result) => {
    if (error) {
      console.error('Error updating payment:', error);
      return res.status(500).json({
        error: 'Failed to update payment',
        details: error.message,
        body: req.body
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'payment not found' });
    }

    res.status(200).json({
      message: 'payment updated successfully',
      id: id,
      updated_fields: { issue, comment },
      body: req.body
    });
  });
});

PaymentRouter.post('/delete:id', (req, res) => {
  const id = req.params.id;
  mysqlconnection.query('delete from payment where id=?'
    , [id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        res.json({ status: error });
      }
    });
});

PaymentRouter.post('/delete_all/:id', (req, res) => {
  const id = req.params.id;
  mysqlconnection.query('delete from payment where rent_id  =?'
    , [id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        res.json({ status: error });
      }
    });
});

module.exports = PaymentRouter;