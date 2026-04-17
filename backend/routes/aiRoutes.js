const express = require('express');
const router = express.Router();
const aiService = require('../aiService');

/**
 * POST /api/analyze-idea
 * Analyze an idea using OpenRouter Mistral
 */
router.post('/analyze-idea', async (req, res) => {
  try {
    const { title, description, target } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        error: 'Title and description are required for analysis'
      });
    }

    console.log('Analyzing idea with OpenRouter Mistral:', title);

    // Call OpenRouter AI service
    const analysis = await aiService.analyzeIdea(title, description, target || '');

    console.log('AI analysis completed for:', title);

    res.json({
      success: true,
      analysis: analysis
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      error: 'AI analysis failed',
      message: error.message
    });
  }
});

/**
 * POST /api/openroute/directions
 * Get route directions from OpenRouteService using the API key
 */
/**
 * GET /api/ai-status
 * Check if OpenRouter AI services are available
 */
router.get('/ai-status', async (req, res) => {
  try {
    // Simple test to check if AI services are initialized
    const testAnalysis = await aiService.analyzeIdea(
      'Test Idea',
      'This is a test description for AI service validation.',
      'Test audience'
    );

    res.json({
      status: 'available',
      message: 'OpenRouter AI services are working',
      testResult: {
        score: testAnalysis.score,
        hasSWOT: !!(testAnalysis.swot && testAnalysis.swot.s)
      }
    });

  } catch (error) {
    res.json({
      status: 'unavailable',
      message: 'Google Cloud AI services not available, using mock analysis',
      error: error.message
    });
  }
});

module.exports = router;