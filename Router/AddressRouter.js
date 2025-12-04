const { Router } = require('express')

const AddressRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

AddressRouter.get('/', (req, res) => {
    res.status(200).json('server on port 9000 and database is connected');
});

AddressRouter.get('/all', (req, res) => {
    mysqlconnection.query('select * from address',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
            }
        });
});

module.exports = AddressRouter;