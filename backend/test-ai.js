require('dotenv').config();
const aiService = require('./aiService');

async function run() {
  console.log("SERP_API_KEY:", process.env.SERP_API_KEY);
  console.log("OPENROUTER_API_KEY:", process.env.OPENROUTER_API_KEY);
  
  const result = await aiService.analyzeIdea("AI trading bot", "An AI bot that automatically trades crypto", "Day traders");
  console.log(JSON.stringify(result, null, 2));
}

run();