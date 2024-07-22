require('dotenv').config();
const jwt = require('jsonwebtoken');

function JwtAuth (req,res) {
    const token = req.cookies.token;
    try {
        const user = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = user;
    } catch (err) {
        res.clearCookie("token");
        console.log("cookie error");
    }
}

module.exports={ JwtAuth }