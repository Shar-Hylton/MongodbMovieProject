const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie");
const auth = require("../middleware/auth");
const owner = require("../middleware/owner");
const { body, validationResult } = require("express-validator");

// LIST MOVIES
router.get("/", async (req, res) => {
    const movies = await Movie.find();
    res.render("movies/list", { movies });
});

// ADD MOVIE PAGE
router.get("/add", auth, (req, res) => {
    res.render("movies/add", { errors: [], old: {} });
});

// ADD MOVIE POST
router.post("/add",
    auth,
    [
        body("name").notEmpty().withMessage("Movie name required"),
        body("year").isNumeric().withMessage("Year must be a number"),
        body("rating").isNumeric().withMessage("Rating must be a number")
    ],
    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("movies/add", {
                errors: errors.array(),
                old: req.body
            });
        }

        await Movie.create({
            ...req.body,
            owner: req.session.user._id
        });

        res.redirect("/movies");
    }
);

// MOVIE DETAILS
router.get("/:id", async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    res.render("movies/details", { movie });
});

// EDIT MOVIE PAGE
router.get("/edit/:id", auth, owner, async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    res.render("movies/edit", { movie, errors: [] });
});

// EDIT MOVIE POST
router.post("/edit/:id",
    auth,
    owner,
    async (req, res) => {
        await Movie.findByIdAndUpdate(req.params.id, req.body);
        res.redirect("/movies/" + req.params.id);
    }
);

// DELETE MOVIE
router.get("/delete/:id", auth, owner, async (req, res) => {
    await Movie.findByIdAndDelete(req.params.id);
    res.redirect("/movies");
});

module.exports = router;
