const { Router } = require('express')

const ComplaintRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

ComplaintRouter.get('/', (req, res) => {
    res.status(200).json('server on port 9000 and database is connected');
});

ComplaintRouter.get('/all', (req, res) => {
    mysqlconnection.query('select complaint_id,user_id,name,complaint,book_id,complaint.created_at,issue,comment from users inner join complaint on complaint.user_id=users.id',
        (error, rows, fields) => {
            if (!error) {
                res.json(rows);
            } else {
                console.log(error);
            }
        });
});

ComplaintRouter.post('/add', (req, res) => {
    const { user_id, complaint, book_id,issue} = req.body;
    console.log(req.body);
    mysqlconnection.query('insert into complaint(user_id,complaint,book_id,issue,comment) values(?,?,?,?);',
        [user_id, complaint,book_id,issue,issue], (error, rows, fields) => {
            if (!error) {
                res.json({ status: 'inserted' });
            } else {
                console.log(error);
            }
        });
});

ComplaintRouter.put('/update/:id', (req, res) => {
  const id = req.params.id;
  const { issue,comment } = req.body;
  console.log(req.body);
  mysqlconnection.query('update complaint set issue= ?, comment=? where complaint_id=?'
    , [issue,comment, id], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'updated' });
      } else {
        console.log(error);
      }
    });
});

ComplaintRouter.post('/delete:id', (req, res) => {
  const id = req.params.id;
  mysqlconnection.query('delete from complaint where complaint_id=?'
    , [id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        res.json({ status: error });
      }
    });
});

module.exports = ComplaintRouter;