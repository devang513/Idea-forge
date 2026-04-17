const datasetService = require('./backend/datasetService');

async function testIntegration() {
  try {
    console.log('🧪 Testing Dataset Integration...\n');

    const testIdeas = [
      {
        title: "Fintech payment for rural farmers",
        description: "A mobile payment solution that allows farmers in remote areas to receive payments and manage finances without traditional banks."
      },
      {
        title: "Personal health assistant",
        description: "An AI app that tracks your daily health metrics and provides medical suggestions."
      }
    ];

    for (const idea of testIdeas) {
      console.log(`--- Analyzing: ${idea.title} ---`);
      const swot = await datasetService.getSwotData(idea.title, idea.description);
      
      console.log('📊 SWOT Additions from Datasets:');
      console.log('   💪 Strengths:', swot.s);
      console.log('   ⚠️ Weaknesses:', swot.w);
      console.log('   🚀 Opportunities:', swot.o);
      console.log('   🔴 Threats:', swot.t);
      console.log('');
    }

    console.log('✅ Integration Test Completed!');
  } catch (error) {
    console.error('❌ Test Failed:', error);
  }
}

testIntegration();
