const GUIDE_TYPES = [
  "First-Time Buyer Guide",
  "TPE vs Silicone",
  "Weight & Storage",
  "Vendor Trust",
  "AI Heads",
];

const SOURCE_STATUSES = [
  "inbox",
  "discovering",
  "extracting",
  "needs_review",
  "ready",
  "rejected",
];

const NEXT_ACTION = "discover official source and important pages";

function parseSeedList(seedList) {
  return seedList
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function createSource({ id, runId, name }) {
  return {
    id,
    runId,
    name,
    sourceType: "unknown",
    officialUrl: null,
    confidence: "weak",
    status: "inbox",
    importantPages: [],
    extractableFields: [],
    blockers: [],
    ownerExperienceRelevance: "",
    nextAction: NEXT_ACTION,
  };
}

module.exports = {
  GUIDE_TYPES,
  NEXT_ACTION,
  SOURCE_STATUSES,
  createSource,
  parseSeedList,
};
