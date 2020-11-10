const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = mongoose.Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  token: String,
  createdAt: { type: Date, default: Date.now() },
  expires: Date,
});

schema.virtual("isExpired").get(function () {
  return Date.now() >= this.expires;
});

const model = mongoose.model("RefreshToken", schema);

module.exports = model;
