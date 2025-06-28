const { body } = require('express-validator');

const validationUser = [
  body('firstname').notEmpty().withMessage('First name is required').trim(),
  body('lastname').notEmpty().withMessage('Last name is required').trim(),
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['customer', 'admin', 'staff']).withMessage('Role must be one of: customer, admin, staff').trim(),
];

const validationLogin = [
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const validationRestaurant = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('cuisine').notEmpty().withMessage('Cuisine is required').trim(),
  body('location').notEmpty().withMessage('Location is required').trim(),
  body('rating').notEmpty().withMessage('Rating is required').isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
];

const validateSearchQuery = (req, res, next) => {
  try {
    const query = req.query.query || '';
    if (typeof query !== 'string' || query.length > 100) throw new Error('Query must be a string and less than 100 characters');
    req.query.query = query.trim();
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const validateFilters = (req, res, next) => {
  try {
    const { cuisine, location, rating } = req.query;
    if (cuisine && typeof cuisine !== 'string') throw new Error('Cuisine must be a string');
    if (location && typeof location !== 'string') throw new Error('Location must be a string');
    if (rating && (isNaN(rating) || rating < 0 || rating > 5)) throw new Error('Rating must be between 0 and 5');
    req.query.filters = { cuisine, location, rating };
    next();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  validationUser,
  validationLogin,
  validationRestaurant,
  validateSearchQuery,
  validateFilters,
};