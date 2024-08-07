const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { userRouter } = require('./routes/user');
const { blogRouter } = require('./routes/blog');

const app = express();
const port = 3000;

//User cors middleware
app.use(cors({credentials: true, origin : "http://127.0.0.1:5500"}));

//Parse Json bodies
app.use(express.json());

//cookie parser for jwt
app.use(cookieParser());
//ejs stuff
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: false}));
//User the user routes
app.use('/user', userRouter);
app.use('/blog', blogRouter);

app.get("/", (req,res) => {
    res.send("Hello");
})

app.listen(port, () => console.log(`app listening on port ${port}`));