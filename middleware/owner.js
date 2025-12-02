const Movie = require("../models/Movie");

module.exports = async (req, res, next) => {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.redirect("/movies");

    if (movie.owner.toString() !== req.session.user._id.toString()) {
        return res.status(403).send("Forbidden");
    }
    next();
};
