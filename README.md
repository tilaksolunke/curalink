---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| LLM | LLaMA 3.1 8B via Groq API |
| Publications | PubMed API + OpenAlex API |
| Clinical Trials | ClinicalTrials.gov API v2 |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Key Engineering Decisions

**1. Parallel API Fetching**
All three data sources (PubMed, OpenAlex, ClinicalTrials) are fetched simultaneously using Promise.all — reducing response time significantly compared to sequential fetching.

**2. Relevance Scoring Filter**
After fetching 100+ papers, a scoring algorithm filters papers based on disease keyword presence in title (score: 3) vs abstract (score: 1). Only papers scoring ≥3 are passed to the LLM.

**3. Follow-up Context Reuse**
Follow-up questions reuse the publications saved from the first query instead of making redundant API calls. This saves time and keeps answers scoped to the original context.

**4. Query Intent Detection**
The system detects whether the user is asking about treatment, risk, diagnosis, mechanism, or clinical trials — and instructs the LLM to focus only on relevant papers.

**5. Open-Source LLM Choice**
LLaMA 3.1 8B via Groq was chosen over GPT/Gemini because:
- It satisfies the open-source requirement
- Groq's inference is extremely fast
- Results are grounded in retrieved papers, not training data

---

## Features

- 🔍 **Deep Retrieval** — Analyzes 100+ publications before showing top 8
- 🧠 **Intent-Aware** — Detects query intent and filters accordingly  
- 🔄 **Context Memory** — Follow-up questions use previous papers
- 📍 **Location-Aware** — Filters clinical trials by user location
- 📚 **Source Attribution** — Every claim linked to a real paper
- 💬 **Multi-turn Chat** — Full conversation history in MongoDB

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB
- Groq API key (free at console.groq.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/tilaksolunke/curalink.git
cd curalink

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Set up environment variables
cp server/.env.example server/.env
# Add your GROQ_API_KEY and MONGO_URI to server/.env

# Start MongoDB
mongod --dbpath D:/data/db

# Start server (in one terminal)
cd server
npm run dev

# Start client (in another terminal)
cd client
npm run dev

# Open http://localhost:5173
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/chat | Send message, get AI response |
| GET | /api/chat/:sessionId | Get conversation history |
| POST | /api/research | Fetch research without chat |
| GET | /api/health | Health check |

---

## Example Queries

- "Latest treatment for Parkinson's disease"
- "Clinical trials for diabetes in India"
- "What are the risks of chemotherapy for lung cancer?"
- "How does deep brain stimulation work?"
- "Recent studies on Alzheimer's disease"

---

## Screenshots

> Add screenshots here

---

## Author

Built by [Tilak Solunke](https://github.com/tilaksolunke)
