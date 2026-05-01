const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

let cachedDb = null;
let lastError = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  console.log("📍 Connecting to MongoDB...");
  try {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/ideaforge";
    
    // Use existing connection if available
    if (mongoose.connection.readyState === 1) return mongoose.connection;
    
    cachedDb = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB Connected to:", uri.includes("mongodb+srv") ? "Atlas Cloud" : "Localhost");
    return cachedDb;
  } catch (e) {
    console.error("❌ MongoDB Connection Error:", e.message);
    throw e;
  }
}

// Routes
app.get("/", (req, res) => {
  res.json({ message: "IdeaForge Backend API is running! 🚀" });
});

// Middleware to ensure DB connection for all API routes
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    app.locals.useMockDb = false;
  } catch (e) {
    app.locals.useMockDb = true;
  }
  next();
});

app.use("/ideas", require("./routes/ideaRoutes"));
app.use("/api", require("./routes/aiRoutes"));
app.use("/api/openroute", require("./routes/openrouteRoutes"));
app.use("/api/gpt", require("./routes/gptRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// Remove the old global connection call at the bottom
// mongoose.connect(...) -> Removed

// Start server
const PORT = process.env.PORT || 5001;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (Version: 1.2 - Mock Fix)`);
  });
}

// Export the Express API
module.exports = app;