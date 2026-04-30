const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

let cachedDb = null;
let lastError = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  console.log("📍 Connecting to MongoDB...");
  try {
    const opts = {
      serverSelectionTimeoutMS: 5000,
    };
    
    // If we're already connecting, don't start a new connection
    if (mongoose.connection.readyState === 2) {
      console.log("⏳ Connection already in progress, waiting...");
      await new Promise((resolve, reject) => {
        const check = setInterval(() => {
          if (mongoose.connection.readyState === 1) { clearInterval(check); resolve(); }
          if (mongoose.connection.readyState === 0) { clearInterval(check); reject(new Error("Connection failed")); }
        }, 100);
        setTimeout(() => { clearInterval(check); reject(new Error("Timeout waiting for connection")); }, 5000);
      });
      return mongoose.connection;
    }

    cachedDb = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ideaforge", opts);
    console.log("✅ MongoDB Connected!");
    lastError = null;
    return cachedDb;
  } catch (e) {
    console.error("❌ MongoDB Connection Error:", e.message);
    lastError = e;
    throw e;
  }
}

// Routes
app.get("/", async (req, res) => {
  try {
    await connectToDatabase();
  } catch (e) {
    // Continue even on error to show the debug info
  }

  const status = mongoose.connection.readyState === 1 ? "Connected ✅" : "Disconnected (Mock Mode) ❌";
  res.json({
    message: "IdeaForge Backend API is running! 🚀",
    database: status,
    debugInfo: {
      hasURI: !!process.env.MONGODB_URI,
      readyState: mongoose.connection.readyState,
      lastError: lastError ? lastError.message : "None"
    }
  });
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