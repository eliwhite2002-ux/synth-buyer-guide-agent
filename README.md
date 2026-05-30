# Synth Companions Buyer Guide Agent

Internal editorial workflow app for building buyer-guide research queues from source/vendor seed lists.

Issue #1 provides the first working slice: a dark internal dashboard, durable local data, extraction-run creation, queued sources, sample seed import, the required seed run, and work logs. It intentionally does not perform extraction yet.

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
- the broader source list remains available for UI import.

## Issue #2 Hooks

The source queue exposes a disabled mock-extraction action and placeholder run tabs for Product Candidates, Asset Rights, Guide Blocks, and Output Pack. Issue #2 should add mock extraction behind testable adapter functions while clearly marking mock data as unverified.
