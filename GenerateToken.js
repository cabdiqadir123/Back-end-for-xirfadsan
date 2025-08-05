const JWT = require('jsonwebtoken');

const generateToken=(id )=>{
    return JWT.sign({id},"group72")
}
module.exports = generateToken;
