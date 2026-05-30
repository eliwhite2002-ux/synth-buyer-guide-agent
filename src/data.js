const fs = require('fs');
const path = require('path');
const { candidateDefaults, normalizeProductSpecs } = require('./candidateSpecs');

const DB_PATH = process.env.SBGA_DB_PATH || path.join(__dirname, '..', 'data', 'app-db.json');
const SEED_PATH = path.join(__dirname, '..', 'data', 'seed-vendors.json');
const guideTypes = ['First-Time Buyer Guide', 'TPE vs Silicone', 'Weight & Storage', 'Vendor Trust', 'AI Heads'];
const linkTypes = ['likely_product', 'likely_category', 'vendor_source', 'support_policy', 'article_guide', 'unknown'];

function now() { return new Date().toISOString(); }
function slugify(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item'; }
function makeId(prefix, value) { return `${prefix}_${slugify(value)}_${Math.random().toString(36).slice(2, 8)}`; }
function parseSeedList(seedList) { return String(seedList || '').split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean); }
function loadSeeds() { return JSON.parse(fs.readFileSync(SEED_PATH, 'utf8')); }
function createSource(runId, name) { return { id: makeId('src', name), runId, name, sourceType: 'unknown', officialUrl: '', confidence: 'weak', status: 'inbox', importantPages: '', extractableFields: '', blockers: '', ownerExperienceRelevance: '', nextAction: 'Discover official source and important pages.' }; }
function createWorkLog(runId, message, severity = 'info') { return { id: makeId('log', message), runId, message, severity, createdAt: now() }; }
function normalizeDatabase(db) { db.productCandidates ||= []; db.assets ||= []; db.guideBlocks ||= []; db.workLogs ||= []; db.researchRecords ||= []; db.discoveryQueue ||= []; db.guidePackages ||= []; return db; }

function buildSeedDatabase() {
  const seeds = loadSeeds();
  const runId = 'run_extraction_001';
  const createdAt = now();
  return normalizeDatabase({
    extractionRuns: [{ id: runId, title: seeds.extractionRun001.title, guideType: seeds.extractionRun001.guideType, seedList: seeds.extractionRun001.sources.join('\n'), status: 'draft', notes: 'Seed run for the editorial extraction workflow.', createdAt, updatedAt: createdAt }],
    sources: seeds.extractionRun001.sources.map((name) => createSource(runId, name)),
    broaderSourceList: seeds.broaderSourceList,
    guideTypes,
    workLogs: [createWorkLog(runId, 'Seed run created from data/seed-vendors.json.', 'complete'), createWorkLog(runId, 'Parsed 4 seed sources into Source rows.', 'complete')]
  });
}

function ensureDatabase() { if (!fs.existsSync(DB_PATH)) { fs.mkdirSync(path.dirname(DB_PATH), { recursive: true }); fs.writeFileSync(DB_PATH, JSON.stringify(buildSeedDatabase(), null, 2)); } }
function loadDatabase() { ensureDatabase(); return normalizeDatabase(JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))); }
function saveDatabase(db) { fs.mkdirSync(path.dirname(DB_PATH), { recursive: true }); fs.writeFileSync(DB_PATH, JSON.stringify(normalizeDatabase(db), null, 2)); }

function createExtractionRun({ title, guideType, seedList, notes = '' }) {
  const db = loadDatabase();
  const safeTitle = title && title.trim() ? title.trim() : 'Untitled Extraction Run';
  const safeGuideType = guideTypes.includes(guideType) ? guideType : 'First-Time Buyer Guide';
  const id = makeId('run', safeTitle);
  const createdAt = now();
  const sources = parseSeedList(seedList).map((name) => createSource(id, name));
  db.extractionRuns.push({ id, title: safeTitle, guideType: safeGuideType, seedList: sources.map((source) => source.name).join('\n'), status: 'draft', notes, createdAt, updatedAt: createdAt });
  db.sources.push(...sources);
  db.workLogs.push(createWorkLog(id, `Created extraction run: ${safeTitle}.`, 'complete'), createWorkLog(id, `Parsed ${sources.length} source${sources.length === 1 ? '' : 's'} from seed list.`, 'complete'));
  saveDatabase(db);
  return { runId: id, sourceCount: sources.length };
}

function canonicalUrl(value) {
  try {
    const url = new URL(value || '');
    url.hash = '';
    url.search = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return String(value || '').trim();
  }
}
function hostFromUrl(value) { try { return new URL(value).hostname.replace(/^www\./, ''); } catch { return 'unknown source'; } }
function positiveDetectedFields(fields = {}) { return Object.entries(fields).filter(([, value]) => value === true).map(([key]) => key); }
function hasReadableEvidence(result) { const title = String(result.title || '').trim(); const description = String(result.description || '').trim(); const textSample = String(result.textSample || '').trim(); const headings = Array.isArray(result.headings) ? result.headings.filter(Boolean) : []; return Boolean(title || description || textSample || headings.length || positiveDetectedFields(result.detectedFields || {}).length); }

function classifyUrl(sourceUrl) {
  try {
    const url = new URL(sourceUrl);
    const pathName = url.pathname.toLowerCase().replace(/\/$/, '');
    const segments = pathName.split('/').filter(Boolean);
    const text = `${pathName} ${segments.join(' ')}`;
    const productSignals = ['product', 'products', 'item', 'model', 'doll', 'body'];
    const categorySignals = ['shop', 'product-category', 'collections', 'collection', 'category', 'categories'];
    const supportSignals = ['about', 'contact', 'faq', 'shipping', 'returns', 'return', 'warranty', 'care', 'privacy', 'terms', 'support'];
    const articleSignals = ['blog', 'news', 'guide', 'article', 'overview', 'top-features', 'features', 'tutorial', 'tutorials', 'factory-videos', 'videos', 'pov', 'feedback'];
    const isHomepage = segments.length === 0;
    const hasSupportSignal = segments.some((segment) => supportSignals.includes(segment));
    const hasArticleSignal = articleSignals.some((signal) => text.includes(signal));
    const hasCategorySignal = categorySignals.some((signal) => text.includes(signal));
    const hasProductSignal = segments.some((segment) => productSignals.includes(segment));
    const isLikelyProduct = !isHomepage && !hasSupportSignal && !hasArticleSignal && !hasCategorySignal && (hasProductSignal || segments.length >= 2);
    let linkType = 'unknown';
    if (isHomepage) linkType = 'vendor_source';
    else if (hasSupportSignal) linkType = 'support_policy';
    else if (hasArticleSignal) linkType = 'article_guide';
    else if (hasCategorySignal) linkType = 'likely_category';
    else if (isLikelyProduct) linkType = 'likely_product';
    return { isHomepage, isLikelyProduct, linkType };
  } catch {
    return { isHomepage: false, isLikelyProduct: false, linkType: 'unknown' };
  }
}

function normalizeLinkType(kind, url) { if (linkTypes.includes(kind)) return kind; if (kind === 'possible_product') return 'likely_product'; if (kind === 'possible_category') return 'likely_category'; return classifyUrl(url).linkType || 'unknown'; }
function canCreateCandidate(linkType) { return ['likely_product', 'likely_category'].includes(linkType); }
function shouldFeedDiscovery(linkType) { return linkType !== 'likely_product'; }
function isProductOutputCandidate(item) { return item.candidateKind === 'product_candidate' && item.productUrl && item.productUrl.includes('/product/') && Boolean(item.price || item.height || item.weight); }

function candidateBuyerFit(item) {
  const bits = [];
  if (item.height) bits.push(item.height);
  if (item.weight) bits.push(item.weight);
  if (item.material && item.material !== 'Unknown') bits.push(item.material);
  if (item.price) bits.push(item.price);
  const specText = bits.length ? bits.join(', ') : 'specs still need review';
  return `${item.productName} is a review-only candidate with ${specText}. Use it as a real product example only after checking media rights, shipping, and owner-fit context.`;
}

function candidateAvoidFlag(item) {
  const flags = [];
  if (!item.weight) flags.push('weight unverified');
  if (!item.price) flags.push('price unverified');
  if (!item.height) flags.push('height unverified');
  if ((item.imageCandidates || []).length && item.imageRights === 'unknown') flags.push('image rights unknown');
  return flags.join('; ') || 'do not recommend until human review is complete';
}

function buildGuidePackage(db) {
  const records = db.researchRecords;
  const candidates = db.productCandidates;
  const productOutputCandidates = candidates.filter(isProductOutputCandidate);
  const categoryLeads = candidates.filter((item) => item.candidateKind === 'category_candidate');
  const productCards = productOutputCandidates.map((item) => ({
    vendor: item.vendor,
    productName: item.productName,
    sourceUrl: item.productUrl,
    price: item.price || '',
    regularPrice: item.regularPrice || '',
    salePrice: item.salePrice || '',
    height: item.height || '',
    weight: item.weight || '',
    material: item.material || '',
    brand: item.brand || '',
    body: item.body || '',
    head: item.head || '',
    collection: item.collection || '',
    imageCandidateCount: (item.imageCandidates || []).length,
    recommendationStatus: item.recommendationStatus,
    reviewStatus: item.reviewStatus,
    mediaRights: item.mediaRights,
    imageRights: item.imageRights,
    buyerFit: candidateBuyerFit(item),
    avoidIf: candidateAvoidFlag(item)
  }));
  return {
    id: 'guide_package_current',
    status: 'needs_review',
    updatedAt: now(),
    evidenceRecordCount: records.length,
    candidateCount: candidates.length,
    productOutputCount: productCards.length,
    categoryLeadCount: categoryLeads.length,
    articleUpdate: `${records.length} saved extraction record${records.length === 1 ? '' : 's'}, ${productCards.length} clean product output card${productCards.length === 1 ? '' : 's'}, and ${categoryLeads.length} category/discovery lead${categoryLeads.length === 1 ? '' : 's'} are available. Verify specs and media rights before publication.`,
    comparisonRows: productCards.map((item) => ({ vendor: item.vendor, productName: item.productName, sourceUrl: item.sourceUrl, price: item.price, height: item.height, weight: item.weight, material: item.material, status: item.recommendationStatus })),
    productCards,
    categoryLeads: categoryLeads.map((item) => ({ vendor: item.vendor, title: item.productName, sourceUrl: item.productUrl, status: item.recommendationStatus })),
    articleInsert: productCards.map((item) => `- ${item.productName}: ${item.price || 'price needs verification'}, ${item.height || 'height needs verification'}, ${item.weight || 'weight needs verification'}, ${item.material || 'material needs verification'}. Source: ${item.sourceUrl}. Status: ${item.recommendationStatus}; human review required before publication.`).join('\n'),
    canvaBrief: productCards.map((item) => `Product card visual: ${item.productName}\nUse source URL: ${item.sourceUrl}\nShow: price ${item.price || 'verify'}, height ${item.height || 'verify'}, weight ${item.weight || 'verify'}, material ${item.material || 'verify'}\nBadge: Review only / not recommended yet\nImage candidates: ${item.imageCandidateCount}; rights unknown until approved`).join('\n\n')
  };
}

function findSourceForUrl(db, sourceUrl) { const host = hostFromUrl(sourceUrl).replace(/[^a-z0-9]/gi, '').toLowerCase(); return db.sources.find((source) => host.includes(slugify(source.name).replace(/-/g, ''))) || db.sources[0]; }

function upsertDiscoveryQueueItems(db, { runId, sourceId, parentResearchRecordId, parentUrl, suggestedLinks }) {
  const created = [];
  for (const link of suggestedLinks || []) {
    const url = canonicalUrl(link.url);
    if (!url) continue;
    const linkType = normalizeLinkType(link.kind, url);
    const existing = db.discoveryQueue.find((item) => canonicalUrl(item.url) === url);
    if (existing) {
      existing.parentResearchRecordId ||= parentResearchRecordId;
      existing.sourceId ||= sourceId;
      existing.label ||= link.label || url;
      existing.linkType = existing.linkType || linkType;
      existing.updatedAt = now();
      continue;
    }
    const item = { id: makeId('queue', url), runId, sourceId, parentResearchRecordId, parentUrl, url, label: link.label || url, linkType, queueStatus: 'queued', reviewStatus: 'needs_review', recommendationStatus: 'not_recommended', mediaRights: 'unknown', confidence: 'probable', blocker: '', createdAt: now(), updatedAt: now() };
    db.discoveryQueue.push(item);
    created.push(item);
  }
  return created;
}

function updateQueueForExtraction(db, { sourceUrl, confidence, blocker, candidate }) {
  const item = db.discoveryQueue.find((queueItem) => canonicalUrl(queueItem.url) === sourceUrl);
  if (!item) return null;
  item.queueStatus = candidate ? 'candidate_created' : (confidence === 'blocked' ? 'blocked' : 'extracted');
  item.reviewStatus = 'needs_review';
  item.recommendationStatus = 'not_recommended';
  item.mediaRights = 'unknown';
  item.confidence = confidence;
  item.blocker = blocker || '';
  item.updatedAt = now();
  return item;
}

function updateQueueStatus(queueId, queueStatus) {
  const allowed = ['queued', 'extracted', 'saved_source', 'ignored', 'blocked', 'candidate_created'];
  if (!allowed.includes(queueStatus)) return null;
  const db = loadDatabase();
  const item = db.discoveryQueue.find((entry) => entry.id === queueId);
  if (!item) return null;
  item.queueStatus = queueStatus;
  item.updatedAt = now();
  saveDatabase(db);
  return item;
}
function getQueueItem(queueId) { return loadDatabase().discoveryQueue.find((entry) => entry.id === queueId) || null; }

function categoryLeadCandidate({ existingCandidate, host, result, sourceUrl, run, source, record, urlClass, blocker }) {
  return {
    id: existingCandidate?.id || makeId('candidate', `${host}-${result.title || 'category'}`),
    runId: run.id,
    sourceId: source?.id || '',
    researchRecordId: record.id,
    vendor: host,
    productName: result.title || '(category page)',
    productUrl: sourceUrl,
    category: 'Category page',
    productSpecs: {},
    imageCandidates: [],
    ...candidateDefaults(urlClass.linkType),
    bestFor: 'Discovery lead only',
    ownerRisk: blocker || 'Category page. Do not use as a product example until a specific product page is extracted.',
    evidenceNotes: 'Category candidate created for discovery. It is not included in product-card JSON, article inserts, or Canva briefs.'
  };
}

function productCandidate({ existingCandidate, host, result, productSpecs, sourceUrl, run, source, record, urlClass, blocker }) {
  const mappedSpecs = normalizeProductSpecs(productSpecs);
  return {
    id: existingCandidate?.id || makeId('candidate', `${host}-${result.title || 'page'}`),
    runId: run.id,
    sourceId: source?.id || '',
    researchRecordId: record.id,
    vendor: host,
    productName: mappedSpecs.productName || result.title || '(no readable title)',
    productUrl: sourceUrl,
    category: 'Product page',
    ...mappedSpecs,
    ...candidateDefaults(urlClass.linkType),
    bestFor: 'Pending evidence review',
    ownerRisk: blocker || 'Specs and media rights remain unverified.',
    evidenceNotes: 'Product candidate created from saved extraction evidence. Human review required.'
  };
}

function saveExtractionResult(result) {
  const db = loadDatabase();
  const run = db.extractionRuns[0];
  const sourceUrl = canonicalUrl(result.targetUrl || '');
  const host = hostFromUrl(sourceUrl);
  const source = findSourceForUrl(db, sourceUrl);
  const extractedAt = result.completedAt || now();
  const verificationStatus = 'needs_review';
  const readableEvidence = hasReadableEvidence(result);
  const confidence = result.ok && readableEvidence ? 'probable' : 'blocked';
  const blocker = result.blocker || (readableEvidence ? '' : 'No readable text evidence captured. Treat as access-wall/unreadable-page candidate.');
  const detected = result.detectedFields || {};
  const fields = positiveDetectedFields(detected);
  const urlClass = classifyUrl(sourceUrl);
  const evidenceKind = canCreateCandidate(urlClass.linkType) ? 'product_candidate' : 'vendor_source';
  const suggestedLinks = Array.isArray(result.suggestedLinks) ? result.suggestedLinks : [];
  const productSpecs = result.productSpecs || {};

  const existingRecord = db.researchRecords.find((record) => canonicalUrl(record.sourceUrl) === sourceUrl);
  const record = { id: existingRecord?.id || makeId('research', sourceUrl), runId: run.id, sourceId: source?.id || '', sourceUrl, adapter: 'live_fetch', evidenceKind, suggestedLinks, extractedAt, confidence, verificationStatus, blocker, evidence: { title: result.title || '', description: result.description || '', headings: result.headings || [], detectedFields: detected, productSpecs, textSample: result.textSample || '', statusCode: result.statusCode || null } };
  if (existingRecord) Object.assign(existingRecord, record); else db.researchRecords.push(record);

  if (source) {
    source.officialUrl = sourceUrl;
    source.confidence = confidence;
    source.status = 'needs_review';
    source.importantPages = sourceUrl;
    source.extractableFields = fields.join(', ') || 'none detected';
    source.blockers = blocker;
    source.nextAction = readableEvidence ? (canCreateCandidate(urlClass.linkType) ? 'Review product/category evidence, verify specs, and classify media rights.' : 'Vendor/source page captured. Next: process Discovery Queue links.') : 'Try a reader/browser extraction or a specific product/category URL; this page did not expose readable evidence.';
  }

  if (readableEvidence && shouldFeedDiscovery(urlClass.linkType)) upsertDiscoveryQueueItems(db, { runId: run.id, sourceId: source?.id || '', parentResearchRecordId: record.id, parentUrl: sourceUrl, suggestedLinks });

  let candidate = null;
  let candidateAction = 'no product candidate created';
  if (canCreateCandidate(urlClass.linkType) && readableEvidence) {
    const existingCandidate = db.productCandidates.find((item) => canonicalUrl(item.productUrl) === sourceUrl);
    candidate = urlClass.linkType === 'likely_category'
      ? categoryLeadCandidate({ existingCandidate, host, result, sourceUrl, run, source, record, urlClass, blocker })
      : productCandidate({ existingCandidate, host, result, productSpecs, sourceUrl, run, source, record, urlClass, blocker });
    if (existingCandidate) {
      Object.assign(existingCandidate, candidate);
      candidateAction = `updated review-only ${candidate.candidateKind} card`;
    } else {
      db.productCandidates.push(candidate);
      candidateAction = `created review-only ${candidate.candidateKind} card`;
    }
  }

  updateQueueForExtraction(db, { sourceUrl, confidence, blocker, candidate });
  db.guidePackages = [buildGuidePackage(db)];
  run.status = 'needs_review';
  run.updatedAt = extractedAt;
  db.workLogs.push(createWorkLog(run.id, `${existingRecord ? 'Updated' : 'Saved'} ${evidenceKind} evidence for ${sourceUrl}; ${candidateAction}.`, confidence === 'blocked' ? 'blocked' : 'warning'));
  saveDatabase(db);
  return { record, candidate, guidePackage: db.guidePackages[0] };
}

function getResearchState() { const db = loadDatabase(); return { researchRecords: db.researchRecords.slice().reverse(), discoveryQueue: db.discoveryQueue.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)), productCandidates: db.productCandidates.slice().reverse(), guidePackage: db.guidePackages[0] || buildGuidePackage(db) }; }
function getDashboard() { const db = loadDatabase(); return { runs: db.extractionRuns, counts: { extractionRuns: db.extractionRuns.length, sources: db.sources.length, productCandidates: db.productCandidates.length, blockedSources: db.sources.filter((source) => source.confidence === 'blocked').length, readyGuideBlocks: db.guideBlocks.filter((block) => block.status === 'ready').length, needsReview: db.sources.filter((source) => source.status === 'needs_review').length + db.productCandidates.filter((candidate) => candidate.reviewStatus === 'needs_review' || candidate.recommendationStatus === 'needs_review').length }, broaderSourceList: db.broaderSourceList, guideTypes: db.guideTypes }; }
function getRun(runId) { const db = loadDatabase(); const run = db.extractionRuns.find((item) => item.id === runId) || db.extractionRuns[0]; if (!run) return null; return { run, sources: db.sources.filter((source) => source.runId === run.id), workLogs: db.workLogs.filter((log) => log.runId === run.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt)), guideTypes: db.guideTypes }; }

module.exports = { DB_PATH, buildSeedDatabase, canCreateCandidate, classifyUrl, createExtractionRun, ensureDatabase, getDashboard, getQueueItem, getResearchState, getRun, loadDatabase, parseSeedList, saveDatabase, saveExtractionResult, updateQueueStatus };
