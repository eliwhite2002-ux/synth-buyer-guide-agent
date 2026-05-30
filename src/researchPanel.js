function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderSuggestedLinks(record) {
  const links = Array.isArray(record.suggestedLinks) ? record.suggestedLinks : [];
  if (!links.length) return '';
  return `<div class="suggested-links"><h5>Try these next</h5><div class="suggested-link-grid">${links.map((link) => `<form method="post" action="/extract" class="suggested-link-form"><input type="hidden" name="targetUrl" value="${escapeHtml(link.url)}" /><button class="button" type="submit"><span>${escapeHtml(link.kind)}</span>${escapeHtml(link.label || link.url)}</button></form>`).join('')}</div></div>`;
}

function renderResearchPanel({ researchRecords, productCandidates, guidePackage }) {
  const recordsHtml = researchRecords.length
    ? researchRecords.map((record) => `<article class="research-card"><div class="panel-title"><h4>${escapeHtml(record.evidence.title || record.sourceUrl)}</h4><span class="badge badge-inbox">${escapeHtml(record.evidenceKind || 'evidence')}</span></div><p><strong>URL:</strong> <a href="${escapeHtml(record.sourceUrl)}">${escapeHtml(record.sourceUrl)}</a></p><p><strong>Adapter:</strong> ${escapeHtml(record.adapter)} · <strong>Confidence:</strong> ${escapeHtml(record.confidence)} · <strong>Status:</strong> ${escapeHtml(record.verificationStatus)}</p>${record.blocker ? `<p><strong>Blocker:</strong> ${escapeHtml(record.blocker)}</p>` : ''}<p>${escapeHtml(record.evidence.description || record.evidence.textSample || 'No text evidence captured.')}</p>${renderSuggestedLinks(record)}</article>`).join('')
    : '<p class="muted">Run a URL extraction to save the first evidence record.</p>';

  const candidatesHtml = productCandidates.length
    ? productCandidates.map((candidate) => `<article class="research-card"><h4>${escapeHtml(candidate.productName)}</h4><p>${escapeHtml(candidate.vendor)}</p><p><strong>Source:</strong> <a href="${escapeHtml(candidate.productUrl)}">${escapeHtml(candidate.productUrl)}</a></p><p><strong>Status:</strong> ${escapeHtml(candidate.recommendationStatus)} · <strong>Media rights:</strong> ${escapeHtml(candidate.imageRights)}</p><p>${escapeHtml(candidate.evidenceNotes)}</p></article>`).join('')
    : '<p class="muted">Likely product-page extractions will create review-only product candidate cards here. Vendor homepages will not.</p>';

  const guideRows = guidePackage.comparisonRows.length
    ? `<table><thead><tr><th>Vendor</th><th>Candidate</th><th>Status</th><th>Evidence</th></tr></thead><tbody>${guidePackage.comparisonRows.map((row) => `<tr><td>${escapeHtml(row.vendor)}</td><td>${escapeHtml(row.productName)}</td><td>${escapeHtml(row.status)}</td><td><a href="${escapeHtml(row.sourceUrl)}">source URL</a></td></tr>`).join('')}</tbody></table>`
    : '<p class="muted">No evidence-backed product rows yet. Extract a suggested product/category link next.</p>';

  return `<section class="panel" id="saved-research"><div class="panel-title"><h3>Saved Research Records</h3><span class="badge badge-needs_review">${researchRecords.length} evidence record${researchRecords.length === 1 ? '' : 's'}</span></div><p class="muted">Each extraction remains attached to its URL, evidence snapshot, confidence, and review status. Vendor pages can produce suggested internal links; product pages can create product candidate cards.</p><div class="research-grid">${recordsHtml}</div></section><section class="panel"><div class="panel-title"><h3>Product Candidate Cards</h3><span class="badge badge-needs_review">review only</span></div><div class="research-grid">${candidatesHtml}</div></section><section class="panel"><div class="panel-title"><h3>Evidence-backed Guide Package Update</h3><span class="badge badge-needs_review">${escapeHtml(guidePackage.status)}</span></div><p>${escapeHtml(guidePackage.articleUpdate)}</p>${guideRows}</section>`;
}

module.exports = { renderResearchPanel };
