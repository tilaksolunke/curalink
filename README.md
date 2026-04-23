# Curalink — AI Medical Research Assistant

> Built for the Curalink Hackathon — A health companion that bridges the gap between patients and medical research.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://curalink.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-green)](https://curalink-birm.onrender.com)

---

## The Problem

When someone is diagnosed with a disease, they turn to Google or ChatGPT for answers. But generic AI responses are trained on massive datasets without citing real sources — leaving patients with unverified, potentially outdated information.

## The Solution

Curalink is a research-backed health companion that:
- Fetches **real, up-to-date publications** from PubMed and OpenAlex
- Finds **active clinical trials** from ClinicalTrials.gov
- Uses an **open-source LLM (LLaMA 3.1)** to reason over retrieved papers
- Delivers **structured, source-cited responses** — not generic AI answers

Every insight is traceable to a real paper. No hallucination. No guessing.

---

## Hackathon Context

This project was built for the **Curalink Medical AI Hackathon**, which challenged developers to build a full-stack AI-powered Medical Research Assistant using the MERN stack powered by a custom open-source LLM.

### Core Requirements Met
- Structured input understanding with query expansion
- Research data retrieval from PubMed, OpenAlex, ClinicalTrials.gov
- Deep retrieval (100+ results) then filtered to top 8
- Custom open-source LLM (LLaMA 3.1 via Groq)
- Context-aware multi-turn conversations
- Personalized, research-backed responses
- Full MERN stack application

---

## How It Works

```
User Query + Disease + Location
        ↓
Query Intent Detection (treatment / risk / diagnosis / mechanism)
        ↓
Parallel API Fetching with Promise.all
  ├── PubMed → 50 results
  ├── OpenAlex → 50 results
  └── ClinicalTrials.gov → 50 results
        ↓
Relevance Filtering (disease keyword scoring)
        ↓
Top 8 Publications + Top 6 Trials
        ↓
LLaMA 3.1 Reasoning (via Groq)
        ↓
Structured Response with Citations
```

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
All three data sources are fetched simultaneously using Promise.all — reducing response time significantly compared to sequential fetching.

**2. Relevance Scoring Filter**
After fetching 100+ papers, a scoring algorithm filters papers based on disease keyword presence in title (score: 3) vs abstract (score: 1). Only papers scoring 3 or above are passed to the LLM.

**3. Follow-up Context Reuse**
Follow-up questions reuse the publications saved from the first query instead of making redundant API calls. This saves time and keeps answers scoped to the original context.

**4. Query Intent Detection**
The system detects whether the user is asking about treatment, risk, diagnosis, mechanism, or clinical trials — and instructs the LLM to focus only on relevant papers.

**5. Open-Source LLM Choice**
LLaMA 3.1 8B via Groq was chosen over GPT/Gemini because it satisfies the open-source requirement, Groq inference is extremely fast, and results are grounded in retrieved papers rather than training data.

---

## Features

- Deep Retrieval — Analyzes 100+ publications before showing top 8
- Intent-Aware — Detects query intent and filters accordingly
- Context Memory — Follow-up questions use previous papers
- Location-Aware — Filters clinical trials by user location
- Source Attribution — Every claim linked to a real paper
- Multi-turn Chat — Full conversation history in MongoDB

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB
- Groq API key (free at console.groq.com)

### Installation

Clone the repository:

    git clone https://github.com/tilaksolunke/curalink.git
    cd curalink

Install server dependencies:

    cd server
    npm install

Install client dependencies:

    cd ../client
    npm install

Set up environment variables:

    cp server/.env.example server/.env

Add your GROQ_API_KEY and MONGO_URI to server/.env

Start MongoDB:

    mongod --dbpath D:/data/db

Start the server in one terminal:

    cd server
    npm run dev

Start the client in another terminal:

    cd client
    npm run dev

Open http://localhost:5173

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

## Author

Built by [Tilak Solunke](https://github.com/tilaksolunke)