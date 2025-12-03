const Movie = require('../models/movie');

// Check if user is authenticated
const requireAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'Please login to access this page');
    res.redirect('/login');
};

// Check if user is the owner of the movie
const isOwner = async (req, res, next) => {
    try {
        const movieId = req.params.id;
        
        // Check if ID is valid
        if (!mongoose.Types.ObjectId.isValid(movieId)) {
            req.flash('error', 'Invalid movie ID');
            return res.redirect('/movies');
        }
        
        const movie = await Movie.findById(movieId);
        
        if (!movie) {
            req.flash('error', 'Movie not found');
            return res.redirect('/movies');
        }
        
        // Check if movie has an owner (some movies might not have owner field)
        if (!movie.owner) {
            req.flash('error', 'This movie has no owner information');
            return res.redirect('/movies');
        }
        
        // Check if current user is the owner
        if (movie.owner.equals(req.user._id)) {
            // Attach movie to request for use in the route handler
            req.movie = movie;
            return next();
        }
        
        req.flash('error', 'You are not authorized to modify this movie');
        res.redirect(`/movies/${movieId}`);
    } catch (error) {
        console.error('Owner check error:', error);
        req.flash('error', 'An error occurred while checking permissions');
        res.redirect('/movies');
    }
};

// Combined middleware: require auth AND ownership
const requireAuthAndOwnership = [requireAuth, isOwner];

module.exports = {
    requireAuth,
    isOwner,
    requireAuthAndOwnership
};