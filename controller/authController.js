const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SystemUser = require("../models/systemUser");
const SystemUserOtp = require("../models/systemUserOtp");
const { sendOtpEmail } = require("../service/emailService");

const OTP_PURPOSE_CREATE = "create_system_user";
const OTP_PURPOSE_RESET = "reset_password";
const OTP_EXPIRY_MINUTES = 10;
const JWT_SECRET = process.env.JWT_SECRET || "change_me";
const JWT_EXPIRES_MINUTES = Number.parseInt(
  process.env.JWT_EXPIRES_MINUTES,
  10
);
const JWT_EXPIRES_DAYS = Number.parseInt(process.env.JWT_EXPIRES_DAYS, 10) || 14;
const PASSWORD_SALT_ROUNDS = 10;

function hashOtp(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

function issueToken(systemUser) {
  const hasMinuteOverride =
    Number.isFinite(JWT_EXPIRES_MINUTES) && JWT_EXPIRES_MINUTES > 0;
  const expiresIn = hasMinuteOverride
    ? `${JWT_EXPIRES_MINUTES}m`
    : `${JWT_EXPIRES_DAYS}d`;
  const token = jwt.sign(
    { sub: systemUser._id.toString(), email: systemUser.email },
    JWT_SECRET,
    { expiresIn }
  );
  const expiresAt = new Date(
    Date.now() +
      (hasMinuteOverride
        ? JWT_EXPIRES_MINUTES * 60 * 1000
        : JWT_EXPIRES_DAYS * 24 * 60 * 60 * 1000)
  ).toISOString();
  return { token, expiresAt };
}

function isHashedPassword(password) {
  return /^\$2[aby]\$/.test(password);
}

exports.hasSystemUser = async (req, res) => {
  try {
    const systemUser = await SystemUser.findOne(
      {},
      "name email instituteName instituteLogo"
    );
    return res.json({
      success: true,
      exists: !!systemUser,
      user: systemUser
        ? {
            id: systemUser._id,
            name: systemUser.name,
            email: systemUser.email,
            instituteName: systemUser.instituteName,
            instituteLogo: systemUser.instituteLogo || "",
          }
        : null,
    });
  } catch (err) {
    console.error("Error checking system user:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.createSystemUser = async (req, res) => {
  const { name, email, instituteName, password, otp } = req.body;

  if (!name || !email || !instituteName || !password || !otp) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const existing = await SystemUser.exists({});
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "System user already exists",
      });
    }

    const otpHash = hashOtp(otp);
    const otpRecord = await SystemUserOtp.findOne({
      email: email.toLowerCase(),
      purpose: OTP_PURPOSE_CREATE,
      otpHash,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    const passwordHash = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
    const systemUser = await SystemUser.create({
      name,
      email,
      instituteName,
      password: passwordHash,
    });

    await SystemUserOtp.deleteMany({
      email: email.toLowerCase(),
      purpose: OTP_PURPOSE_CREATE,
    });

    return res.status(201).json({
      success: true,
      message: "System user created",
      user: {
        id: systemUser._id,
        name: systemUser.name,
        email: systemUser.email,
        instituteName: systemUser.instituteName,
        instituteLogo: systemUser.instituteLogo || "",
      },
    });
  } catch (err) {
    console.error("Error creating system user:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.requestSystemUserOtp = async (req, res) => {
  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    const existing = await SystemUser.exists({});
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "System user already exists",
      });
    }

    const otp = `${crypto.randomInt(100000, 1000000)}`;
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await SystemUserOtp.create({
      email: email.toLowerCase(),
      otpHash,
      purpose: OTP_PURPOSE_CREATE,
      expiresAt,
    });

    await sendOtpEmail({
      to: email,
      name,
      otp,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
      purpose: "create",
    });

    return res.json({
      success: true,
      message: "Verification code sent",
    });
  } catch (err) {
    console.error("Error sending OTP:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to send verification code",
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const systemUser = await SystemUser.findOne({
      email: email.toLowerCase(),
    });

    if (!systemUser) {
      return res.status(404).json({
        success: false,
        message: "No system user found. Please create a user first.",
      });
    }

    const storedPassword = systemUser.password || "";
    let passwordMatches = false;

    if (isHashedPassword(storedPassword)) {
      passwordMatches = await bcrypt.compare(password, storedPassword);
    } else {
      passwordMatches = storedPassword === password;
      if (passwordMatches) {
        systemUser.password = await bcrypt.hash(password, PASSWORD_SALT_ROUNDS);
        await systemUser.save();
      }
    }

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Email or password is not matched",
      });
    }

    const { token, expiresAt } = issueToken(systemUser);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      expiresAt,
      user: {
        id: systemUser._id,
        name: systemUser.name,
        email: systemUser.email,
        instituteName: systemUser.instituteName,
        instituteLogo: systemUser.instituteLogo || "",
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.requestPasswordResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  try {
    const systemUser = await SystemUser.findOne({});
    if (!systemUser) {
      return res.status(404).json({
        success: false,
        message: "No system user found. Please create a user first.",
      });
    }

    if (systemUser.email !== email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "Email does not match system user",
      });
    }

    const otp = `${crypto.randomInt(100000, 1000000)}`;
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await SystemUserOtp.create({
      email: email.toLowerCase(),
      otpHash,
      purpose: OTP_PURPOSE_RESET,
      expiresAt,
    });

    await sendOtpEmail({
      to: email,
      name: systemUser.name,
      otp,
      expiresInMinutes: OTP_EXPIRY_MINUTES,
      purpose: "reset",
    });

    return res.json({
      success: true,
      message: "Verification code sent",
    });
  } catch (err) {
    console.error("Error sending reset OTP:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to send verification code",
    });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email, OTP, and new password are required",
    });
  }

  try {
    const systemUser = await SystemUser.findOne({});
    if (!systemUser) {
      return res.status(404).json({
        success: false,
        message: "No system user found. Please create a user first.",
      });
    }

    if (systemUser.email !== email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "Email does not match system user",
      });
    }

    const otpHash = hashOtp(otp);
    const otpRecord = await SystemUserOtp.findOne({
      email: email.toLowerCase(),
      purpose: OTP_PURPOSE_RESET,
      otpHash,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    systemUser.password = await bcrypt.hash(
      newPassword,
      PASSWORD_SALT_ROUNDS
    );
    await systemUser.save();

    await SystemUserOtp.deleteMany({
      email: email.toLowerCase(),
      purpose: OTP_PURPOSE_RESET,
    });

    return res.json({
      success: true,
      message: "Password reset successful",
      user: {
        id: systemUser._id,
        name: systemUser.name,
        email: systemUser.email,
        instituteName: systemUser.instituteName,
        instituteLogo: systemUser.instituteLogo || "",
      },
    });
  } catch (err) {
    console.error("Error resetting password:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to reset password",
    });
  }
};

function parseLogoBase64(logo) {
  if (typeof logo !== "string" || !logo.trim()) {
    return { error: "Logo is required" };
  }

  const trimmed = logo.trim();
  const commaIndex = trimmed.indexOf(",");
  if (!trimmed.startsWith("data:image/") || commaIndex === -1) {
    return { error: "Logo must be a valid image data URL" };
  }

  const base64 = trimmed.slice(commaIndex + 1);
  if (!base64) {
    return { error: "Logo must be a valid image data URL" };
  }

  return { base64 };
}

exports.updateSystemUserLogo = async (req, res) => {
  const { logo } = req.body || {};
  const parsed = parseLogoBase64(logo);
  if (parsed.error) {
    return res.status(400).json({ success: false, message: parsed.error });
  }

  const maxBytes = 5 * 1024 * 1024;
  let buffer;
  try {
    buffer = Buffer.from(parsed.base64, "base64");
  } catch {
    return res.status(400).json({
      success: false,
      message: "Logo must be a valid image data URL",
    });
  }

  if (!buffer.length) {
    return res.status(400).json({
      success: false,
      message: "Logo must be a valid image data URL",
    });
  }

  if (buffer.length > maxBytes) {
    return res.status(400).json({
      success: false,
      message: "Logo size must be 5 MB or less",
    });
  }

  try {
    const systemUser = await SystemUser.findOne({});
    if (!systemUser) {
      return res.status(404).json({
        success: false,
        message: "No system user found. Please create a user first.",
      });
    }

    systemUser.instituteLogo = logo.trim();
    await systemUser.save();

    return res.json({
      success: true,
      message: "Institute logo updated",
      user: {
        id: systemUser._id,
        name: systemUser.name,
        email: systemUser.email,
        instituteName: systemUser.instituteName,
        instituteLogo: systemUser.instituteLogo || "",
      },
    });
  } catch (err) {
    console.error("Error updating institute logo:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteSystemUserLogo = async (req, res) => {
  try {
    const systemUser = await SystemUser.findOne({});
    if (!systemUser) {
      return res.status(404).json({
        success: false,
        message: "No system user found. Please create a user first.",
      });
    }

    systemUser.instituteLogo = "";
    await systemUser.save();

    return res.json({
      success: true,
      message: "Institute logo removed",
      user: {
        id: systemUser._id,
        name: systemUser.name,
        email: systemUser.email,
        instituteName: systemUser.instituteName,
        instituteLogo: systemUser.instituteLogo || "",
      },
    });
  } catch (err) {
    console.error("Error deleting institute logo:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
