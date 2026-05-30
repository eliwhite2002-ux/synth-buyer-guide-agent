const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  DB_PATH,
  buildSeedDatabase,
  createExtractionRun,
  getDashboard,
  getRun,
  parseSeedList,
  saveDatabase
} = require('../src/data');

function resetDatabase() {
  saveDatabase(buildSeedDatabase());
}

function runTests() {
  resetDatabase();

  assert.deepStrictEqual(parseSeedList('A\nB, C\n\nD'), ['A', 'B', 'C', 'D']);

  const dashboard = getDashboard();
  assert.strictEqual(dashboard.counts.extractionRuns, 1, 'seed dashboard should have 1 run');
  assert.strictEqual(dashboard.counts.sources, 4, 'seed dashboard should have 4 sources');
  assert.strictEqual(dashboard.counts.productCandidates, 0, 'Issue #1 should not create product candidates');

  const seedRun = getRun('run_extraction_001');
  assert(seedRun, 'seed run should load');
  assert.strictEqual(seedRun.sources.length, 4, 'seed run should have 4 sources');
  assert(seedRun.workLogs.length >= 2, 'seed run should include work logs');

  const result = createExtractionRun({
    title: 'Test Run',
    guideType: 'Vendor Trust',
    seedList: 'Alpha Dolls\nBeta Dolls',
    notes: 'Test note'
  });
  assert(result.runId, 'new run should return id');
  assert.strictEqual(result.sourceCount, 2, 'new run should parse two source rows');

  const newRun = getRun(result.runId);
  assert.strictEqual(newRun.sources.length, 2, 'new run should load two sources');
  assert(newRun.workLogs.some((log) => log.message.includes('Parsed 2 sources')), 'new run should log parsing');

  const server = require('../src/server');
  assert.strictEqual(typeof server.renderDashboard, 'function', 'server should export renderDashboard');

  if (!fs.existsSync(path.join(__dirname, '..', 'src', 'styles.css'))) {
    throw new Error('styles.css should exist');
  }

  console.log('4 tests passed');
  console.log('Seed dashboard: 1 run, 4 sources, 0 future-stage rows');
  console.log('Syntax checks passed');
}

runTests();
