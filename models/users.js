const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password: String, // (store hashed in real projects)
});

module.exports = mongoose.model("User", userSchema);
