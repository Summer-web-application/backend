require('dotenv').config();
const jwt = require('jsonwebtoken');

function jwtAuth (req,res, next) {
    //jwt token in cookie that gets passed in every HTTP request
    const token = req.cookies.token;
    if(!token) {
        return res.status(401).json({error:'Please log in to access all features.'});
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET_KEY);
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid credentials' });
    }
}

module.exports={ jwtAuth }