const express = require("express");
const router = express.Router();

const subjectController = require("../controller/subjectController");

// Create
router.post("/", subjectController.addSubject);

// Read (list with pagination & search)
router.get("/", subjectController.getSubjects);

// Read single
router.get("/:id", subjectController.getSubjectById);

// Update
router.put("/:id", subjectController.updateSubject);

// Delete
router.delete("/:id", subjectController.deleteSubject);

module.exports = router;
