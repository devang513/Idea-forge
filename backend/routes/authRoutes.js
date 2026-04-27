const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const mockDb = require("../mockDb");

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userRole = role || 'user'; // default to user

    // Check if user already exists
    let existingUser;
    if (req.app.locals.useMockDb || require("mongoose").connection.readyState !== 1) {
      existingUser = await mockDb.userFindOne({ email });
    } else {
      existingUser = await User.findOne({ email });
    }

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save user
    if (req.app.locals.useMockDb || require("mongoose").connection.readyState !== 1) {
      const newUser = await mockDb.userSave({ name, email, password: hashedPassword, role: userRole });
      console.log(`User created in Mock DB: ${newUser.email}`);
      return res.status(201).json({
        message: "User created successfully (Mock Mode)",
        user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
      });
    }

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: userRole
    });

    await newUser.save();
    console.log(`User created successfully: ${newUser.email}`);

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error during signup" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user;
    if (req.app.locals.useMockDb || require("mongoose").connection.readyState !== 1) {
      user = await mockDb.userFindOne({ email });
    } else {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'user'
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Admin: Get all users
router.get("/users", async (req, res) => {
  try {
    let users;
    if (req.app.locals.useMockDb || require("mongoose").connection.readyState !== 1) {
      users = await mockDb.userFindAll();
    } else {
      users = await User.find({}, '-password'); // exclude password
    }
    
    // Map to ensure role exists
    const formattedUsers = users.map(u => ({
      id: u._id || u.id,
      name: u.name,
      email: u.email,
      role: u.role || 'user',
      createdAt: u.createdAt
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

// Admin: Delete a user
router.delete("/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    let deleted = false;
    
    if (req.app.locals.useMockDb || require("mongoose").connection.readyState !== 1) {
      deleted = await mockDb.userDelete(userId);
    } else {
      const result = await User.findByIdAndDelete(userId);
      deleted = !!result;
    }

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Server error deleting user" });
  }
});

module.exports = router;
