const axios = require('axios');

class AIService {
  constructor() {
    this.openRouterKey = process.env.OPENROUTER_API_KEY;
    this.serpApiKey = process.env.SERP_API_KEY;
  }

  // ---------- LIVE SEARCH ----------
  async searchMarket(query) {
    if (!this.serpApiKey) return null;
    try {
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          q: `${query} competitors 2026`,
          api_key: this.serpApiKey,
          engine: 'google',
          num: 3
        },
        timeout: 5000
      });
      return (response.data.organic_results || []).map(r => ({ title: r.title, link: r.link }));
    } catch (error) {
      return null;
    }
  }

  async analyzeIdea(title, description, target) {
    if (!this.openRouterKey) {
      console.error("❌ OPENROUTER_API_KEY missing");
      return this.mockAnalysis(title, description);
    }

    const liveSearchResults = await this.searchMarket(title);

    try {
      const prompt = `
Act as a Startup Investor. Provide a validation report.
IDEA:
Title: ${title}
Description: ${description}
Target: ${target}

${liveSearchResults ? `SEARCH CONTEXT: ${JSON.stringify(liveSearchResults)}` : ""}

INSTRUCTIONS:
1. Provide scores (0-100).
2. SWOT: 4-5 points each.
3. MARKET RESEARCH: 
   - targetDemographic: Who are the users?
   - estimatedMarketSize: TAM/SAM (e.g. "$10B Global").
   - competitors: List real competitors.
   - trends: List current industry trends.
4. SUMMARY: 150-200 words (Include Target Audience, Market Size, Risks, Monetization).
5. RECOMMENDATIONS: 3 actionable steps.
6. PAST FAILURES: Identify 2 similar failed startups & lessons.

Return ONLY JSON:
{
  "scores": { "overall": 0, "feasibility": 0, "market": 0, "innovation": 0 },
  "swot": { "s": [], "w": [], "o": [], "t": [] },
  "marketReport": {
    "targetDemographic": "",
    "estimatedMarketSize": "",
    "competitors": [],
    "trends": []
  },
  "summary": "",
  "recommendations": [],
  "pastFailures": [{ "name": "", "reason": "", "lesson": "" }],
  "validation": { "status": "", "reason": "" }
}
`;

      console.log("🚀 Starting AI Analysis (with Live Search)...");
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: "meta-llama/llama-3-70b-instruct",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.5
        },
        {
          headers: { Authorization: `Bearer ${this.openRouterKey}`, 'Content-Type': 'application/json' },
          timeout: 40000
        }
      );

      let text = response.data.choices[0].message.content;
      text = text.replace(/```json/gi, '').replace(/```/g, '');
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      const analysis = JSON.parse(text.substring(start, end + 1));
      console.log("✅ Analysis Complete");

      return {
        score: analysis.scores?.overall || 50,
        feasibility: analysis.scores?.feasibility || 50,
        market: analysis.scores?.market || 50,
        innovation: analysis.scores?.innovation || 50,
        swot: analysis.swot || { s: [], w: [], o: [], t: [] },
        suggestions: analysis.recommendations || [],
        aiSummary: analysis.summary || "",
        marketResearchReport: {
          targetDemographic: analysis.marketReport?.targetDemographic || "N/A",
          competitors: analysis.marketReport?.competitors || [],
          trends: analysis.marketReport?.trends || [],
          estimatedMarketSize: analysis.marketReport?.estimatedMarketSize || "N/A"
        },
        pastFailures: analysis.pastFailures || [],
        validation: analysis.validation || { status: "MODERATE", reason: "Analysis completed" }
      };

    } catch (error) {
      console.error("❌ AI Error:", error.message);
      return this.mockAnalysis(title, description);
    }
  }

  mockAnalysis(title, description) {
    return {
      score: 60, feasibility: 65, market: 55, innovation: 70,
      swot: { s: ["Concept strength"], w: ["Initial data"], o: ["Growth potential"], t: ["Competition"] },
      suggestions: ["Check API Key", "Validate audience"],
      aiSummary: "Mock Analysis: Please ensure your API keys are active.",
      marketResearchReport: { targetDemographic: "General", competitors: [], trends: [], estimatedMarketSize: "N/A" },
      pastFailures: [],
      validation: { status: "MODERATE", reason: "API Fallback" }
    };
  }
}

module.exports = new AIService();