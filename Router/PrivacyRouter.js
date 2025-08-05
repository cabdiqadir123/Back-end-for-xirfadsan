const { Router } = require('express')

const PrivacyRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

PrivacyRouter.get('/', (req, res) => {
    res.status(200).json('server on port 9000 and database is connected');
});

PrivacyRouter.get('/all', (req, res) => {
    mysqlconnection.query('select * from privacy',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
            }
        });
});

PrivacyRouter.post('/add', (req, res) => {
    const { privacy_policy } = req.body;
    console.log(req.body);
    mysqlconnection.query(
        'insert into privacy(privacy_policy) values(?);',
        [privacy_policy], (error, rows, fields) => {
            if (!error) {
                res.json({ status: 'inserted' });
            } else {
                console.log(error);
            }
        });
});

PrivacyRouter.put('/update', (req, res) => {
    const { privacy_policy } = req.body;
    mysqlconnection.query('update privacy set privacy_policy=?'
        , [privacy_policy], (error, rows, fields) => {
            if (!error) {
                res.json({ status: 'updated' });
            } else {
                console.log(error);
            }
        });
});

PrivacyRouter.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    console.log(req.body);
    mysqlconnection.query('delete from privacy where id=?'
        , [id], (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                res.json({ status: error });
            }
        });
});

module.exports = PrivacyRouter;