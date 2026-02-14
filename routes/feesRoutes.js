const express = require('express');
const router = express.Router();

const feesController = require('../controller/feesController');
const feesValidation = require('../validation/feesValidation');

// Create
router.post('/', feesValidation.addFees, feesController.addFees);

// Read (list with pagination & search)
router.get('/', feesController.getFees);

// Export summary by student (one row per student)
router.get('/summary/by-student', feesController.getFeesSummaryByStudent);

// Read last fees for a student
router.get('/by-student/:studentId/last', feesController.getLastFeesForStudent);

// Read single
router.get('/:id', feesController.getFeesById);

// Update
router.put('/:id', feesValidation.updateFees, feesController.updateFees);

// Delete (soft delete)
router.delete('/:id', feesController.deleteFees);

module.exports = router;
