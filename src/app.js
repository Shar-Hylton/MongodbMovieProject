const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/auth');
const movieRoutes = require('./routes/movies');

const app = express();
const PORT = process.env.PORT || 8000;


//   DATABASE

connectDB();

//   VIEW ENGINE

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//   MIDDLEWARE

// Use qs parser to support arrays from repeated form fields (checkboxes)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Sessions
app.use(
  session({
    secret: process.env.SECRET_KEY || "Session_hidden_token",
    resave: false,
    saveUninitialized: false,
    cookie: {}
  })
);

// Make session available in all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});


//   ROUTES
app.use('/auth', authRoutes);
app.use('/movies', movieRoutes);

// Default route
app.get('/', (req, res) => {
  res.redirect('/movies');
});


//   404 HANDLER

app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

//   SERVER

const onServerStart = () => {
    console.log(`Server is now running at http://localhost:${PORT}`)
    console.log("Press CTRL+C to stop")

}

app.listen(PORT, onServerStart);
