const {Router} = require('express');
const userRouter = Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const executeQuery = require('../src/helpers/db');
const nodemailer = require('nodemailer');
require('dotenv').config();

//register
userRouter.post("/register", async (req,res) => {
    try {
        const emailSql = 'SELECT s FROM users s WHERE s.email = $1';
        const emailResult = await executeQuery(emailSql, [req.body.email]);

        if (emailResult.rows.length) {
            res.status(400).json({ error: "Email already exists."});
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
        const sql = 'INSERT INTO users (first_name, last_name, email, password, username) VALUES ($1, $2, $3, $4, $5) RETURNING email';
        const result = await executeQuery(sql, [req.body.first_name, req.body.last_name, req.body.email, hashedPassword, req.body.username]);
        console.log(result, "is this email");
        res.status(200).json({ email: result.rows[0].email });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})
userRouter.post("/login", async (req,res) => {
    try {
        const sql = "SELECT * FROM users WHERE email = $1";
        const result = await executeQuery(sql, [req.body.email])

        if(result.rows.length) {
            //check that passwords match
            bcrypt.compare(req.body.password, result.rows[0].password, (err, bcrypt_res) => {
                if(!err && bcrypt_res === true) {
                    const user = result.rows[0];
                    //sign jwt token
                    const token = jwt.sign({ user:user.id}, process.env.JWT_SECRET_KEY);
                    //pass the token to browser in cookie
                    res.cookie('token', token, { 
                        httpOnly: true,
                        secure: true,
                        sameSite: 'none',
                    });
                    //send user info 
                    res.status(200).json({
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        first_name: user.first_name,
                        last_name: user.last_name,
                    });
                } else {
                    res.status(401).json({error: "Login failed"});
                }
            })
        } else {
            res.status(401).json({error: "Invalid login"});
        }
    } catch (error) {
        console.log(error, " error");
        res.status(500).json({ error: error.message });
    }
})
userRouter.post('/logout', (req,res) => {
    //reset cookie in browser
    res.cookie('token', '', {
        expires: new Date(0),
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/'
    });
    res.status(200).json({message: 'Log out successfull'});
})

userRouter.get('/forgot-password/:email', async (req,res) => {
    const email = req.params.email;
    try {
        const sql = 'SELECT * FROM users WHERE email = $1';
        const result = await executeQuery(sql, [email]);
        //check that email is in database
        if(result.rows.length == 0) {
            res.status(400).json({ error: "No email found."});
            return;
        }
        const user = result.rows[0];
        const secret = process.env.JWT_SECRET_KEY;
        const token = jwt.sign({ email: user.email, id: user.id}, secret, {
            expiresIn: "30m",
        });
        const link = `http://localhost:3000/user/reset-password/${user.id}/${token}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smpt.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_SENDER,
                pass: process.env.EMAIL_PASSWORD,
            }
        })
          
          var mailOptions = {
            from: process.env.EMAIL_SENDER,
            to: user.email,
            subject: 'New password',
            text: link
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              res.status(500).json({error: 'Send failed'});
            } 
          });
          res.status(200).json({message: 'Link sent to email!'});
    } catch (error) {
        res.status(500).json({error});
    }
})
userRouter.get('/reset-password/:id/:token', async (req, res) => {
    const {id, token} = req.params;
    console.log(req.params);
    const sql = 'SELECT * FROM users WHERE id = $1';
    const result = await executeQuery(sql, [id]);
    if(!result) {
        return res.status(400).send('User not found');
    }
    try {
        const decoded = await verifyToken(token);
        if(decoded.id !== parseInt(id)) {
            return res.status(400).send('Invalid token');
        }
        res.render('index.ejs', {email:decoded.email});
    } catch (error) {
        console.log(error);
    }
})
userRouter.post('/reset-password/:id/:token', async (req, res) => {
    const {id, token} = req.params;
    const {password, confirmPassword} = req.body;
    try {
        //verify the JWT token
        const decoded = await verifyToken(token);
        if(decoded.id !== parseInt(id)) {
            return res.status(400).send('Invalid token');
        }
        //fetch user
        const sql = 'SELECT * FROM users WHERE id = $1';
        const result = await executeQuery(sql, [id]);
        if(!result) {
            return res.status(400).send('User not found');
        }
        const user = result.rows[0];

        //Check that passwords match
        if (password !== confirmPassword) {
            return res.render('index.ejs', {
                id,
                token,
                email: user.email,
                error: 'Passwords do not match'
            });
        }
        
        //hash the new password, update users password
        const hashedPassword = await bcrypt.hash(password, 10);
        const resetSql = 'UPDATE users SET password = $1 WHERE id = $2';
        const resetQuery = await executeQuery(resetSql, [hashedPassword, id]);

        if (resetQuery.rowCount === 0) {
            return res.status(400).send('password update failed: user id not found');
        }
        res.status(201).send('Password changed successfully');
    } catch (error) {
        console.log(error);
        res.send("Not verified");
    }
})
async function verifyToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_SECRET_KEY)
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
}

module.exports = { userRouter }