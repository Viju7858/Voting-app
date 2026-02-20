const express = require("express");
const app = express();
const db = require("./db");
const path = require("path");
require("dotenv").config();


const bodyParser = require("body-parser");

const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:5173", // React frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
  
// Body parser
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 3000;

// Routes
const userRoutes = require("./routes/userRoutes");
const candidateRoutes = require("./routes/candidateRoutes");
const electionRoute = require("./routes/electionRoute");

app.use("/user", userRoutes);
app.use("/candidate", candidateRoutes);
app.use("/election", electionRoute);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
