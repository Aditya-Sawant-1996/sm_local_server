const express = require('express');
const router = express.Router();
const studentController = require('../controller/studentController');
const studentValidation = require('../validation/studentValidation');

// Create
router.post('/', studentValidation.addStudent, studentController.addStudent);

// Read (list with pagination & search)
router.get('/', studentController.getStudents);

// Read single
router.get('/:id', studentController.getStudentById);

// Update
router.put(
	'/:id',
	studentValidation.updateStudent,
	studentController.updateStudent,
);

// Delete
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
