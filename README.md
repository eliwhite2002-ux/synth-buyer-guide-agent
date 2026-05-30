# Synth Companions Buyer Guide Agent

Internal editorial workflow app for building Synth Companions buyer guides from source/vendor seed lists.

This project exists to stop the manual workflow of hunting product pages, copying specs, chasing images, and rebuilding every guide from scratch. The system should start from a vendor/source list, run discovery and extraction, classify confidence and media rights, create structured rows, and generate guide-ready outputs.

## Core workflow

1. Start from a seed list of vendor/source names or URLs.
2. Discover official source URL candidates and important internal pages.
3. Extract available source/product fields.
4. Classify confidence and access blockers.
5. Create source rows and product candidate rows.
6. Classify image/media rights before publication.
7. Generate guide blocks from verified/probable rows.
8. Export article markdown, comparison tables, product-card JSON, visual briefs, and short-video hooks.

## First MVP

The first app version should include:

- Dashboard for extraction runs
- New run form
- Source queue
- Product candidates table
- Asset/media rights tracker
- Guide block generator
- Output pack exporter
- Work log
- Mock extraction mode
- Seed run for Zelex Dolls, WM Doll, Irontech Doll, and Tayu Doll

## Hard rule

Eli reviews final judgment. Eli does not become the research assistant.

The app should escalate only narrow access-wall exceptions after logging what it tried and what is missing.

## Status

Initial repo scaffold for Codex-driven build.

## Run locally

```bash
npm test
npm start
```

Open `http://localhost:3000/studio` for research and `http://localhost:3000/builder` for the output composer.

## Deterministic extraction fixtures

Use these fixture URLs in Research Studio to exercise the workflow without external websites:

- `mock://vendor-homepage`
- `mock://product-model-one`
- `mock://product-compact-tpe`
- `mock://product-large-silicone`
- `mock://product-incomplete`
- `mock://category-silicone`
- `mock://article-first-time-buyers`
- `mock://blocked-access-wall`

Fixture records are visibly labeled `mock_fixture`. Candidate reviews can approve or reject evidence and classify rights, but they intentionally stay review-only and `not_recommended`.
