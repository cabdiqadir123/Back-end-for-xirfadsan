const mysql = require('mysql2');
// require('dotenv').config();

const mysqlconnection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT
    // host: 'localhost',
    // user: 'root',
    // password: '',
    // database: 'servicemanagementsystem'
});

mysqlconnection.connect(function (error){
    if(error){
        console.log(error);
    } else{
        console.log('Database is connected');
    }
});

module.exports= mysqlconnection;