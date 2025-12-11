require("dotenv").config();
const jwt = require("jsonwebtoken");

const jwtAuthMiddleware = (req, res, next) => {
  // first check request headers has authorization or not
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res.status(401).json({ error: "Token not Found" });
  }

  // Extract the jwt token from the request headers
  const token = req.headers.authorization.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    //verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //Attach user info to the request object
    // req.userId = decoded.id || decoded._id;
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid Token" });
  }
};

//Function to generate JWT token
const generateToken = (userData) => {
  // Generate a new token using user data
  return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: "30m" });
};

module.exports = { jwtAuthMiddleware, generateToken };
