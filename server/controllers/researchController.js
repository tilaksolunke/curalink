const fetchPubMedArticles = require("../services/pubmed");
const fetchOpenAlexArticles = require("../services/openalex");
const fetchClinicalTrials = require("../services/clinicaltrials");

async function getResearch(req, res) {
  try {
    const { query = "", disease = "", location = "" } = req.body || {};

    if (!query.trim() && !disease.trim()) {
      return res.status(400).json({
        success: false,
        error: "At least query or disease is required.",
      });
    }

    const combinedQuery = [query, disease].filter(Boolean).join(" ").trim();

    const [pubmedPublications, openAlexPublications, trials] = await Promise.all([
      fetchPubMedArticles(query, disease),
      fetchOpenAlexArticles(query, disease),
      fetchClinicalTrials(query, disease, location),
    ]);

    const publications = [...pubmedPublications, ...openAlexPublications];
    const sortedPublications = publications.sort((a, b) => {
      const yearA = Number(a?.year) || 0;
      const yearB = Number(b?.year) || 0;
      return yearB - yearA;
    });

    const totalPublications = sortedPublications.length;
    const totalTrials = Array.isArray(trials) ? trials.length : 0;
    const top8Publications = sortedPublications.slice(0, 8);
    const top6Trials = (Array.isArray(trials) ? trials : []).slice(0, 6);

    return res.json({
      success: true,
      query: combinedQuery,
      disease,
      location,
      publications: top8Publications,
      trials: top6Trials,
      totalPublications,
      totalTrials,
    });
  } catch (error) {
    console.error("Error in getResearch:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch research data.",
    });
  }
}

module.exports = { getResearch };
