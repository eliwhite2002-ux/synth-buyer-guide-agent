# Synth Companions Buyer Guide Agent

Internal editorial workflow app for building buyer-guide research queues from source/vendor seed lists.

The app provides a dark internal dashboard, durable local data, extraction-run creation, queued sources, sample seed import, the required seed run, and work logs. The first extraction adapter is intentionally a mock/unverified adapter: it records submitted URLs and creates review-only evidence records without pretending page contents were fetched or verified.

## Stack

The MVP uses dependency-free Node.js and a durable JSON store at `data/store.json`. This keeps setup small and the model explicit while leaving room for extraction adapters in later issues.

## Run

Requirements: Node.js 20 or newer.

```powershell
npm start
```

Open `http://localhost:3000`.

## Test

```powershell
npm test
```

The test suite verifies:

- the app server starts;
- `Extraction Run 001` appears with its four required sources;
- a new run is created through the API;
- pasted non-empty lines create durable source rows with the required defaults;
- run creation and source parsing create work-log entries;
- the broader source list remains available for UI import;
- mock URL extraction creates saved evidence, review-only candidate cards, work logs, refreshed guide blocks, and a draft output package.

## Extraction Adapter

The Sources tab accepts a vendor or product URL and routes it through `src/extractors/mock.js`. The mock adapter persists source-linked evidence snippets, creates a candidate card with `needs_review` status, and refreshes the run guide package. Its records are labeled `mock_unverified`. Replace it with real discovery and extraction adapters before treating any field as verified.

Asset Rights remains a placeholder until rights-classification behavior is added.
