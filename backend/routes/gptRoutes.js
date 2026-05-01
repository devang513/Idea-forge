const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/status', (req, res) => {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'OPENROUTER_API_KEY is not configured on the server'
    });
  }

  res.json({
    success: true,
    message: 'OpenRouter route is configured',
    model: 'mistralai/mistral-7b-instruct:free'
  });
});

router.post('/chat', async (req, res) => {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  if (!OPENROUTER_API_KEY) {
    return res.status(500).json({
      success: false,
      error: 'OPENROUTER_API_KEY is not configured on the server'
    });
  }

  const { messages, model = 'mistralai/mistral-7b-instruct-v0.1', temperature = 0.7, max_tokens = 1000 } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Request body must include a non-empty messages array.'
    });
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: max_tokens
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'IdeaForge',
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({
      success: true,
      model: response.data.model,
      usage: response.data.usage,
      choices: response.data.choices
    });
  } catch (error) {
    console.error('OpenRouter API request failed:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const data = error.response?.data || { error: 'OpenRouter API request failed', message: error.message };
    res.status(status).json({ success: false, ...data });
  }
});

module.exports = router;
