const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { buildSeedDatabase, createExtractionRun, getDashboard, getResearchState, getRun, parseSeedList, saveDatabase, saveExtractionResult } = require('../src/data');
function resetDatabase() { saveDatabase(buildSeedDatabase()); }
function runTests() {
  resetDatabase();
  assert.deepStrictEqual(parseSeedList('A\nB, C\n\nD'), ['A', 'B', 'C', 'D']);
  const dashboard = getDashboard(); assert.strictEqual(dashboard.counts.extractionRuns, 1); assert.strictEqual(dashboard.counts.sources, 4); assert.strictEqual(dashboard.counts.productCandidates, 0);
  const seedRun = getRun('run_extraction_001'); assert(seedRun); assert.strictEqual(seedRun.sources.length, 4); assert(seedRun.workLogs.length >= 2);
  const result = createExtractionRun({ title: 'Test Run', guideType: 'Vendor Trust', seedList: 'Alpha Dolls\nBeta Dolls', notes: 'Test note' }); assert(result.runId); assert.strictEqual(result.sourceCount, 2); assert.strictEqual(getRun(result.runId).sources.length, 2);
  const saved = saveExtractionResult({ ok: true, targetUrl: 'https://example.com/products/model-one', title: 'Model One', description: 'Silicone product with weight, shipping, and care details.', headings: ['Model One'], detectedFields: { mentionsWeight: true, mentionsMaterial: true, mentionsShipping: true }, textSample: 'Model One silicone weight shipping care', completedAt: new Date().toISOString() });
  assert.strictEqual(saved.record.verificationStatus, 'needs_review'); assert.strictEqual(saved.candidate.recommendationStatus, 'needs_review'); assert.strictEqual(saved.candidate.imageRights, 'unknown');
  const research = getResearchState(); assert.strictEqual(research.researchRecords.length, 1); assert.strictEqual(research.productCandidates.length, 1); assert.strictEqual(research.guidePackage.evidenceRecordCount, 1);
  const server = require('../src/server'); assert.strictEqual(typeof server.renderDashboard, 'function'); if (!fs.existsSync(path.join(__dirname, '..', 'src', 'styles.css'))) throw new Error('styles.css should exist');
  console.log('5 tests passed'); console.log('Seed dashboard and persisted extraction evidence pipeline verified');
}
runTests();
