const { Router } = require('express')

const FavourRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

FavourRouter.get('/', (req, res) => {
  res.status(200).json('server on port 9000 and database is connected');
});

FavourRouter.get('/all', (req, res) => {
  mysqlconnection.query('select id,favourite.sub_service_id,user_id,sub_service,rating_service,num_of_rating,service_id,price,description,favourite.created_at from favourite INNER JOIN sub_services on favourite.sub_service_id=sub_services.sub_service_id', (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

FavourRouter.post('/add', (req, res) => {
  const { sub_service_id ,user_id } = req.body;
  console.log(req.body);
  mysqlconnection.query('insert into favourite(sub_service_id ,user_id) values(?,?);',
    [sub_service_id ,user_id], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'inserted' });
      } else {
        console.log(error);
      }
    });
});

FavourRouter.put('/update', (req, res) => {
  const { name,ismultiple,unit_id } = req.body;
  console.log(req.body);
  mysqlconnection.query('update favourite set sub_service_id= ?, user_id= ? where id=?'
    , [name,ismultiple, unit_id], (error, rows, fields) => {
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

module.exports = FavourRouter;