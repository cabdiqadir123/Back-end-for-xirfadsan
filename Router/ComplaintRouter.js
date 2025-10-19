const { Router } = require('express')

const ComplaintRouter = Router();

const mysqlconnection = require('../dstsbase/database.js');

ComplaintRouter.get('/', (req, res) => {
  res.status(200).json('server on port 9000 and database is connected');
});

ComplaintRouter.get('/all', (req, res) => {
  mysqlconnection.query('select complaint_id,user_id,name,phone,complaint,book_id,subject,complaint.created_at,issue,comment from users inner join complaint on complaint.user_id=users.id',
    (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        console.log(error);
      }
    });
});

ComplaintRouter.post('/add', (req, res) => {
  const { user_id, subject, complaint, book_id, issue, comment, created_at } = req.body;
  console.log(req.body);
  mysqlconnection.query('insert into complaint(user_id,subject,complaint,book_id,issue,comment,created_at) values(?,?,?,?,?,?,?);',
    [user_id, subject, complaint, book_id, issue, comment, created_at], (error, rows, fields) => {
      if (!error) {
        res.json({ status: 'inserted' });
      } else {
        console.log(error);
      }
    });
});

ComplaintRouter.put('/update/:id', (req, res) => {
  const id = req.params.id;
  const { issue, comment } = req.body;

  const query = `
    UPDATE complaint 
    SET issue = ?, comment = ? 
    WHERE complaint_id = ?;
  `;

  mysqlconnection.query(query, [issue, comment, id], (error, result) => {
    if (error) {
      console.error('Error updating complaint:', error);
      return res.status(500).json({
        error: 'Failed to update complaint',
        details:  error.message,
        body: req.body
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    res.status(200).json({
      message: 'Complaint updated successfully',
      id: id,
      updated_fields: { issue, comment },
      body: req.body
    });
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

ComplaintRouter.post('/delete_all/:id', (req, res) => {
  const id = req.params.id;
  mysqlconnection.query('delete from complaint where user_id=?'
    , [id], (error, rows, fields) => {
      if (!error) {
        res.json(rows);
      } else {
        res.json({ status: error });
      }
    });
});

module.exports = ComplaintRouter;