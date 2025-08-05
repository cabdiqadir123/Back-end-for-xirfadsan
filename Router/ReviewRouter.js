const { Router } = require('express')

const RatingRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

RatingRouter.get('/', (req, res) => {
  res.status(200).json('server on port 9000 and database is connected');
});

RatingRouter.get('/all', (req, res) => {
  mysqlconnection.query('select review.id,review.sub_service_id,user_id,name,comment,rating,sub_service,service_id,price,review.created_at from users inner join review on review.user_id=users.id INNER JOIN sub_services on review.sub_service_id=sub_services.sub_service_id', (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

RatingRouter.post('/add', (req, res) => {
  const { sub_service_id ,user_id,comment,rating } = req.body;
  console.log(req.body);
  mysqlconnection.query('insert into review(sub_service_id ,user_id,comment,rating) values(?,?,?,?);',
    [sub_service_id ,user_id,comment,rating], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'inserted' });
      } else {
        console.log(error);
      }
    });
});

RatingRouter.put('/updatereview/:id', (req, res) => {
  const id = req.params.id;
  const { rating , comment } = req.body;
  console.log(req.body);
  mysqlconnection.query('update review set rating=?,comment=? where id=?'
    , [rating,comment,id], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'updated' });
      } else {
        console.log(error);
      }
    });
});

RatingRouter.post('/delete:id', (req, res) => {
  const id = req.params.id;
  mysqlconnection.query('delete from review where id=?'
    , [id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        res.json({ status: error });
      }
    });
});

module.exports = RatingRouter;