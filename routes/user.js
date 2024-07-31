const {Router} = require('express');
const userRouter = Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const executeQuery = require('../db');
require('dotenv').config();
//register
userRouter.post("/register", async (req,res) => {
    try {
        const emailSql = 'SELECT s FROM users s WHERE s.email = $1';
        const emailResult = await executeQuery(emailSql, [req.body.email]);

        if (emailResult.rows.length) {
            res.status(400).send("Email already exists.");
            return;
        }

        // Hash password
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(req.body.password, 10);
        } catch (hashError) {
            res.status(500).json({ error: "Error hashing password" });
            return;
        }

        const sql = 'INSERT INTO users (first_name, last_name, email, password, username) VALUES ($1, $2, $3, $4, $5) RETURNING id';
        const result = await executeQuery(sql, [req.body.first_name, req.body.last_name, req.body.email, hashedPassword, req.body.username]);

        res.status(200).json({ id: result.rows[0].id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
userRouter.post("/login", async (req,res) => {
    try {
        const sql = "SELECT * FROM users WHERE email = $1";
        const result = await executeQuery(sql, [req.body.email])

        if(result.rows.length) {
            bcrypt.compare(req.body.password, result.rows[0].password, (err, bcrypt_res) => {
                if(!err && bcrypt_res === true) {
                    const user = result.rows[0];

                    const token = jwt.sign({ id:user.id}, process.env.JWT_SECRET_KEY);

                    res.cookie('token', token, { //maybe change the cookie to only jwt token
                        httpOnly: true,
                        secure: true,
                        sameSite: 'None',
                    });

                    res.status(200).json({
                        id: user.id,
                        email: user.email,
                        username: user.username, 
                    });
                } else {
                    res.status(401).send("Login failed");
                }
            })
        } else {
            res.status(401).send("Invalid login");
        }
    } catch (error) {
        console.log(error, " error");
        res.status(500).json({ error: error.message });
    }
})

module.exports = { userRouter }