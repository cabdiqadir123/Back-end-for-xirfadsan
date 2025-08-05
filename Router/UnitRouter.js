const { Router } = require('express')

const UnitRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

UnitRouter.get('/', (req, res) => {
  res.status(200).json('server on port 9000 and database is connected');
});

UnitRouter.get('/all', (req, res) => {
  mysqlconnection.query('select * from units', (error, rows, fields) => {
    if (!error) {
      res.json(rows);
    } else {
      console.log(error);
    }
  });
});

UnitRouter.post('/add', (req, res) => {
  const { name,ismultiple } = req.body;
  console.log(req.body);
  mysqlconnection.query('insert into units(name,ismultiple) values(?,?);',
    [name,ismultiple], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'inserted' });
      } else {
        console.log(error);
      }
    });
});

UnitRouter.put('/update', (req, res) => {
  const { name,ismultiple,unit_id } = req.body;
  console.log(req.body);
  mysqlconnection.query('update units set name= ?, ismultiple= ? where unit_id=?'
    , [name,ismultiple, unit_id], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'updated' });
      } else {
        console.log(error);
      }
    });
});

UnitRouter.post('/delete', (req, res) => {
  const { unit_id } = req.body;
  console.log(req.body);
  mysqlconnection.query('delete from units where unit_id=?'
    , [unit_id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        res.json({ status: error });
      }
    });
});

module.exports = UnitRouter;