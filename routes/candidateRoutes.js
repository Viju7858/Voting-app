const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { jwtAuthMiddleware, generateToken } = require("../middlewares/jwt");
const Candidate = require("../models/candidate");
const e = require("express");
const uploadImage = require("../middlewares/uploadImage");
const mongoose = require("mongoose");
const electionId = require("../models/election");

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
router.post(
  "/",
  jwtAuthMiddleware,
  uploadImage.single("image"),
  async (req, res) => {
    const { age } = req.body;
    try {
      if (!(await checkAdminRole(req.user.id)))
        return res.status(403).json({ error: "user does not have admin role" });

      const imagePath = req.file
        ? `/uploads/common/${req.file.filename}`
        : req.body.image;
      if (age < 10 || age > 60) {
        return res.status(400).json({ error: "Age must be between 10 and 60" });
      }
      if (!imagePath) {
        return res.status(400).json({ error: "Image is required" });
      }

      const newCandidate = new Candidate({
        name: req.body.name,
        party: req.body.party,
        age: req.body.age,
        electionId: req.body.electionId,
        image: imagePath,
      });

      const response = await newCandidate.save();
      res.status(200).json({ response: response });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error", err });
      console.log(err);
    }
  },
);

router.put(
  "/:candidateID",
  jwtAuthMiddleware,
  uploadImage.single("image"), // ✅ THIS WAS MISSING
  async (req, res) => {
    try {
      if (!(await checkAdminRole(req.user.id)))
        return res.status(403).json({ error: "user does not have admin role" });

      const candidateID = req.params.candidateID;

      console.log("PUT BODY:", req.body); // 🔍 debug
      console.log("PUT FILE:", req.file); // 🔍 debug

      const updatedCandidateData = {
        name: req.body.name,
        party: req.body.party,
        age: req.body.age,
      };

      // image optional in edit
      if (req.file) {
        updatedCandidateData.image = `/uploads/common/${req.file.filename}`;
      }

      const response = await Candidate.findByIdAndUpdate(
        candidateID,
        updatedCandidateData,
        { new: true, runValidators: true },
      );

      if (!response) {
        return res.status(404).json({ error: "Candidate not found" });
      }

      res.status(200).json({ response });
    } catch (err) {
      console.error("UPDATE CANDIDATE ERROR:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
);

router.delete("/:candidateID", jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ error: "user does  not have admin role" });
    const candidateID = req.params.candidateID;

    const response = await Candidate.findByIdAndDelete(candidateID);
    if (!response) {
      return res.status(404).json({ error: "Candidate not found" });
    }
    res.status(200).json({ response: response });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//let's start voting
router.post("/vote/:candidateID", jwtAuthMiddleware, async (req, res) => {
  //no admin can vote
  const candidateID = req.params.candidateID;
  const userId = req.user?.id || req.user?._id;
  try {
    const candidate = await Candidate.findById(candidateID);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not Found" });
    }

    const election = await electionId.findById(candidate.electionId);

    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }

    const now = new Date();

    // ❌ Election not started
    if (now < election.startDate) {
      return res.status(400).json({ message: "Election has not started yet" });
    }

    // ❌ Election ended
    if (now > election.endDate) {
      return res.status(400).json({ message: "Election has ended" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not Found" });
    }
    if (user.role === "admin") {
      return res.status(403).json({ message: "Admin cannot vote" });
    }

    const alreadyVoted = await Candidate.findOne({
      electionId: candidate.electionId,
      "votes.user": userId,
    });

    if (alreadyVoted) {
      return res
        .status(400)
        .json({ message: "User already voted in this election" });
    }

    candidate.votes.push({ user: userId });
    candidate.voteCount += 1;
    await candidate.save();
    //update user as voted

    res.status(200).json({ message: "Vote cast successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log(err);
  }
});

//vote count
router.get("/vote/count/:electionId", async (req, res) => {
  try {
    const { electionId } = req.params;

    const result = await Candidate.aggregate([
      { $match: { electionId: new mongoose.Types.ObjectId(electionId) } },

      {
        $group: {
          _id: "$party", // party wise group
          votes: { $sum: "$voteCount" }, // total votes
        },
      },

      { $sort: { votes: -1 } }, // DESC order
    ]);

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all candidates of a specific election
router.get("/election/:electionId", async (req, res) => {
  try {
    const electionId = req.params.electionId;
    const candidates = await Candidate.find({ electionId: electionId });
    res.status(200).json(candidates);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
