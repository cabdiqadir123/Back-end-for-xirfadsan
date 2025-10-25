const { Router } = require('express')

const RatingRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

RatingRouter.get('/', (req, res) => {
  res.status(200).json('server on port 9000 and database is connected');
});

RatingRouter.get('/all', (req, res) => {
  mysqlconnection.query('SELECT review.id,user_id,staff_id,book_id,customer.name AS customer_name,staff.name AS staff_name,comment,rating,num_rating,cus_rating,num_cus_rating,review.created_at FROM review INNER JOIN users customer ON customer.id = review.user_id INNER JOIN users staff ON staff.id = review.staff_id;', (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

RatingRouter.post('/add', (req, res) => {
  const { user_id,staff_id,comment,rating,num_rating,cus_rating,num_cus_rating,book_id,created_at } = req.body;
  console.log(req.body);
  mysqlconnection.query('insert into review(user_id,staff_id,comment,rating,num_rating,cus_rating,num_cus_rating,book_id,created_at) values(?,?,?,?,?,?,?,?,?);',
    [user_id,staff_id,comment,rating,num_rating,cus_rating,num_cus_rating,book_id,created_at], (error, rows, fields) => {
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

RatingRouter.post('/delete_all/:id', (req, res) => {
  const id = req.params.id;
  mysqlconnection.query('delete from review where user_id=?'
    , [id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        res.json({ status: error });
      }
    });
});

module.exports = RatingRouter;