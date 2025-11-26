const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");

// REGISTER PAGE
router.get("/register", (req, res) => {
    res.render("auth/register", { errors: [], old: {} });
});

// REGISTER POST
router.post("/register",
    [
        body("email").isEmail().withMessage("Email is invalid"),
        body("password").isLength({ min: 5 }).withMessage("Password must be at least 5 chars")
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("auth/register", {
                errors: errors.array(),
                old: req.body
            });
        }

        const hashed = await bcrypt.hash(req.body.password, 10);
        await User.create({
            email: req.body.email,
            password: hashed
        });

        res.redirect("/auth/login");
    }
);

// LOGIN PAGE
router.get("/login", (req, res) => {
    res.render("auth/login", { errors: [] });
});

// LOGIN POST
router.post("/login", async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.render("auth/login", { errors: ["User not found"] });
    }

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
        return res.render("auth/login", { errors: ["Incorrect password"] });
    }

    req.session.user = user;
    res.redirect("/");
});

// LOGOUT
router.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

module.exports = router;
