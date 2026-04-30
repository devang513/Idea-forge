const axios = require('axios');

class AIService {
  constructor() {
    this.openRouterKey = process.env.OPENROUTER_API_KEY;
  }

  // ---------- MAIN FUNCTION ----------
  async analyzeIdea(title, description, target) {
    if (!this.openRouterKey) {
      console.warn('OPENROUTER_API_KEY missing');
      return this.mockAnalysis(title, description);
    }

    try {
      const idea = `Title: ${title}\nDescription: ${description}\nTarget: ${target}`;

      // 🔹 Step 1: Structured Analysis
      const analysisData = await this.basicAnalysis(idea);

      // 🔹 Step 2: Summary + Recommendations + Market
      const finalData = await this.generateSummaryAndSuggestions(
        analysisData,
        idea
      );

      // 🔹 Merge both outputs
      return {
        score: analysisData.overallScore || 50,
        feasibility: analysisData.feasibilityScore || 50,
        market: analysisData.marketScore || 50,
        innovation: analysisData.innovationScore || 50,

        swot: analysisData.swot || { s: [], w: [], o: [], t: [] },
        keyIssues: analysisData.keyIssues || [],

        suggestions: finalData.recommendations || [],
        aiSummary: finalData.summary || "",

        marketResearchReport: {
          targetDemographic: finalData.market?.target || "",
          competitors: finalData.market?.competitors || [],
          trends: finalData.market?.trends || []
        },

        validation: analysisData.validation || { status: "WEAK" }
      };

    } catch (error) {
      console.error("AI pipeline failed:", error.message);
      return this.mockAnalysis(title, description);
    }
  }

  // ---------- STEP 1: BASIC ANALYSIS ----------
  async basicAnalysis(idea) {
    const marketData = {
      hintCompetitors: ["SimilarWeb", "Hotjar", "Crazy Egg"],
      hintTrend: "website optimization tools are growing with SaaS adoption"
    };

    const prompt = `
Act as a strict startup investor.

Analyze this idea:
${idea}

Use this context:
${JSON.stringify(marketData)}

Rules:
- Be critical
- Do NOT invent fake companies
- Keep answers short and factual

Return JSON:
{
  "validation": { "status": "", "reason": "" },
  "overallScore": number,
  "feasibilityScore": number,
  "marketScore": number,
  "innovationScore": number,
  "swot": {
    "s": [],
    "w": [],
    "o": [],
    "t": []
  },
  "keyIssues": []
}
`;

    const res = await this.callAI(prompt);
    return res;
  }

  // ---------- STEP 2: SUMMARY + SUGGESTIONS ----------
  async generateSummaryAndSuggestions(analysisData, idea) {
    const prompt = `
You are a startup advisor.

Based on this analysis:
${JSON.stringify(analysisData)}

And this idea:
${idea}

Generate:

1. Summary (3-4 sentences):
- explain problem
- explain solution
- explain value

2. Recommendations (3):
- specific
- actionable
- no generic advice

3. Market research:
- real competitors (only well-known)
- specific target users
- real trends

Return JSON:
{
  "summary": "",
  "recommendations": [],
  "market": {
    "target": "",
    "competitors": [],
    "trends": []
  }
}
`;

    const res = await this.callAI(prompt);
    return res;
  }

  // ---------- COMMON AI CALL ----------
  async callAI(prompt) {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "meta-llama/llama-3-70b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3
      },
      {
        headers: {
          Authorization: `Bearer ${this.openRouterKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    let text = response.data.choices[0].message.content;

    // Clean JSON
    text = text.replace(/```json/gi, '').replace(/```/g, '');

    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');

    if (start !== -1 && end !== -1) {
      text = text.substring(start, end + 1);
    }

    try {
      return JSON.parse(text);
    } catch (err) {
      console.error("JSON parse error:", text);
      throw new Error("Invalid AI JSON");
    }
  }

  // ---------- MOCK ----------
  mockAnalysis(title, description) {
    return {
      score: 50,
      feasibility: 50,
      market: 50,
      innovation: 50,
      swot: { s: [], w: [], o: [], t: [] },
      suggestions: ["Provide better input"],
      aiSummary: "Mock summary",
      marketResearchReport: null,
      validation: { status: "WEAK" },
      keyIssues: [],
    };
  }
}

module.exports = new AIService();