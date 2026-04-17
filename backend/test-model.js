const axios = require('axios');
const OPENROUTER_API_KEY = "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";

async function test(model) {
  try {
    const res = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: model,
      messages: [{role: "user", content: "hello"}]
    }, {
      headers: { 'Authorization': `Bearer ${OPENROUTER_API_KEY}` }
    });
    console.log(`✅ ${model} SUCCESS:`, res.data.choices[0].message.content);
  } catch (err) {
    console.log(`❌ ${model} FAILED:`, err.response?.data || err.message);
  }
}

async function run() {
  await test("mistralai/mistral-7b-instruct:free");
  await test("mistralai/mistral-7b-instruct");
  await test("mistralai/mistral-7b-instruct-v0.2");
  await test("mistralai/mistral-7b-instruct:nitro");
  await test("huggingfaceh4/zephyr-7b-beta:free");
  await test("openrouter/auto");
}
run();
