/**
 * Movies Routes
 * Includes: listing, adding, viewing, editing, deleting movies
 * Validation is handled using custom middleware
 * Adhyan Chandhoke & Shar-Hylton
 */

const express = require("express");
const router = express.Router();
const Movie = require("../models/Movie");

const auth = require("../middleware/auth");       // Restricts access to logged-in users
const owner = require("../middleware/owner");     // Restricts access to movie creator

// Import our new reusable validation middleware
const { movieValidationRules, validate } = require("../middleware/validation");

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
router.post(
    "/add",
    auth,
    movieValidationRules,   // Apply validation rules
    validate,               // Collect validation errors
    async (req, res) => {

        if (req.validationErrors) {
            return res.render("movies/add", {
                errors: req.validationErrors,
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

// MOVIE DETAILS PAGE
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
router.post(
    "/edit/:id",
    auth,
    owner,
    movieValidationRules,  // Reuse same validation rules
    validate,              // Handle errors
    async (req, res) => {

        if (req.validationErrors) {
            const movie = await Movie.findById(req.params.id);

            return res.render("movies/edit", {
                movie,
                errors: req.validationErrors
            });
        }

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
