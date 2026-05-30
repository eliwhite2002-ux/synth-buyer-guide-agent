const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const { GUIDE_TYPES, createSource, parseSeedList } = require("./model");
const { extractUrl } = require("./extractors/mock");

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
    researchRecords: [],
    guidePackages: [],
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
    const run = { id: randomUUID(), title: cleanTitle, guideType, seedList: cleanSeedList, status: "draft", notes: "", createdAt: now, updatedAt: now };
    const sources = sourceNames.map((name) => createSource({ id: randomUUID(), runId: run.id, name }));
    this.data.extractionRuns.unshift(run);
    this.data.sources.push(...sources);
    this.data.workLogs.push(
      { id: randomUUID(), runId: run.id, message: `Created extraction run "${run.title}".`, severity: "info", createdAt: now },
      { id: randomUUID(), runId: run.id, message: `Parsed ${sources.length} source${sources.length === 1 ? "" : "s"} from the seed list.`, severity: "complete", createdAt: now },
    );
    this.save();
    return this.getRun(run.id);
  }

  extractUrl({ runId, sourceId, url }) {
    const run = this.data.extractionRuns.find((item) => item.id === runId);
    if (!run) throw new Error("Run not found.");
    const source = this.data.sources.find((item) => item.id === sourceId && item.runId === runId);
    if (!source) throw new Error("Choose a source row.");
    const result = extractUrl(url);
    const now = result.extractedAt;
    Object.assign(source, result.sourcePatch);
    run.status = "needs_review";
    run.updatedAt = now;
    const researchRecord = { id: randomUUID(), runId, sourceId, adapter: result.adapter, sourceUrl: result.sourceUrl, extractedAt: now, confidence: result.confidence, verificationStatus: result.verificationStatus, blockers: result.blockers, evidence: result.evidence };
    const candidate = { id: randomUUID(), runId, sourceId, researchRecordId: researchRecord.id, ...result.candidate };
    this.data.researchRecords.push(researchRecord);
    this.data.productCandidates.push(candidate);
    this.refreshGuidePackage(runId);
    this.data.workLogs.push({ id: randomUUID(), runId, message: `Mock-extracted ${result.sourceUrl}; saved evidence and created review-only candidate "${candidate.productName}".`, severity: "warning", createdAt: now });
    this.save();
    return { run: this.getRun(runId), researchRecord, candidate };
  }

  refreshGuidePackage(runId) {
    const now = new Date().toISOString();
    const candidates = this.data.productCandidates.filter((item) => item.runId === runId);
    const records = this.data.researchRecords.filter((item) => item.runId === runId);
    const blockSpecs = [
      ["opening", "Opening promise", "Research package started. Editorial claims remain pending evidence review."],
      ["comparison_table", "Product comparison table", `${candidates.length} review-only candidate card${candidates.length === 1 ? "" : "s"} saved. Recommendations remain pending verified specs and media rights.`],
      ["vendor_trust", "Vendor trust table", `${records.length} saved research record${records.length === 1 ? "" : "s"} available with source URLs and evidence snippets.`],
    ];
    this.data.guideBlocks = this.data.guideBlocks.filter((block) => block.runId !== runId);
    this.data.guideBlocks.push(...blockSpecs.map(([blockType, title, bodyMarkdown]) => ({ id: randomUUID(), runId, blockType, title, bodyMarkdown, status: "needs_review", updatedAt: now })));
    const guidePackage = {
      id: randomUUID(), runId, updatedAt: now, status: "needs_review", evidenceRecordCount: records.length, candidateCount: candidates.length,
      articleMarkdown: `# Draft buyer guide package\n\nEvidence review is required before publication.\n\nSaved research records: ${records.length}\nReview-only candidates: ${candidates.length}`,
      productCardJson: JSON.stringify(candidates, null, 2),
      comparisonTableMarkdown: "| Candidate | Vendor | Status | Evidence |\n| --- | --- | --- | --- |\n" + candidates.map((item) => `| ${item.productName} | ${item.vendor} | ${item.recommendationStatus} | ${item.productUrl} |`).join("\n"),
    };
    this.data.guidePackages = this.data.guidePackages.filter((item) => item.runId !== runId);
    this.data.guidePackages.push(guidePackage);
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
      runs: this.data.extractionRuns.map((run) => ({ ...run, sourceCount: this.data.sources.filter((source) => source.runId === run.id).length })),
      sampleSeeds: this.seeds.broaderSourceList,
    };
  }

  getRun(id) {
    const run = this.data.extractionRuns.find((item) => item.id === id);
    if (!run) return null;
    return {
      ...run,
      sources: this.data.sources.filter((source) => source.runId === id),
      workLogs: this.data.workLogs.filter((log) => log.runId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      productCandidates: this.data.productCandidates.filter((item) => item.runId === id),
      assets: this.data.assets.filter((item) => item.runId === id),
      guideBlocks: this.data.guideBlocks.filter((item) => item.runId === id),
      researchRecords: this.data.researchRecords.filter((item) => item.runId === id),
      guidePackage: this.data.guidePackages.find((item) => item.runId === id) || null,
    };
  }
}

module.exports = { Store, emptyData };
