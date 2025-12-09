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
    type: String,
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
    type: String,
    default: 0,
  },
});

const Candidate = mongoose.model("Candidate", candidateSchema);
module.exports = Candidate;
