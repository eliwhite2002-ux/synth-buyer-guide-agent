# AGENTS.md

## Project

Synth Companions Buyer Guide Agent is an internal editorial workflow app for turning vendor/source seed lists into structured buyer-guide outputs.

This is not a public adult storefront, product gallery, or explicit-content site. Keep the UI neutral, professional, and text/data driven.

## Non-negotiable product rule

The app exists so Eli does **not** have to manually gather product links, specs, screenshots, or images.

The system starts from a source/vendor list and does discovery, extraction, classification, logging, and output generation itself. Eli reviews decisions and exceptions.

## Build priority

1. Build a usable MVP before optimizing.
2. Preserve a clean extraction workflow.
3. Use mock extraction first.
4. Make future real extraction adapters easy to add.
5. Generate visible outputs, not just database rows.

## MVP scope

Build a web app with:

- Dashboard
- New Extraction Run flow
- Run Detail page
- Source Queue table
- Product Candidates table
- Asset Rights tracker
- Guide Blocks view
- Output Pack exporter
- Work Log
- Settings page for future API keys

## Data model

Implement these entities:

- ExtractionRun
- Source
- ProductCandidate
- Asset
- GuideBlock
- WorkLog

Use the schema in `docs/agent-build-spec.md` as the source of truth.

## Required seed data

Create a seed run titled `Extraction Run 001` with guide type `First-Time Buyer Guide` and these sources:

- Zelex Dolls
- WM Doll
- Irontech Doll
- Tayu Doll

Also keep the broader source list in `data/seed-vendors.json` importable.

## Extraction workflow

For MVP, implement a mock extractor.

Mock extraction must:

- Be visibly labeled as mock/unverified.
- Populate source fields.
- Create placeholder ProductCandidate rows.
- Add WorkLog entries.
- Mark the source/product rows as `needs_review`, not verified.

Do not mark mock data as recommended.

## Future extraction adapters

Design the code so these can be added later:

- Jina Reader
- Firecrawl
- Apify or Browse AI
- Manual Browser Review status for blocked pages

Suggested abstraction:

- `discoverSourcePages(source)`
- `extractSource(source)`
- `extractProductCandidates(source)`
- `generateGuideBlocks(run)`
- `exportOutputPack(run)`

## Access-wall handling

When extraction fails, do not dump the task back to Eli.

Log the blocker and continue.

Blocker categories:

- JS-heavy or dynamic page
- Bot protection
- No visible specs
- Official URL uncertain
- Product data inconsistent
- Media rights unclear
- Adult-content visibility restriction

Escalations must be narrow, such as:

> Vendor site is JS-blocked. Need browser review of product spec table.

Never escalate with:

> Go find product links.

## Guide block requirements

Generate these blocks:

- Opening promise
- First-time buyer mistakes
- Real-home decision tree
- Product comparison table
- Vendor trust table
- TPE vs silicone block
- Weight/storage warning
- Photo-reality warning
- AI/robotics caution
- Buying checklist
- Short-video hooks
- CTA

If verified products do not exist yet, mark product tables and recommendations as pending/needs_review.

## Output Pack requirements

Export/copy:

- Article markdown
- Product-card JSON
- Comparison table markdown
- Short-video hooks
- Visual asset brief
- Vendor outreach template

## UI and tone

- Dark-mode friendly
- Serious internal editorial tool
- Neutral icons and cards
- Status badges and tables
- No explicit imagery
- No sex-store visual language
- Owner-experience oriented

## Testing / acceptance

Before finishing a task, confirm:

- The app can create a run from a seed list.
- Source rows are created.
- Mock extraction works.
- Guide blocks generate.
- Output pack exports.
- Mock/unverified/blocked statuses are obvious.
- No product is recommended without verified specs and image/media rights.

## Development notes

Prefer clear, maintainable code over clever code. Keep workflow functions testable. If you choose a framework or database, document why in the README.
