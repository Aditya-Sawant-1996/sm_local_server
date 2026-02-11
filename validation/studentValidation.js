const { body, validationResult } = require('express-validator');

const namePattern = /^[A-Za-z\s]+$/;
const aadhaarPattern = /^\d{12}$/;
const mobilePattern = /^\d{10}$/;

exports.addStudent = [
  body('surName')
    .notEmpty()
    .withMessage('surName is required')
    .matches(namePattern)
    .withMessage('surName must contain only letters'),
  body('firstName')
    .notEmpty()
    .withMessage('firstName is required')
    .matches(namePattern)
    .withMessage('firstName must contain only letters'),
  body('guardianName')
    .notEmpty()
    .withMessage('guardianName is required')
    .matches(namePattern)
    .withMessage('guardianName must contain only letters'),
  body('mothersName')
    .notEmpty()
    .withMessage('mothersName is required')
    .matches(namePattern)
    .withMessage('mothersName must contain only letters'),
  body('subject')
    .custom((value, { req }) => {
      const subjects = req.body.subject;
      if (!subjects || (Array.isArray(subjects) && subjects.length === 0)) {
        throw new Error('At least one subject is required');
      }
      return true;
    }),
  body('address').notEmpty().withMessage('address is required'),
  body('aadhaarNumber')
    .notEmpty()
    .withMessage('aadhaarNumber is required')
    .matches(aadhaarPattern)
    .withMessage('aadhaarNumber must be 12 digits'),
  body('mobileNo')
    .notEmpty()
    .withMessage('mobileNo is required')
    .matches(mobilePattern)
    .withMessage('mobileNo must be 10 digits'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email'),
  body('birthPlace').notEmpty().withMessage('birthPlace is required'),
  body('dateOfBirth')
    .notEmpty()
    .withMessage('dateOfBirth is required')
    .isISO8601()
    .withMessage('Invalid dateOfBirth'),
  body('gender')
    .notEmpty()
    .withMessage('gender is required')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Invalid gender value'),
  body('handicapped')
    .notEmpty()
    .withMessage('handicapped is required')
    .isIn(['Yes', 'No'])
    .withMessage('Invalid handicapped value'),
  body('latestEducation')
    .notEmpty()
    .withMessage('latestEducation is required'),
  body('previousSchoolName')
    .notEmpty()
    .withMessage('previousSchoolName is required'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

exports.updateStudent = [
  body('surName')
    .optional()
    .matches(namePattern)
    .withMessage('surName must contain only letters'),
  body('firstName')
    .optional()
    .matches(namePattern)
    .withMessage('firstName must contain only letters'),
  body('guardianName')
    .optional()
    .matches(namePattern)
    .withMessage('guardianName must contain only letters'),
  body('mothersName')
    .optional()
    .matches(namePattern)
    .withMessage('mothersName must contain only letters'),
  body('subject')
    .optional()
    .custom((value, { req }) => {
      const subjects = req.body.subject;
      if (!subjects || (Array.isArray(subjects) && subjects.length === 0)) {
        throw new Error('At least one subject is required');
      }
      return true;
    }),
  body('address').optional().notEmpty().withMessage('address is required'),
  body('aadhaarNumber')
    .optional()
    .matches(aadhaarPattern)
    .withMessage('aadhaarNumber must be 12 digits'),
  body('mobileNo')
    .optional()
    .matches(mobilePattern)
    .withMessage('mobileNo must be 10 digits'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Invalid email'),
  body('birthPlace').optional().notEmpty().withMessage('birthPlace is required'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid dateOfBirth'),
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Invalid gender value'),
  body('handicapped')
    .optional()
    .isIn(['Yes', 'No'])
    .withMessage('Invalid handicapped value'),
  body('latestEducation').optional().notEmpty().withMessage('latestEducation is required'),
  body('previousSchoolName').optional().notEmpty().withMessage('previousSchoolName is required'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
