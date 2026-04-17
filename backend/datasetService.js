const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

class DatasetService {
  constructor() {
    this.studentData = [];
    this.bigStartupData = [];
    this.failureData = [];
    this.isLoaded = false;
    
    // Domain mapping for the Student dataset
    this.domainKeywords = {
      'AgriTech': ['agriculture', 'farm', 'food', 'crop', 'irrigation', 'rural'],
      'FinTech': ['finance', 'money', 'payment', 'bank', 'wallet', 'crypto', 'trading'],
      'GreenTech': ['environment', 'energy', 'solar', 'waste', 'recycling', 'carbon', 'clean'],
      'HealthTech': ['health', 'medical', 'hospital', 'doctor', 'patient', 'wellness', 'biotech'],
      'EdTech': ['education', 'learning', 'student', 'school', 'course', 'teaching', 'coding']
    };

    // Category mapping for the Big dataset
    this.categoryKeywords = {
      'Software': ['software', 'saas', 'enterprise', 'cloud'],
      'Mobile': ['mobile', 'app', 'ios', 'android', 'handheld'],
      'E-Commerce': ['shopping', 'retail', 'marketplace', 'store'],
      'Biotechnology': ['bio', 'genetics', 'pharma', 'lab'],
      'Social Media': ['social', 'network', 'community', 'messaging'],
      'Finance': ['finance', 'fintech', 'investment', 'banking']
    };

    // Industry mapping for the Failure Prediction dataset
    this.industryKeywords = {
      'AI/ML': ['ai', 'ml', 'intelligence', 'automation', 'data'],
      'E-commerce': ['shopping', 'retail', 'store', 'marketplace'],
      'Education': ['school', 'learning', 'student', 'teach'],
      'Finance': ['bank', 'money', 'payment', 'crypto', 'invest'],
      'Healthcare': ['health', 'doctor', 'medical', 'patient'],
      'Logistics': ['delivery', 'shipping', 'warehouse', 'truck'],
      'Tech': ['software', 'cloud', 'internet', 'hardware']
    };
  }

  /**
   * Initialize and load datasets into memory
   */
  async init() {
    if (this.isLoaded) return;

    try {
      this.studentData = await this.loadCSV(path.join(__dirname, 'data', 'student_startup_success_dataset.csv'));
      this.bigStartupData = await this.loadCSV(path.join(__dirname, 'data', 'big_startup_secsees_dataset.csv'));
      this.failureData = await this.loadCSV(path.join(__dirname, 'data', 'startup_failure_prediction.csv'));
      this.isLoaded = true;
      console.log(`--- Datasets Loaded: Student (${this.studentData.length}), Big Startup (${this.bigStartupData.length}), Failure Pred (${this.failureData.length}) ---`);
    } catch (error) {
      console.error('Error loading datasets:', error.message);
      // Fallback to empty datasets if files are missing
      this.studentData = this.studentData || [];
      this.bigStartupData = this.bigStartupData || [];
      this.failureData = this.failureData || [];
    }
  }

  /**
   * Helper to load CSV file
   */
  loadCSV(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (err) => reject(err));
    });
  }

  /**
   * Analyze an idea and return data-driven insights
   */
  async getInsights(title, description) {
    await this.init();
    
    const text = (title + ' ' + description).toLowerCase();
    
    // 1. Identify Domain/Category
    const matchedDomains = Object.keys(this.domainKeywords).filter(domain => 
      this.domainKeywords[domain].some(kw => text.includes(kw))
    );
    
    const matchedIndustries = Object.keys(this.industryKeywords).filter(ind => 
      this.industryKeywords[ind].some(kw => text.includes(kw))
    );

    // 2. Statistical Insights from Student Dataset
    let studentStats = null;
    if (matchedDomains.length > 0) {
      const domain = matchedDomains[0];
      const similarProjects = this.studentData.filter(d => d.project_domain === domain);
      
      if (similarProjects.length > 0) {
        const successes = similarProjects.filter(d => d.success_label === '1').length;
        const total = similarProjects.length;
        const successRate = ((successes / total) * 100).toFixed(1);
        const avgInnovation = (similarProjects.reduce((acc, curr) => acc + parseFloat(curr.innovation_score || 0), 0) / total).toFixed(2);
        
        studentStats = {
          domain,
          successRate,
          avgInnovation,
          totalProjects: total
        };
      }
    }

    // 3. Competitive Insights from Big Startup Dataset
    let bigStats = null;
    if (matchedCategories.length > 0) {
      const category = matchedCategories[0];
      const competitors = this.bigStartupData.filter(d => 
        d.category_list && d.category_list.toLowerCase().includes(category.toLowerCase())
      );
      
      if (competitors.length > 0) {
        const operatingCount = competitors.filter(d => d.status === 'operating').length;
        const totalFunding = competitors.reduce((acc, curr) => acc + (parseFloat(curr.funding_total_usd) || 0), 0);
        const avgFunding = (totalFunding / competitors.length).toFixed(0);
        
        bigStats = {
          category,
          competitorCount: competitors.length,
          operatingCount,
          avgFunding
        };
      }
    }

    // 4. Failure Benchmarks from Prediction Dataset
    let failureStats = null;
    if (matchedIndustries.length > 0) {
      const industry = matchedIndustries[0];
      const similarStartups = this.failureData.filter(d => d.Industry === industry);
      
      if (similarStartups.length > 0) {
        const avgExp = (similarStartups.reduce((acc, curr) => acc + parseInt(curr.Founder_Experience || 0), 0) / similarStartups.length).toFixed(1);
        const avgBurn = (similarStartups.reduce((acc, curr) => acc + parseFloat(curr.Burn_Rate || 0), 0) / similarStartups.length).toFixed(0);
        const avgRetention = (similarStartups.reduce((acc, curr) => acc + parseFloat(curr.Customer_Retention_Rate || 0), 0) / similarStartups.length).toFixed(1);

        failureStats = {
          industry,
          avgExp,
          avgBurn,
          avgRetention,
          count: similarStartups.length
        };
      }
    }

    return {
      studentStats,
      bigStats,
      failureStats,
      matchedDomains,
      matchedCategories,
      matchedIndustries
    };
  }

  /**
   * Format insights into human-readable SWOT components
   */
  async getSwotData(title, description) {
    const insights = await this.getInsights(title, description);
    const swotAdditions = { s: [], w: [], o: [], t: [] };

    if (insights.studentStats) {
      swotAdditions.o.push(`Historical ${insights.studentStats.domain} projects show a ${insights.studentStats.successRate}% success rate.`);
      swotAdditions.s.push(`Based on ${insights.studentStats.totalProjects} student startups, the average innovation score in ${insights.studentStats.domain} is ${insights.studentStats.avgInnovation}.`);
    }

    if (insights.bigStats) {
      swotAdditions.t.push(`Identified ${insights.bigStats.competitorCount} similar startups in the ${insights.bigStats.category} category.`);
      swotAdditions.o.push(`Strong funding environment: Average total investment for ${insights.bigStats.category} startups is around $${this.formatCurrency(insights.bigStats.avgFunding)}.`);
      
      if (insights.bigStats.competitorCount > 1000) {
        swotAdditions.w.push(`High market saturation in the global ${insights.bigStats.category} landscape.`);
      }
    }

    if (insights.failureStats) {
      swotAdditions.s.push(`Stable ${insights.failureStats.industry} startups typically maintain a ${insights.failureStats.avgRetention}% customer retention rate.`);
      swotAdditions.w.push(`High operational standards: Successful ${insights.failureStats.industry} founders have an average of ${insights.failureStats.avgExp} years of experience.`);
      swotAdditions.t.push(`Financial hurdle: Average burn rate for established ${insights.failureStats.industry} companies is around $${this.formatCurrency(insights.failureStats.avgBurn)}/mo.`);
    }

    return swotAdditions;
  }

  formatCurrency(value) {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
    return value;
  }
}

module.exports = new DatasetService();
