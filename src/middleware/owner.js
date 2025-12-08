// middleware/owner.js
const Movie = require('../models/Movie');

module.exports = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.redirect('/movies');
    }

    // Compare logged-in user with movie owner
    if (movie.owner.toString() !== req.session.user._id) {
      req.session.error = 'You are not authorized to perform this action';
      return res.redirect('/movies/' + req.params.id);
    }

    // Attach movie to request (optional but helpful)
    req.movie = movie;

    next();
  } catch (err) {
    console.error(err);
    res.redirect('/movies');
  }
};
