const axios = require('axios');

async function testOpenRouter() {
  try {
    console.log('🧪 Testing OpenRouter (Mistral) AI Integration...\n');

    // Test 1: AI Status
    console.log('1. Testing AI Status Endpoint:');
    const statusResponse = await axios.get('http://localhost:5001/api/ai-status');
    console.log('✅ Status:', statusResponse.data.status);
    console.log('📊 Test Result:', statusResponse.data.testResult);
    console.log('');

    // Test 2: AI Analysis
    console.log('2. Testing AI Analysis with Sample Idea:');
    const testIdea = {
      title: "AI-Powered Rural Health Diagnostics",
      description: "A mobile application that uses artificial intelligence to provide preliminary health diagnostics in remote rural areas where access to doctors is limited. The app analyzes symptoms through image recognition and provides immediate health insights.",
      target: "Rural communities in developing countries with limited healthcare access"
    };

    const analysisResponse = await axios.post('http://localhost:5001/api/analyze-idea', testIdea);
    const analysis = analysisResponse.data.analysis;

    console.log('📈 AI Scores:');
    console.log(`   Overall Score: ${analysis.score}/100`);
    console.log(`   Feasibility: ${analysis.feasibility}/100`);
    console.log(`   Market Fit: ${analysis.market}/100`);
    console.log(`   Innovation: ${analysis.innovation}/100`);
    console.log('');

    console.log('🔍 Sentiment Analysis:');
    console.log(`   Score: ${analysis.sentiment.score.toFixed(2)}`);
    console.log(`   Magnitude: ${analysis.sentiment.magnitude.toFixed(2)}`);
    console.log('');

    console.log('🏷️ Detected Entities:');
    console.log(`   ${analysis.entities.join(', ')}`);
    console.log('');

    console.log('📂 Content Categories:');
    console.log(`   ${analysis.categories.join(', ')}`);
    console.log('');

    console.log('💡 AI Suggestions:');
    analysis.suggestions.forEach((suggestion, i) => {
      console.log(`   ${i + 1}. ${suggestion}`);
    });
    console.log('');

    console.log('🎯 SWOT Analysis:');
    console.log('   💪 Strengths:');
    analysis.swot.s.forEach(s => console.log(`      • ${s}`));
    console.log('   ⚠️ Weaknesses:');
    analysis.swot.w.forEach(w => console.log(`      • ${w}`));
    console.log('   🚀 Opportunities:');
    analysis.swot.o.forEach(o => console.log(`      • ${o}`));
    console.log('   🔴 Threats:');
    analysis.swot.t.forEach(t => console.log(`      • ${t}`));

    console.log('\n🎉 Google Cloud AI Integration Test Completed Successfully!');
    console.log('🤖 Your app now uses real AI for idea analysis!');

  } catch (error) {
    console.error('❌ AI Test Failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the test
testOpenRouter();