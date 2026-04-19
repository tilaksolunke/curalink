const axios = require("axios");

const OPENALEX_BASE_URL = "https://api.openalex.org/works";

const buildAbstractFromInvertedIndex = (invertedIndex) => {
  if (!invertedIndex || typeof invertedIndex !== "object") return "";

  const positionedWords = [];

  Object.entries(invertedIndex).forEach(([word, positions]) => {
    if (!Array.isArray(positions)) return;
    positions.forEach((position) => {
      if (Number.isInteger(position)) {
        positionedWords[position] = word;
      }
    });
  });

  return positionedWords.filter(Boolean).join(" ").trim();
};

const extractAuthors = (authorships) => {
  if (!Array.isArray(authorships)) return [];

  return authorships
    .map((authorship) => authorship?.author?.display_name || "")
    .filter(Boolean);
};

const normalizeWork = (work) => {
  const id = work?.id || "";
  const title = work?.title || "";
  const abstract = buildAbstractFromInvertedIndex(work?.abstract_inverted_index);
  const authors = extractAuthors(work?.authorships);
  const year = work?.publication_year || null;
  const doi = work?.doi || "";
  const landingPageUrl = work?.primary_location?.landing_page_url || "";
  const url = doi || landingPageUrl || "";

  return {
    title,
    abstract,
    authors,
    year,
    id,
    url,
    source: "OpenAlex",
  };
};

async function fetchOpenAlexArticles(query, disease) {
  try {
    const searchQuery = disease
      ? `"${disease}" ${query}`.trim()
      : query.trim();
    if (!searchQuery) return [];

    const commonParams = {
      search: searchQuery,
      "per-page": 25,
      page: 1,
      filter: "from_publication_date:2020-01-01,type:article"
    };

    const [relevanceResponse, recentResponse] = await Promise.all([
      axios.get(OPENALEX_BASE_URL, {
        params: {
          ...commonParams,
          sort: "relevance_score:desc",
        },
      }),
      axios.get(OPENALEX_BASE_URL, {
        params: {
          ...commonParams,
          sort: "publication_date:desc",
        },
      }),
    ]);

    const relevanceResults = relevanceResponse?.data?.results || [];
    const recentResults = recentResponse?.data?.results || [];

    const mergedResults = [...relevanceResults, ...recentResults];
    const deduplicatedMap = new Map();

    mergedResults.forEach((work) => {
      const normalized = normalizeWork(work);
      if (normalized.id && !deduplicatedMap.has(normalized.id)) {
        deduplicatedMap.set(normalized.id, normalized);
      }
    });

    return Array.from(deduplicatedMap.values());
  } catch (error) {
    console.error("Error fetching OpenAlex articles:", error.message);
    return [];
  }
}

module.exports = fetchOpenAlexArticles;
