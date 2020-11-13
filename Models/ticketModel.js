const mongoose = require("mongoose");

const schema = mongoose.Schema(
  {
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    assignedUser: { type: Schema.Types.ObjectId, ref: "User" },
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    subject: {
      type: String,
      required: [true, "Please enter a subject (e.g. 'issue' or 'request')"],
    },
    text: {
      type: String,
      required: [true, "Please enter a description"],
    },
    priority: {
      type: String,
      required: [
        true,
        "Please enter a priority (e.g. 'low','medium', or 'high'",
      ],
    },
    finishedAt: Date,
  },
  { timestamps: true }
);

const model = mongoose.model("Ticket", schema);

module.exports = model;
