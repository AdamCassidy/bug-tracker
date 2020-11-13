const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    assignedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    name: {
      type: String,
      required: [true, "Please enter a project name"],
    },
    finishedAt: Date,
  },
  { timestamps: true }
);

const model = mongoose.model("Project", schema);

module.exports = model;
