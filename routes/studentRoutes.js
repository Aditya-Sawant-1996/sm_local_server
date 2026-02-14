const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const studentController = require('../controller/studentController');
const studentValidation = require('../validation/studentValidation');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, file.fieldname + '-' + uniqueSuffix + ext);
	},
});

const fileFilter = (req, file, cb) => {
	if (!file.mimetype.startsWith('image/')) {
		return cb(new Error('Only image files are allowed'), false);
	}
	cb(null, true);
};

const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter,
});
const attachPhotoIfPresent = (req, res, next) => {
	if (req.file) {
		req.body.photo = `/uploads/${req.file.filename}`;
	}
	next();
};

// Create
router.post(
	'/',
	upload.single('photo'),
	attachPhotoIfPresent,
	studentValidation.addStudent,
	studentController.addStudent,
);

// Read (list with pagination & search)
router.get('/', studentController.getStudents);

// Read single
router.get('/:id', studentController.getStudentById);

// Update
router.put(
	'/:id',
	upload.single('photo'),
	attachPhotoIfPresent,
	studentValidation.updateStudent,
	studentController.updateStudent,
);

// Delete
router.delete('/:id', studentController.deleteStudent);

module.exports = router;
