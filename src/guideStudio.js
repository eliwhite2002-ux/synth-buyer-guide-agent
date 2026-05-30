const studioOutput = {
  guideTitle: 'First-Time Sex Doll Buyer Guide: How to Buy Without Regret',
  promise: 'A practical first-time buyer guide focused on avoiding regret: weight, storage, cleaning, vendor trust, realistic photos, material choice, and whether the product fits the buyer’s real home.',
  packageItems: [
    { title: 'Article Draft', status: 'usable draft', action: 'Copy article markdown into Substack, then revise voice and add product examples after extraction.' },
    { title: 'Canva Visual Pack', status: 'ready brief', action: 'Use the visual brief to make cover, mistake cards, checklist graphic, weight warning, and decision table.' },
    { title: 'Product Card Template', status: 'needs products', action: 'Use after extraction creates real vendor/product rows with specs and image-rights status.' },
    { title: 'Short Video Pack', status: 'usable draft', action: 'Record or generate 4–5 shorts using the hooks and visual briefs.' },
    { title: 'Research Queue', status: 'next bottleneck', action: 'Run vendor/product URLs through the extractor and replace placeholders with verified product examples.' }
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
      startUrl: 'https://www.tayudoll.com/',
      missing: ['official product examples', 'body weights', 'construction claims', 'media permissions'],
      guideUse: 'Potential source for weight-focused first-time buyer guidance.'
    }
  ],
  articleSections: [
    { title: 'Opening promise', body: 'This guide is for the person who is curious enough to buy, but smart enough not to trust a beautiful product photo and a discount timer as a buying strategy. The goal is simple: help a first-time buyer avoid the purchase they regret after the box arrives.' },
    { title: 'The five first-time buyer mistakes', body: 'Most first-time buyers make the same mistakes: buying too much doll, treating weight like a footnote, choosing material without understanding maintenance, trusting vendor photos too much, and forgetting the private logistics of delivery, cleaning, drying, storage, and disposal.' },
    { title: 'The real-home test', body: 'Before comparing bodies, ask where it will live, whether one person can safely move it, whether it can be cleaned without turning the bathroom into a project, whether it can dry properly, whether delivery is private, and whether the owner can maintain it without resenting the work.' },
    { title: 'Weight is the hidden purchase decision', body: 'Weight affects lifting, storage, cleaning, posing, damage risk, and whether the buyer actually uses the product after the novelty wears off. For a first-time buyer, weight is not a secondary spec. It is one of the main buying decisions.' },
    { title: 'TPE vs silicone in plain English', body: 'TPE often attracts first-time buyers because of cost and softness. Silicone often attracts buyers because of durability, detail, and cleaning advantages. The guide should not pretend one is universally better. The practical question is what maintenance burden the buyer can actually live with.' },
    { title: 'Vendor photos are not ownership evidence', body: 'Product photos are useful for style and options, but they are not proof of ownership experience. Lighting, posing, editing, professional photography, and selected angles can hide what a buyer needs to know. The guide should prefer verified specs, clear support policies, owner-language patterns, and practical handling details.' },
    { title: 'AI and robotics caution', body: 'First-time buyers should not chase AI heads or robotics before solving the basic ownership problem. Voice, memory, and companion tech can improve presence, but only if the physical product is manageable, repairable, private, and not locked into a weak app or gimmick.' }
  ],
  mistakeCards: [
    { label: 'Mistake 1', title: 'Buying too much doll', note: 'The fantasy choice is often not the livable choice.' },
    { label: 'Mistake 2', title: 'Ignoring weight', note: 'Weight controls cleaning, storage, moving, posing, and regret.' },
    { label: 'Mistake 3', title: 'Choosing material blindly', note: 'TPE and silicone create different maintenance burdens.' },
    { label: 'Mistake 4', title: 'Trusting photos', note: 'Vendor photos are marketing evidence, not ownership evidence.' },
    { label: 'Mistake 5', title: 'No private logistics plan', note: 'Delivery, storage, drying, and cleaning must be planned before purchase.' }
  ],
  comparisonRows: [
    ['Buyer situation', 'Better first direction', 'Avoid first'],
    ['Small apartment / shared housing', 'Torso, compact body, or lightweight full-body candidate', 'Large heavy body with no storage plan'],
    ['Concerned about maintenance', 'Silicone or simpler design after care review', 'Cheap TPE body without cleaning plan'],
    ['Photography / display interest', 'Stable skeleton, manageable weight, clear skin/detail specs', 'Unknown skeleton or vague weight specs'],
    ['AI companion interest', 'Body that is manageable first, companion tech later', 'Buying an AI gimmick before solving ownership basics'],
    ['Low budget', 'Clear specs, reputable support, realistic size', 'Unknown vendor with aggressive discount pressure']
  ],
  checklist: ['Material confirmed', 'Height confirmed', 'Weight confirmed', 'Storage location chosen', 'Cleaning process understood', 'Drying process understood', 'Delivery/privacy plan ready', 'Support route known', 'Return/cancellation policy checked', 'Replacement/repair options checked', 'Media rights/source evidence classified', 'Product fits the buyer’s real home, not just the fantasy'],
  visualBriefs: [
    { asset: 'Hero graphic', format: '16:9 article cover', direction: 'No explicit imagery. Dark editorial background, checklist/product-card motif, headline: First-Time Sex Doll Buyer Guide. Subhead: How to buy without regret.' },
    { asset: 'Five mistakes carousel', format: '5 square cards', direction: 'One card per mistake. Use neutral icons: weight, box, water/drop, camera, closet. No product nudity or fake product photos.' },
    { asset: 'Real-home test checklist', format: 'Vertical infographic', direction: 'Apartment/closet/bathroom workflow style. Questions: move it, clean it, dry it, store it, receive it privately.' },
    { asset: 'Weight warning card', format: 'Short-video background or article insert', direction: 'Scale/handling motif. Copy: Weight is not a footnote. It decides whether you actually use the product.' },
    { asset: 'Comparison table graphic', format: 'Wide article image', direction: 'Use buyer situation vs better first direction vs avoid first. Make it look like a practical buying tool.' }
  ],
  shortVideos: [
    { hook: 'The biggest first-time sex doll buyer mistake is buying too much doll.', beats: ['Fantasy shopping says bigger and more realistic.', 'Ownership says can you move it, clean it, store it, and keep using it?', 'Buy for the life you actually have.'], visual: 'Use mistake card 1 plus real-home checklist cuts.' },
    { hook: 'The most ignored sex doll spec is weight.', beats: ['Weight controls cleaning.', 'Weight controls storage.', 'Weight controls whether the doll becomes a regret purchase.'], visual: 'Weight warning card plus simple scale icon.' },
    { hook: 'Vendor photos are not ownership evidence.', beats: ['Photos show style.', 'They do not show cleaning, storage, moving, delivery, or support.', 'Look for specs, owner signals, and clear policies.'], visual: 'Camera icon over product-card mockup, no explicit imagery.' },
    { hook: 'Do not buy an AI head before solving the basic ownership problem.', beats: ['Voice and memory can matter.', 'But not if the physical product is too heavy, hard to clean, or locked into a weak app.', 'Body first. Companion tech second.'], visual: 'AI/robotics caution card with neutral device icon.' }
  ],
  productCardSchema: { vendor: 'Vendor name', productName: 'Product name', sourceUrl: 'Verified source URL', material: 'TPE / Silicone / Hybrid / Unknown', height: 'Confirmed height', weight: 'Confirmed weight', price: 'Visible price or range', imageRights: 'Unknown / Vendor Approved / Affiliate Approved / Do Not Use', bestFor: 'Specific buyer situation', avoidIf: 'Specific mismatch', ownerAdvantage: 'Practical ownership advantage', ownerRisk: 'Practical ownership risk', recommendationStatus: 'Include / Watch / Reject / Needs Review' }
};

function markdownTable(rows) {
  const [header, ...body] = rows;
  return [`| ${header.join(' | ')} |`, `| ${header.map(() => '---').join(' | ')} |`, ...body.map((row) => `| ${row.join(' | ')} |`)].join('\n');
}

function articleMarkdown() {
  return [`# ${studioOutput.guideTitle}`, '', studioOutput.promise, '', ...studioOutput.articleSections.flatMap((section) => [`## ${section.title}`, '', section.body, '']), '## First-time buyer decision table', '', markdownTable(studioOutput.comparisonRows), '', '## Buying checklist', '', ...studioOutput.checklist.map((item) => `- ${item}`)].join('\n');
}

function renderPre(title, content) {
  return `<article class="output-block"><div class="panel-title"><h3>${title}</h3><button class="copy-button" data-copy="${encodeURIComponent(content)}">Copy</button></div><pre>${escapeHtml(content)}</pre></article>`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function renderStudioPage(layout, extractionResult = null) {
  const article = articleMarkdown();
  const productJson = JSON.stringify(studioOutput.productCardSchema, null, 2);
  const visualBrief = studioOutput.visualBriefs.map((brief) => `${brief.asset}\nFormat: ${brief.format}\nDirection: ${brief.direction}`).join('\n\n');
  const videoPack = studioOutput.shortVideos.map((video, index) => `${index + 1}. ${video.hook}\n- ${video.beats.join('\n- ')}\nVisual: ${video.visual}`).join('\n\n');

  return layout('Buyer Guide Studio', `
    <section class="hero studio-hero">
      <div>
        <p class="eyebrow">Guide Package Builder</p>
        <h2>First-Time Buyer Guide Package</h2>
        <p>This is the production dashboard: article, Canva assets, product-card template, short-video pack, and research queue. Use the extractor below to start replacing placeholders with real product/vendor evidence.</p>
      </div>
      <a class="button primary" href="#package-dashboard">Use package</a>
    </section>

    <section class="cards studio-cards" id="package-dashboard">
      ${studioOutput.packageItems.map((item) => `<article class="card package-card"><span>${escapeHtml(item.status)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.action)}</p></article>`).join('')}
    </section>

    <section class="panel extractor-panel">
      <div class="panel-title"><h3>URL Extraction Tester</h3><span class="badge badge-needs_review">basic extractor</span></div>
      <p class="muted">Paste a vendor/product URL. The app will try to fetch it, detect buyer-guide fields, and show whether it found price, weight, height, material, shipping, returns, or care signals. If it fails, it logs the blocker as an access-wall candidate.</p>
      <form method="post" action="/extract" class="extract-form">
        <input name="targetUrl" placeholder="https://example-vendor.com/product-page" required />
        <button class="button primary" type="submit">Test extract URL</button>
      </form>
      ${extractionResult ? renderExtractionResult(extractionResult) : ''}
    </section>

    <section class="panel">
      <div class="panel-title"><h3>Production Research Cards</h3><span class="muted">Next evidence to collect for real product examples</span></div>
      <div class="research-grid">
        ${studioOutput.researchCards.map((card) => `<article class="research-card"><div class="panel-title"><h3>${escapeHtml(card.vendor)}</h3><span class="badge badge-inbox">${escapeHtml(card.role)}</span></div><p>${escapeHtml(card.goal)}</p><p><strong>Start:</strong> <a href="${escapeHtml(card.startUrl)}" target="_blank">${escapeHtml(card.startUrl)}</a></p><p><strong>Guide use:</strong> ${escapeHtml(card.guideUse)}</p><p><strong>Missing:</strong> ${card.missing.map(escapeHtml).join(' · ')}</p><form method="post" action="/extract"><input type="hidden" name="targetUrl" value="${escapeHtml(card.startUrl)}" /><button class="button" type="submit">Run extraction test</button></form></article>`).join('')}
      </div>
    </section>

    <section class="panel">
      <div class="panel-title"><h3>Guide promise</h3><span class="badge badge-ready">usable draft</span></div>
      <h2>${escapeHtml(studioOutput.guideTitle)}</h2>
      <p class="big-copy">${escapeHtml(studioOutput.promise)}</p>
    </section>

    <section class="panel">
      <div class="panel-title"><h3>Canva card set: first-time buyer mistakes</h3><span class="muted">Use for carousel, article inserts, or short video</span></div>
      <div class="mistake-grid">${studioOutput.mistakeCards.map((card) => `<article class="mistake-card"><span>${escapeHtml(card.label)}</span><h4>${escapeHtml(card.title)}</h4><p>${escapeHtml(card.note)}</p></article>`).join('')}</div>
    </section>

    <section class="panel"><div class="panel-title"><h3>Comparison table graphic</h3><span class="badge badge-ready">visual-ready</span></div><table><thead><tr>${studioOutput.comparisonRows[0].map((cell) => `<th>${escapeHtml(cell)}</th>`).join('')}</tr></thead><tbody>${studioOutput.comparisonRows.slice(1).map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></section>

    <section class="panel output-pack" id="article-output"><div class="panel-title"><h3>Output Pack</h3><span class="muted">Copy these into Substack, Canva, CapCut, or a future exporter</span></div>${renderPre('Article Markdown', article)}${renderPre('Product Card JSON', productJson)}${renderPre('Visual Asset Brief', visualBrief)}${renderPre('Short Video Hooks', videoPack)}</section>

    <script>document.querySelectorAll('.copy-button').forEach((button) => { button.addEventListener('click', async () => { const text = decodeURIComponent(button.dataset.copy); await navigator.clipboard.writeText(text); const original = button.textContent; button.textContent = 'Copied'; setTimeout(() => button.textContent = original, 900); }); });</script>
  `);
}

function renderExtractionResult(result) {
  const fields = result.detectedFields ? Object.entries(result.detectedFields).map(([key, value]) => `<li><strong>${escapeHtml(key)}:</strong> ${escapeHtml(String(value))}</li>`).join('') : '';
  return `<div class="extract-result"><div class="panel-title"><h4>Extraction result</h4><span class="badge ${result.ok ? 'badge-ready' : 'badge-needs_review'}">${escapeHtml(result.status)}</span></div><p><strong>URL:</strong> ${escapeHtml(result.targetUrl)}</p>${result.blocker ? `<p><strong>Blocker:</strong> ${escapeHtml(result.blocker)}</p>` : ''}${result.title ? `<p><strong>Title:</strong> ${escapeHtml(result.title)}</p>` : ''}${result.description ? `<p><strong>Description:</strong> ${escapeHtml(result.description)}</p>` : ''}<ul class="field-list">${fields}</ul>${result.headings && result.headings.length ? `<p><strong>Headings:</strong> ${result.headings.map(escapeHtml).join(' · ')}</p>` : ''}${result.textSample ? `<details><summary>Text sample</summary><pre>${escapeHtml(result.textSample)}</pre></details>` : ''}</div>`;
}

module.exports = { studioOutput, articleMarkdown, renderStudioPage };
