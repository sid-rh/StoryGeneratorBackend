const { body, validationResult } = require('express-validator');

// Registration validation middleware
const validateRegistration = [
  // Email validation
  body('email').isEmail().withMessage('Invalid email address'),
  
  // Password validation
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),


  // Check for errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateRegistration };