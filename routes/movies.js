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

router.get("/", async (req, res) => {
    const movies = await Movie.find();
    res.render("movies/list", { movies });
});

router.get("/add", auth, (req, res) => {
    res.render("movies/add", { errors: [], old: {} });
});

router.post("/add",
    auth,
    [
        body("name")
            .notEmpty().withMessage("Movie name is required")
            .isLength({ min: 1, max: 200 }).withMessage("Movie name must be between 1 and 200 characters"),
        
        body("description")
            .optional()
            .isLength({ min: 10 }).withMessage("Description must be at least 10 characters if provided"),
        
        body("year")
            .notEmpty().withMessage("Year is required")
            .isInt().withMessage("Year must be a valid number")
            .isInt({ min: 1888, max: 2030 }).withMessage("Year must be between 1888 and 2030"),
        
        body("rating")
            .notEmpty().withMessage("Rating is required")
            .isFloat({ min: 0, max: 10 }).withMessage("Rating must be between 0 and 10")
            .isFloat({ min: 0, max: 10 }).withMessage("Rating must be a valid number"),
        
        body("genres")
            .notEmpty().withMessage("At least one genre is required")
            .custom((value) => {
                if (typeof value === 'string') {
                    const genreArray = value.split(',').map(g => g.trim()).filter(g => g.length > 0);
                    if (genreArray.length === 0) {
                        throw new Error('At least one valid genre is required');
                    }
                }
                return true;
            })
    ],
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

        let genres = req.body.genres;
        if (typeof genres === 'string') {
            genres = genres.split(',').map(g => g.trim()).filter(g => g.length > 0);
        } else if (Array.isArray(genres)) {
            genres = genres.filter(g => g && g.trim().length > 0);
        }

        await Movie.create({
            ...req.body,
            genres,
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

router.get("/edit/:id", auth, owner, async (req, res) => {
    const movie = await Movie.findById(req.params.id);
    res.render("movies/edit", { movie, errors: [] });
});

router.post("/edit/:id",
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

router.get("/delete/:id", auth, owner, async (req, res) => {
    await Movie.findByIdAndDelete(req.params.id);
    res.redirect("/movies");
});

module.exports = router;
