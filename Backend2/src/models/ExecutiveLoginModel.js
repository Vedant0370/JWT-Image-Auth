const mongoose = require("mongoose");

const User = new mongoose.Schema('User', {
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("users", User);

module.exports = User;
 