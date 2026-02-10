exports.login = async (req, res) => {
  const { username, password } = req.body;

  console.log("Login attempt:", { username, password });
  console.log("Configured admin:", {
    usernameEnv: process.env.ADMIN_USERNAME,
    passwordEnv: process.env.ADMIN_PASSWORD ? "***" : undefined,
  });

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return res.json({ success: true, message: "Login successful" });
  }

  return res
    .status(401)
    .json({ success: false, message: "Invalid credentials" });
};
