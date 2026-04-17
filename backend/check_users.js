const mongoose = require('mongoose');
const User = require('./models/User');

async function checkUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/ideaforge');
    console.log('Connected to MongoDB');
    
    const users = await User.find({});
    console.log('Total Users:', users.length);
    users.forEach(u => {
      console.log(`- Name: ${u.name}, Email: ${u.email}, ID: ${u._id}`);
    });
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

checkUsers();
