const express = require('express');
const cors = require('cors');
const userRoutes = require('./src/users/routes');

const app = express();
const port = 3000;

//User cors middleware
app.use(cors());

//Parse Json bodies
app.use(express.json());

//User the user routes
app.use('/api', userRoutes);

app.get("/", (req,res) => {
    res.send("Hello");
})

app.listen(port, () => console.log(`app listening on port ${port}`));