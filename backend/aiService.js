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
      
      const prompt = `
Act as a strict startup investor and advisor.
Analyze this idea:
${idea}

Return a single JSON object with:
1. overallScore, feasibilityScore, marketScore, innovationScore (0-100)
2. swot (s, w, o, t arrays)
3. keyIssues (array)
4. summary (3-4 sentences explaining problem, solution, value)
5. recommendations (3 specific actionable items)
6. market (target demographic, competitors list, industry trends list)
7. validation (status: "STRONG", "MODERATE", or "WEAK"; reason: short text)

Return ONLY JSON:
{
  "overallScore": 0,
  "feasibilityScore": 0,
  "marketScore": 0,
  "innovationScore": 0,
  "swot": { "s": [], "w": [], "o": [], "t": [] },
  "keyIssues": [],
  "summary": "",
  "recommendations": [],
  "market": { "target": "", "competitors": [], "trends": [] },
  "validation": { "status": "", "reason": "" }
}
`;

      const analysis = await this.callAI(prompt);

      return {
        score: analysis.overallScore || 50,
        feasibility: analysis.feasibilityScore || 50,
        market: analysis.marketScore || 50,
        innovation: analysis.innovationScore || 50,
        swot: analysis.swot || { s: [], w: [], o: [], t: [] },
        keyIssues: analysis.keyIssues || [],
        suggestions: analysis.recommendations || [],
        aiSummary: analysis.summary || "",
        marketResearchReport: {
          targetDemographic: analysis.market?.target || "",
          competitors: analysis.market?.competitors || [],
          trends: analysis.market?.trends || []
        },
        validation: analysis.validation || { status: "WEAK" }
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