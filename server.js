const express = require('express');
const userRoutes = require('./src/users/routes');

const app = express();
const port = 3000;

app.use(express.json());

app.get("/", (req,res) => {
    res.send("Hello");
})

app.use('/api', userRoutes);

app.listen(port, () => console.log(`app listening on port ${port}`));