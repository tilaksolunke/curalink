const axios = require("axios");
const xml2js = require("xml2js");

const ESEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
const EFETCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi";

const getText = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return getText(value[0]);
  if (typeof value === "object" && "_" in value) return String(value._).trim();
  return "";
};

const extractAuthors = (authorList) => {
  if (!authorList || !Array.isArray(authorList)) return [];

  return authorList
    .map((author) => {
      if (!author) return "";

      // CollectiveName is used for group authors.
      const collectiveName = getText(author.CollectiveName);
      if (collectiveName) return collectiveName;

      const lastName = getText(author.LastName);
      const foreName = getText(author.ForeName || author.Initials);
      const fullName = `${foreName} ${lastName}`.trim();

      return fullName;
    })
    .filter(Boolean);
};

const extractYear = (article) => {
  const articleDateYear = getText(article?.ArticleDate?.[0]?.Year);
  if (articleDateYear) return articleDateYear;

  const pubDate = article?.Journal?.[0]?.JournalIssue?.[0]?.PubDate?.[0];
  const pubDateYear = getText(pubDate?.Year);
  if (pubDateYear) return pubDateYear;

  const medlineDate = getText(pubDate?.MedlineDate);
  const medlineYearMatch = medlineDate.match(/\b\d{4}\b/);
  return medlineYearMatch ? medlineYearMatch[0] : "";
};

const extractAbstract = (abstractArr) => {
  if (!Array.isArray(abstractArr) || !abstractArr[0]) return "";
  const abstractText = abstractArr[0].AbstractText;
  if (!Array.isArray(abstractText)) return "";

  return abstractText
    .map((part) => getText(part))
    .filter(Boolean)
    .join(" ")
    .trim();
};

async function fetchPubMedArticles(query, disease) {
  try {
    const combinedQuery = [query, disease].filter(Boolean).join(" ").trim();
    if (!combinedQuery) return [];

    const esearchResponse = await axios.get(ESEARCH_URL, {
      params: {
        db: "pubmed",
        term: combinedQuery,
        retmax: 50,
        sort: "pub date",
        retmode: "json",
      },
    });

    const idList = esearchResponse?.data?.esearchresult?.idlist || [];
    if (!Array.isArray(idList) || idList.length === 0) return [];

    const efetchResponse = await axios.get(EFETCH_URL, {
      params: {
        db: "pubmed",
        id: idList.join(","),
        retmode: "xml",
      },
    });

    const parsedXml = await xml2js.parseStringPromise(efetchResponse.data, {
      explicitArray: true,
      trim: true,
      mergeAttrs: true,
    });

    const articles = parsedXml?.PubmedArticleSet?.PubmedArticle || [];
    if (!Array.isArray(articles) || articles.length === 0) return [];

    return articles
      .map((item) => {
        const article = item?.MedlineCitation?.[0]?.Article?.[0];
        const pubmedId = getText(item?.MedlineCitation?.[0]?.PMID);
        const title = getText(article?.ArticleTitle);
        const abstract = extractAbstract(article?.Abstract);
        const authors = extractAuthors(article?.AuthorList?.[0]?.Author || []);
        const year = extractYear(article);

        return {
          title,
          abstract,
          authors,
          year,
          pubmedId,
          url: pubmedId ? `https://pubmed.ncbi.nlm.nih.gov/${pubmedId}` : "",
          source: "PubMed",
        };
      })
      .filter((publication) => publication.pubmedId || publication.title);
  } catch (error) {
    console.error("Error fetching PubMed articles:", error.message);
    if (error.response) {
      console.error("PubMed response status:", error.response.status);
      console.error("PubMed response data:", error.response.data);
    }
    return [];
  }
}

module.exports = fetchPubMedArticles;
