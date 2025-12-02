const { body } = require('express-validator');

exports.movieValidationRules = [
    body('name')
        .notEmpty().withMessage('Movie name is required')
        .isLength({ min: 2 }).withMessage('Movie name must be at least 2 characters'),
    
    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    
    body('year')
        .notEmpty().withMessage('Year is required')
        .isInt({ min: 1900, max: new Date().getFullYear() })
        .withMessage('Enter a valid year'),
    
    body('genres')
        .notEmpty().withMessage('Genres are required'),
    
    body('rating')
        .notEmpty().withMessage('Rating is required')
        .isFloat({ min: 0, max: 10 })
        .withMessage('Rating must be between 0 and 10')
];

exports.validate = (req, res, next) => {
    const { validationResult } = require('express-validator');
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        req.validationErrors = errors.array();
    }

    next();
};
