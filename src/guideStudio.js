const studioOutput = {
  guideTitle: 'First-Time Sex Doll Buyer Guide: How to Buy Without Regret',
  promise: 'A practical first-time buyer guide focused on avoiding regret: weight, storage, cleaning, vendor trust, realistic photos, material choice, and whether the product fits the buyer’s real home.',
  articleSections: [
    {
      title: 'Opening promise',
      body: 'This guide is for the person who is curious enough to buy, but smart enough not to trust a beautiful product photo and a discount timer as a buying strategy. The goal is simple: help a first-time buyer avoid the purchase they regret after the box arrives.'
    },
    {
      title: 'The five first-time buyer mistakes',
      body: 'Most first-time buyers make the same mistakes: buying too much doll, treating weight like a footnote, choosing material without understanding maintenance, trusting vendor photos too much, and forgetting the private logistics of delivery, cleaning, drying, storage, and disposal.'
    },
    {
      title: 'The real-home test',
      body: 'Before comparing bodies, ask where it will live, whether one person can safely move it, whether it can be cleaned without turning the bathroom into a project, whether it can dry properly, whether delivery is private, and whether the owner can maintain it without resenting the work.'
    },
    {
      title: 'Weight is the hidden purchase decision',
      body: 'Weight affects lifting, storage, cleaning, posing, damage risk, and whether the buyer actually uses the product after the novelty wears off. For a first-time buyer, weight is not a secondary spec. It is one of the main buying decisions.'
    },
    {
      title: 'TPE vs silicone in plain English',
      body: 'TPE often attracts first-time buyers because of cost and softness. Silicone often attracts buyers because of durability, detail, and cleaning advantages. The guide should not pretend one is universally better. The practical question is what maintenance burden the buyer can actually live with.'
    },
    {
      title: 'Vendor photos are not ownership evidence',
      body: 'Product photos are useful for style and options, but they are not proof of ownership experience. Lighting, posing, editing, professional photography, and selected angles can hide what a buyer needs to know. The guide should prefer verified specs, clear support policies, owner-language patterns, and practical handling details.'
    },
    {
      title: 'AI and robotics caution',
      body: 'First-time buyers should not chase AI heads or robotics before solving the basic ownership problem. Voice, memory, and companion tech can improve presence, but only if the physical product is manageable, repairable, private, and not locked into a weak app or gimmick.'
    }
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
  checklist: [
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
  ],
  visualBriefs: [
    {
      asset: 'Hero graphic',
      format: '16:9 article cover',
      direction: 'No explicit imagery. Dark editorial background, checklist/product-card motif, headline: First-Time Sex Doll Buyer Guide. Subhead: How to buy without regret.'
    },
    {
      asset: 'Five mistakes carousel',
      format: '5 square cards',
      direction: 'One card per mistake. Use neutral icons: weight, box, water/drop, camera, closet. No product nudity or fake product photos.'
    },
    {
      asset: 'Real-home test checklist',
      format: 'Vertical infographic',
      direction: 'Apartment/closet/bathroom workflow style. Questions: move it, clean it, dry it, store it, receive it privately.'
    },
    {
      asset: 'Weight warning card',
      format: 'Short-video background or article insert',
      direction: 'Scale/handling motif. Copy: Weight is not a footnote. It decides whether you actually use the product.'
    },
    {
      asset: 'Comparison table graphic',
      format: 'Wide article image',
      direction: 'Use buyer situation vs better first direction vs avoid first. Make it look like a practical buying tool.'
    }
  ],
  shortVideos: [
    {
      hook: 'The biggest first-time sex doll buyer mistake is buying too much doll.',
      beats: ['Fantasy shopping says bigger and more realistic.', 'Ownership says can you move it, clean it, store it, and keep using it?', 'Buy for the life you actually have.'],
      visual: 'Use mistake card 1 plus real-home checklist cuts.'
    },
    {
      hook: 'The most ignored sex doll spec is weight.',
      beats: ['Weight controls cleaning.', 'Weight controls storage.', 'Weight controls whether the doll becomes a regret purchase.'],
      visual: 'Weight warning card plus simple scale icon.'
    },
    {
      hook: 'Vendor photos are not ownership evidence.',
      beats: ['Photos show style.', 'They do not show cleaning, storage, moving, delivery, or support.', 'Look for specs, owner signals, and clear policies.'],
      visual: 'Camera icon over product-card mockup, no explicit imagery.'
    },
    {
      hook: 'Do not buy an AI head before solving the basic ownership problem.',
      beats: ['Voice and memory can matter.', 'But not if the physical product is too heavy, hard to clean, or locked into a weak app.', 'Body first. Companion tech second.'],
      visual: 'AI/robotics caution card with neutral device icon.'
    }
  ],
  productCardSchema: {
    vendor: 'Vendor name',
    productName: 'Product name',
    sourceUrl: 'Verified source URL',
    material: 'TPE / Silicone / Hybrid / Unknown',
    height: 'Confirmed height',
    weight: 'Confirmed weight',
    price: 'Visible price or range',
    imageRights: 'Unknown / Vendor Approved / Affiliate Approved / Do Not Use',
    bestFor: 'Specific buyer situation',
    avoidIf: 'Specific mismatch',
    ownerAdvantage: 'Practical ownership advantage',
    ownerRisk: 'Practical ownership risk',
    recommendationStatus: 'Include / Watch / Reject / Needs Review'
  }
};

function markdownTable(rows) {
  const [header, ...body] = rows;
  return [
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
    ...body.map((row) => `| ${row.join(' | ')} |`)
  ].join('\n');
}

function articleMarkdown() {
  return [
    `# ${studioOutput.guideTitle}`,
    '',
    studioOutput.promise,
    '',
    ...studioOutput.articleSections.flatMap((section) => [`## ${section.title}`, '', section.body, '']),
    '## First-time buyer decision table',
    '',
    markdownTable(studioOutput.comparisonRows),
    '',
    '## Buying checklist',
    '',
    ...studioOutput.checklist.map((item) => `- ${item}`)
  ].join('\n');
}

function renderPre(title, content) {
  return `<article class="output-block"><div class="panel-title"><h3>${title}</h3><button class="copy-button" data-copy="${encodeURIComponent(content)}">Copy</button></div><pre>${escapeHtml(content)}</pre></article>`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderStudioPage(layout) {
  const article = articleMarkdown();
  const productJson = JSON.stringify(studioOutput.productCardSchema, null, 2);
  const visualBrief = studioOutput.visualBriefs.map((brief) => `${brief.asset}\nFormat: ${brief.format}\nDirection: ${brief.direction}`).join('\n\n');
  const videoPack = studioOutput.shortVideos.map((video, index) => `${index + 1}. ${video.hook}\n- ${video.beats.join('\n- ')}\nVisual: ${video.visual}`).join('\n\n');

  return layout('Buyer Guide Studio', `
    <section class="hero studio-hero">
      <div>
        <p class="eyebrow">Useful MVP direction</p>
        <h2>Buyer Guide Studio</h2>
        <p>This is the part the tool actually needs: guide draft, visual briefs, checklist graphics, comparison table, product-card schema, and short-video hooks. Source queues support this; they are not the product.</p>
      </div>
      <a class="button primary" href="#article-output">Open output pack</a>
    </section>

    <section class="cards studio-cards">
      <article class="card"><span>Article sections</span><strong>${studioOutput.articleSections.length}</strong></article>
      <article class="card"><span>Mistake cards</span><strong>${studioOutput.mistakeCards.length}</strong></article>
      <article class="card"><span>Visual briefs</span><strong>${studioOutput.visualBriefs.length}</strong></article>
      <article class="card"><span>Short-video hooks</span><strong>${studioOutput.shortVideos.length}</strong></article>
    </section>

    <section class="panel">
      <div class="panel-title"><h3>Guide promise</h3><span class="badge badge-ready">usable draft</span></div>
      <h2>${escapeHtml(studioOutput.guideTitle)}</h2>
      <p class="big-copy">${escapeHtml(studioOutput.promise)}</p>
    </section>

    <section class="panel">
      <div class="panel-title"><h3>Graphic card set: first-time buyer mistakes</h3><span class="muted">Use for carousel, article inserts, or short video</span></div>
      <div class="mistake-grid">
        ${studioOutput.mistakeCards.map((card) => `<article class="mistake-card"><span>${escapeHtml(card.label)}</span><h4>${escapeHtml(card.title)}</h4><p>${escapeHtml(card.note)}</p></article>`).join('')}
      </div>
    </section>

    <section class="panel">
      <div class="panel-title"><h3>Comparison table graphic</h3><span class="badge badge-ready">visual-ready</span></div>
      <table>
        <thead><tr>${studioOutput.comparisonRows[0].map((cell) => `<th>${escapeHtml(cell)}</th>`).join('')}</tr></thead>
        <tbody>${studioOutput.comparisonRows.slice(1).map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
      </table>
    </section>

    <section class="panel output-pack" id="article-output">
      <div class="panel-title"><h3>Output Pack</h3><span class="muted">Copy these into Substack, Canva, CapCut, or a future exporter</span></div>
      ${renderPre('Article Markdown', article)}
      ${renderPre('Product Card JSON', productJson)}
      ${renderPre('Visual Asset Brief', visualBrief)}
      ${renderPre('Short Video Hooks', videoPack)}
    </section>

    <script>
      document.querySelectorAll('.copy-button').forEach((button) => {
        button.addEventListener('click', async () => {
          const text = decodeURIComponent(button.dataset.copy);
          await navigator.clipboard.writeText(text);
          const original = button.textContent;
          button.textContent = 'Copied';
          setTimeout(() => button.textContent = original, 900);
        });
      });
    </script>
  `);
}

module.exports = {
  studioOutput,
  articleMarkdown,
  renderStudioPage
};
