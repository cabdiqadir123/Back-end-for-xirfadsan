const { Router } = require('express')

const FavourRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

FavourRouter.get('/', (req, res) => {
  res.status(200).json('server on port 9000 and database is connected');
});

FavourRouter.get('/all', (req, res) => {
  mysqlconnection.query('select id,favourite.sub_service_id,user_id,sub_service,service_id,price,description,favourite.created_at from favourite INNER JOIN sub_services on favourite.sub_service_id=sub_services.sub_service_id', (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

FavourRouter.post('/add', (req, res) => {
  const { sub_service_id, user_id } = req.body;
  console.log(req.body);

  mysqlconnection.query(
    'INSERT INTO favourite(sub_service_id, user_id) VALUES (?, ?);',
    [sub_service_id, user_id],
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
  mysqlconnection.query('update favourite set sub_service_id= ?, user_id= ? where id=?'
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
  mysqlconnection.query('delete from favourite where user_id=?'
    , [id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        res.json({ status: error });
      }
    });
});

module.exports = FavourRouter;