const Movie = require('../models/Movie');

module.exports = async function (req, res, next) {
    try {
        const movieId = req.params.id;
        const currentUser = req.user || req.session.user;
        
        if (!currentUser) {
            req.flash('error', 'You must be logged in to perform this action');
            return res.redirect('/login');
        }
        
        const movie = await Movie.findById(movieId);
        
        if (!movie) {
            req.flash('error', 'Movie not found');
            return res.redirect('/movies');
        }
        
        // Check if movie has an owner and if current user is the owner
        if (!movie.owner || !movie.owner.equals(currentUser._id)) {
            req.flash('error', 'You are not authorized to perform this action');
            return res.redirect(`/movies/${movieId}`);
        }
        
        // Attach movie to request for use in the route handler
        req.movie = movie;
        next();
    } catch (error) {
        console.error('Owner middleware error:', error);
        req.flash('error', 'An error occurred while checking permissions');
        res.redirect('/movies');
    }
};