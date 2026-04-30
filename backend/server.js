const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

let dbError = null;
let maskedURI = "Not Found";

if (process.env.MONGODB_URI) {
  // Show only first 15 chars for security
  maskedURI = process.env.MONGODB_URI.substring(0, 15) + "...";
}

// Routes
app.get("/", (req, res) => {
  const status = mongoose.connection.readyState === 1 ? "Connected ✅" : "Disconnected (Mock Mode) ❌";
  res.json({
    message: "IdeaForge Backend API is running! 🚀",
    database: status,
    debugInfo: {
      hasURI: !!process.env.MONGODB_URI,
      uriStart: maskedURI,
      lastError: dbError ? dbError.message : "None",
      readyState: mongoose.connection.readyState
    }
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

mongoose.connect(MONGO_URI || "mongodb://localhost:27017/ideaforge", {
  serverSelectionTimeoutMS: 5000 
})
.then(() => {
  console.log("✅ MongoDB Connected Successfully");
  dbError = null;
})
.catch(err => {
  console.log("❌ MongoDB Connection Error:", err.message);
  dbError = err;
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