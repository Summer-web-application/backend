const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
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
//image file upload
app.use(fileUpload())
//serve static files to access pictures from frontend
app.use(express.static('public'))
//User the user routes
app.use('/user', userRouter);
app.use('/blog', blogRouter);

app.get("/", (req,res) => {
    res.send("Hello");
})

app.listen(port, () => console.log(`app listening on port ${port}`));