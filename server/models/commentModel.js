const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = Schema(
  {
    creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
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
