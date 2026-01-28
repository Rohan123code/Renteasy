const { body, validationResult } = require('express-validator');

// Validation rules
const registerValidation = [
  body('name').not().isEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone').not().isEmpty().withMessage('Phone number is required'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').exists().withMessage('Password is required'),
];

const productValidation = [
  body('name').not().isEmpty().withMessage('Product name is required'),
  body('description').not().isEmpty().withMessage('Description is required'),
  body('category').isIn(['furniture', 'appliance']).withMessage('Invalid category'),
  body('monthlyRent').isNumeric().withMessage('Monthly rent must be a number'),
  body('securityDeposit').isNumeric().withMessage('Security deposit must be a number'),
];

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

module.exports = {
  registerValidation,
  loginValidation,
  productValidation,
  validate,
};