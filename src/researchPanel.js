function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function queueActions(item) {
  const extract = `<form method="post" action="/extract"><input type="hidden" name="targetUrl" value="${escapeHtml(item.url)}" /><button class="button" type="submit">Extract</button></form>`;
  const rerun = `<form method="post" action="/extract"><input type="hidden" name="targetUrl" value="${escapeHtml(item.url)}" /><button class="button" type="submit">Re-run</button></form>`;
  const ignore = `<form method="post" action="/queue-action"><input type="hidden" name="queueId" value="${escapeHtml(item.id)}" /><input type="hidden" name="queueStatus" value="ignored" /><button class="button" type="submit">Ignore</button></form>`;
  const saveSource = `<form method="post" action="/queue-action"><input type="hidden" name="queueId" value="${escapeHtml(item.id)}" /><input type="hidden" name="queueStatus" value="saved_source" /><button class="button" type="submit">Save Source</button></form>`;
  const requeue = `<form method="post" action="/queue-action"><input type="hidden" name="queueId" value="${escapeHtml(item.id)}" /><input type="hidden" name="queueStatus" value="queued" /><button class="button" type="submit">Re-queue</button></form>`;
  const viewEvidence = `<a class="button" href="#saved-research">View Evidence</a>`;
  const viewCandidate = `<a class="button" href="#candidate-cards">View Candidate</a>`;
  const viewBlocker = `<span class="button disabled">View Blocker</span>`;
  const viewSource = `<a class="button" href="${escapeHtml(item.url)}" target="_blank">View Source</a>`;

  if (item.queueStatus === 'queued') return `${extract}${saveSource}${ignore}`;
  if (item.queueStatus === 'extracted') return `${viewEvidence}${rerun}${ignore}`;
  if (item.queueStatus === 'saved_source') return `${viewSource}${rerun}${ignore}`;
  if (item.queueStatus === 'ignored') return requeue;
  if (item.queueStatus === 'blocked') return `${viewBlocker}${rerun}${ignore}`;
  if (item.queueStatus === 'candidate_created') return `${viewCandidate}${viewEvidence}${rerun}`;
  return `${extract}${ignore}`;
}

function renderDiscoveryQueue(discoveryQueue = []) {
  const rows = discoveryQueue.length
    ? discoveryQueue.map((item) => `<tr><td><strong>${escapeHtml(item.label)}</strong><br><a href="${escapeHtml(item.url)}" target="_blank">${escapeHtml(item.url)}</a></td><td>${escapeHtml(item.linkType)}</td><td>${escapeHtml(item.queueStatus)}</td><td>${escapeHtml(item.reviewStatus)}</td><td>${escapeHtml(item.recommendationStatus)}</td><td>${escapeHtml(item.mediaRights)}</td><td><div class="queue-actions">${queueActions(item)}</div></td></tr>`).join('')
    : '<tr><td colspan="7" class="muted">Extract a vendor homepage to populate the discovery queue.</td></tr>';

  return `<section class="panel" id="discovery-queue"><div class="panel-title"><h3>Discovery Queue</h3><span class="badge badge-needs_review">${discoveryQueue.length} queued link${discoveryQueue.length === 1 ? '' : 's'}</span></div><p class="muted">Suggested internal links become queue items. Queue status, review status, and recommendation status are separate.</p><table><thead><tr><th>Link</th><th>Type</th><th>Queue</th><th>Review</th><th>Recommendation</th><th>Media</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></section>`;
}

function renderResearchPanel({ researchRecords, discoveryQueue = [], productCandidates, guidePackage }) {
  const recordsHtml = researchRecords.length
    ? researchRecords.map((record) => `<article class="research-card"><div class="panel-title"><h4>${escapeHtml(record.evidence.title || record.sourceUrl)}</h4><span class="badge badge-inbox">${escapeHtml(record.evidenceKind || 'evidence')}</span></div><p><strong>URL:</strong> <a href="${escapeHtml(record.sourceUrl)}">${escapeHtml(record.sourceUrl)}</a></p><p><strong>Adapter:</strong> ${escapeHtml(record.adapter)} · <strong>Confidence:</strong> ${escapeHtml(record.confidence)} · <strong>Status:</strong> ${escapeHtml(record.verificationStatus)}</p>${record.blocker ? `<p><strong>Blocker:</strong> ${escapeHtml(record.blocker)}</p>` : ''}<p>${escapeHtml(record.evidence.description || record.evidence.textSample || 'No text evidence captured.')}</p></article>`).join('')
    : '<p class="muted">Run a URL extraction to save the first evidence record.</p>';

  const candidatesHtml = productCandidates.length
    ? productCandidates.map((candidate) => `<article class="research-card"><h4>${escapeHtml(candidate.productName)}</h4><p>${escapeHtml(candidate.vendor)}</p><p><strong>Source:</strong> <a href="${escapeHtml(candidate.productUrl)}">${escapeHtml(candidate.productUrl)}</a></p><p><strong>Queue:</strong> ${escapeHtml(candidate.queueStatus || 'candidate_created')} · <strong>Review:</strong> ${escapeHtml(candidate.reviewStatus || 'needs_review')} · <strong>Recommendation:</strong> ${escapeHtml(candidate.recommendationStatus)}</p><p><strong>Media rights:</strong> ${escapeHtml(candidate.mediaRights || candidate.imageRights)}</p><p>${escapeHtml(candidate.evidenceNotes)}</p></article>`).join('')
    : '<p class="muted">Likely product/category-page extractions will create review-only product candidate cards here. Vendor homepages will not.</p>';

  const guideRows = guidePackage.comparisonRows.length
    ? `<table><thead><tr><th>Vendor</th><th>Candidate</th><th>Status</th><th>Evidence</th></tr></thead><tbody>${guidePackage.comparisonRows.map((row) => `<tr><td>${escapeHtml(row.vendor)}</td><td>${escapeHtml(row.productName)}</td><td>${escapeHtml(row.status)}</td><td><a href="${escapeHtml(row.sourceUrl)}">source URL</a></td></tr>`).join('')}</tbody></table>`
    : '<p class="muted">No evidence-backed product rows yet. Extract a likely product/category queue item next.</p>';

  return `<section class="panel" id="saved-research"><div class="panel-title"><h3>Saved Research Records</h3><span class="badge badge-needs_review">${researchRecords.length} evidence record${researchRecords.length === 1 ? '' : 's'}</span></div><p class="muted">Each extraction remains attached to its URL, evidence snapshot, confidence, and review status.</p><div class="research-grid">${recordsHtml}</div></section>${renderDiscoveryQueue(discoveryQueue)}<section class="panel" id="candidate-cards"><div class="panel-title"><h3>Product Candidate Cards</h3><span class="badge badge-needs_review">review only</span></div><div class="research-grid">${candidatesHtml}</div></section><section class="panel"><div class="panel-title"><h3>Evidence-backed Guide Package Update</h3><span class="badge badge-needs_review">${escapeHtml(guidePackage.status)}</span></div><p>${escapeHtml(guidePackage.articleUpdate)}</p>${guideRows}</section>`;
}

module.exports = { renderResearchPanel };
