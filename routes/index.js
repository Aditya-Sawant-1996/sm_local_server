const express = require("express");
const router = express.Router();

// Load all routes here
router.use("/auth", require("./authRoutes"));
router.use("/students", require("./studentRoutes"));
router.use("/subjects", require("./subjectRoutes"));

module.exports = router;
