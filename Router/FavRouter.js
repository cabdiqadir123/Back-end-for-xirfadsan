const { Router } = require('express')

const FavourRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

FavourRouter.get('/', (req, res) => {
  res.status(200).json('server on port 9000 and database is connected');
});

FavourRouter.get('/all', (req, res) => {

  const query = `
    SELECT 
      f.id,
      f.property_id,
      f.user_id,
      p.name,
      p.address,
      p.rent,
      p.description,
      f.created_at

    FROM favourite f
    INNER JOIN properties p ON f.property_id = p.id
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

FavourRouter.post('/add', (req, res) => {
  const { property_id, user_id, created_at } = req.body;
  console.log(req.body);

  mysqlconnection.query(
    'INSERT INTO favourite(property_id , user_id,created_at) VALUES (?, ?,?);',
    [property_id, user_id, created_at],
    (error, results, fields) => {
      if (!error) {
        // return the inserted ID
        res.json({ status: 'inserted', id: results.insertId });
      } else {
        console.log(error);
        res.status(500).json({ status: 'error', error });
      }
    }
  );
});

FavourRouter.put('/update', (req, res) => {
  const { name, ismultiple, unit_id } = req.body;
  console.log(req.body);
  mysqlconnection.query('update favourite set property_id= ?, user_id= ? where id=?'
    , [name, ismultiple, unit_id], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'updated' });
      } else {
        console.log(error);
      }
    });
});

FavourRouter.post('/delete:id', (req, res) => {
  const id = req.params.id;
  mysqlconnection.query('delete from favourite where id=?'
    , [id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        res.json({ status: error });
      }
    });
});

FavourRouter.post('/delete_all/:id', (req, res) => {
  const id = req.params.id;
  mysqlconnection.query('delete from favourite where id=?'
    , [id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        res.json({ status: error });
      }
    });
});

module.exports = FavourRouter;