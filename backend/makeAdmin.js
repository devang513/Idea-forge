require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const emailToPromote = process.argv[2];

if (!emailToPromote) {
  console.log("Please provide an email address.");
  console.log("Usage: node makeAdmin.js <email>");
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB...");
    const user = await User.findOneAndUpdate(
      { email: emailToPromote }, 
      { role: 'admin' }, 
      { new: true }
    );
    
    if (user) {
      console.log(`✅ Success! Updated user ${user.email} to have the 'admin' role.`);
    } else {
      console.log(`❌ Error: Could not find any user with the email '${emailToPromote}' in the database.`);
    }
    mongoose.disconnect();
  })
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
