const Conversation = require("../models/Conversation");
const fetchPubMedArticles = require("../services/pubmed");
const fetchOpenAlexArticles = require("../services/openalex");
const fetchClinicalTrials = require("../services/clinicaltrials");
const generateResearchResponse = require("../services/groq");

function filterRelevantPublications(publications, disease, query) {
  if (!disease) return publications;

  const diseaseKeywords = disease.toLowerCase()
    .split(" ")
    .filter(word => word.length > 3);

  const scored = publications.map(pub => {
    const titleLower = (pub.title || "").toLowerCase();
    const abstractLower = (pub.abstract || "").toLowerCase();
    
    let score = 0;
    
    // Title match scores higher than abstract match
    diseaseKeywords.forEach(keyword => {
      if (titleLower.includes(keyword)) score += 3;
      if (abstractLower.includes(keyword)) score += 1;
    });

    return { ...pub, _relevanceScore: score };
  });

  // Only keep papers with score >= 3, sort by score descending
  return scored
    .filter(pub => pub._relevanceScore >= 3)
    .sort((a, b) => b._relevanceScore - a._relevanceScore);
}

async function chat(req, res) {
  try {
    const {
      message = "",
      disease = "",
      location = "",
      sessionId: incomingSessionId = "",
    } = req.body || {};

    if (!message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message is required.",
      });
    }

    const sessionId = incomingSessionId || Date.now().toString();

    let conversation = await Conversation.findOne({ sessionId });

    if (!conversation) {
      conversation = new Conversation({
        sessionId,
        disease,
        location,
      });
    } else if (disease && !conversation.disease) {
      conversation.disease = disease;
    }

    const isFollowUp = conversation.messages.length > 0;

    let publications, topTrials, meta;

    if (isFollowUp) {
      // Use existing publications and trials from conversation
      publications = conversation.publications || [];
      topTrials = conversation.trials || [];
      
      meta = {
        totalPublicationsFetched: publications.length,
        totalTrialsFetched: topTrials.length,
        publicationsShown: publications.length,
        trialsShown: topTrials.length,
        isFollowUp: true
      };
    } else {
      // First message - fetch from all APIs
      const historyPromise = Promise.resolve(
        Array.isArray(conversation.messages) ? conversation.messages.slice(-6) : []
      );

      const [pubmedPublications, openAlexPublications, trials, history] = await Promise.all([
        fetchPubMedArticles(message, disease),
        fetchOpenAlexArticles(message, disease),
        fetchClinicalTrials(message, disease, location),
        historyPromise,
      ]);

      const filteredPublications = filterRelevantPublications(
        [...pubmedPublications, ...openAlexPublications],
        disease,
        message
      );

      publications = filteredPublications
        .sort((a, b) => (Number(b?.year) || 0) - (Number(a?.year) || 0))
        .slice(0, 8);

      console.log("Filtered publications count:", publications.length);
      console.log("Publication titles:", publications.map(p => p.title));

      topTrials = (Array.isArray(trials) ? trials : []).slice(0, 6);

      // Save publications and trials to conversation
      conversation.publications = publications;
      conversation.trials = topTrials;

      meta = {
        totalPublicationsFetched: pubmedPublications.length + openAlexPublications.length,
        totalTrialsFetched: trials.length,
        publicationsShown: publications.length,
        trialsShown: topTrials.length,
        isFollowUp: false
      };
    }

    const history = Array.isArray(conversation.messages) ? conversation.messages.slice(-6) : [];

    const aiResponse = await generateResearchResponse(
      message,
      disease,
      publications,
      topTrials,
      history,
      isFollowUp
    );

    conversation.messages.push(
      { role: "user", content: message },
      { role: "assistant", content: aiResponse }
    );

    await conversation.save();

    return res.json({
      success: true,
      sessionId,
      response: aiResponse,
      publications,
      trials: topTrials,
      meta,
      disease,
      location,
    });
  } catch (error) {
    console.error("Error in chat controller:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to process chat request.",
    });
  }
}

module.exports = { chat };
