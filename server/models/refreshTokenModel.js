const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    token: String,
    expires: Date,
  },
  { timestamps: true }
);

schema.virtual("isExpired").get(function () {
  return Date.now() >= this.expires;
});

const model = mongoose.model("RefreshToken", schema);

module.exports = model;
