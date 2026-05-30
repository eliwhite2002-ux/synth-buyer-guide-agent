const path = require('path');
process.env.SBGA_DB_PATH = path.join(__dirname, 'tmp-enhancements-db.json');
const assert = require('assert');
const fs = require('fs');
const { buildSeedDatabase, getResearchState, loadDatabase, saveDatabase, saveExtractionResult, updateCandidateReview } = require('../src/data');
const { extractUrl } = require('../src/extractor');
const { exportPublicationPack, renderBuilderPage } = require('../src/guideBuilder');
const { renderResearchPanel } = require('../src/researchPanel');

function cleanup() {
  if (fs.existsSync(process.env.SBGA_DB_PATH)) fs.unlinkSync(process.env.SBGA_DB_PATH);
}

async function runTests() {
  cleanup();
  saveDatabase(buildSeedDatabase());

  const homepage = await extractUrl('mock://vendor-homepage');
  assert.strictEqual(homepage.adapter, 'mock_fixture');
  saveExtractionResult(homepage);
  assert.strictEqual(getResearchState().discoveryQueue.length, 3);

  const product = saveExtractionResult(await extractUrl('mock://product-model-one'));
  assert.strictEqual(product.candidate.productName, 'Model One');
  assert.strictEqual(product.candidate.reviewOnly, true);
  assert.strictEqual(product.candidate.recommendationStatus, 'not_recommended');

  const category = saveExtractionResult(await extractUrl('mock://category-silicone'));
  assert.strictEqual(category.candidate.candidateKind, 'category_candidate');
  assert.strictEqual(category.guidePackage.productCards.length, 1);

  const article = saveExtractionResult(await extractUrl('mock://article-first-time-buyers'));
  assert.strictEqual(article.candidate, null);

  const blocked = saveExtractionResult(await extractUrl('mock://blocked-access-wall'));
  assert.strictEqual(blocked.record.confidence, 'blocked');
  assert.strictEqual(blocked.candidate, null);

  const reviewed = updateCandidateReview(product.candidate.id, { reviewStatus: 'approved', mediaRights: 'vendor_approved', imageRights: 'do_not_use', reviewNotes: 'Specs reviewed; do not publish source imagery.' });
  assert.strictEqual(reviewed.reviewStatus, 'approved');
  assert.strictEqual(reviewed.mediaRights, 'vendor_approved');
  assert.strictEqual(reviewed.imageRights, 'do_not_use');
  assert.strictEqual(reviewed.reviewOnly, true);
  assert.strictEqual(reviewed.recommendationStatus, 'not_recommended');

  const research = getResearchState();
  assert.strictEqual(research.guidePackage.productCards.length, 1);
  assert.strictEqual(research.guidePackage.categoryLeadCount, 1);
  assert.strictEqual(research.guidePackage.productCards[0].productName, 'Model One');
  assert(!JSON.stringify(research.guidePackage.productCards).includes('Silicone Collection'));
  assert(!JSON.stringify(research.guidePackage.productCards).includes('First-time buyer guide'));

  const publicationPack = exportPublicationPack(research);
  assert.strictEqual(publicationPack.publicationStatus, 'needs_review');
  assert.strictEqual(publicationPack.recommendationStatus, 'not_recommended');
  assert.strictEqual(publicationPack.productExampleCards.length, 1);
  assert(publicationPack.articleMarkdown.includes('Product example: Model One'));
  assert(publicationPack.publicationChecklist.includes('Category pages and article/guide pages are excluded'));

  const builderHtml = renderBuilderPage((title, body) => `${title}\n${body}`, research);
  assert(builderHtml.includes('/builder/export'));
  const panelHtml = renderResearchPanel(research);
  assert(panelHtml.includes('/candidate-review'));
  assert(panelHtml.includes('Save review'));

  const db = loadDatabase();
  assert(db.workLogs.some((log) => log.message.includes('Updated review-only candidate Model One')));
  cleanup();
  console.log('Workflow enhancement tests passed');
}

runTests().catch((error) => {
  cleanup();
  console.error(error);
  process.exitCode = 1;
});
