const path = require('path');
process.env.SBGA_DB_PATH = path.join(__dirname, 'tmp-test-db.json');

const assert = require('assert');
const fs = require('fs');
const { buildSeedDatabase, createExtractionRun, getDashboard, getResearchState, getRun, parseSeedList, saveDatabase, saveExtractionResult } = require('../src/data');

function resetDatabase() {
  saveDatabase(buildSeedDatabase());
}

function cleanup() {
  if (fs.existsSync(process.env.SBGA_DB_PATH)) fs.unlinkSync(process.env.SBGA_DB_PATH);
}

function runTests() {
  cleanup();
  resetDatabase();
  assert.deepStrictEqual(parseSeedList('A\nB, C\n\nD'), ['A', 'B', 'C', 'D']);
  const dashboard = getDashboard();
  assert.strictEqual(dashboard.counts.extractionRuns, 1);
  assert.strictEqual(dashboard.counts.sources, 4);
  assert.strictEqual(dashboard.counts.productCandidates, 0);
  const seedRun = getRun('run_extraction_001');
  assert(seedRun);
  assert.strictEqual(seedRun.sources.length, 4);
  assert(seedRun.workLogs.length >= 2);
  const result = createExtractionRun({ title: 'Test Run', guideType: 'Vendor Trust', seedList: 'Alpha Dolls\nBeta Dolls', notes: 'Test note' });
  assert(result.runId);
  assert.strictEqual(result.sourceCount, 2);
  assert.strictEqual(getRun(result.runId).sources.length, 2);
  const saved = saveExtractionResult({ ok: true, targetUrl: 'https://example.com/products/model-one', title: 'Model One', description: 'Silicone product with weight, shipping, and care details.', headings: ['Model One'], detectedFields: { mentionsWeight: true, mentionsMaterial: true, mentionsShipping: true }, textSample: 'Model One silicone weight shipping care', completedAt: new Date().toISOString() });
  assert.strictEqual(saved.record.verificationStatus, 'needs_review');
  assert.strictEqual(saved.candidate.recommendationStatus, 'needs_review');
  assert.strictEqual(saved.candidate.imageRights, 'unknown');
  const research = getResearchState();
  assert.strictEqual(research.researchRecords.length, 1);
  assert.strictEqual(research.productCandidates.length, 1);
  assert.strictEqual(research.guidePackage.evidenceRecordCount, 1);
  const appDbPath = path.join(__dirname, '..', 'data', 'app-db.json');
  if (fs.existsSync(appDbPath)) {
    const appDb = JSON.parse(fs.readFileSync(appDbPath, 'utf8'));
    const leakedExample = JSON.stringify(appDb).includes('example.com/products/model-one');
    assert.strictEqual(leakedExample, false, 'test fixture must not leak into data/app-db.json');
  }
  const server = require('../src/server');
  assert.strictEqual(typeof server.renderDashboard, 'function');
  if (!fs.existsSync(path.join(__dirname, '..', 'src', 'styles.css'))) throw new Error('styles.css should exist');
  cleanup();
  console.log('5 tests passed');
  console.log('Seed dashboard and isolated persisted extraction evidence pipeline verified');
}

runTests();
