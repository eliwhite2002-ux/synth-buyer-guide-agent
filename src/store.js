const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { GUIDE_TYPES, createSource, parseSeedList } = require("./model");

const DEFAULT_STORE_PATH = path.join(__dirname, "..", "data", "store.json");
const DEFAULT_SEEDS_PATH = path.join(__dirname, "..", "data", "seed-vendors.json");

function emptyData() {
  return {
    extractionRuns: [],
    sources: [],
    workLogs: [],
    productCandidates: [],
    assets: [],
    guideBlocks: [],
  };
}

class Store {
  constructor({ storePath = DEFAULT_STORE_PATH, seedsPath = DEFAULT_SEEDS_PATH } = {}) {
    this.storePath = storePath;
    this.seeds = JSON.parse(fs.readFileSync(seedsPath, "utf8"));
    this.data = this.load();
    this.ensureSeedRun();
  }

  load() {
    if (!fs.existsSync(this.storePath)) return emptyData();
    return { ...emptyData(), ...JSON.parse(fs.readFileSync(this.storePath, "utf8")) };
  }

  save() {
    fs.mkdirSync(path.dirname(this.storePath), { recursive: true });
    const tempPath = `${this.storePath}.tmp`;
    fs.writeFileSync(tempPath, `${JSON.stringify(this.data, null, 2)}\n`);
    fs.renameSync(tempPath, this.storePath);
  }

  ensureSeedRun() {
    const seed = this.seeds.extractionRun001;
    if (this.data.extractionRuns.some((run) => run.title === seed.title)) return;
    this.createRun({ ...seed, seedList: seed.sources.join("\n") });
  }

  createRun({ title, guideType, seedList }) {
    const cleanTitle = String(title || "").trim();
    const cleanSeedList = String(seedList || "");
    if (!cleanTitle) throw new Error("Title is required.");
    if (!GUIDE_TYPES.includes(guideType)) throw new Error("Choose a valid guide type.");

    const sourceNames = parseSeedList(cleanSeedList);
    if (!sourceNames.length) throw new Error("Add at least one source.");

    const now = new Date().toISOString();
    const run = {
      id: randomUUID(),
      title: cleanTitle,
      guideType,
      seedList: cleanSeedList,
      status: "draft",
      notes: "",
      createdAt: now,
      updatedAt: now,
    };

    const sources = sourceNames.map((name) =>
      createSource({ id: randomUUID(), runId: run.id, name }),
    );

    this.data.extractionRuns.unshift(run);
    this.data.sources.push(...sources);
    this.data.workLogs.push(
      {
        id: randomUUID(),
        runId: run.id,
        message: `Created extraction run "${run.title}".`,
        severity: "info",
        createdAt: now,
      },
      {
        id: randomUUID(),
        runId: run.id,
        message: `Parsed ${sources.length} source${sources.length === 1 ? "" : "s"} from the seed list.`,
        severity: "complete",
        createdAt: now,
      },
    );
    this.save();
    return this.getRun(run.id);
  }

  getDashboard() {
    return {
      summary: {
        extractionRuns: this.data.extractionRuns.length,
        sources: this.data.sources.length,
        productCandidates: this.data.productCandidates.length,
        blockedSources: this.data.sources.filter((source) => source.confidence === "blocked").length,
        readyGuideBlocks: this.data.guideBlocks.filter((block) => block.status === "ready").length,
        needsReview: this.data.sources.filter((source) => source.status === "needs_review").length,
      },
      runs: this.data.extractionRuns.map((run) => ({
        ...run,
        sourceCount: this.data.sources.filter((source) => source.runId === run.id).length,
      })),
      sampleSeeds: this.seeds.broaderSourceList,
    };
  }

  getRun(id) {
    const run = this.data.extractionRuns.find((item) => item.id === id);
    if (!run) return null;
    return {
      ...run,
      sources: this.data.sources.filter((source) => source.runId === id),
      workLogs: this.data.workLogs
        .filter((log) => log.runId === id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      productCandidates: this.data.productCandidates.filter((item) => item.runId === id),
      assets: this.data.assets.filter((item) => item.runId === id),
      guideBlocks: this.data.guideBlocks.filter((item) => item.runId === id),
    };
  }
}

module.exports = { Store, emptyData };
