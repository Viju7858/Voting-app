const express = require("express");
const app = express();
const db = require("./db");
require("dotenv").config();

const bodyParser = require("body-parser");

// ⭐⭐⭐ Add CORS here ⭐⭐⭐
const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:5173",   // React frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
// ⭐⭐⭐ END ⭐⭐⭐

// Body parser
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Routes
const userRoutes = require("./routes/userRoutes");
const candidateRoutes = require("./routes/candidateRoutes");

app.use("/user", userRoutes);
app.use("/candidate", candidateRoutes);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
