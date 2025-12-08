// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');

router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/movies');
  res.render('auth/register', { title: 'Register', errors: [], old: {} });
});

router.post(
  '/register',
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('auth/register', {
        title: 'Register',
        errors: errors.array(),
        old: req.body
      });
    }

    try {
      const { username, email, password } = req.body;

      const existing = await User.findOne({ email: email.toLowerCase() });

      if (existing) {
        return res.render('auth/register', {
          title: 'Register',
          errors: [{ msg: 'Email already registered' }],
          old: req.body
        });
      }

      const hash = await bcrypt.hash(password, 10);

      const user = await User.create({
        username,
        email,
        password: hash
      });

      req.session.user = {
        _id: user._id,
        username: user.username,
        email: user.email
      };

      req.session.success = 'Welcome! You are registered and logged in.';
      res.redirect('/movies');

    } catch (err) {
      console.error(err);
      res.render('auth/register', {
        title: 'Register',
        errors: [{ msg: 'Registration failed' }],
        old: req.body
      });
    }
  }
);

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/movies');
  res.render('auth/login', { title: 'Login', errors: [], old: {} });
});

router.post(
  '/login',
  body('email').isEmail().withMessage('Enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('auth/login', {
        title: 'Login',
        errors: errors.array(),
        old: req.body
      });
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });

      if (!user) {
        return res.render('auth/login', {
          title: 'Login',
          errors: [{ msg: 'Invalid email or password' }],
          old: req.body
        });
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.render('auth/login', {
          title: 'Login',
          errors: [{ msg: 'Invalid email or password' }],
          old: req.body
        });
      }

      req.session.user = {
        _id: user._id,
        username: user.username,
        email: user.email
      };

      req.session.success = 'Welcome back!';
      res.redirect('/movies');

    } catch (err) {
      console.error(err);
      res.render('auth/login', {
        title: 'Login',
        errors: [{ msg: 'Login failed' }],
        old: req.body
      });
    }
  }
);

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/auth/login');
  });
});

module.exports = router;


