const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/ideas", require("./routes/ideaRoutes"));
app.use("/api", require("./routes/aiRoutes"));
app.use("/api/openroute", require("./routes/openrouteRoutes"));
app.use("/api/gpt", require("./routes/gptRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));

// MongoDB connection
app.locals.useMockDb = false;

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ideaforge";

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000 // 5 seconds timeout
})
.then(() => {
  console.log("MongoDB Connected");
})
.catch(err => {
  console.log("!!! MongoDB connection error. Switching to Mock DB fallback !!!");
  console.log("Error details:", err.message);
  app.locals.useMockDb = true;
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} (Version: 1.2 - Mock Fix)`);
});