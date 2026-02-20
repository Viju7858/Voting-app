const express = require("express");
const Election = require("../models/election");
const { jwtAuthMiddleware } = require("../middlewares/jwt"); // JWT auth
const router = express.Router();
const uploadImage = require("../middlewares/uploadImage");
const electionId = require("../models/election");

//  🔥 ELECTION STATUS CALCULATOR (DO NOT STORE IN DB)

const getElectionStatus = (startDate, endDate) => {
  if (!startDate || !endDate) return "unknown";
  const now = new Date();
  if (now < new Date(startDate)) return "upcoming";
  if (now > new Date(endDate)) return "completed";
  return "active";
};

//  CREATE ELECTION (ADMIN ONLY)

const adminOnly = async (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  next();
};

router.post(
  "/create",
  jwtAuthMiddleware,
  uploadImage.single("image"),
  async (req, res) => {
    try {
      console.log("USER:", req.user);

      const { title, description, startDate, endDate, type, scope } = req.body;

      if (!title || !startDate || !endDate || !type || !scope) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      const imagePath = req.file
        ? `/uploads/common/${req.file.filename}`
        : null;

      if (!imagePath) {
        return res.status(400).json({ message: "Election image is required" });
      }

      const election = new Election({
        title: title.trim(),
        description: description || "",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        scope,
        type,
        image: imagePath,
      });

      await election.save();

      res.status(201).json({
        message: "Election Created Successfully",
        election,
      });
    } catch (err) {
      console.error("CREATE ELECTION ERROR FULL:", err);
      res.status(500).json({ message: err.message });
    }
  },
);

router.put(
  "/update/:id",
  jwtAuthMiddleware,
  uploadImage.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const updateData = {
        title: req.body.title,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        scope: req.body.scope,
        type: req.body.type,
      };

      if (req.file) {
        updateData.image = `/uploads/common/${req.file.filename}`;
      }

      const updated = await Election.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      if (!updated) {
        return res.status(404).json({ message: "Election not found" });
      }

      res.status(200).json(updated);
    } catch (err) {
      res.status(500).json({ message: "Update failed" });
    }
  },
);

//  GET ALL ELECTIONS (STATUS CALCULATED)

router.get("/all", async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });

    const result = elections.map((e) => ({
      ...e.toObject(),
      status: getElectionStatus(e.startDate, e.endDate), // 🔥 REAL STATUS
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error("GET ALL ELECTIONS ERROR:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete("/delete/:id", jwtAuthMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Election.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Election not found" });
    }
    res.status(200).json({ message: "Election deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

module.exports = router;
