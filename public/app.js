const app = document.querySelector("#app");
const newRunButton = document.querySelector("#new-run-button");
const state = { dashboard: null, view: "dashboard", run: null, runTab: "sources" };

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const badge = (value) => `<span class="badge ${escapeHtml(value)}">${escapeHtml(value).replaceAll("_", " ")}</span>`;
const list = (values) => values?.length ? `<span class="comma-list">${values.map(escapeHtml).join(", ")}</span>` : '<span class="muted">None yet</span>';
const api = async (url, options) => {
  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Request failed.");
  return body;
};

async function loadDashboard() {
  state.dashboard = await api("/api/dashboard");
}

function renderDashboard() {
  const { summary, runs } = state.dashboard;
  const cards = [
    ["Extraction runs", summary.extractionRuns],
    ["Sources", summary.sources],
    ["Product candidates", summary.productCandidates],
    ["Blocked sources", summary.blockedSources],
    ["Ready guide blocks", summary.readyGuideBlocks],
    ["Needs review", summary.needsReview],
  ];
  app.innerHTML = `
    <section>
      <p class="eyebrow">Dashboard</p>
      <h2>Extraction runs</h2>
      <p class="muted">Start with vendor names. The workflow owns discovery, evidence collection, and narrow exception tracking.</p>
      <div class="cards">${cards.map(([label, value]) => `<article class="card"><span>${label}</span><strong>${value}</strong></article>`).join("")}</div>
      <article class="panel">
        <div class="panel-header"><div><h3>Run history</h3><p class="muted">Seed data and editorial research runs.</p></div></div>
        <div class="table-wrap">
          <table><thead><tr><th>Title</th><th>Guide type</th><th>Status</th><th>Sources</th><th>Created</th></tr></thead>
          <tbody>${runs.map((run) => `
            <tr class="clickable" data-run-id="${escapeHtml(run.id)}">
              <td><strong>${escapeHtml(run.title)}</strong></td><td>${escapeHtml(run.guideType)}</td>
              <td>${badge(run.status)}</td><td>${run.sourceCount}</td><td>${new Date(run.createdAt).toLocaleString()}</td>
            </tr>`).join("")}</tbody></table>
        </div>
      </article>
    </section>`;
  document.querySelectorAll("[data-run-id]").forEach((row) => row.addEventListener("click", () => openRun(row.dataset.runId)));
}

function renderNewRun() {
  const samples = state.dashboard.sampleSeeds;
  app.innerHTML = `
    <section>
      <button class="button ghost" id="back">Back to dashboard</button>
      <article class="panel">
        <p class="eyebrow">New extraction run</p>
        <h2>Create a research queue</h2>
        <p class="muted">Paste source names or URLs. Each non-empty line becomes a queued source for later discovery.</p>
        <form id="new-run-form" class="form-grid">
          <label>Title<input name="title" required placeholder="Example: Vendor trust refresh" /></label>
          <label>Guide type<select name="guideType">
            ${["First-Time Buyer Guide", "TPE vs Silicone", "Weight & Storage", "Vendor Trust", "AI Heads"].map((type) => `<option>${type}</option>`).join("")}
          </select></label>
          <label class="full">Seed list<textarea name="seedList" required placeholder="One source per line"></textarea></label>
          <div class="full seed-box"><button type="button" class="button" id="use-samples">Use broader sample list</button><span>${samples.length} importable seeds from <code>data/seed-vendors.json</code></span></div>
          <p class="full error" id="form-error"></p>
          <div class="full form-actions"><span class="muted">Discovery and extraction arrive in Issue #2.</span><button class="button primary">Create run</button></div>
        </form>
      </article>
    </section>`;
  document.querySelector("#back").addEventListener("click", showDashboard);
  document.querySelector("#use-samples").addEventListener("click", () => {
    document.querySelector("[name=seedList]").value = samples.join("\n");
  });
  document.querySelector("#new-run-form").addEventListener("submit", createRun);
}

async function createRun(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const error = document.querySelector("#form-error");
  error.textContent = "";
  try {
    const run = await api("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    await loadDashboard();
    state.run = run;
    state.view = "run";
    state.runTab = "sources";
    renderRun();
  } catch (requestError) {
    error.textContent = requestError.message;
  }
}

async function openRun(id) {
  state.run = await api(`/api/runs/${encodeURIComponent(id)}`);
  state.view = "run";
  state.runTab = "sources";
  renderRun();
}

function renderSources() {
  const rows = state.run.sources.map((source) => `
    <tr>
      <td><strong>${escapeHtml(source.name)}</strong></td><td>${escapeHtml(source.sourceType)}</td>
      <td>${source.officialUrl ? `<a href="${escapeHtml(source.officialUrl)}">${escapeHtml(source.officialUrl)}</a>` : '<span class="muted">Not discovered</span>'}</td>
      <td>${badge(source.confidence)}</td><td>${badge(source.status)}</td>
      <td>${list(source.importantPages)}</td><td>${list(source.extractableFields)}</td>
      <td>${list(source.blockers)}</td><td>${escapeHtml(source.nextAction)}</td>
    </tr>`).join("");
  return `
    <article class="panel">
      <div class="panel-header"><div><h3>Source queue</h3><p class="muted">${state.run.sources.length} source rows waiting for discovery.</p></div>
      <button class="button" disabled>Mock extraction: Coming in Issue #2</button></div>
      <div class="table-wrap"><table><thead><tr><th>Name</th><th>Type</th><th>Official URL</th><th>Confidence</th><th>Status</th><th>Important pages</th><th>Extractable fields</th><th>Blockers</th><th>Next action</th></tr></thead><tbody>${rows}</tbody></table></div>
    </article>`;
}

function renderWorkLog() {
  return `<article class="panel"><h3>Work log</h3><p class="muted">A durable record of workflow actions for this run.</p>
    <div class="list">${state.run.workLogs.map((log) => `<div class="log"><p>${escapeHtml(log.message)}</p><span>${badge(log.severity)} <small class="muted">${new Date(log.createdAt).toLocaleString()}</small></span></div>`).join("")}</div></article>`;
}

function renderRun() {
  const tabs = ["Sources", "Product Candidates", "Asset Rights", "Guide Blocks", "Output Pack", "Work Log"];
  app.innerHTML = `
    <section>
      <button class="button ghost" id="back">Back to dashboard</button>
      <div class="run-header">
        <div><p class="eyebrow">${escapeHtml(state.run.guideType)}</p><h2>${escapeHtml(state.run.title)}</h2></div>
        <div>${badge(state.run.status)}</div>
      </div>
      <nav class="tabs">${tabs.map((tab) => {
        const active = tab.toLowerCase().replaceAll(" ", "_") === state.runTab;
        const enabled = tab === "Sources" || tab === "Work Log";
        return `<button class="tab ${active ? "active" : ""}" data-tab="${tab.toLowerCase().replaceAll(" ", "_")}" ${enabled ? "" : "disabled"}>${tab}${enabled ? "" : " - Issue #2"}</button>`;
      }).join("")}</nav>
      ${state.runTab === "work_log" ? renderWorkLog() : renderSources()}
    </section>`;
  document.querySelector("#back").addEventListener("click", showDashboard);
  document.querySelectorAll("[data-tab]:not(:disabled)").forEach((tab) => tab.addEventListener("click", () => {
    state.runTab = tab.dataset.tab;
    renderRun();
  }));
}

function showDashboard() {
  state.view = "dashboard";
  renderDashboard();
}

newRunButton.addEventListener("click", () => {
  state.view = "new";
  renderNewRun();
});

loadDashboard().then(renderDashboard).catch((error) => {
  app.innerHTML = `<article class="panel"><h2>Unable to load dashboard</h2><p class="error">${escapeHtml(error.message)}</p></article>`;
});
