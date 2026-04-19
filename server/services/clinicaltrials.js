const axios = require("axios");

const CLINICAL_TRIALS_BASE_URL = "https://clinicaltrials.gov/api/v2/studies";

const extractLocations = (locations) => {
  if (!Array.isArray(locations)) return [];

  return locations
    .map((location) => ({
      city: location?.city || "",
      country: location?.country || "",
    }))
    .filter((location) => location.city || location.country);
};

const extractContact = (centralContacts) => {
  if (!Array.isArray(centralContacts) || !centralContacts[0]) {
    return { name: "", phone: "", email: "" };
  }

  const firstContact = centralContacts[0];
  return {
    name: firstContact?.name || "",
    phone: firstContact?.phone || "",
    email: firstContact?.email || "",
  };
};

const normalizeStudy = (study) => {
  const protocolSection = study?.protocolSection || {};
  const identificationModule = protocolSection?.identificationModule || {};
  const statusModule = protocolSection?.statusModule || {};
  const eligibilityModule = protocolSection?.eligibilityModule || {};
  const contactsLocationsModule = protocolSection?.contactsLocationsModule || {};

  const nctId = identificationModule?.nctId || "";

  return {
    title: identificationModule?.briefTitle || "",
    status: statusModule?.overallStatus || "",
    eligibility: eligibilityModule?.eligibilityCriteria || "",
    locations: extractLocations(contactsLocationsModule?.locations),
    contact: extractContact(contactsLocationsModule?.centralContacts),
    nctId,
    url: nctId ? `https://clinicaltrials.gov/study/${nctId}` : "",
    source: "ClinicalTrials",
  };
};

async function fetchClinicalTrials(query, disease, location) {
  try {
    if (!query && !disease) return [];

    const commonParams = {
      "query.cond": disease || "",
      "query.term": query || "",
      pageSize: 25,
      format: "json",
    };

    const recruitingParams = {
      ...commonParams,
      "filter.overallStatus": "RECRUITING",
    };
    
    const completedParams = {
      ...commonParams,
      "filter.overallStatus": "COMPLETED",
    };
    
    if (location) {
      recruitingParams["query.locn"] = location;
      completedParams["query.locn"] = location;
    }

    const [recruitingResponse, completedResponse] = await Promise.all([
      axios.get(CLINICAL_TRIALS_BASE_URL, {
        params: recruitingParams,
      }),
      axios.get(CLINICAL_TRIALS_BASE_URL, {
        params: completedParams,
      }),
    ]);

    const recruitingStudies = recruitingResponse?.data?.studies || [];
    const completedStudies = completedResponse?.data?.studies || [];
    const mergedStudies = [...recruitingStudies, ...completedStudies];

    const deduplicatedMap = new Map();

    mergedStudies.forEach((study) => {
      const normalized = normalizeStudy(study);
      if (normalized.nctId && !deduplicatedMap.has(normalized.nctId)) {
        deduplicatedMap.set(normalized.nctId, normalized);
      }
    });

    return Array.from(deduplicatedMap.values());
  } catch (error) {
    console.error("Error fetching ClinicalTrials studies:", error.message);
    return [];
  }
}

module.exports = fetchClinicalTrials;
