const express = require('express');
const app = express();
const connectDB = require("./config/db");
require('dotenv').config();
 
const PORT = process.env.PORT || 3000;

connectDB();

app.set("view engine", "ejs");
app.use(express.urlencoded({extended:true}));

const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false
}));

//Routes

app.use("/movies", require("./routes/movies"));
app.use("/", require("./routes/auth"));

app.get('/', (req, res) => {
    res.redirect('/register');
});


app.listen(PORT, ()=>{console.log(`Server is running at http://localhost:${PORT}`)});
