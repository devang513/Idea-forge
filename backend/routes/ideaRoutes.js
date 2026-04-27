const express = require("express");
const router = express.Router();
const Idea = require("../models/idea");
const mockDb = require("../mockDb");

// GET all ideas
router.get("/", async (req, res) => {
  try {
    let ideas;
    if (req.app.locals.useMockDb || require("mongoose").connection.readyState !== 1) {
      ideas = await mockDb.ideaFind();
    } else {
      ideas = await Idea.find().sort({ createdAt: -1 });
    }
    res.json(ideas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST new idea
router.post("/", async (req, res) => {
  try {
    if (req.app.locals.useMockDb || require("mongoose").connection.readyState !== 1) {
      const idea = await mockDb.ideaSave(req.body);
      console.log(`New idea saved to Mock DB: ${idea.title}`);
      return res.json(idea);
    }

    const idea = new Idea(req.body);
    await idea.save();
    console.log(`New idea submitted and saved to DB: ${idea.title}`);
    res.json(idea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST vote for an idea
router.post("/:id/vote", async (req, res) => {
  try {
    if (req.app.locals.useMockDb || require("mongoose").connection.readyState !== 1) {
      const idea = await mockDb.ideaUpdateVote(req.params.id);
      return res.json(idea);
    }
    const idea = await Idea.findByIdAndUpdate(req.params.id, { $inc: { votes: 1 } }, { new: true });
    res.json(idea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST comment to an idea
router.post("/:id/comment", async (req, res) => {
  try {
    const { author, text, time } = req.body;
    const comment = { author, text, time };
    if (req.app.locals.useMockDb || require("mongoose").connection.readyState !== 1) {
      const idea = await mockDb.ideaAddComment(req.params.id, comment);
      return res.json(idea);
    }
    const idea = await Idea.findByIdAndUpdate(req.params.id, { $push: { comments: comment } }, { new: true });
    res.json(idea);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;