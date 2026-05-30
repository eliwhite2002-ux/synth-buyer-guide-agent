const path = require('path');
process.env.SBGA_DB_PATH = path.join(__dirname, 'tmp-enhancements-db.json');
const assert = require('assert');
const fs = require('fs');
const { buildSeedDatabase, getResearchState, loadDatabase, saveDatabase, saveExtractionResult, updateCandidateReview } = require('../src/data');
const { extractImageCandidates, extractUrl } = require('../src/extractor');
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
  assert.strictEqual(category.record.evidenceKind, 'category_candidate');
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

  const imageCandidates = extractImageCandidates('<meta property="og:image" content="https://example.com/product/model-one"><img src="https://cdn.example.com/images/model-one.webp"><source srcset="https://cdn.example.com/gallery/model-one-small.jpg 400w, https://cdn.example.com/gallery/model-one-large.jpg 900w">', 'https://example.com/product/model-one');
  assert.strictEqual(imageCandidates.some((image) => image.url === 'https://example.com/product/model-one'), false);
  assert.strictEqual(imageCandidates.length, 3);

  const compact = saveExtractionResult(await extractUrl('mock://product-compact-tpe'));
  assert.strictEqual(compact.candidate.materialGroup, 'TPE');
  assert.strictEqual(compact.candidate.sizeClass, 'compact');
  assert.strictEqual(compact.candidate.weightClass, 'lightweight');
  assert.strictEqual(compact.candidate.guideReadiness, 'core_specs_ready');
  assert.deepStrictEqual(compact.candidate.imageCandidates.map((image) => image.url), ['https://cdn.example.com/images/compact-tpe-model.webp']);

  const large = saveExtractionResult(await extractUrl('mock://product-large-silicone'));
  assert.strictEqual(large.candidate.materialGroup, 'Silicone');
  assert.strictEqual(large.candidate.sizeClass, 'large');
  assert.strictEqual(large.candidate.weightClass, 'heavy');

  const incomplete = saveExtractionResult(await extractUrl('mock://product-incomplete'));
  assert.strictEqual(incomplete.candidate.guideReadiness, 'missing_core_specs');
  assert.deepStrictEqual(incomplete.candidate.missingGuideFields, ['weight', 'material']);

  const compactReviewed = updateCandidateReview(compact.candidate.id, { reviewStatus: 'approved', mediaRights: 'vendor_approved', imageRights: 'public_stock', reviewNotes: 'Keep this decision after reruns.' });
  assert.strictEqual(compactReviewed.imageRights, 'public_stock');
  const compactRerun = saveExtractionResult(await extractUrl('mock://product-compact-tpe'));
  assert.strictEqual(compactRerun.candidate.reviewStatus, 'approved');
  assert.strictEqual(compactRerun.candidate.imageRights, 'public_stock');
  assert.strictEqual(compactRerun.candidate.reviewNotes, 'Keep this decision after reruns.');

  const variedResearch = getResearchState();
  assert.strictEqual(variedResearch.guidePackage.productCards.length, 3);
  assert.strictEqual(variedResearch.guidePackage.incompleteProductCount, 1);
  assert.strictEqual(variedResearch.guidePackage.productCards.find((item) => item.productName === 'Compact TPE Model').approvedImageUrls.length, 1);
  assert.strictEqual(variedResearch.guidePackage.productCards.some((item) => item.productName === 'Incomplete Model'), false);
  assert.strictEqual(variedResearch.guidePackage.productCards.some((item) => item.sourceUrl.includes('/dolls/compact-tpe-model')), true);
  const variedPanelHtml = renderResearchPanel(variedResearch);
  assert(variedPanelHtml.includes('Approved Media URLs'));
  assert(variedPanelHtml.includes('https://cdn.example.com/images/compact-tpe-model.webp'));
  assert(!variedPanelHtml.includes('<pre id="image-url-') || !variedPanelHtml.includes('https://example.com/dolls/compact-tpe-model</pre>'));

  saveDatabase(buildSeedDatabase());
  saveExtractionResult({
    ok: true,
    targetUrl: 'https://zelexdoll.com/',
    title: 'Zelex Dolls',
    textSample: 'Shipping returns silicone products.',
    detectedFields: { mentionsShipping: true },
    suggestedLinks: [{ url: 'https://zelexdoll.com/product/starter-model', label: 'Starter Model', kind: 'likely_product' }]
  });
  saveExtractionResult({
    ok: true,
    targetUrl: 'https://zelexdoll.com/product/starter-model',
    title: 'Starter Model',
    textSample: 'Starter Model price height weight silicone.',
    detectedFields: { mentionsPrice: true, mentionsHeight: true, mentionsWeight: true, mentionsMaterial: true },
    productSpecs: { price: '$1,100.00', height: '155cm', bodyWeight: '30kg', material: 'Silicone' }
  });
  const zelex = loadDatabase().sources.find((source) => source.name === 'Zelex Dolls');
  assert.strictEqual(zelex.officialUrl, 'https://zelexdoll.com');
  assert(zelex.importantPages.includes('https://zelexdoll.com/product/starter-model'));

  saveDatabase(buildSeedDatabase());
  saveExtractionResult(await extractUrl('mock://vendor-homepage'));
  assert.strictEqual(loadDatabase().sources.some((source) => source.officialUrl === 'https://example.com'), false);
  cleanup();
  console.log('Workflow enhancement tests passed');
}

runTests().catch((error) => {
  cleanup();
  console.error(error);
  process.exitCode = 1;
});
