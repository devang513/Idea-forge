const { LanguageServiceClient } = require('@google-cloud/language');
// Note: VertexAI import needs to be fixed for the current version
// const { VertexAI } = require('@google-cloud/aiplatform');

class GoogleCloudAIService {
  constructor() {
    this.isServiceAvailable = false;
    try {
      const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './service-account-key.json';
      const fs = require('fs');
      
      if (fs.existsSync(keyPath)) {
        // Initialize Natural Language API client only if file exists
        this.languageClient = new LanguageServiceClient({
          keyFilename: keyPath
        });
        this.isServiceAvailable = true;
        console.log('Google Cloud Natural Language API initialized');
      } else {
        console.warn('Google Cloud credentials not found at:', keyPath);
        console.log('Using mock AI analysis as fallback');
      }
    } catch (error) {
      console.error('Failed to initialize Google Cloud AI services:', error.message);
      console.log('Using mock AI analysis as fallback');
    }
  }

  /**
   * Analyze idea using Google Cloud Natural Language API
   * @param {string} title - Idea title
   * @param {string} description - Idea description
   * @param {string} target - Target audience
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeIdea(title, description, target) {
    try {
      const text = `${title}. ${description}. Target: ${target}`;
      const document = {
        content: text,
        type: 'PLAIN_TEXT',
      };

      // 1. Basic NLP via Google (or mock if needed)
      let sentiment = { score: 0, magnitude: 0 };
      let entities = [];
      let categories = [];

      if (this.isServiceAvailable && this.languageClient) {
        try {
          const [sentimentResult] = await this.languageClient.analyzeSentiment({ document });
          sentiment = sentimentResult.documentSentiment;

          const [entityResult] = await this.languageClient.analyzeEntities({ document });
          entities = entityResult.entities;

          const [classificationResult] = await this.languageClient.classifyText({ document });
          categories = classificationResult.categories;
        } catch (e) {
          console.warn('Google NL API call failed:', e.message);
        }
      } else {
        // Internal heuristic fallback for sentiment/entities
        const posWords = ['great', 'excellent', 'amazing', 'solve', 'important', 'health', 'efficiency'];
        const negWords = ['hard', 'expensive', 'risky', 'problem', 'failure', 'difficult'];
        
        const textLower = text.toLowerCase();
        const posCount = posWords.filter(w => textLower.includes(w)).length;
        const negCount = negWords.filter(w => textLower.includes(w)).length;
        
        sentiment.score = (posCount - negCount) / 10;
        sentiment.magnitude = (posCount + negCount) / 5;
        entities = text.split(' ').slice(0, 5).map(w => ({ name: w }));
      }

      // 2. Generate SWOT - Use OpenAI GPT as the primary "Devil's Advocate" engine if available
      let swotAnalysis;
      if (process.env.OPENAI_API_KEY) {
        swotAnalysis = await this.generateGPTAnalysis(title, description, target);
      } else {
        swotAnalysis = await this.generateSWOTAnalysis(text);
      }

      // 3. Enrich SWOT with Data-Driven Insights from CSVs
      try {
        const datasetService = require('./datasetService');
        const dataSwot = await datasetService.getSwotData(title, description);
        
        // Merge data-driven points into SWOT
        swotAnalysis.s = [...(swotAnalysis.s || []), ...(dataSwot.s || [])];
        swotAnalysis.w = [...(swotAnalysis.w || []), ...(dataSwot.w || [])];
        swotAnalysis.o = [...(swotAnalysis.o || []), ...(dataSwot.o || [])];
        swotAnalysis.t = [...(swotAnalysis.t || []), ...(dataSwot.t || [])];
      } catch (e) {
        console.warn('Dataset service failed to enrich SWOT:', e.message);
      }

      // 4. Calculate scores with the new critical logic
      const scores = this.calculateScores(sentiment, entities, categories, swotAnalysis, description);

      return {
        score: scores.overall,
        feasibility: scores.feasibility,
        market: scores.market,
        innovation: scores.innovation,
        swot: swotAnalysis,
        sentiment: {
          score: sentiment.score,
          magnitude: sentiment.magnitude
        },
        entities: entities.slice(0, 5).map(e => e.name),
        categories: categories.slice(0, 3).map(c => c.name),
        suggestions: this.generateSuggestions(scores, entities, categories)
      };

    } catch (error) {
      console.error('AI analysis encountered a critical error:', error.message);
      // Fallback to the new critical mock analysis
      return this.mockAnalysis(title, description);
    }
  }

  /**
   * Generate critical analysis using OpenAI GPT
   */
  async generateGPTAnalysis(title, description, target) {
    try {
      const axios = require('axios');
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: process.env.GPT_MODEL || 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a critical startup advisor and venture capitalist acting as a Devil\'s Advocate. Your job is to find the flaws, risks, and challenges in an idea. Be brutal but constructive. Provide a SWOT analysis in JSON format.'
            },
            {
              role: 'user',
              content: `Analyze this idea: 
              Title: ${title}
              Description: ${description}
              Target Audience: ${target}
              
              Respond ONLY with a JSON object containing keys: s, w, o, t (each is an array of strings).`
            }
          ],
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      let content = response.data.choices[0].message.content;
      // Basic JSON cleaning if LLM adds markdown
      content = content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(content);
    } catch (error) {
      console.error('GPT Analysis failed, falling back to rule-based SWOT:', error.message);
      return this.generateSWOTAnalysis(`${title} ${description}`);
    }
  }

  /**
   * Generate SWOT analysis using rule-based approach (Vertex AI temporarily disabled)
   * @param {string} ideaText - Combined idea text
   * @returns {Promise<Object>} SWOT analysis
   */
  async generateSWOTAnalysis(ideaText) {
    try {
      // For now, using rule-based SWOT generation
      // TODO: Re-enable Vertex AI when import issues are resolved

      const text = ideaText.toLowerCase();
      const swot = {
        s: [],
        w: [],
        o: [],
        t: []
      };

      // Strengths based on content analysis
      if (text.includes('ai') || text.includes('artificial intelligence')) {
        swot.s.push("Leverages cutting-edge AI technology");
      }
      if (text.includes('mobile') || text.includes('app')) {
        swot.s.push("Accessible mobile platform");
      }
      if (text.includes('health') || text.includes('medical')) {
        swot.s.push("Addresses critical healthcare needs");
      }
      if (text.includes('rural') || text.includes('remote')) {
        swot.s.push("Targets underserved markets");
      }

      // Default strengths if none found
      if (swot.s.length === 0) {
        swot.s = ["Clear value proposition", "Identifiable target market", "Scalable business model"];
      }

      // Weaknesses
      swot.w = ["Needs technical validation", "Resource requirements unclear", "Market education required"];

      // Opportunities
      swot.o = ["Growing market demand", "Technology advancement", "Partnership potential"];

      // Threats
      swot.t = ["Established competition", "Regulatory uncertainty", "Technology adoption challenges"];

      return swot;

    } catch (error) {
      console.error('SWOT generation failed:', error.message);
      // Fallback SWOT
      return {
        s: ["Clear value proposition", "Identifiable target market", "Scalable approach"],
        w: ["Needs technical validation", "Resource requirements unclear"],
        o: ["Growing market trend", "Partnership potential", "Govt. support programs"],
        t: ["Established competition", "Regulatory uncertainty"]
      };
    }
  }

  /**
   * Calculate scores based on AI analysis
   * @param {Object} sentiment - Sentiment analysis result
   * @param {Array} entities - Named entities
   * @param {Array} categories - Content categories
   * @param {Object} swot - SWOT analysis
   * @param {string} description - Raw description for length checks
   * @returns {Object} Calculated scores
   */
  calculateScores(sentiment, entities, categories, swot, description) {
    // Base scores (much more critical starting point)
    let feasibility = 40;
    let market = 35;
    let innovation = 45;

    // 1. Length/Detail Penalty: Reward detail, penalize vagueness
    const detailScore = Math.min(description.split(' ').length / 5, 20); // Max 20 points for detail
    feasibility += detailScore;
    
    if (description.split(' ').length < 20) {
      feasibility -= 20; // Heavy penalty for very short descriptions
      innovation -= 10;
    }

    // 2. Sentiment Adjustment: Be skeptical of "too positive" marketing speak
    // If sentiment is extremely high, it might be fluff. If negative, it might be a problem.
    if (sentiment.score > 0.8) {
      market -= 5; // Penalty for potential hyperbole
    } else if (sentiment.score < 0) {
      feasibility -= 10; // Penalty for perceived difficulty/negativity
    } else {
      innovation += 5; // Reward balanced/realistic descriptions
    }

    // 3. Saturated Market Check (Heuristic)
    const saturatedKeywords = ['delivery', 'food', 'market', 'social', 'sharing', 'crypto', 'nft', 'ecommerce', 'shop'];
    const lowerDesc = description.toLowerCase();
    const saturationCount = saturatedKeywords.filter(kw => lowerDesc.includes(kw)).length;
    innovation -= (saturationCount * 8);

    // 4. Entity Diversity
    const entityBonus = Math.min(entities.length * 4, 15);
    innovation += entityBonus;

    // 5. SWOT Balance (Risk Awareness)
    // If weaknesses/threats > strengths/opportunities, it means the idea is risky but analyzed.
    // In Devil's Advocate mode, we value identifying risks.
    const riskAwareness = (swot.w.length + swot.t.length);
    if (riskAwareness > 0) {
      feasibility += Math.min(riskAwareness * 3, 10); // Reward for knowing your weaknesses
    }

    // Ensure scores are within bounds
    feasibility = Math.max(10, Math.min(95, feasibility));
    market = Math.max(10, Math.min(95, market));
    innovation = Math.max(10, Math.min(95, innovation));

    // Overall score is weighted average
    const overall = Math.round((feasibility * 0.4) + (market * 0.3) + (innovation * 0.3));

    return {
      overall,
      feasibility,
      market,
      innovation
    };
  }

  /**
   * Generate actionable suggestions based on analysis
   * @param {Object} scores - Calculated scores
   * @param {Array} entities - Named entities
   * @param {Array} categories - Content categories
   * @returns {Array} Suggestions array
   */
  generateSuggestions(scores, entities, categories) {
    const suggestions = [];

    if (scores.feasibility < 50) {
      suggestions.push("URGENT: Your feasibility is critically low. Develop a technical proof-of-concept immediately.");
    } else if (scores.feasibility < 75) {
      suggestions.push("Conduct a technical feasibility study with external developers.");
    }

    if (scores.market < 50) {
      suggestions.push("CRITICAL: Market demand is unproven. You must find 5 paying customers before proceeding.");
    }

    if (scores.innovation < 50) {
      suggestions.push("Innovation is low. How are you different from existing solutions like Amazon or Uber?");
    }

    // Default suggestions if needed
    if (suggestions.length < 3) {
      suggestions.push("Research regulatory hurdles in your target country.");
      suggestions.push("Calculate your Customer Acquisition Cost (CAC) vs Lifetime Value (LTV).");
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Fallback mock analysis when Google Cloud fails
   * @param {string} title - Idea title
   * @param {string} description - Idea description
   * @returns {Object} Mock analysis results
   */
  mockAnalysis(title, description) {
    console.log('Using Devil\'s Advocate Mock AI analysis');
    
    // Heuristic-based mock instead of pure random
    const text = (title + ' ' + description).toLowerCase();
    const isShort = description.split(' ').length < 15;
    
    // Base scores for mock (lower than before)
    let base = isShort ? 30 : 50;
    
    // Random fluctuation
    const rand = () => Math.floor(Math.random() * 15);

    const scores = {
      overall: base + rand() - (isShort ? 10 : 0),
      feasibility: (base - 10) + rand(),
      market: (base - 5) + rand(),
      innovation: (base + 5) + rand()
    };

    const mockSWOT = {
      s: ["Initial concept defined", "Identifiable target audience"],
      w: ["Severely lacks technical detail", "Unclear revenue model", "High execution risk"],
      o: ["Potential for niche dominance if pivoted", "Early stage market entry"],
      t: ["Existing industry giants", "Rapid technology obsolescence", "Low barrier to entry"]
    };

    return {
      score: scores.overall,
      feasibility: scores.feasibility,
      market: scores.market,
      innovation: scores.innovation,
      swot: mockSWOT,
      sentiment: { score: 0.1, magnitude: 0.5 },
      entities: ["General Industry", "Generic Tech"],
      categories: ["Unclassified"],
      suggestions: this.generateSuggestions(scores, [], [])
    };
  }
}

module.exports = new GoogleCloudAIService();