const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { Store } = require("./store");

const PUBLIC_DIR = path.join(__dirname, "..", "public");
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

function sendJson(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) request.destroy();
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });
    request.on("error", reject);
  });
}

function serveStatic(requestPath, response) {
  const requested = requestPath === "/" ? "index.html" : requestPath.slice(1);
  const filePath = path.join(PUBLIC_DIR, requested);
  if (!filePath.startsWith(PUBLIC_DIR) || !fs.existsSync(filePath)) return false;
  response.writeHead(200, { "Content-Type": MIME_TYPES[path.extname(filePath)] || "text/plain" });
  fs.createReadStream(filePath).pipe(response);
  return true;
}

function createServer({ store = new Store() } = {}) {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    try {
      if (request.method === "GET" && url.pathname === "/api/dashboard") {
        return sendJson(response, 200, store.getDashboard());
      }
      if (request.method === "POST" && url.pathname === "/api/runs") {
        return sendJson(response, 201, store.createRun(await readJson(request)));
      }
      if (request.method === "GET" && url.pathname.startsWith("/api/runs/")) {
        const run = store.getRun(decodeURIComponent(url.pathname.slice("/api/runs/".length)));
        return sendJson(response, run ? 200 : 404, run || { error: "Run not found." });
      }
      if (request.method === "GET" && serveStatic(url.pathname, response)) return;
      sendJson(response, 404, { error: "Not found." });
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  createServer().listen(port, () => {
    console.log(`Synth Buyer Guide Agent running at http://localhost:${port}`);
  });
}

module.exports = { createServer };
