const mongoose = require("mongoose");
require("dotenv").config();

// Define the mongoDB URL
const mongoURL = process.env.MONGODB_URL;

// Connect to mongoDB
mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  .then(() => {
    console.log("MongoDB Connected Successfull");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

const db = mongoose.connection;
db.on("connected", () => {
  console.log("Mongoose connected to " + mongoURL);
});

// Report connection errors
db.on("error", (error) => {
  console.error("Mongoose connection error:", error);
});

db.on("disconnected", () => {
  console.log("Mongoose disconnected to " + mongoURL);
});
