const axios = require('axios');

class AIService {
  constructor() {
    this.openRouterKey = process.env.OPENROUTER_API_KEY;
  }

  async analyzeIdea(title, description, target) {
    if (!this.openRouterKey) {
      console.warn('OPENROUTER_API_KEY is missing. Using mock analysis.');
      return this.mockAnalysis(title, description);
    }

    try {
      const prompt = `
You are an expert startup advisor and idea validation AI.

Your task is to critically analyze a startup idea and provide a structured, realistic evaluation.

IMPORTANT RULES:
- Be critical, not generic
- Avoid vague phrases like "great potential"
- Focus on real-world feasibility, market demand, and risks
- Think like an investor reviewing a startup pitch
- CRITICAL: If the input consists of random keystrokes (e.g., "asdf", "ghjk"), gibberish, test data, or lacks any coherent business concept, you MUST output an overallScore, feasibilityScore, marketScore, and innovationScore of 10 or less.
- CRITICAL: For gibberish input, set validation status to "INVALID" and state in the SWOT analysis that the input is random or invalid.

Analyze the idea based on:
1. Problem clarity (Is there a real problem?)
2. Solution quality (Is the solution clear and useful?)
3. Target users (Who will use it?)
4. Feasibility (Can it be built with current technology?)
5. Market potential (Is there demand?)
6. Innovation (Is it unique or just a clone?)

Then generate a JSON response with the following exact structure:
{
  "validation": {
    "status": "VALID" | "WEAK" | "INVALID",
    "reason": "Short reason"
  },
  "overallScore": <integer 0-100>,
  "feasibilityScore": <integer 0-100>,
  "marketScore": <integer 0-100>,
  "innovationScore": <integer 0-100>,
  "aiSummary": "A 2-3 sentence clear and professional summary of the idea.",
  "marketResearchReport": {
    "targetDemographic": "Who exactly will buy this",
    "competitors": ["Competitor A", "Competitor B"],
    "marketSize": "Estimated market size/potential",
    "trends": ["Relevant Trend 1", "Relevant Trend 2"]
  },
  "swot": {
    "s": ["Strength 1", "Strength 2"],
    "w": ["Weakness 1", "Weakness 2"],
    "o": ["Opportunity 1", "Opportunity 2"],
    "t": ["Threat 1", "Threat 2"]
  },
  "keyIssues": ["Issue 1", "Issue 2"],
  "improvementSuggestions": ["Suggestion 1", "Suggestion 2", "Suggestion 3"],
  "prototypePlan": {
    "features": ["Feature 1", "Feature 2"],
    "techStack": ["Tech 1", "Tech 2"],
    "mvpSteps": ["Step 1", "Step 2"]
  }
}

NOTE: Only populate aiSummary and marketResearchReport fully if the idea is somewhat coherent. If the validation status is INVALID (e.g. gibberish), you may leave them blank or state that analysis is impossible.
Return ONLY valid JSON. Do not include markdown formatting, backticks, or any conversational text. START WITH { AND END WITH }.

Here is the idea:
Title: ${title}
Description: ${description}
Target Audience: ${target}
`;

      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
          model: "openrouter/auto", // using auto because mistral returns 404 on this key
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openRouterKey}`,
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'IdeaForge',
            'Content-Type': 'application/json'
          }
        }
      );

      let textContent = response.data.choices[0].message.content;
      
      // JSON Cleaning for Mistral
      textContent = textContent.replace(/```json/gi, '');
      textContent = textContent.replace(/```/g, '');
      const firstBrace = textContent.indexOf('{');
      const lastBrace = textContent.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        textContent = textContent.substring(firstBrace, lastBrace + 1);
      }

      const parsedData = JSON.parse(textContent);

      // Map to the frontend expected format
      return {
        score: parsedData.overallScore || 50,
        feasibility: parsedData.feasibilityScore || 50,
        market: parsedData.marketScore || 50,
        innovation: parsedData.innovationScore || 50,
        swot: parsedData.swot || { s:[], w:[], o:[], t:[] },
        suggestions: parsedData.improvementSuggestions || [],
        aiSummary: parsedData.aiSummary || "",
        marketResearchReport: parsedData.marketResearchReport || null,
        
        validation: parsedData.validation || { status: "WEAK", reason: "Could not parse fully" },
        keyIssues: parsedData.keyIssues || [],
        prototypePlan: parsedData.prototypePlan || { features: [], techStack: [], mvpSteps: [] },

        sentiment: { score: 0, magnitude: 0 },
        entities: [],
        categories: []
      };

    } catch (error) {
      console.error('OpenRouter AI Analysis Failed:', error.response?.data || error.message);
      return this.mockAnalysis(title, description);
    }
  }

  mockAnalysis(title, description) {
    console.log('Using Mock OpenRouter AI analysis');
    const isShort = (title + ' ' + description).length < 30;
    const base = isShort ? 10 : 65;

    return {
      score: base,
      feasibility: base - 5,
      market: base + 5,
      innovation: base,
      swot: isShort ? {
        s: ["None identified"],
        w: ["Text is too short", "Looks like random input", "High execution risk"],
        o: ["Provide real description"],
        t: ["Will not survive market"]
      } : {
        s: ["Clear target audience"],
        w: ["Lacks technical details", "High competition"],
        o: ["Growing market segment"],
        t: ["Existing industry players"]
      },
      suggestions: isShort ? [
        "Please provide a real, detailed startup idea.",
        "Your text is too short or looks like random input.",
        "Ensure OpenRouter API Key is working."
      ] : [
        "Please check if OpenRouter API Key is set correctly.",
        "Define your MVP features more clearly.",
        "Identify 3 direct competitors."
      ],
      aiSummary: isShort ? "" : "This is a mock summary of your startup idea. Please connect the AI to get real feedback.",
      marketResearchReport: isShort ? null : {
        targetDemographic: "Early adopters, mock target audience",
        competitors: ["Mock Competitor A", "Mock Competitor B"],
        marketSize: "Mock Market Size Data ($1B+)",
        trends: ["Mock Trend 1", "Mock Trend 2"]
      },
      validation: { status: isShort ? "INVALID" : "WEAK", reason: "API Key missing, using mock." },
      keyIssues: isShort ? ["Text too short"] : ["No API key"],
      prototypePlan: { features: [], techStack: [], mvpSteps: [] },
      sentiment: { score: 0, magnitude: 0 },
      entities: [],
      categories: []
    };
  }
}

module.exports = new AIService();
