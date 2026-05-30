const studioOutput = {
  guideTitle: 'First-Time Sex Doll Buyer Guide: How to Buy Without Regret',
  promise: 'Use this page to gather source evidence. The Guide Builder turns that evidence into the actual copy-ready buyer guide package.',
  packageItems: [
    { title: 'Extract URLs', status: 'research layer', action: 'Paste vendor, category, and product URLs. Save readable evidence and blockers.' },
    { title: 'Review Discovery Queue', status: 'source triage', action: 'Process suggested internal links without letting article/category pages pollute final product outputs.' },
    { title: 'Create Candidate Cards', status: 'review-only', action: 'Only likely product/category pages create candidates. Product candidates stay not recommended until reviewed.' },
    { title: 'Send Evidence to Builder', status: 'output layer', action: 'Open Guide Builder to assemble the article, product examples, Canva briefs, videos, checklist, and review list.' }
  ],
  researchCards: [
    {
      vendor: 'Zelex Dolls',
      role: 'major manufacturer candidate',
      goal: 'Find beginner-manageable body examples with clear height, weight, material, and support/shipping information.',
      startUrl: 'https://zelexdoll.com/',
      missing: ['beginner product candidates', 'weight/spec clarity', 'media-rights status', 'support/returns clarity'],
      guideUse: 'Potential comparison examples for lightweight/full-body buyer paths.'
    },
    {
      vendor: 'WM Doll',
      role: 'major manufacturer/source candidate',
      goal: 'Extract mainstream product examples and practical specs for comparison table and buyer warnings.',
      startUrl: 'https://www.wmdoll.com/',
      missing: ['recommended beginner sizes', 'weight ranges', 'care/support claims', 'media rights'],
      guideUse: 'Useful for market-standard examples and product-card template testing.'
    },
    {
      vendor: 'Irontech Doll',
      role: 'large manufacturer/source candidate',
      goal: 'Look for accessible product pages, specs, material claims, care claims, and whether media use is permitted.',
      startUrl: 'https://www.irontechdoll.com/',
      missing: ['product candidates', 'image rights', 'shipping/support claims', 'weight data'],
      guideUse: 'Potential vendor-trust and product-spec clarity example.'
    },
    {
      vendor: 'Tayu Doll',
      role: 'lightweight/body-construction candidate',
      goal: 'Research whether lighter bodies or construction claims can support the weight/storage section.',
      startUrl: 'https://www.tayu-doll.com/',
      missing: ['official product examples', 'body weights', 'construction claims', 'media permissions'],
      guideUse: 'Potential source for weight-focused first-time buyer guidance.'
    }
  ],
  researchRules: [
    'Research Studio gathers evidence. Guide Builder creates the buyer guide package.',
    'Product candidates are review-only and stay not_recommended until human review.',
    'Category pages can be discovery leads, but they must not appear as final product examples.',
    'Article/guide pages should save evidence, not create product candidate cards.',
    'Media rights and image rights stay unknown until explicitly reviewed.'
  ],
  articleSections: [
    { title: 'Research handoff', body: 'Saved evidence and review-only candidates from this page feed the Guide Builder output composer.' }
  ],
  mistakeCards: [],
  comparisonRows: [['Layer', 'Job'], ['Research Studio', 'Extract and classify source evidence'], ['Guide Builder', 'Assemble copy-ready buyer-guide outputs']],
  checklist: ['Extract real product pages', 'Review candidate specs', 'Confirm media rights', 'Open Guide Builder'],
  visualBriefs: [],
  shortVideos: [],
  productCardSchema: { vendor: 'Vendor name', productName: 'Product name', sourceUrl: 'Verified source URL', recommendationStatus: 'not_recommended', reviewStatus: 'needs_review', mediaRights: 'unknown', imageRights: 'unknown' }
};

function markdownTable(rows) {
  const [header, ...body] = rows;
  return [`| ${header.join(' | ')} |`, `| ${header.map(() => '---').join(' | ')} |`, ...body.map((row) => `| ${row.join(' | ')} |`)].join('\n');
}

function articleMarkdown() {
  return [`# ${studioOutput.guideTitle}`, '', studioOutput.promise, '', '## Research/output split', '', markdownTable(studioOutput.comparisonRows), '', '## Research rules', '', ...studioOutput.researchRules.map((item) => `- ${item}`)].join('\n');
}

function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function renderStudioPage(layout, extractionResult = null) {
  return layout('Research Studio', `
    <section class="hero studio-hero">
      <div>
        <p class="eyebrow">Research Studio</p>
        <h2>Gather evidence for the first-time buyer guide</h2>
        <p>This is the evidence machine: extract URLs, save research records, classify discovery links, and create review-only product candidate cards. Use Guide Builder when you want the actual article and output package.</p>
      </div>
      <div class="stacked-actions">
        <a class="button primary" href="/builder">Open Guide Builder</a>
        <a class="button" href="#extractor">Extract URL</a>
      </div>
    </section>

    <section class="rule-card"><strong>Hard split:</strong> Research Studio gathers evidence. Guide Builder composes the article, comparison table, product examples, Canva briefs, short videos, checklist, source list, and publication checklist.</section>

    <section class="cards studio-cards" id="research-dashboard">
      ${studioOutput.packageItems.map((item) => `<article class="card package-card"><span>${escapeHtml(item.status)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.action)}</p></article>`).join('')}
    </section>

    <section class="panel extractor-panel" id="extractor">
      <div class="panel-title"><h3>URL Extraction Tester</h3><span class="badge badge-needs_review">evidence input</span></div>
      <p class="muted">Paste a vendor/product URL. The app tries to fetch it, detect buyer-guide fields, save evidence, suggest internal links, and create review-only candidates only when the URL looks like a specific product/category page.</p>
      <form method="post" action="/extract" class="extract-form">
        <input name="targetUrl" placeholder="https://example-vendor.com/product-page" required />
        <button class="button primary" type="submit">Extract URL</button>
      </form>
      <p class="muted">Deterministic fixtures: <code>mock://vendor-homepage</code>, <code>mock://product-model-one</code>, <code>mock://category-silicone</code>, <code>mock://article-first-time-buyers</code>, <code>mock://blocked-access-wall</code>.</p>
      ${extractionResult ? renderExtractionResult(extractionResult) : ''}
    </section>

    <section class="panel">
      <div class="panel-title"><h3>Research rules</h3><span class="badge badge-needs_review">guardrails</span></div>
      <div class="research-grid">
        ${studioOutput.researchRules.map((rule) => `<article class="research-card"><p>${escapeHtml(rule)}</p></article>`).join('')}
      </div>
    </section>

    <section class="panel">
      <div class="panel-title"><h3>Production Research Cards</h3><span class="muted">Next evidence to collect for real product examples</span></div>
      <div class="research-grid">
        ${studioOutput.researchCards.map((card) => `<article class="research-card"><div class="panel-title"><h3>${escapeHtml(card.vendor)}</h3><span class="badge badge-inbox">${escapeHtml(card.role)}</span></div><p>${escapeHtml(card.goal)}</p><p><strong>Start:</strong> <a href="${escapeHtml(card.startUrl)}" target="_blank">${escapeHtml(card.startUrl)}</a></p><p><strong>Guide use:</strong> ${escapeHtml(card.guideUse)}</p><p><strong>Missing:</strong> ${card.missing.map(escapeHtml).join(' · ')}</p><form method="post" action="/extract"><input type="hidden" name="targetUrl" value="${escapeHtml(card.startUrl)}" /><button class="button" type="submit">Run extraction test</button></form></article>`).join('')}
      </div>
    </section>
  `);
}

function renderExtractionResult(result) {
  const fields = result.detectedFields ? Object.entries(result.detectedFields).map(([key, value]) => `<li><strong>${escapeHtml(key)}:</strong> ${escapeHtml(String(value))}</li>`).join('') : '';
  return `<div class="extract-result"><div class="panel-title"><h4>Extraction result</h4><span class="badge ${result.ok ? 'badge-ready' : 'badge-needs_review'}">${escapeHtml(result.status)}</span></div><p><strong>URL:</strong> ${escapeHtml(result.targetUrl)}</p>${result.blocker ? `<p><strong>Blocker:</strong> ${escapeHtml(result.blocker)}</p>` : ''}${result.title ? `<p><strong>Title:</strong> ${escapeHtml(result.title)}</p>` : ''}${result.description ? `<p><strong>Description:</strong> ${escapeHtml(result.description)}</p>` : ''}<ul class="field-list">${fields}</ul>${result.headings && result.headings.length ? `<p><strong>Headings:</strong> ${result.headings.map(escapeHtml).join(' · ')}</p>` : ''}${result.textSample ? `<details><summary>Text sample</summary><pre>${escapeHtml(result.textSample)}</pre></details>` : ''}</div>`;
}

module.exports = { studioOutput, articleMarkdown, renderStudioPage };
