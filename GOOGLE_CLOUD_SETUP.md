# Google Cloud AI Setup Guide

## 🚀 Real AI Analysis Setup

Your project now supports **real Google Cloud AI analysis** instead of mock data! Follow these steps to enable it.

---

## 📋 Prerequisites

1. **Google Cloud Account** - [Create one here](https://cloud.google.com/)
2. **Billing Enabled** - Required for AI APIs
3. **Google Cloud CLI** - [Install here](https://cloud.google.com/sdk/docs/install)

---

## 🛠️ Step-by-Step Setup

### 1. Create Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project
gcloud projects create ideaforge-ai-project

# Set as default project
gcloud config set project ideaforge-ai-project
```

### 2. Enable Required APIs

```bash
# Enable Natural Language API
gcloud services enable language.googleapis.com

# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com

# Enable Cloud Resource Manager API
gcloud services enable cloudresourcemanager.googleapis.com
```

### 3. Create Service Account

```bash
# Create service account
gcloud iam service-accounts create ideaforge-ai-sa \
  --description="Service account for IdeaForge AI analysis" \
  --display-name="IdeaForge AI Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding ideaforge-ai-project \
  --member="serviceAccount:ideaforge-ai-sa@ideaforge-ai-project.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

gcloud projects add-iam-policy-binding ideaforge-ai-project \
  --member="serviceAccount:ideaforge-ai-sa@ideaforge-ai-project.iam.gserviceaccount.com" \
  --role="roles/language.user"
```

### 4. Generate Service Account Key

```bash
# Generate key file
gcloud iam service-accounts keys create service-account-key.json \
  --iam-account=ideaforge-ai-sa@ideaforge-ai-project.iam.gserviceaccount.com
```

### 5. Configure Your Project

1. **Move the key file** to your backend folder:
   ```bash
   # Copy the downloaded service-account-key.json to:
   backend/service-account-key.json
   ```

2. **Update environment variables** in `backend/.env`:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
   GOOGLE_CLOUD_PROJECT=ideaforge-ai-project
   ```

---

## 🧪 Testing the Setup

### 1. Test AI Status Endpoint

```bash
# Start your backend server
cd backend
node server.js

# Test AI services (in another terminal)
curl http://localhost:5000/api/ai-status
```

**Expected Response (AI Working):**
```json
{
  "status": "available",
  "message": "Google Cloud AI services are working",
  "testResult": {
    "score": 85,
    "hasSWOT": true
  }
}
```

**Response (AI Not Working - Mock Fallback):**
```json
{
  "status": "unavailable",
  "message": "Google Cloud AI services not available, using mock analysis"
}
```

### 2. Test Idea Analysis

```bash
curl -X POST http://localhost:5000/api/analyze-idea \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI-Powered Health Diagnostics for Rural Areas",
    "description": "A mobile app that uses AI to provide preliminary health diagnostics in remote areas where doctors are scarce",
    "target": "Rural communities in developing countries"
  }'
```

---

## 💰 Google Cloud Pricing

### Free Tier Limits:
- **Natural Language API**: 5,000 units/month free
- **Vertex AI (Gemini)**: 60 requests/minute free, then $0.0018/request

### Cost Estimation:
- **Per idea analysis**: ~$0.002-0.005
- **100 analyses/month**: ~$0.50
- **1000 analyses/month**: ~$5.00

---

## 🔧 Troubleshooting

### Common Issues:

**1. "Permission denied" error**
```
Solution: Check service account permissions and key file path
```

**2. "API not enabled" error**
```
Solution: Enable the required APIs in Google Cloud Console
```

**3. "Invalid credentials" error**
```
Solution: Regenerate service account key and update .env file
```

**4. "Project not found" error**
```
Solution: Verify GOOGLE_CLOUD_PROJECT in .env matches your project ID
```

### Debug Commands:

```bash
# Check if credentials are valid
gcloud auth application-default print-access-token

# List enabled APIs
gcloud services list --enabled

# Check project info
gcloud config get-value project
```

---

## 🎯 What the AI Analysis Does

### Real AI Features:
- ✅ **Sentiment Analysis** - Analyzes positivity of idea description
- ✅ **Entity Recognition** - Identifies people, organizations, locations
- ✅ **Content Classification** - Categorizes business domains
- ✅ **SWOT Generation** - Uses Gemini AI to create custom SWOT analysis
- ✅ **Smart Scoring** - Calculates feasibility, market fit, innovation scores
- ✅ **Actionable Suggestions** - Provides next steps based on analysis

### Fallback (if Google Cloud fails):
- ⚠️ **Mock Analysis** - Random scores and generic SWOT
- ⚠️ **No Real AI** - Just like before setup

---

## 📊 API Endpoints

### `POST /api/analyze-idea`
Analyzes an idea using Google Cloud AI.

**Request:**
```json
{
  "title": "Your Idea Title",
  "description": "Detailed description of your idea",
  "target": "Target audience or market"
}
```

**Response:**
```json
{
  "success": true,
  "analysis": {
    "score": 87,
    "feasibility": 82,
    "market": 89,
    "innovation": 88,
    "swot": {
      "s": ["Clear value proposition", "Strong market need"],
      "w": ["Technical complexity", "Regulatory hurdles"],
      "o": ["Growing healthcare market", "Government support"],
      "t": ["Competition from tech giants", "Data privacy concerns"]
    },
    "sentiment": { "score": 0.8, "magnitude": 1.2 },
    "entities": ["Healthcare", "AI", "Rural Areas"],
    "categories": ["Technology", "Healthcare"],
    "suggestions": [
      "Conduct pilot study in 3 rural clinics",
      "Partner with local healthcare providers",
      "Develop data privacy compliance framework"
    ]
  }
}
```

### `GET /api/ai-status`
Checks if Google Cloud AI services are available.

---

## 🚀 Next Steps

1. **Complete Google Cloud setup** (follow steps above)
2. **Test the AI analysis** in your app
3. **Monitor usage** in Google Cloud Console
4. **Set up billing alerts** to avoid unexpected charges

---

## 📞 Support

- **Google Cloud Documentation**: https://cloud.google.com/docs
- **Vertex AI Guide**: https://cloud.google.com/vertex-ai/docs
- **Natural Language API**: https://cloud.google.com/natural-language/docs

---

**Status**: Ready for Google Cloud AI Integration! 🎉