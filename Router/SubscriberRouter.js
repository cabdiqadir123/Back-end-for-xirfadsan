const { Router } = require('express')

const SubscriberRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

SubscriberRouter.get('/', (req, res) => {
    res.status(200).json('server on port 9000 and database is connected');
});

SubscriberRouter.get('/all', (req, res) => {
    mysqlconnection.query('select * from subscribers',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
            }
        });
});

SubscriberRouter.post('/add', (req, res) => {
    const { email } = req.body;
    console.log(req.body);
    mysqlconnection.query(
        'insert into subscribers(email) values(?);',
        [email], (error, rows, fields) => {
            if (!error) {
                res.json({ status: 'inserted' });
            } else {
                console.log(error);
            }
        });
});

SubscriberRouter.put('/update', (req, res) => {
    const { email } = req.body;
    mysqlconnection.query('update subscribers set email=?'
        , [email ], (error, rows, fields) => {
            if (!error) {
                res.json({ status: 'updated' });
            } else {
                console.log(error);
            }
        });
});

SubscriberRouter.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    mysqlconnection.query('delete from subscribers where id=?'
        , [id], (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                res.json({ status: error });
            }
        });
});

module.exports = SubscriberRouter;