const { body, validationResult } = require('express-validator');

const isNotFutureDate = (value) => {
  if (!value) return false;
  const date = new Date(value);
  const today = new Date();
  // zero out time for comparison
  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return date <= today;
};

exports.addFees = [
  body('studentId').notEmpty().withMessage('studentId is required'),
  body('admissionDate')
    .notEmpty()
    .withMessage('admissionDate is required')
    .custom(isNotFutureDate)
    .withMessage('admissionDate cannot be in the future'),
  body('totalFees')
    .notEmpty()
    .withMessage('totalFees is required')
    .isFloat({ min: 0 })
    .withMessage('totalFees must be a non-negative number'),
  body('totalInstallments')
    .notEmpty()
    .withMessage('totalInstallments is required')
    .isInt({ min: 1 })
    .withMessage('totalInstallments must be at least 1'),
  body('instalmentNumber')
    .notEmpty()
    .withMessage('instalmentNumber is required')
    .isInt({ min: 1 })
    .withMessage('instalmentNumber must be a positive integer'),
  body('feesPaid')
    .notEmpty()
    .withMessage('feesPaid is required')
    .isFloat({ min: 0 })
    .withMessage('feesPaid must be a non-negative number'),
  body('date')
    .notEmpty()
    .withMessage('date is required')
    .custom(isNotFutureDate)
    .withMessage('date cannot be in the future'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

exports.updateFees = [
  body('admissionDate')
    .optional()
    .custom(isNotFutureDate)
    .withMessage('admissionDate cannot be in the future'),
  body('totalFees')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('totalFees must be a non-negative number'),
  body('totalInstallments')
    .optional()
    .isInt({ min: 1 })
    .withMessage('totalInstallments must be at least 1'),
  body('instalmentNumber')
    .optional()
    .isInt({ min: 1 })
    .withMessage('instalmentNumber must be a positive integer'),
  body('feesPaid')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('feesPaid must be a non-negative number'),
  body('date')
    .optional()
    .custom(isNotFutureDate)
    .withMessage('date cannot be in the future'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
