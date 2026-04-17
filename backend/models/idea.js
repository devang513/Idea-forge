const mongoose = require("mongoose");

const ideaSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  target: String,
  score: Number,
  feasibility: Number,
  market: Number,
  innovation: Number,
  swot: Object,
  author: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Idea", ideaSchema);