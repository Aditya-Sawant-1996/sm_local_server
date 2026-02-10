const { body, validationResult } = require('express-validator');

exports.addStudent = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('gender')
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Invalid gender value'),
  body('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Invalid date of birth'),
  body('age').isInt({ min: 1 }).withMessage('Age must be a positive number'),
  body('class').notEmpty().withMessage('Class is required'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

exports.updateStudent = [
  body('firstName').optional().notEmpty().withMessage('First name is required'),
  body('lastName').optional().notEmpty().withMessage('Last name is required'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Invalid gender value'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date of birth'),
  body('age')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Age must be a positive number'),
  body('class')
    .optional()
		.notEmpty()
    .withMessage('Class is required'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
