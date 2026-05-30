const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { Store } = require("../src/store");

const seedsPath = path.join(__dirname, "..", "data", "seed-vendors.json");

function createTestStore() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "synth-guide-"));
  const storePath = path.join(directory, "store.json");
  return { directory, store: new Store({ storePath, seedsPath }), storePath };
}

test("first load creates the required seed run and four queued sources", (t) => {
  const { directory, store } = createTestStore();
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  const dashboard = store.getDashboard();
  assert.equal(dashboard.summary.extractionRuns, 1);
  assert.equal(dashboard.summary.sources, 4);

  const run = dashboard.runs[0];
  assert.equal(run.title, "Extraction Run 001");
  assert.equal(run.guideType, "First-Time Buyer Guide");
  assert.deepEqual(
    store.getRun(run.id).sources.map((source) => source.name),
    ["Zelex Dolls", "WM Doll", "Irontech Doll", "Tayu Doll"],
  );
});

test("new runs parse non-empty lines into durable source rows and work logs", (t) => {
  const { directory, store, storePath } = createTestStore();
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));

  const created = store.createRun({
    title: "Trust refresh",
    guideType: "Vendor Trust",
    seedList: "Alpha Source\n\n  Beta Source  \r\n",
  });

  assert.deepEqual(created.sources.map((source) => source.name), ["Alpha Source", "Beta Source"]);
  assert.equal(created.sources[0].sourceType, "unknown");
  assert.equal(created.sources[0].confidence, "weak");
  assert.equal(created.sources[0].status, "inbox");
  assert.equal(created.sources[0].officialUrl, null);
  assert.equal(created.sources[0].nextAction, "discover official source and important pages");
  assert.deepEqual(
    created.workLogs.map((log) => log.message).sort(),
    ['Created extraction run "Trust refresh".', "Parsed 2 sources from the seed list."].sort(),
  );

  const reloaded = new Store({ storePath, seedsPath });
  assert.equal(reloaded.getRun(created.id).sources.length, 2);
});

test("broader source list remains available for sample import", (t) => {
  const { directory, store } = createTestStore();
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  assert.equal(store.getDashboard().sampleSeeds.length, 13);
});
