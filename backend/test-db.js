const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.MONGODB_URI;

console.log("Connecting to:", uri.replace(/:[^:@]+@/, ':***@')); // Hide password in log

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log("✅ Successfully connected to MongoDB Atlas!");
  process.exit(0);
})
.catch(err => {
  console.error("❌ Failed to connect to MongoDB Atlas");
  console.error("Error Name:", err.name);
  console.error("Error Message:", err.message);
  if (err.message.includes('bad auth')) {
    console.error("\n👉 POSSIBLE CAUSE: Incorrect username or password.");
  } else if (err.message.includes('IP') || err.message.includes('ETIMEOUT') || err.message.includes('queryTxt ETIMEOUT')) {
    console.error("\n👉 POSSIBLE CAUSE: Your IP address is not whitelisted in MongoDB Atlas Network Access.");
  }
  process.exit(1);
});
