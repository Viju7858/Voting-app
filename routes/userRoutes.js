const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { jwtAuthMiddleware, generateToken } = require("../jwt");

// POST route to add a person
router.post("/signup", async (req, res) => {
  try {
    const data = req.body; // Assuming the request body contains the person data
    // Create a new user document using the Mongoose model
    const newUser = new User(data);
    // Save the new user to the database
    const response = await newUser.save();
    const payload = {
      id: response.id,
    };
    console.log(response);

    const token = generateToken(payload);
    res.status(200).json({ response: response, token: token });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log(err);
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    // Extract aadharCardNumber and password from request body
    const { aadharCardNumber, password } = req.body;

    // Find the user by aadharCardNumber
    const user = await User.findOne({ aadharCardNumber: aadharCardNumber });

    // If user does not exist or password does not match, return error
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // generate Token
    const payload = {
      id: user.id,
    };
    const token = generateToken(payload);
    // resturn token as response
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Profile route
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = req.user;
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    // Extract the id from the token
    const { currentPassword, newPassword } = req.body; //Extract current and new password from request body

    //Find the user by userID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    } else {
      console.log("yes");
    }

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    // Update the user's password
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password Updated" });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log(err);
  }
});

module.exports = router;
