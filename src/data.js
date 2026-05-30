const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'app-db.json');
const SEED_PATH = path.join(__dirname, '..', 'data', 'seed-vendors.json');

const guideTypes = [
  'First-Time Buyer Guide',
  'TPE vs Silicone',
  'Weight & Storage',
  'Vendor Trust',
  'AI Heads'
];

const defaultFutureCounts = {
  productCandidates: 0,
  blockedSources: 0,
  readyGuideBlocks: 0,
  needsReview: 0
};

function now() {
  return new Date().toISOString();
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item';
}

function makeId(prefix, value) {
  return `${prefix}_${slugify(value)}_${Math.random().toString(36).slice(2, 8)}`;
}

function parseSeedList(seedList) {
  return String(seedList || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function loadSeeds() {
  const raw = fs.readFileSync(SEED_PATH, 'utf8');
  return JSON.parse(raw);
}

function createSource(runId, name) {
  return {
    id: makeId('src', name),
    runId,
    name,
    sourceType: 'unknown',
    officialUrl: '',
    confidence: 'weak',
    status: 'inbox',
    importantPages: '',
    extractableFields: '',
    blockers: '',
    ownerExperienceRelevance: '',
    nextAction: 'Discover official source and important pages.'
  };
}

function createWorkLog(runId, message, severity = 'info') {
  return {
    id: makeId('log', message),
    runId,
    message,
    severity,
    createdAt: now()
  };
}

function buildSeedDatabase() {
  const seeds = loadSeeds();
  const runId = 'run_extraction_001';
  const createdAt = now();
  const sources = seeds.extractionRun001.sources.map((name) => createSource(runId, name));

  return {
    extractionRuns: [
      {
        id: runId,
        title: seeds.extractionRun001.title,
        guideType: seeds.extractionRun001.guideType,
        seedList: seeds.extractionRun001.sources.join('\n'),
        status: 'draft',
        notes: 'Seed run for Issue #1 MVP. Extraction behavior intentionally untouched until Issue #2.',
        createdAt,
        updatedAt: createdAt
      }
    ],
    sources,
    productCandidates: [],
    assets: [],
    guideBlocks: [],
    workLogs: [
      createWorkLog(runId, 'Seed run created from data/seed-vendors.json.', 'complete'),
      createWorkLog(runId, 'Parsed 4 seed sources into Source rows.', 'complete')
    ],
    broaderSourceList: seeds.broaderSourceList,
    guideTypes,
    futureCounts: defaultFutureCounts
  };
}

function ensureDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    fs.writeFileSync(DB_PATH, JSON.stringify(buildSeedDatabase(), null, 2));
  }
}

function loadDatabase() {
  ensureDatabase();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function saveDatabase(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

function createExtractionRun({ title, guideType, seedList, notes = '' }) {
  const db = loadDatabase();
  const safeTitle = title && title.trim() ? title.trim() : 'Untitled Extraction Run';
  const safeGuideType = guideTypes.includes(guideType) ? guideType : 'First-Time Buyer Guide';
  const id = makeId('run', safeTitle);
  const createdAt = now();
  const names = parseSeedList(seedList);
  const sources = names.map((name) => createSource(id, name));

  db.extractionRuns.push({
    id,
    title: safeTitle,
    guideType: safeGuideType,
    seedList: names.join('\n'),
    status: 'draft',
    notes,
    createdAt,
    updatedAt: createdAt
  });
  db.sources.push(...sources);
  db.workLogs.push(createWorkLog(id, `Created extraction run: ${safeTitle}.`, 'complete'));
  db.workLogs.push(createWorkLog(id, `Parsed ${sources.length} source${sources.length === 1 ? '' : 's'} from seed list.`, 'complete'));

  saveDatabase(db);
  return { runId: id, sourceCount: sources.length };
}

function getDashboard() {
  const db = loadDatabase();
  return {
    runs: db.extractionRuns,
    counts: {
      extractionRuns: db.extractionRuns.length,
      sources: db.sources.length,
      productCandidates: db.productCandidates.length,
      blockedSources: db.sources.filter((source) => source.confidence === 'blocked' || source.status === 'needs_review').length,
      readyGuideBlocks: db.guideBlocks.filter((block) => block.status === 'ready').length,
      needsReview: db.sources.filter((source) => source.status === 'needs_review').length + db.productCandidates.filter((candidate) => candidate.recommendationStatus === 'needs_review').length
    },
    broaderSourceList: db.broaderSourceList,
    guideTypes: db.guideTypes
  };
}

function getRun(runId) {
  const db = loadDatabase();
  const run = db.extractionRuns.find((item) => item.id === runId) || db.extractionRuns[0];
  if (!run) return null;
  return {
    run,
    sources: db.sources.filter((source) => source.runId === run.id),
    workLogs: db.workLogs.filter((log) => log.runId === run.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    guideTypes: db.guideTypes
  };
}

module.exports = {
  DB_PATH,
  buildSeedDatabase,
  createExtractionRun,
  ensureDatabase,
  getDashboard,
  getRun,
  loadDatabase,
  parseSeedList,
  saveDatabase
};
