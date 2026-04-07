const { Router } = require('express')

const MaintenanceRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

MaintenanceRouter.get('/', (req, res) => {
  res.status(200).json('server on port 9000 and database is connected');
});

MaintenanceRouter.get('/all', (req, res) => {

  const query = `
    SELECT 
      m.id,
      m.category,
      m.title,
      m.description,
      m.status,
      m.urgency_level,
      m.repair_time,
      m.created_at,

      -- Tenant
      t.id AS tenant_id,
      t.full_name AS tenant_name,
      t.phone AS tenant_phone,
      t.address AS tenant_address,

      -- Property
      p.id AS property_id,
      p.name AS property_name,
      p.address AS property_address,

      -- Owner
      o.id AS owner_id,
      o.full_name AS owner_name,
      o.phone AS owner_phone

    FROM maintenance m

    LEFT JOIN users t ON m.tenant_id = t.id
    LEFT JOIN properties p ON m.property_id = p.id
    LEFT JOIN users o ON p.owner_id = o.id
  `;

  mysqlconnection.query(query, (error, rows) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
      res.status(500).json({ error: "Database error" });
    }
  });

});

MaintenanceRouter.post('/add', (req, res) => {
  const { tenant_id, property_id, category, title, description, status, urgency_level,repair_time, created_at } = req.body;
  console.log(req.body);
  mysqlconnection.query('insert into maintenance(tenant_id , property_id , category ,title,description, status   ,urgency_level ,repair_time, created_at) values(?,?,?,?,?,?,?,?,?);',
    [tenant_id, property_id, category, title, description, status, urgency_level,repair_time, created_at], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'inserted' });
      } else {
        console.log(error);
      }
    });
});

MaintenanceRouter.put('/update/:id', (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  const query = `
    UPDATE maintenance 
    SET status = ?
    WHERE id = ?;
  `;

  mysqlconnection.query(query, [status,  id], (error, result) => {
    if (error) {
      console.error('Error updating maintenance:', error);
      return res.status(500).json({
        error: 'Failed to update maintenance',
        details: error.message,
        body: req.body
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'maintenance not found' });
    }

    res.status(200).json({
      message: 'maintenance updated successfully',
      id: id
    });
  });
});

MaintenanceRouter.post('/delete:id', (req, res) => {
  const id = req.params.id;
  mysqlconnection.query('delete from maintenance where id=?'
    , [id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        res.json({ status: error });
      }
    });
});

MaintenanceRouter.post('/delete_all/:id', (req, res) => {
  const id = req.params.id;
  mysqlconnection.query('delete from maintenance where tenant_id =?'
    , [id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        res.json({ status: error });
      }
    });
});

module.exports = MaintenanceRouter;