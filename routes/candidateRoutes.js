const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { jwtAuthMiddleware, generateToken } = require("../jwt");
const Candidate = require("../models/candidate");
const e = require("express");

const checkAdminRole = async (userID) => {
  try {
    const user = await User.findById(userID);
    if (user.role === "admin") {
      return true;
    }
  } catch (err) {
    return false;
  }
};

// POST route to add a cadidate
router.post("/", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res
        .status(403)
        .json({ error: "user does  not have admin role 1" });

    const data = req.body; // Assuming the request body contains the cadidate data
    // Create a new user document using the Mongoose model
    const newCandidate = new Candidate(data);
    // Save the new user to the database
    const response = await newCandidate.save();
    console.log("data saved");

    res.status(200).json({ response: response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ error: "user does  not have admin role" });

    const candidateID = req.params.candidateID;
    const updatedCandidateData = req.body;

    const response = await Candidate.findByIdAndUpdate(
      candidateID,
      updatedCandidateData,
      { new: true, runValidators: true }
    );
    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }
    console.log("data update");
    res.status(200).json({ response: response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ error: "user does  not have admin role" });
    const candidateID = req.params.candidateID;

    const response = await Candidate.findByIdAndDelete(candidateID);
    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }
    console.log("Candidate deleted");
    res.status(200).json({ response: response });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//let's start voting
router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  //no admin can vote
  //user can only vote once

  const candidateID = req.params.candidateID;
  const userId = req.user?.id || req.user?._id;
  console.log("req.user =", req.user);

  try {
    const candidate = await Candidate.findById(candidateID);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not Found" });
    }

    const user = await User.findById(userId);

    if (!user) {
      console.log(user);
      return res.status(404).json({ message: "User not Found" });
    }
    if (user.role === "admin") {
      return res.status(403).json({ message: "Admin cannot vote" });
    }
    if (user.isVoted) {
      return res.status(400).json({ message: "User has already voted" });
    }

    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();
    //update user as voted
    user.isVoted = true;
    await user.save();
    res.status(200).json({ message: "Vote cast successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//vote count
router.get("/vote/count", async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ voteCount: "desc" });

    // Map the candidates to include only name, party, and voteCount
    const voteRecord = candidates.map((data) => {
      return {
        party: data.party,
        voteCount: data.voteCount,
      };
    });
    return res.status(200).json(voteRecord);
  } catch (error) {
    console.log(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
