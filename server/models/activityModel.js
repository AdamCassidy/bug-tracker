const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = Schema(
  {
    project: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    text: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const model = mongoose.model("Activity", schema);

module.exports = model;
