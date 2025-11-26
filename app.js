const express = require('express');
const app = express();
const connectDB = require("./config/db");
require('dotenv').config();
 
const PORT = 3000;

connectDB();

app.set("view engine", "ejs");
app.use(express.urlencoded({extended:true}));

//Routes

app.use("/movies", require("./routes/movies"));
app.use("/", require("./routes/auth"));


app.listen(PORT, ()=>{console.log(`Server is running at http://localhost:${PORT}`)});
