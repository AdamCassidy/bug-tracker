const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    ticket: { type: Schema.Types.ObjectId, ref: "Ticket" },
    text: {
      type: String,
      required: [true, "Please enter a comment"],
    },
  },
  { timestamps: true }
);

const model = mongoose.model("Comment", schema);

module.exports = model;
