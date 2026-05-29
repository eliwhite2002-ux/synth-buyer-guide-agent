# Codex Instructions

You are building the Synth Companions Buyer Guide Agent.

This is an internal editorial workflow app. Do not build a public adult marketplace, gallery, or explicit-content site. The app should use neutral UI and text-only/product-data workflows.

## Product goal

Build a tool that starts with a vendor/source list and produces structured buyer-guide outputs.

The user should not manually gather product links, specs, screenshots, or images unless the system has logged a true access-wall exception.

## Development priority

1. Build the working MVP app first.
2. Keep data structures explicit and testable.
3. Mock extraction before adding paid or fragile scraping.
4. Add real extraction adapters behind an interface.
5. Generate useful outputs from structured rows.

## MVP requirements

- Use a modern web app stack.
- Persist extraction runs and related rows.
- Include seed data.
- Provide a dashboard.
- Provide create-run flow.
- Provide source queue.
- Provide product candidates table.
- Provide guide block generator.
- Provide output exports.
- Include work log.
- Include status badges and filters.
- Avoid explicit imagery.

## Workflow rules to preserve

- The agent starts from a source list and does discovery itself.
- Eli reviews decisions; Eli does not become the research assistant.
- Escalate only narrow access-wall exceptions.
- Guide blocks must be generated from verified/probable rows, not imagination.
- Visual assets require rights classification before publication.
- Do not recommend a product until specs and media rights are verified.

## Recommended implementation shape

Use an extractor interface like:

- `extractSource(source)`
- `discoverImportantPages(source)`
- `extractProductCandidates(source)`
- `generateGuideBlocks(run)`
- `exportOutputPack(run)`

Start with a mock extractor that clearly labels all output as unverified.

Add real adapters later:

- Jina Reader
- Firecrawl
- Apify or Browse AI if needed

## Seed run

Create a seed run titled `Extraction Run 001` with guide type `First-Time Buyer Guide` and these sources:

- Zelex Dolls
- WM Doll
- Irontech Doll
- Tayu Doll

Also include broader importable seeds:

- Irontech Doll
- SEDOLL
- Zelex Dolls
- Tayu Doll
- The Doll Forum
- WM Doll
- Coeros
- EXDOLL
- Sino-doll
- Gynoid Dolls
- XT DOLL
- JIUSHENGDolls
- Funwestdoll

## UI tone

Professional internal tool. Practical, serious, owner-experience oriented. No joke UI. No explicit images. No sex-store design language.

## Acceptance criteria for MVP

- A user can create an extraction run from pasted source names.
- Sources appear as rows with status and confidence.
- User can run mock extraction on sources.
- Mock extraction produces source fields, product candidate rows, work-log entries, and `needs_review` status.
- User can generate guide blocks from the run.
- User can export article markdown, table markdown, product-card JSON, short-video hooks, and visual brief.
- UI clearly distinguishes verified/probable/mock/blocked data.
