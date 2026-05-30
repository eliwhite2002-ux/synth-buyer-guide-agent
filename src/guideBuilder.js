const GUIDE_TITLE = 'First-Time Sex Doll Buyer Guide: How to Buy Without Regret';
const GUIDE_PROMISE = 'A practical first-time buyer guide focused on avoiding regret by testing weight, storage, cleaning, vendor trust, realistic photos, material choice, delivery/privacy, and whether the product fits the buyer’s real home.';

const ARTICLE_SECTIONS = [
  {
    title: 'Start Here: The Real-Home Test',
    body: 'Before comparing faces, cup sizes, or discount prices, test the purchase against the home it has to live in. Where will it be stored? Can one person move it safely? Can it be cleaned and dried without turning the bathroom into a project? Can it arrive privately? A first-time buyer should pass the real-home test before falling in love with product photos.'
  },
  {
    title: 'Five First-Time Buyer Mistakes',
    body: 'The same mistakes show up again and again: buying too much doll, treating weight like a footnote, choosing material without understanding care, trusting vendor photos as ownership proof, and forgetting the private logistics of delivery, cleaning, drying, storage, and disposal.'
  },
  {
    title: 'Weight Is the Hidden Purchase Decision',
    body: 'Weight decides whether the doll can be moved, cleaned, posed, stored, and used after the novelty wears off. A heavier body may look more realistic in photos, but the practical question is whether the buyer can handle it on a normal day without injury, frustration, or regret.'
  },
  {
    title: 'TPE vs Silicone in Plain English',
    body: 'TPE usually attracts first-time buyers because it can be soft and lower cost. Silicone usually attracts buyers because of durability, detail, and easier cleaning. Neither material wins for every buyer. The real decision is maintenance burden, budget, texture preference, repair expectations, and how much care the owner is actually willing to do.'
  },
  {
    title: 'Vendor Photos Are Not Ownership Evidence',
    body: 'Vendor photos are useful for style, options, and comparison, but they are not proof of real ownership experience. Lighting, posing, editing, and selected angles can hide what matters. The better evidence is clear specs, transparent policies, owner-language patterns, realistic weight, and support information that survives contact with real home use.'
  },
  {
    title: 'AI and Robotics: Do Not Start There',
    body: 'AI heads, voice, memory, and companion tech can matter later. They should not be the first buying filter. A first-time buyer should solve the body first: manageable size, cleaning, storage, material, privacy, vendor support, and repairability. Companion tech is a second layer, not a shortcut around the basic ownership problem.'
  }
];

const MISTAKE_CARDS = [
  ['Mistake 1', 'Buying too much doll', 'The fantasy choice is often not the livable choice.'],
  ['Mistake 2', 'Ignoring weight', 'Weight controls cleaning, storage, moving, posing, and regret.'],
  ['Mistake 3', 'Choosing material blindly', 'TPE and silicone create different maintenance burdens.'],
  ['Mistake 4', 'Trusting photos', 'Vendor photos are marketing evidence, not ownership evidence.'],
  ['Mistake 5', 'No private logistics plan', 'Delivery, storage, drying, and cleaning must be planned before purchase.']
];

const DECISION_ROWS = [
  ['Buyer situation', 'Better first direction', 'Avoid first'],
  ['Small apartment / shared housing', 'Compact body, torso, or lighter full-body candidate', 'Large heavy body with no storage plan'],
  ['Concerned about maintenance', 'Silicone or simpler design after care review', 'Cheap TPE body without cleaning plan'],
  ['Photography / display interest', 'Stable skeleton, manageable weight, clear skin/detail specs', 'Unknown skeleton or vague weight specs'],
  ['AI companion interest', 'Manageable body first, companion tech second', 'Buying an AI gimmick before solving ownership basics'],
  ['Low budget', 'Clear specs, reputable support, realistic size', 'Unknown vendor with aggressive discount pressure']
];

const BUYER_CHECKLIST = [
  'Material confirmed',
  'Height confirmed',
  'Weight confirmed',
  'Storage location chosen',
  'Cleaning process understood',
  'Drying process understood',
  'Delivery/privacy plan ready',
  'Support route known',
  'Return/cancellation policy checked',
  'Replacement/repair options checked',
  'Media rights/source evidence classified',
  'Product fits the buyer’s real home, not just the fantasy'
];

const VISUAL_BRIEFS = [
  ['Article cover', '16:9 article cover', 'No explicit imagery. Dark editorial background, checklist/product-card motif, headline: First-Time Sex Doll Buyer Guide. Subhead: How to buy without regret.'],
  ['Five mistakes carousel', '5 square cards', 'One card per mistake. Use neutral icons: weight, box, water/drop, camera, closet. No product nudity or fake product photos.'],
  ['Real-home checklist graphic', 'Vertical infographic', 'Apartment/closet/bathroom workflow style. Questions: move it, clean it, dry it, store it, receive it privately.'],
  ['Weight warning card', 'Short-video background or article insert', 'Scale/handling motif. Copy: Weight is not a footnote. It decides whether you actually use the product.'],
  ['Product example card', 'Square or 4:5 card', 'Use only reviewed source specs. Badge: review-only / not recommended yet. Avoid using vendor product imagery until image rights are approved.'],
  ['Comparison table graphic', 'Wide article image', 'Use buyer situation vs better first direction vs avoid first. Make it look like a practical buying tool.'],
  ['Short-video background cards', '9:16 background cards', 'Simple high-contrast text cards for hooks about weight, vendor photos, cleaning, and AI-first mistakes.']
];

const SHORT_VIDEOS = [
  {
    hook: 'The biggest first-time sex doll buyer mistake is buying too much doll.',
    beats: ['Fantasy shopping says bigger and more realistic.', 'Ownership says: can you move it, clean it, store it, and keep using it?', 'Buy for the life you actually have.']
  },
  {
    hook: 'The most ignored sex doll spec is weight.',
    beats: ['Weight controls cleaning.', 'Weight controls storage.', 'Weight controls whether the doll becomes a regret purchase.']
  },
  {
    hook: 'Vendor photos are not ownership evidence.',
    beats: ['Photos show style.', 'They do not show cleaning, storage, moving, delivery, or support.', 'Look for specs, owner signals, and clear policies.']
  },
  {
    hook: 'Do not buy an AI head before solving the basic ownership problem.',
    beats: ['Voice and memory can matter.', 'But not if the physical product is too heavy, hard to clean, or locked into a weak app.', 'Body first. Companion tech second.']
  }
];

function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function markdownTable(rows) {
  const [header, ...body] = rows;
  return [`| ${header.join(' | ')} |`, `| ${header.map(() => '---').join(' | ')} |`, ...body.map((row) => `| ${row.join(' | ')} |`)].join('\n');
}

function cleanProductCards(state = {}) {
  return (state.guidePackage?.productCards || []).filter((item) => item && item.sourceUrl && item.price && item.height && item.weight && item.material && item.material !== 'Unknown' && item.recommendationStatus === 'not_recommended');
}

function productExampleMarkdown(productCards = []) {
  if (!productCards.length) {
    return 'No clean product examples are ready yet. Extract a real product page with price, height, weight, and material before adding product examples to the article.';
  }
  return productCards.map((item) => [
    `Product example: ${item.productName || 'Unnamed product'}`,
    `Vendor: ${item.vendor || 'Unknown vendor'}`,
    `Price: ${item.salePrice && item.regularPrice ? `${item.salePrice} sale / ${item.regularPrice} regular` : (item.price || 'needs verification')}`,
    `Height: ${item.height || 'needs verification'}`,
    `Weight: ${item.weight || 'needs verification'}`,
    `Material: ${item.material || 'needs verification'}`,
    `Guide tags: ${item.materialGroup || 'Unknown'}, ${item.sizeClass || 'unknown'}, ${item.weightClass || 'unknown'}`,
    `Status: ${item.reviewStatus || 'needs_review'}, ${item.recommendationStatus || 'not_recommended'} yet`,
    `Buyer-guide use: ${item.buyerFit || 'Real example for discussing first-time buyer fit, storage, handling, and review status.'}`,
    `Source: ${item.sourceUrl}`
  ].join('\n')).join('\n\n');
}

function productComparisonRows(productCards = []) {
  if (!productCards.length) return DECISION_ROWS;
  return [
    ['Product example', 'Price', 'Height', 'Weight', 'Material', 'Size', 'Handling', 'Guide use / caution'],
    ...productCards.map((item) => [
      item.productName || 'Unnamed product',
      item.price || item.salePrice || 'verify',
      item.height || 'verify',
      item.weight || 'verify',
      item.material || 'verify',
      item.sizeClass || 'unknown',
      item.weightClass || 'unknown',
      item.avoidIf || 'review before recommendation'
    ])
  ];
}

function fullArticleMarkdown(state = {}) {
  const productCards = cleanProductCards(state);
  return [
    `# ${GUIDE_TITLE}`,
    '',
    GUIDE_PROMISE,
    '',
    ...ARTICLE_SECTIONS.flatMap((section) => [`## ${section.title}`, '', section.body, '']),
    '## Product Examples and What They Actually Mean',
    '',
    productExampleMarkdown(productCards),
    '',
    '## First-Time Buyer Decision Framework',
    '',
    markdownTable(DECISION_ROWS),
    '',
    '## First-Time Buyer Checklist',
    '',
    ...BUYER_CHECKLIST.map((item) => `- ${item}`),
    '',
    '## Final Recommendation Framework',
    '',
    'Do not start with the prettiest photo or biggest discount. Start with the ownership path that is least likely to create regret: manageable weight, clear material choice, honest storage plan, clean delivery/privacy expectations, and a vendor/product record with enough evidence to review. Product examples in this guide are evidence examples first, not recommendations, until review, rights, and owner-fit checks are complete.'
  ].join('\n');
}

function mistakeCardsMarkdown() {
  return MISTAKE_CARDS.map(([label, title, note]) => `${label}: ${title}\n${note}`).join('\n\n');
}

function canvaVisualPackage(productCards = []) {
  const core = VISUAL_BRIEFS.map(([asset, format, direction]) => `${asset}\nFormat: ${format}\nDirection: ${direction}`).join('\n\n');
  const productBriefs = productCards.length
    ? productCards.map((item) => `Product example card: ${item.productName}\nSource: ${item.sourceUrl}\nShow: price ${item.price || 'verify'}, height ${item.height || 'verify'}, weight ${item.weight || 'verify'}, material ${item.material || 'verify'}, size ${item.sizeClass || 'unknown'}, handling ${item.weightClass || 'unknown'}\nBadge: Review only / not recommended yet\nImage candidates: ${item.imageCandidateCount || 0}; image rights: ${item.imageRights || 'unknown'}; approved image URLs: ${(item.approvedImageUrls || []).length}`).join('\n\n')
    : 'Product example cards: waiting for clean product pages with specs. Do not use vendor images until image rights are approved.';
  return `${core}\n\n${productBriefs}`;
}

function shortVideoPackMarkdown() {
  return SHORT_VIDEOS.map((video, index) => [
    `${index + 1}. ${video.hook}`,
    ...video.beats.map((beat) => `- ${beat}`),
    'Visual: simple 9:16 text card or checklist/card motif; no explicit imagery required.'
  ].join('\n')).join('\n\n');
}

function sourceEvidenceMarkdown(state = {}) {
  const records = state.researchRecords || [];
  if (!records.length) return 'No saved evidence records yet. Extract vendor/product URLs in the Research Studio first.';
  return records.map((record) => {
    const title = record.evidence?.title || record.sourceUrl;
    return `- ${title}\n  URL: ${record.sourceUrl}\n  Kind: ${record.evidenceKind || 'evidence'}\n  Confidence: ${record.confidence || 'unknown'}\n  Review: ${record.verificationStatus || 'needs_review'}`;
  }).join('\n');
}

function publicationChecklistMarkdown(state = {}) {
  const productCards = cleanProductCards(state);
  const hasProductCards = productCards.length > 0;
  return [
    `[${hasProductCards ? 'x' : ' '}] At least one real product page has clean specs`,
    '[ ] Product examples are still labeled review-only, not recommendations',
    '[ ] Any vendor image use has explicit rights approval or is avoided',
    '[ ] Weight, height, price, material, and source URL are visible in product examples',
    '[ ] Category pages and article/guide pages are excluded from final product examples',
    '[ ] Article includes real-home test, weight warning, material explanation, vendor-photo warning, and AI/robotics caution',
    '[ ] Canva briefs avoid explicit imagery unless rights and platform placement are handled',
    '[ ] Short video hooks use clear buyer-intent language: sex doll, adult doll, realistic sex doll, AI head when accurate',
    '[ ] Final article does not over-recommend any product before human review'
  ].join('\n');
}

function exportPublicationPack(state = {}) {
  const productCards = cleanProductCards(state);
  return {
    guideTitle: GUIDE_TITLE,
    generatedAt: new Date().toISOString(),
    publicationStatus: 'needs_review',
    recommendationStatus: 'not_recommended',
    articleMarkdown: fullArticleMarkdown(state),
    productExampleCards: productCards,
    comparisonTableMarkdown: markdownTable(productComparisonRows(productCards)),
    canvaBriefs: canvaVisualPackage(productCards),
    shortVideoHooks: shortVideoPackMarkdown(),
    buyerChecklist: BUYER_CHECKLIST,
    sourceEvidenceList: sourceEvidenceMarkdown(state),
    publicationChecklist: publicationChecklistMarkdown(state)
  };
}

function outputBlock(id, title, content) {
  return `<article class="output-block"><div class="panel-title"><h3>${escapeHtml(title)}</h3><button class="copy-button" type="button" data-copy-target="${escapeHtml(id)}">Copy</button></div><pre id="${escapeHtml(id)}" tabindex="0">${escapeHtml(content)}</pre></article>`;
}

function renderStatCards(state = {}) {
  const guidePackage = state.guidePackage || {};
  const cards = [
    ['Evidence Records', guidePackage.evidenceRecordCount || (state.researchRecords || []).length || 0],
    ['Review Product Examples', cleanProductCards(state).length],
    ['Incomplete Product Cards', guidePackage.incompleteProductCount || 0],
    ['Category Leads Excluded', guidePackage.categoryLeadCount || 0],
    ['Recommendation Status', 'not recommended yet']
  ];
  return `<section class="cards builder-cards">${cards.map(([label, value]) => `<article class="card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`).join('')}</section>`;
}

function renderProductPreview(productCards = []) {
  if (!productCards.length) {
    return '<p class="muted">No clean product examples yet. Use Research Studio to extract a real product page, then return here.</p>';
  }
  return `<div class="research-grid">${productCards.map((item) => `<article class="research-card"><div class="panel-title"><h4>${escapeHtml(item.productName)}</h4><span class="badge badge-needs_review">review-only</span></div><p><strong>Price:</strong> ${escapeHtml(item.price || item.salePrice || 'verify')}</p><p><strong>Height:</strong> ${escapeHtml(item.height || 'verify')} · <strong>Weight:</strong> ${escapeHtml(item.weight || 'verify')} · <strong>Material:</strong> ${escapeHtml(item.material || 'verify')}</p><p><strong>Guide tags:</strong> ${escapeHtml(item.materialGroup || 'Unknown')} · ${escapeHtml(item.sizeClass || 'unknown')} · ${escapeHtml(item.weightClass || 'unknown')}</p><p><strong>Approved image URLs:</strong> ${(item.approvedImageUrls || []).length}</p><p><strong>Status:</strong> ${escapeHtml(item.reviewStatus || 'needs_review')} · ${escapeHtml(item.recommendationStatus || 'not_recommended')}</p><p><strong>Source:</strong> <a href="${escapeHtml(item.sourceUrl)}" target="_blank">${escapeHtml(item.sourceUrl)}</a></p><p>${escapeHtml(item.buyerFit || 'Use as a real product example after review.')}</p></article>`).join('')}</div>`;
}

function renderBuilderPage(layout, state = {}) {
  const productCards = cleanProductCards(state);
  const article = fullArticleMarkdown(state);
  const productExamples = productExampleMarkdown(productCards);
  const comparison = markdownTable(productComparisonRows(productCards));
  const decisionFramework = markdownTable(DECISION_ROWS);
  const canva = canvaVisualPackage(productCards);
  const videos = shortVideoPackMarkdown();
  const sourceList = sourceEvidenceMarkdown(state);
  const checklist = publicationChecklistMarkdown(state);

  return layout('Guide Builder', `
    <section class="hero studio-hero">
      <div>
        <p class="eyebrow">Output Composer</p>
        <h2>${escapeHtml(GUIDE_TITLE)}</h2>
        <p>${escapeHtml(GUIDE_PROMISE)}</p>
      </div>
      <div class="stacked-actions">
        <a class="button primary" href="#article-markdown-output">Copy article draft</a>
        <a class="button" href="/builder/export">Download publication JSON</a>
        <a class="button" href="/studio">Open Research Studio</a>
      </div>
    </section>

    <section class="rule-card"><strong>Workflow split:</strong> Research Studio gathers evidence. Guide Builder turns reviewed evidence into copy-ready buyer-guide outputs. Product examples stay review-only until human review, media rights, and owner-fit checks are complete.</section>

    ${renderStatCards(state)}

    <section class="panel" id="product-examples-preview">
      <div class="panel-title"><h3>Product examples pulled from evidence</h3><span class="badge badge-needs_review">review-only</span></div>
      ${renderProductPreview(productCards)}
    </section>

    <section class="panel output-pack" id="guide-builder-output">
      <div class="panel-title"><h3>Copy-ready Guide Package</h3><span class="badge badge-ready">composer output</span></div>
      ${outputBlock('article-markdown-output', 'Article Markdown', article)}
      ${outputBlock('product-example-output', 'Product Example Cards', productExamples)}
      ${outputBlock('decision-framework-output', 'Buyer Decision Framework', decisionFramework)}
      ${outputBlock('comparison-table-output', 'Comparison Table', comparison)}
      ${outputBlock('canva-visual-output', 'Canva Visual Brief', canva)}
      ${outputBlock('short-video-output', 'Short Video Hooks', videos)}
      ${outputBlock('buyer-checklist-output', 'Checklist', BUYER_CHECKLIST.map((item) => `- ${item}`).join('\n'))}
      ${outputBlock('source-evidence-output', 'Source/Evidence List', sourceList)}
      ${outputBlock('publication-checklist-output', 'Publication Review Checklist', checklist)}
    </section>

    <section class="panel">
      <div class="panel-title"><h3>Five mistake cards</h3><span class="muted">Carousel / article insert / short-video source</span></div>
      <div class="mistake-grid">${MISTAKE_CARDS.map(([label, title, note]) => `<article class="mistake-card"><span>${escapeHtml(label)}</span><h4>${escapeHtml(title)}</h4><p>${escapeHtml(note)}</p></article>`).join('')}</div>
      ${outputBlock('mistake-card-copy-output', 'Mistake Card Copy', mistakeCardsMarkdown())}
    </section>
  `);
}

module.exports = { cleanProductCards, exportPublicationPack, fullArticleMarkdown, markdownTable, productExampleMarkdown, renderBuilderPage };
