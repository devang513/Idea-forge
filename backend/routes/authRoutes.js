const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const mockDb = require("../mockDb");

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

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
      const newUser = await mockDb.userSave({ name, email, password: hashedPassword });
      console.log(`User created in Mock DB: ${newUser.email}`);
      return res.status(201).json({
        message: "User created successfully (Mock Mode)",
        user: { id: newUser._id, name: newUser.name, email: newUser.email }
      });
    }

    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();
    console.log(`User created successfully: ${newUser.email}`);

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
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
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = router;
