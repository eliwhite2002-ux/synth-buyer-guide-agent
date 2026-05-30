const path = require('path');
process.env.SBGA_DB_PATH = path.join(__dirname, 'tmp-test-db.json');
const assert = require('assert');
const fs = require('fs');
const { buildSeedDatabase, createExtractionRun, getDashboard, getResearchState, getRun, parseSeedList, saveDatabase, saveExtractionResult } = require('../src/data');
function resetDatabase() { saveDatabase(buildSeedDatabase()); }
function cleanup() { if (fs.existsSync(process.env.SBGA_DB_PATH)) fs.unlinkSync(process.env.SBGA_DB_PATH); }
function fixture(targetUrl, overrides = {}) { return { ok: true, targetUrl, title: 'Model One', description: 'Silicone product with weight, shipping, and care details.', headings: ['Model One'], detectedFields: { mentionsWeight: true, mentionsMaterial: true, mentionsShipping: true }, textSample: 'Model One silicone weight shipping care', completedAt: new Date().toISOString(), ...overrides }; }
function runTests() {
  cleanup(); resetDatabase();
  assert.deepStrictEqual(parseSeedList('A\nB, C\n\nD'), ['A', 'B', 'C', 'D']);
  const dashboard = getDashboard(); assert.strictEqual(dashboard.counts.extractionRuns, 1); assert.strictEqual(dashboard.counts.sources, 4); assert.strictEqual(dashboard.counts.productCandidates, 0);
  const seedRun = getRun('run_extraction_001'); assert(seedRun); assert.strictEqual(seedRun.sources.length, 4); assert(seedRun.workLogs.length >= 2);
  const result = createExtractionRun({ title: 'Test Run', guideType: 'Vendor Trust', seedList: 'Alpha Dolls\nBeta Dolls', notes: 'Test note' }); assert(result.runId); assert.strictEqual(result.sourceCount, 2); assert.strictEqual(getRun(result.runId).sources.length, 2);
  const productSpecs = { price: '$1,935.00', regularPrice: '$2,150.00', salePrice: '$1,935.00', brand: 'TAYU Doll', body: 'TAYU NOVA Series 158cm C Cup', head: 'QingZhi', collection: 'NOVA Series', bodyWeight: '31kg / 68 lbs', height: '158cm / 5’2”', material: 'Silicone', imageCandidates: [{ url: 'https://example.com/model-one.jpg', label: 'Model One' }] };
  const saved = saveExtractionResult(fixture('https://example.com/product/model-one', { productSpecs }));
  assert.strictEqual(saved.record.verificationStatus, 'needs_review'); assert.deepStrictEqual(saved.record.evidence.productSpecs, productSpecs);
  assert.strictEqual(saved.candidate.reviewOnly, true); assert.strictEqual(saved.candidate.queueStatus, 'candidate_created'); assert.strictEqual(saved.candidate.reviewStatus, 'needs_review'); assert.strictEqual(saved.candidate.recommendationStatus, 'not_recommended'); assert.strictEqual(saved.candidate.mediaRights, 'unknown'); assert.strictEqual(saved.candidate.imageRights, 'unknown');
  assert.strictEqual(saved.candidate.productName, 'Model One'); assert.strictEqual(saved.candidate.price, '$1,935.00'); assert.strictEqual(saved.candidate.regularPrice, '$2,150.00'); assert.strictEqual(saved.candidate.salePrice, '$1,935.00'); assert.strictEqual(saved.candidate.brand, 'TAYU Doll'); assert.strictEqual(saved.candidate.body, 'TAYU NOVA Series 158cm C Cup'); assert.strictEqual(saved.candidate.head, 'QingZhi'); assert.strictEqual(saved.candidate.collection, 'NOVA Series'); assert.strictEqual(saved.candidate.height, '158cm / 5’2”'); assert.strictEqual(saved.candidate.weight, '31kg / 68 lbs'); assert.strictEqual(saved.candidate.material, 'Silicone'); assert.strictEqual(saved.candidate.imageCandidates.length, 1); assert.strictEqual(saved.candidate.candidateKind, 'product_candidate');
  const category = saveExtractionResult(fixture('https://example.com/product-category/silicone', { title: 'Silicone Collection' })); assert.strictEqual(category.candidate.candidateKind, 'category_candidate'); assert.strictEqual(category.candidate.recommendationStatus, 'not_recommended');
  const beforeGuide = getResearchState().productCandidates.length; const guide = saveExtractionResult(fixture('https://example.com/guide/first-time-buyers', { title: 'First-time buyer guide' })); assert.strictEqual(guide.candidate, null); assert.strictEqual(getResearchState().productCandidates.length, beforeGuide);
  const research = getResearchState(); assert.strictEqual(research.researchRecords.length, 3); assert.strictEqual(research.productCandidates.length, 2); assert.strictEqual(research.guidePackage.evidenceRecordCount, 3);
  const appDbPath = path.join(__dirname, '..', 'data', 'app-db.json'); if (fs.existsSync(appDbPath)) { const appDb = JSON.parse(fs.readFileSync(appDbPath, 'utf8')); assert.strictEqual(JSON.stringify(appDb).includes('example.com/product/model-one'), false, 'test fixture must not leak into data/app-db.json'); }
  const server = require('../src/server'); assert.strictEqual(typeof server.renderDashboard, 'function'); if (!fs.existsSync(path.join(__dirname, '..', 'src', 'styles.css'))) throw new Error('styles.css should exist');
  cleanup(); console.log('6 tests passed'); console.log('Product specs persist into review-only product and category candidate cards');
}
runTests();
