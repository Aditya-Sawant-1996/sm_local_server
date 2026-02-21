const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Load all routes here
router.use("/auth", require("./authRoutes"));
router.use("/students", authMiddleware, require("./studentRoutes"));
router.use("/subjects", authMiddleware, require("./subjectRoutes"));
router.use("/fees", authMiddleware, require("./feesRoutes"));

module.exports = router;
