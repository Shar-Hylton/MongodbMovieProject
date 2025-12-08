const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const ensureLogin = require('../middleware/ensureLogin');
const owner = require('../middleware/owner');
const { body, validationResult } = require('express-validator');

// Middleware to normalize genres into an array (handles string, comma-list, single or multiple values)
function normalizeGenres(req, res, next) {
  let genres = req.body.genres;

  if (!genres) {
    req.body.genres = [];
  } else if (Array.isArray(genres)) {
    // Filter out any empty values
    req.body.genres = genres.map(g => (typeof g === 'string' ? g.trim() : g)).filter(Boolean);
  } else if (typeof genres === 'string') {
    const trimmed = genres.trim();
    if (trimmed === '') {
      req.body.genres = [];
    } else if (trimmed.includes(',')) {
      // allow client to POST a comma separated list
      req.body.genres = trimmed.split(',').map(s => s.trim()).filter(Boolean);
    } else {
      req.body.genres = [trimmed];
    }
  } else {
    // Fallback to empty array for unexpected types
    req.body.genres = [];
  }

  next();
}

// list with search
router.get('/', async (req, res) => {
  const q = req.query.q || '';
  const filter = q ? { name: new RegExp(q, 'i') } : {};
  const movies = await Movie.find(filter).sort({ createdAt: -1 }).populate('owner', 'username email');
  res.render('movies/list', { title: 'Movies', movies, q });
});

// add form
router.get('/add', ensureLogin, (req, res) => {
  res.render('movies/add', { title: 'Add Movie', errors: [], old: {} });
});

// add post
router.post(
  '/add',
  ensureLogin,
  normalizeGenres,
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('genres').custom((value, { req }) => {
    if (!req.body.genres || !req.body.genres.length) {
      throw new Error('At least one genre is required');
    }
    return true;
  }),
  body('rating').isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('movies/add', {
        title: 'Add Movie',
        errors: errors.array(),
        old: req.body
      });
    }

    try {
      const movie = await Movie.create({
        name: req.body.name,
        description: req.body.description,
        year: req.body.year || undefined,
        genres: req.body.genres,
        rating: req.body.rating || 0,
        posterUrl: req.body.posterUrl || undefined,
        owner: req.session.user._id
      });

      req.session.success = 'Movie added successfully';
      res.redirect('/movies/' + movie._id);
    } catch (err) {
      console.error(err);
      res.render('movies/add', {
        title: 'Add Movie',
        errors: [{ msg: 'Failed to create movie' }],
        old: req.body
      });
    }
  }
);

// details
router.get('/:id', async (req, res) => {
  const movie = await Movie.findById(req.params.id).populate('owner', 'username email');
  if (!movie) {
    return res.status(404).render('404', { title: 'Movie not found' });
  }
  res.render('movies/details', { title: movie.name, movie });
});

// edit form
router.get('/edit/:id', ensureLogin, owner, async (req, res) => {
  // owner middleware attaches the movie at req.movie when the user is authorized
  const movie = req.movie || (await Movie.findById(req.params.id));
  if (!movie) return res.redirect('/movies');
  // pass an empty `old` object so the template's optional chaining won't throw
  res.render('movies/edit', { title: 'Edit Movie', movie, errors: [], old: {} });
});

// edit post
router.post(
  '/edit/:id',
  ensureLogin,
  owner,
  normalizeGenres,
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('genres').custom((value, { req }) => {
    if (!req.body.genres.length) {
      throw new Error('At least one genre is required');
    }
    return true;
  }),
  body('rating').isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
  async (req, res) => {
    const errors = validationResult(req);
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.redirect('/movies');

    if (!errors.isEmpty()) {
      return res.render('movies/edit', {
        title: 'Edit Movie',
        movie,
        errors: errors.array(),
        old: req.body
      });
    }

    await Movie.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      description: req.body.description,
      year: req.body.year || undefined,
      genres: req.body.genres,
      rating: req.body.rating || 0,
      posterUrl: req.body.posterUrl || undefined
    });

    req.session.success = 'Movie updated';
    res.redirect('/movies/' + req.params.id);
  }
);

// delete
router.post('/delete/:id', ensureLogin, owner, async (req, res) => {
  await Movie.findByIdAndDelete(req.params.id);
  req.session.success = 'Movie deleted';
  res.redirect('/movies');
});

module.exports = router;
