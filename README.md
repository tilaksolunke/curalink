# Curalink - AI Medical Research Assistant

A full-stack AI-powered medical research companion built with the MERN stack.

## What it does
- Accepts user medical context (disease, location, query)
- Fetches relevant research publications from PubMed and OpenAlex
- Fetches clinical trials from ClinicalTrials.gov
- Filters and ranks results by relevance
- Generates structured, research-backed responses using LLaMA 3.1 via Groq
- Maintains conversation context across follow-up questions

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- LLM: LLaMA 3.1 (via Groq API)
- Data Sources: PubMed, OpenAlex, ClinicalTrials.gov

## Architecture
User Query -> Query Expansion -> Parallel API Fetching (PubMed + OpenAlex + ClinicalTrials) -> Relevance Filtering -> LLM Reasoning -> Structured Response

## Setup

### Prerequisites
- Node.js 18+
- MongoDB
- Groq API key (free at console.groq.com)

### Installation

1. Clone the repository
git clone https://github.com/yourusername/curalink.git
cd curalink

2. Install server dependencies
cd server
npm install

3. Install client dependencies
cd ../client
npm install

4. Set up environment variables
cp server/.env.example server/.env
Add your GROQ_API_KEY to server/.env

5. Start MongoDB
mongod --dbpath /your/db/path

6. Start the server
cd server
npm run dev

7. Start the client
cd client
npm run dev

8. Open http://localhost:5173

## API Endpoints
- POST /api/chat - Send a message and get AI response
- GET /api/chat/:sessionId - Get conversation history
- POST /api/research - Fetch research without chat

## Key Design Decisions
- Parallel API fetching with Promise.all for speed
- Relevance scoring filters papers by disease keyword in title
- Follow-up questions reuse saved publications to avoid redundant API calls
- Query intent detection focuses LLM on treatment/risk/diagnosis/mechanism
- LLaMA 3.1 8B via Groq chosen for speed, cost, and open-source compliance
