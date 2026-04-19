const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const getPublicationContext = (publications) => {
  if (!Array.isArray(publications) || publications.length === 0) {
    return "No publication data provided.";
  }

  return publications
    .map((pub, index) => {
      const title = pub?.title || "";
      const authors =
        Array.isArray(pub?.authors) && pub.authors.length > 0
          ? pub.authors.slice(0, 3).join(", ")
          : "Unknown authors";
      const year = pub?.year || "Unknown year";
      const source = pub?.source || "";
      const abstractSnippet = (pub?.abstract || "").slice(0, 300);

      return `[Paper ${index + 1}]
Title: ${title}
Authors: ${authors}
Year: ${year}
Journal/Source: ${source}
Abstract: ${abstractSnippet}`;
    })
    .join("\n\n");
};

const getTrialsContext = (trials) => {
  if (!Array.isArray(trials) || trials.length === 0) {
    return "No clinical trial data provided.";
  }

  return trials
    .map((trial, index) => {
      const title = trial?.title || "Untitled trial";
      const status = trial?.status || "Unknown status";
      const eligibilitySnippet = (trial?.eligibility || "").slice(0, 150);

      return `${index + 1}. Title: ${title}\nStatus: ${status}\nEligibility Snippet: ${eligibilitySnippet}`;
    })
    .join("\n\n");
};

function detectQueryIntent(userMessage) {
  const message = userMessage.toLowerCase();
  
  const intents = {
    treatment: [
      "treatment", "therapy", "drug", "medication", "cure", 
      "treat", "therapeutic", "medicine", "prescription", "dose"
    ],
    risk: [
      "risk", "side effect", "danger", "complication", "adverse", 
      "warning", "harmful", "toxic", "safety", "concern"
    ],
    diagnosis: [
      "diagnose", "diagnosis", "detect", "test", "symptom", 
      "sign", "screening", "scan", "biopsy", "identify"
    ],
    mechanism: [
      "mechanism", "how does", "pathway", "biology", "cause", 
      "why", "process", "molecular", "genetic", "cellular"
    ],
    clinical_trials: [
      "trial", "study", "research", "experiment", "clinical", 
      "recruit", "enroll", "participate"
    ]
  };

  for (const [intent, keywords] of Object.entries(intents)) {
    if (keywords.some(keyword => message.includes(keyword))) {
      return intent;
    }
  }
  
  return "general";
}

const normalizeHistoryMessages = (conversationHistory) => {
  if (!Array.isArray(conversationHistory)) return [];

  return conversationHistory
    .slice(-6)
    .map((message) => ({
      role: message?.role === "assistant" ? "assistant" : "user",
      content: message?.content || "",
    }))
    .filter((message) => message.content);
};

async function generateResearchResponse(userMessage, disease, publications, trials, conversationHistory, isFollowUp = false) {
  try {
    const intent = detectQueryIntent(userMessage);
    
    const systemPrompt = `You are Curalink, a strict medical research assistant.
You extract and present ONLY information directly stated in the provided papers.

ABSOLUTE RULES - NEVER BREAK THESE:
1. NEVER use vague language like "may help", "promising", "suggests", "could be", "might", "potentially"
2. NEVER combine information from multiple papers into one statement
3. NEVER add external knowledge not present in the provided papers
4. NEVER use [Publication title] placeholder - use the exact paper title
5. Each insight must come from ONE specific paper only
6. If a paper's abstract does not directly address the query intent - SKIP that paper
7. If no papers are relevant - say "No relevant evidence found in retrieved papers"

CITATION FORMAT:
- Inline: (FirstAuthor et al., Year)
- Each bullet point must end with its citation

OUTPUT FORMAT FOR NEW QUERIES:
## Condition Overview
(2-3 sentences maximum, only from provided papers)

## Research Insights
(One bullet per paper, only papers relevant to query intent)
- **[Topic]**: [Exact sentence or finding from the abstract]. (Author et al., Year)

## Clinical Trials
(Only if trial data provided and relevant)

## Key Takeaways
(Maximum 4 points, each from a DIFFERENT paper, each labeled with source)
(Never repeat the same paper twice in Key Takeaways)

## Evidence Sources
[1] Full paper title — Authors (Year)
[2] Full paper title — Authors (Year)

OUTPUT FORMAT FOR FOLLOW-UP QUERIES:
- NO Condition Overview section
- Directly answer the specific follow-up question
- Only use papers relevant to the follow-up question
- Keep response focused and concise

QUERY INTENT: The user is asking about "${intent}".
Focus ONLY on ${intent}-related content from the papers.
Skip any paper not directly addressing ${intent}.`;

    const publicationsContext = getPublicationContext(publications);
    const trialsContext = getTrialsContext(trials);
    const historyMessages = normalizeHistoryMessages(conversationHistory);

    const currentUserMessage = `${isFollowUp ? "FOLLOW-UP QUESTION (use OUTPUT FORMAT FOR FOLLOW-UP QUERIES):" : "NEW QUERY (use OUTPUT FORMAT FOR NEW QUERIES):"} 
${userMessage || ""}

Disease Context:
${disease || "Not specified"}

Publications Context:
${publicationsContext}

Clinical Trials Context:
${trialsContext}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        ...historyMessages,
        { role: "user", content: currentUserMessage },
      ],
      max_tokens: 1500,
      temperature: 0.3,
    });

    return completion?.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("Error generating Groq response:", error.message);
    return "I ran into an issue generating a research response right now. Please try again.";
  }
}

module.exports = generateResearchResponse;
