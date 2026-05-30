const http = require('http');
const fs = require('fs');
const path = require('path');
const { URLSearchParams } = require('url');
const { createExtractionRun, ensureDatabase, getDashboard, getResearchState, getRun, saveExtractionResult, updateCandidateReview, updateQueueStatus } = require('./data');
const { exportPublicationPack, renderBuilderPage } = require('./guideBuilder');
const { renderStudioPage } = require('./guideStudio');
const { renderResearchPanel } = require('./researchPanel');
const { extractUrl } = require('./extractor');
const PORT = Number(process.env.PORT || 3000);
let latestExtractionResult = null;

function escapeHtml(value) { return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;'); }
function badge(value) { const safe = escapeHtml(value || 'unknown'); return `<span class="badge badge-${safe.replace(/[^a-z0-9_-]/gi, '').toLowerCase()}">${safe}</span>`; }
function copyScript() { return `<script>document.addEventListener('click', async function(event) { const button = event.target.closest('[data-copy-target]'); if (!button) return; const target = document.getElementById(button.dataset.copyTarget); if (!target) return; const original = button.textContent; try { await navigator.clipboard.writeText(target.innerText); button.textContent = 'Copied'; setTimeout(function(){ button.textContent = original; }, 1200); } catch (error) { const range = document.createRange(); range.selectNodeContents(target); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); button.textContent = 'Selected'; setTimeout(function(){ button.textContent = original; }, 1600); } });</script>`; }
function layout(title, body) { return `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escapeHtml(title)} · Synth Buyer Guide Agent</title><link rel="stylesheet" href="/styles.css" /></head><body><header class="topbar"><div><p class="eyebrow">Synth Companions</p><h1>Buyer Guide Agent</h1></div><nav><a href="/builder">Guide Builder</a><a href="/studio">Research Studio</a><a href="/">Dashboard</a><a href="/runs/new">New Run</a></nav></header><main>${body}</main>${copyScript()}</body></html>`; }

function renderDashboard() {
  const dashboard = getDashboard();
  const firstRun = dashboard.runs[0];
  const cards = [
    ['Extraction Runs', dashboard.counts.extractionRuns],
    ['Sources', dashboard.counts.sources],
    ['Product Candidates', dashboard.counts.productCandidates],
    ['Blocked Sources', dashboard.counts.blockedSources],
    ['Ready Guide Blocks', dashboard.counts.readyGuideBlocks],
    ['Needs Review', dashboard.counts.needsReview]
  ];
  return layout('Dashboard', `<section class="hero"><div><p class="eyebrow">Production tool direction</p><h2>Build the buyer guide package from evidence</h2><p>The research layer gathers URL evidence and review-only product candidates. The Guide Builder turns that evidence into copy-ready article, Canva, comparison, checklist, and short-video outputs.</p></div><a class="button primary" href="/builder">Open Guide Builder</a></section><section class="cards">${cards.map(([label, count]) => `<article class="card"><span>${escapeHtml(label)}</span><strong>${count}</strong></article>`).join('')}</section><section class="panel two-col"><div><h3>Guide Builder</h3><p class="muted">Assemble the first-time buyer guide package from saved evidence and product candidates.</p><a class="button primary" href="/builder">Open output composer</a></div><div><h3>Research Studio</h3><p class="muted">Extract vendor/product URLs, save evidence, review discovery links, and create review-only candidate cards.</p><a class="button" href="/studio">Open research studio</a></div></section><section class="panel"><div class="panel-title"><h3>Extraction Runs</h3><a class="button" href="/runs/new">New run</a></div><table><thead><tr><th>Title</th><th>Guide Type</th><th>Status</th><th>Created</th><th></th></tr></thead><tbody>${dashboard.runs.map((run) => `<tr><td>${escapeHtml(run.title)}</td><td>${escapeHtml(run.guideType)}</td><td>${badge(run.status)}</td><td>${escapeHtml(new Date(run.createdAt).toLocaleString())}</td><td><a href="/runs/${encodeURIComponent(run.id)}">Open</a></td></tr>`).join('')}</tbody></table></section>`);
}

function renderNewRun() {
  const dashboard = getDashboard();
  return layout('New Extraction Run', `<section class="panel narrow"><h2>Create extraction run</h2><form method="post" action="/runs"><label>Title<input name="title" value="First-Time Buyer Guide Source Pass" required /></label><label>Guide Type<select name="guideType">${dashboard.guideTypes.map((type) => `<option>${escapeHtml(type)}</option>`).join('')}</select></label><label>Seed List<textarea name="seedList" rows="12" required>${escapeHtml(dashboard.broaderSourceList.join('\n'))}</textarea></label><label>Notes<textarea name="notes" rows="4"></textarea></label><button class="button primary" type="submit">Create Run</button></form></section>`);
}

function renderRun(runId) {
  const data = getRun(runId);
  if (!data) return layout('Run not found', '<section class="panel"><h2>Run not found</h2></section>');
  const { run, sources, workLogs } = data;
  return layout(run.title, `<section class="hero compact"><div><p class="eyebrow">${escapeHtml(run.guideType)}</p><h2>${escapeHtml(run.title)}</h2><p>${escapeHtml(run.notes || 'No notes yet.')}</p></div>${badge(run.status)}</section><section class="tabs"><a class="active" href="#sources">Sources</a><a href="#worklog">Work Log</a><a href="/studio">Research Studio</a><a href="/builder">Guide Builder</a></section><section class="panel" id="sources"><h3>Source Queue</h3><table><thead><tr><th>Name</th><th>Type</th><th>Official URL</th><th>Confidence</th><th>Status</th><th>Extractable Fields</th><th>Blockers</th><th>Next Action</th></tr></thead><tbody>${sources.map((source) => `<tr><td>${escapeHtml(source.name)}</td><td>${badge(source.sourceType)}</td><td>${source.officialUrl ? `<a href="${escapeHtml(source.officialUrl)}">${escapeHtml(source.officialUrl)}</a>` : 'pending'}</td><td>${badge(source.confidence)}</td><td>${badge(source.status)}</td><td>${escapeHtml(source.extractableFields || 'pending')}</td><td>${escapeHtml(source.blockers || 'none logged')}</td><td>${escapeHtml(source.nextAction)}</td></tr>`).join('')}</tbody></table></section><section class="panel" id="worklog"><h3>Work Log</h3><ul class="log-list">${workLogs.map((log) => `<li><span>${badge(log.severity)}</span><div>${escapeHtml(log.message)}<br><small>${escapeHtml(new Date(log.createdAt).toLocaleString())}</small></div></li>`).join('')}</ul></section>`);
}

function parseBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => { body += chunk.toString(); if (body.length > 1_000_000) request.destroy(); });
    request.on('end', () => resolve(new URLSearchParams(body)));
    request.on('error', reject);
  });
}

function redirect(response, location) { response.writeHead(303, { Location: location }); response.end(); }

async function handleRequest(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (url.pathname === '/styles.css') {
    response.writeHead(200, { 'Content-Type': 'text/css' });
    response.end(fs.readFileSync(path.join(__dirname, 'styles.css')));
    return;
  }
  if (request.method === 'GET' && url.pathname === '/') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(renderDashboard());
    return;
  }
  if (request.method === 'GET' && url.pathname === '/builder') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(renderBuilderPage(layout, getResearchState()));
    return;
  }
  if (request.method === 'GET' && url.pathname === '/builder/export') {
    response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Disposition': 'attachment; filename="first-time-buyer-guide-publication-pack.json"' });
    response.end(JSON.stringify(exportPublicationPack(getResearchState()), null, 2));
    return;
  }
  if (request.method === 'GET' && url.pathname === '/studio') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    const page = renderStudioPage(layout, latestExtractionResult);
    response.end(page.replace('</main>', `${renderResearchPanel(getResearchState())}</main>`));
    return;
  }
  if (request.method === 'POST' && url.pathname === '/extract') {
    const body = await parseBody(request);
    latestExtractionResult = await extractUrl(body.get('targetUrl'));
    saveExtractionResult(latestExtractionResult);
    redirect(response, '/studio#discovery-queue');
    return;
  }
  if (request.method === 'POST' && url.pathname === '/queue-action') {
    const body = await parseBody(request);
    updateQueueStatus(body.get('queueId'), body.get('queueStatus'));
    redirect(response, '/studio#discovery-queue');
    return;
  }
  if (request.method === 'POST' && url.pathname === '/candidate-review') {
    const body = await parseBody(request);
    updateCandidateReview(body.get('candidateId'), { reviewStatus: body.get('reviewStatus'), mediaRights: body.get('mediaRights'), imageRights: body.get('imageRights'), reviewNotes: body.get('reviewNotes') });
    redirect(response, '/studio#candidate-cards');
    return;
  }
  if (request.method === 'GET' && url.pathname === '/runs/new') {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(renderNewRun());
    return;
  }
  if (request.method === 'POST' && url.pathname === '/runs') {
    const body = await parseBody(request);
    const result = createExtractionRun({ title: body.get('title'), guideType: body.get('guideType'), seedList: body.get('seedList'), notes: body.get('notes') });
    redirect(response, `/runs/${encodeURIComponent(result.runId)}`);
    return;
  }
  const runMatch = url.pathname.match(/^\/runs\/([^/]+)$/);
  if (request.method === 'GET' && runMatch) {
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    response.end(renderRun(decodeURIComponent(runMatch[1])));
    return;
  }
  response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end(layout('Not found', '<section class="panel"><h2>Not found</h2></section>'));
}

ensureDatabase();
if (require.main === module) {
  http.createServer((request, response) => {
    handleRequest(request, response).catch((error) => {
      response.writeHead(500, { 'Content-Type': 'text/plain' });
      response.end(error.stack || String(error));
    });
  }).listen(PORT, () => console.log(`Synth Buyer Guide Agent running at http://localhost:${PORT}`));
}
module.exports = { handleRequest, renderDashboard, renderNewRun, renderRun, layout };
