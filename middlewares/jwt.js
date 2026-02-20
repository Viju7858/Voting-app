require("dotenv").config();
const jwt = require("jsonwebtoken");

const jwtAuthMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({ error: "Token not Found" });
  }

  // Extract token: "Bearer TOKEN"
  const token = authorization.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //  IMPORTANT: User info attached to req.user
    // decoded contains: { id: "...", role: "admin/voter", iat, exp }
    req.user = decoded;

    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid Token" });
  }
};

// ======================
// TOKEN GENERATOR
// ======================
const generateToken = (userData) => {
  return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: "30m" });
};

module.exports = { jwtAuthMiddleware, generateToken };
