const mongoose = require("mongoose");

const electionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },
    type: {
      type: String,
      enum: [
        "class_monitor",
        "captain",
        "school_leader",
        "sarpanch",
        "ward_member",
        "cr",
        "general_secretary",
      ],
      required: true,
    },
    scope: {
      type: String,
      enum: ["school", "village", "college"],
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Election", electionSchema);
