const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");

router.get("/register", (req, res) => {
    res.render("auth/register", { errors: [], old: {} });
});

router.post("/register",
    [
        body("email").isEmail().withMessage("Email is invalid"),
        body("password").isLength({ min: 5 }).withMessage("Password must be at least 5 chars")
    ],
    async (req, res) => {
        console.log('=== REGISTER POST ROUTE HIT ===');
        console.log('Request body:', req.body);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('Validation errors:', errors.array());
            return res.render("auth/register", {
                errors: errors.array(),
                old: req.body
            });
        }

        try {
            // Normalize email to lowercase
            const email = req.body.email.toLowerCase().trim();
            
            // Check if email already exists
            const existingUser = await User.findOne({ email: email });
            if (existingUser) {
                console.log('Email already exists:', req.body.email);
                return res.render("auth/register", {
                    errors: [{ msg: "Email already registered" }],
                    old: req.body
                });
            }

            console.log('Creating new user with email:', email);
            const hashed = await bcrypt.hash(req.body.password, 10);
            console.log('Password hashed successfully');
            
            await User.create({
                email: email,
                password: hashed
            });
            console.log('User created successfully');

            res.redirect("/login");
        } catch (error) {
            console.error('Registration error:', error);
            return res.render("auth/register", {
                errors: [{ msg: "Registration failed. Please try again." }],
                old: req.body
            });
        }
    }
);

router.get("/login", (req, res) => {
    res.render("auth/login", { errors: [], old: {} });
});

router.post("/login",
    [
        body("email").isEmail().withMessage("Email is invalid"),
        body("password").notEmpty().withMessage("Password is required")
    ],
    async (req, res) => {
        console.log('=== LOGIN POST ROUTE HIT ===');
        console.log('Request body:', req.body);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("auth/login", {
                errors: errors.array(),
                old: req.body
            });
        }

        try {
            const email = req.body.email.toLowerCase().trim();
            
            const user = await User.findOne({ email: email });

            if (!user) {
                return res.render("auth/login", { errors: [{ msg: "User not found" }], old: req.body });
            }

            const match = await bcrypt.compare(req.body.password, user.password);
            console.log('Password comparison result:', match);
            console.log('User password hash:', user.password);
            
            if (!match) {
                return res.render("auth/login", { errors: [{ msg: "Incorrect password" }], old: req.body });
            }

            req.session.user = user;
            res.redirect("/");
        } catch (error) {
            console.error('Login error:', error);
            return res.render("auth/login", { 
                errors: [{ msg: "Login failed. Please try again." }], 
                old: req.body 
            });
        }
    }
);

router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

module.exports = router;
