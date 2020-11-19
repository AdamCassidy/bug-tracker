const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const schema = Schema({
  name: {
    type: String,
    required: [true, "Please enter a name"],
  },
  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: true,
    lowercase: true,
    validate: [isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: [8, "Please enter at least 8 characters"],
  },
  role: {
    type: String,
    required: [true, "Please enter a role"],
  },
});

schema.pre("save", async function (next) {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const model = mongoose.model("User", schema);

module.exports = model;
