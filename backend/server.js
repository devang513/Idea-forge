const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  const status = mongoose.connection.readyState === 1 ? "Connected ✅" : "Disconnected (Mock Mode) ❌";
  res.json({
    message: "IdeaForge Backend API is running! 🚀",
    database: status,
    environment: process.env.NODE_ENV || "development"
  });
});
app.use("/ideas", require("./routes/ideaRoutes"));
app.use("/api", require("./routes/aiRoutes"));
app.use("/api/openroute", require("./routes/openrouteRoutes"));
app.use("/api/gpt", require("./routes/gptRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// MongoDB connection
app.locals.useMockDb = false;

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.log("⚠️ WARNING: MONGODB_URI environment variable is not set!");
  console.log("Falling back to local mongodb://localhost:27017/ideaforge (This will fail on Vercel)");
} else {
  console.log("📍 Attempting to connect to MongoDB Atlas...");
}

const connectionString = MONGO_URI || "mongodb://localhost:27017/ideaforge";

mongoose.connect(connectionString, {
  serverSelectionTimeoutMS: 5000 // 5 seconds timeout
})
.then(() => {
  console.log("✅ MongoDB Connected Successfully");
})
.catch(err => {
  console.log("❌ MongoDB Connection Error!");
  console.log("Error details:", err.message);
  console.log("TIP: If you are on Vercel, check if you whitelisted 0.0.0.0/0 in MongoDB Atlas Network Access.");
  app.locals.useMockDb = true;
});

// Start server
const PORT = process.env.PORT || 5001;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (Version: 1.2 - Mock Fix)`);
  });
}

// Export the Express API
module.exports = app;