// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

router.get("/system-user", authController.hasSystemUser);
router.post("/system-user/request-otp", authController.requestSystemUserOtp);
router.post("/system-user", authController.createSystemUser);
router.post("/system-user/reset-password/request-otp", authController.requestPasswordResetOtp);
router.post("/system-user/reset-password", authController.resetPassword);
router.post("/login", authController.login);

module.exports = router;
