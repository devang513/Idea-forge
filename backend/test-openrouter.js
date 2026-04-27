const axios = require('axios');

async function testOpenRouter() {
  const OPENROUTER_API_KEY = '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';
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "openrouter/auto",
        messages: [{ role: "user", content: "Say hello" }]
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
    console.log("Success:", response.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

testOpenRouter();
