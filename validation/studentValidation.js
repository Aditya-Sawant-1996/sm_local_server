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
    .optional({ checkFalsy: true })
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
  body('address').optional({ checkFalsy: true }),
  body('aadhaarNumber')
    .optional({ checkFalsy: true })
    .matches(aadhaarPattern)
    .withMessage('aadhaarNumber must be 12 digits'),
  body('mobileNo')
    .notEmpty()
    .withMessage('mobileNo is required')
    .matches(mobilePattern)
    .withMessage('mobileNo must be 10 digits'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email'),
  body('birthPlace').optional({ checkFalsy: true }),
  body('dateOfBirth')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Invalid dateOfBirth'),
  body('gender')
    .optional({ checkFalsy: true })
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Invalid gender value'),
  body('handicapped')
    .optional({ checkFalsy: true })
    .isIn(['Yes', 'No'])
    .withMessage('Invalid handicapped value'),
  body('latestEducation').optional({ checkFalsy: true }),
  body('previousSchoolName').optional({ checkFalsy: true }),

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
    .optional({ checkFalsy: true })
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
  body('address').optional({ checkFalsy: true }),
  body('aadhaarNumber')
		.optional({ checkFalsy: true })
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
  body('birthPlace').optional({ checkFalsy: true }),
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
  body('latestEducation').optional({ checkFalsy: true }),
  body('previousSchoolName').optional({ checkFalsy: true }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
