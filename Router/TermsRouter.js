const { Router } = require('express')

const TermsRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

TermsRouter.get('/', (req, res) => {
    res.status(200).json('server on port 9000 and database is connected');
});

TermsRouter.get('/all', (req, res) => {
    mysqlconnection.query('select * from terms',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
            }
        });
});

TermsRouter.post('/add', (req, res) => {
    const { term } = req.body;
    console.log(req.body);
    mysqlconnection.query(
        'insert into terms(term) values(?);',
        [term], (error, rows, fields) => {
            if (!error) {
                res.json({ status: 'inserted' });
            } else {
                console.log(error);
            }
        });
});

TermsRouter.put('/update', (req, res) => {
    const { term } = req.body;
    mysqlconnection.query('update terms set term=?'
        , [term], (error, rows, fields) => {
            if (!error) {
                res.json({ status: 'updated' });
            } else {
                console.log(error);
            }
        });
});

TermsRouter.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    mysqlconnection.query('delete from terms where id=?'
        , [id], (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                res.json({ status: error });
            }
        });
});

module.exports = TermsRouter;