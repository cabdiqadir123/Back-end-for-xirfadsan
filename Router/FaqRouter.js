const { Router } = require('express')

const FaqRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

FaqRouter.get('/', (req, res) => {
    res.status(200).json('server on port 9000 and database is connected');
});

FaqRouter.get('/all', (req, res) => {
    mysqlconnection.query('select * from faq',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
            }
        });
});

FaqRouter.post('/add', (req, res) => {
    const { question, answer } = req.body;
    console.log(req.body);
    mysqlconnection.query(
        'insert into faq(question,answer) values(?,?);',
        [question, answer], (error, rows, fields) => {
            if (!error) {
                res.json({ status: 'inserted' });
            } else {
                console.log(error);
            }
        });
});

FaqRouter.put('/update/:id', (req, res) => {
    const id = req.params.id;
    const { question, answer } = req.body;
    mysqlconnection.query('update faq set question=?, answer=? where faq_id=?'
        , [question, answer, id], (error, rows, fields) => {
            if (!error) {
                res.json({ status: 'updated' });
            } else {
                console.log(error);
            }
        });
});

FaqRouter.post('/delete', (req, res) => {
    const { faq_id } = req.body;
    console.log(req.body);
    mysqlconnection.query('delete from faq where faq_id=?'
        , [faq_id], (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                res.json({ status: error });
            }
        });
});

module.exports = FaqRouter;