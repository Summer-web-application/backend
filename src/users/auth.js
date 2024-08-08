require('dotenv').config();
const jwt = require('jsonwebtoken');

function jwtAuth (req,res, next) {
    console.log('auth called');
    const token = req.cookies.token;
    console.log(token, " token");
    if(!token) {
        return res.status(401).json({message:'Auth required'});
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET_KEY);
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid credentials' });
    }
}

module.exports={ jwtAuth }