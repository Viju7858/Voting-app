const mongoose = require("mongoose");

//Define the Person schema
const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  party: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    min: 10,
    max: 60,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Election",
    required: true,
  },
  votes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      voteAt: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  voteCount: {
    type: Number,
    default: 0,
  },
  maxVotes: {
    type: Number,
    default: null,
  },
});

const Candidate = mongoose.model("Candidate", candidateSchema);
module.exports = Candidate;
