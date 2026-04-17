const fs = require('fs');
const path = require('path');

class MockDatabase {
  constructor() {
    this.users = [
      { _id: 'user_1', name: 'Alice Chen', email: 'alice@founder.com', role: 'founder' },
      { _id: 'user_2', name: 'Bob Smith', email: 'bob@investor.com', role: 'investor' }
    ];
    this.ideas = [
      {
        _id: 'seed_1',
        title: 'IoT Smart Irrigation for Small Scale Farmers',
        description: 'A low-cost IoT sensor network that helps small-scale farmers in rural areas optimize water usage using AI-driven weather predictions.',
        targetAudience: 'Rural farmers in South Asia and Africa',
        category: 'AgriTech',
        userId: 'user_1',
        createdAt: new Date('2026-04-10'),
        analysis: {
          score: 68,
          feasibility: 62,
          market: 75,
          innovation: 70,
          swot: {
            s: ['Addresses critical water scarcity', 'High innovation in specific niche', 'Leverages cutting-edge AI technology'],
            w: ['High hardware manufacturing cost', 'Internet connectivity issues in rural areas', 'High operational standards: Founders need 12.4 years of exp.'],
            o: ['Government subsidies for green tech', 'Historical AgriTech projects show a 39.6% success rate.', 'Opportunity to scale globally'],
            t: ['Low adoption rate among older farmers', 'Weather patterns becoming unpredictable', 'Financial hurdle: Avg burn rate is $120K/mo.']
          },
          suggestions: ['Partner with local NGOs for distribution', 'Develop an offline-first mobile app', 'Apply for agricultural innovation grants']
        }
      },
      {
        _id: 'seed_2',
        title: 'AI Diabetic Retinopathy Screening',
        description: 'An AI-powered mobile app that uses smartphone camera lenses to perform preliminary screening for diabetic retinopathy in areas without eye specialists.',
        targetAudience: 'Hospitals and community clinics in underserved regions',
        category: 'HealthTech',
        userId: 'user_1',
        createdAt: new Date('2026-04-12'),
        analysis: {
          score: 74,
          feasibility: 58,
          market: 82,
          innovation: 85,
          swot: {
            s: ['High accuracy compared to manual tests', 'Strong social impact', 'Stable Healthcare startups maintain 79.2% retention.'],
            w: ['FDA/Medical regulatory hurdles', 'Needs specialized lens attachments', 'Founder experience in med-tech is critical.'],
            o: ['Global increase in diabetic patients', 'Partnerships with health insurance companies', 'Historical HealthTech success rate: 42.0%'],
            t: ['Liability issues for false negatives', 'Competition from large medical equipment makers', 'Avg burn rate in Healthcare is $240K/mo.']
          },
          suggestions: ['Start a clinical trial immediately', 'Hire a Chief Medical Officer', 'Focus on B2B hospital sales']
        }
      },
      {
        _id: 'seed_3',
        title: 'Micro-Insurance for Gig Economy Workers',
        description: 'A "pay-as-you-go" insurance platform for delivery riders and freelancers that offers injury and tool insurance calculated by the hour.',
        targetAudience: 'Uber/DoorDash riders and independent contractors',
        category: 'FinTech',
        userId: 'user_1',
        createdAt: new Date('2026-04-14'),
        analysis: {
          score: 62,
          feasibility: 68,
          market: 72,
          innovation: 45,
          swot: {
            s: ['Direct solution for a massive unserved market', 'Highly scalable tech platform', 'FinTech benchmarks show strong retention.'],
            w: ['High customer acquisition cost (CAC)', 'Low profit margins per user', 'Insurance licensing is extremely difficult.'],
            o: ['Gig economy is expected to double by 2030', 'Partnership potential with delivery giants', 'Historical FinTech success rate: 41.5%'],
            t: ['Large insurance companies entering the space', 'Changes in labor laws', 'Avg Finance industry burn rate: $310K/mo.']
          },
          suggestions: ['Partner with gig platforms directly', 'Implement a referral program', 'Acquire a secondary insurance license']
        }
      },
      {
        _id: 'seed_4',
        title: 'AR Vocational Training for Technicians',
        description: 'An Augmented Reality platform that provides step-by-step 3D visual instructions for repairing complex machinery, reducing training time by 60%.',
        targetAudience: 'Manufacturing companies and technical schools',
        category: 'EdTech',
        userId: 'user_1',
        createdAt: new Date('2026-04-15'),
        analysis: {
          score: 71,
          feasibility: 75,
          market: 65,
          innovation: 78,
          swot: {
            s: ['Significantly reduces human error', 'High ROI for corporate clients', 'Stable Tech startups show high retention.'],
            w: ['Requires expensive AR hardware (HoloLens)', 'Content creation is time-consuming', 'Needs deep industry expertise.'],
            o: ['Manufacturing industry digitalization', 'Integration with existing ERP systems', 'Historical EdTech projects success: 38.4%'],
            t: ['Slow adoption in conservative industries', 'Rapid hardware obsolescence', 'Identified 2,450 competitors in Tech/Software.']
          },
          suggestions: ['Develop a tablet-based version for accessibility', 'Create a "no-code" content editor', 'Target the automotive sector first']
        }
      },
      {
        _id: 'seed_5',
        title: 'Solar-Powered Cold Storage',
        description: 'Decentralized, solar-powered refrigeration units for rural marketplaces to prevent food spoilage for small-scale juice and vegetable sellers.',
        targetAudience: 'Market committees and cooperative societies',
        category: 'GreenTech',
        userId: 'user_1',
        createdAt: new Date('2026-04-16'),
        analysis: {
          score: 59,
          feasibility: 45,
          market: 78,
          innovation: 62,
          swot: {
            s: ['Environmentally sustainable', 'Strong economic value for users', 'GreenTech benchmarks show high demand.'],
            w: ['High upfront capital expenditure', 'Maintenance in remote areas is difficult', 'Logistics of moving units is complex.'],
            o: ['Climate change funds availability', 'Carbon credit potential', 'Strategic value in food security.'],
            t: ['Cheap diesel alternatives', 'Theft of units or solar panels', 'Avg burn rate in Logistics is $85K/mo.']
          },
          suggestions: ['Implement a lease-to-own model', 'Use standard parts for easy repair', 'Focus on regions with high milk production']
        }
      },
      {
        _id: 'seed_6',
        title: 'Fetch - Social Network for Dog Owners',
        description: 'A simple app where dog owners can post photos of their pets, find local dog parks, and message other owners for playdates.',
        targetAudience: 'Dog owners in urban cities',
        category: 'Tech',
        userId: 'user_1',
        createdAt: new Date('2026-04-17'),
        analysis: {
          score: 35,
          feasibility: 85,
          market: 25,
          innovation: 15,
          swot: {
            s: ['Low technical complexity', 'Highly emotional niche', 'Clear value for lonely pet owners.'],
            w: ['No clear revenue model', 'Extremely high market saturation', 'Low innovation compared to Instagram/Facebook.'],
            o: ['Growth in pet industry spending', 'Potential for e-commerce integration', 'Partnerships with pet food brands.'],
            t: ['Identified 66,368 similar startups in Social/App categories.', 'Users stay on existing large networks.', 'High turnover rate for pet apps.']
          },
          suggestions: ['Find a unique angle like "safety first"', 'Don\'t try to be a general social network', 'Build an e-commerce marketplace']
        }
      },
      {
        _id: 'seed_7',
        title: 'WorkspaceAnywhere - Airbnb for Home Offices',
        description: 'A marketplace where remote workers can rent quiet home office spaces or meeting rooms from local residents by the hour.',
        targetAudience: 'Digital nomads and remote employees',
        category: 'SaaS',
        userId: 'user_2',
        createdAt: new Date('2026-04-17'),
        analysis: {
          score: 64,
          feasibility: 72,
          market: 68,
          innovation: 55,
          swot: {
            s: ['Low overhead for hosts', 'Direct response to remote work trends', 'Validated marketplace model.'],
            w: ['Insurance and liability risks', 'Privacy concerns for homeowners', 'Competition from WeWork and local cafes.'],
            o: ['Expansion into corporate "work-near-home" stipends', 'Integration with smart-lock technology', 'Partnerships with coffee delivery services.'],
            t: ['Zoning laws and residential regulations', 'Decline in remote work as companies return to office', 'Identified 4,103 similar startups in E-Commerce/Marketplace.']
          },
          suggestions: ['Focus on "Privacy Verified" listings', 'Offer corporate bulk-buy packages', 'Implement a strict identity verification system']
        }
      },
      {
        _id: 'seed_8',
        title: 'MedDrive - Uber for Non-Emergency Medical Transport',
        description: 'An app that connects elderly or disabled patients with certified drivers for safe, reliable transport to medical appointments.',
        targetAudience: 'Elderly patients and healthcare providers',
        category: 'Logistics',
        userId: 'user_1',
        createdAt: new Date('2026-04-17'),
        analysis: {
          score: 72,
          feasibility: 65,
          market: 85,
          innovation: 60,
          swot: {
            s: ['High demand in aging populations', 'Improved clinical outcomes through attendance', 'Leverages existing gig-economy infrastructure.'],
            w: ['High insurance premiums', 'Need for driver medical certification', 'Complex scheduling with hospital workflows.'],
            o: ['Contracts with Medicare/Medicaid', 'Expansion into prescription delivery', 'Historical Healthcare success rate: 42.0%'],
            t: ['Liability for patient health during transit', 'Competition from traditional ambulance services', 'Avg Logistics burn rate: $85K/mo.']
          },
          suggestions: ['Partner with hospital discharge departments', 'Focus on specialized vehicle accessibility', 'Invest in HIPAA-compliant communication']
        }
      },
      {
        _id: 'seed_9',
        title: 'ScienceStack - Substack for Academic Research',
        description: 'A newsletter and crowdfunding platform where scientists can publish raw research data and receive direct funding from the public/peers.',
        targetAudience: 'Researchers and science enthusiasts',
        category: 'EdTech',
        userId: 'user_2',
        createdAt: new Date('2026-04-17'),
        analysis: {
          score: 67,
          feasibility: 75,
          market: 55,
          innovation: 78,
          swot: {
            s: ['Disrupts the expensive academic journal model', 'Direct scientist-to-citizen connection', 'Blockchain-based peer review potential.'],
            w: ['Risk of misinformation or unverified claims', 'Difficulty in attracting non-specialist readers', 'Academic career pressure to publish in "reputable" journals.'],
            o: ['Open Science movement growth', 'Micro-grants for niche research areas', 'Integration with NFT data ownership.'],
            t: ['Copyright battles with legacy publishers', 'Difficulty in sustaining high-quality 2-way peer review', 'Identified 1,940 competitors in Education.']
          },
          suggestions: ['Offer a "Validated by Peer" badge system', 'Partner with university open-access initiatives', 'Include easy "Cite This" tools']
        }
      },
      {
        _id: 'seed_10',
        title: 'HireSwipe - Tinder for Tech Recruitment',
        description: 'A mobile-first recruitment app where developers and recruiters swipe on projects and profiles based on skill tags and salary ranges.',
        targetAudience: 'Software engineers and startup founders',
        category: 'Tech',
        userId: 'user_1',
        createdAt: new Date('2026-04-17'),
        analysis: {
          score: 52,
          feasibility: 82,
          market: 45,
          innovation: 30,
          swot: {
            s: ['High speed of connection', 'Reduced "recruiter spam" friction', 'Mobile-first UX for busy devs.'],
            w: ['Devaluation of complex roles', 'High risk of gender/age bias in swipe culture', 'Lack of deep-dive skill assessment.'],
            o: ['Niche focus on remote-only roles', 'Integration with Github/LeetCode profiles', 'AI-driven "perfect match" suggestions.'],
            t: ['Dominance of LinkedIn and Indeed', 'Low retention once a job is found', 'Identified 8,633 similar startups in Software.']
          },
          suggestions: ['Add a mandatory coding challenge before swiping', 'Focus on "Stealth Mode" for currently employed devs', 'Charge per match rather than per listing']
        }
      },
      {
        _id: 'seed_11',
        title: 'MindFlow - Peloton for Mental Resiliency',
        description: 'An interactive streaming platform with live "mindset" classes, guided meditation, and neurological tracking via wearable integration.',
        targetAudience: 'High-performance professionals and athletes',
        category: 'HealthTech',
        userId: 'user_2',
        createdAt: new Date('2026-04-17'),
        analysis: {
          score: 75,
          feasibility: 68,
          market: 82,
          innovation: 88,
          swot: {
            s: ['Community-driven engagement', 'Real-time biofeedback integration', 'Scalable digital content.'],
            w: ['High content production costs', 'Device fatigue among users', 'Risk of "toxic positivity" in communal wellness.'],
            o: ['Corporate wellness stipends', 'Vertical integration into specialized wearables', 'Stable Healthcare startups maintain 79.2% retention.'],
            t: ['Competition from Headspace and Calm', 'Privacy concerns over biometric data', 'Avg healthcare burn rate: $240K/mo.']
          },
          suggestions: ['Launch with "Celebrity Mindset Coaches"', 'Focus on B2B corporate partnerships', 'Include an "Offline Mode" for deep meditation']
        }
      },
      {
        _id: 'seed_12',
        title: 'CarbonPay - Stripe for Carbon Offset Credits',
        description: 'An API that allows any e-commerce store to automatically calculate and purchase carbon offsets for every transaction at checkout.',
        targetAudience: 'E-commerce merchants and conscious consumers',
        category: 'GreenTech',
        userId: 'user_1',
        createdAt: new Date('2026-04-17'),
        analysis: {
          score: 78,
          feasibility: 85,
          market: 88,
          innovation: 65,
          swot: {
            s: ['Extremely low friction for merchants', 'Automates complex calculations', 'Strong regulatory tailwinds.'],
            w: ['Complexity in verifying offset quality', 'Fluctuating carbon prices', 'Dependency on third-party verification bodies.'],
            o: ['Mandatory ESG reporting for small businesses', 'Expansion into supply chain carbon tracking', 'Historical GreenTech success rate: 45.2%'],
            t: ['Accusations of "greenwashing"', 'Integration struggles with legacy checkout systems', 'Avg Finance industry burn rate: $310K/mo.']
          },
          suggestions: ['Offer "Transparency Reports" for every offset', 'Support multiple offset standards (VCS, Gold Standard)', 'Focus on Shopify/WooCommerce integrations first']
        }
      }
    ];
    this.isInitialized = true;
    console.log(`--- Mock Database Initialized: ${this.users.length} Users, ${this.ideas.length} Ideas Seeded ---`);
  }

  // User Operations
  async userFindOne(query) {
    if (query.email) {
      return this.users.find(u => u.email === query.email) || null;
    }
    if (query._id) {
      return this.users.find(u => u._id === query._id) || null;
    }
    return null;
  }

  async userSave(userData) {
    const newUser = {
      ...userData,
      _id: userData._id || `mock_user_${Date.now()}`,
      createdAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  // Idea Operations
  async ideaFind() {
    // Return sorted by date descending
    return [...this.ideas].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  async ideaSave(ideaData) {
    const newIdea = {
      ...ideaData,
      _id: `mock_idea_${Date.now()}`,
      createdAt: new Date()
    };
    this.ideas.push(newIdea);
    return newIdea;
  }
}

module.exports = new MockDatabase();
