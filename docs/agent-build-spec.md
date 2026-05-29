# Synth Companions Buyer Guide Agent — Build Spec

## Purpose

Build an internal editorial workflow app that can produce repeatable buyer-guide packages from source/vendor seed lists.

The app is not a public adult storefront. It should avoid explicit imagery and focus on owner-experience research, buyer-guide production, vendor/source analysis, asset-rights tracking, and output generation.

## Operating principle

The system starts from a source list and does discovery itself.

Eli reviews decisions; Eli does not gather product links, specs, screenshots, or images just to make the workflow easier.

## Core entities

### ExtractionRun

Fields:

- id
- title
- guideType: First-Time Buyer Guide | TPE vs Silicone | Weight & Storage | Vendor Trust | AI Heads
- seedList
- status: draft | discovering | extracting | ready | needs_review | complete
- notes
- createdAt
- updatedAt

### Source

Fields:

- id
- runId
- name
- sourceType: manufacturer | retailer | community | accessory | media | unknown
- officialUrl
- confidence: verified | probable | weak | blocked
- status: inbox | discovering | extracting | needs_review | ready | rejected
- importantPages
- extractableFields
- blockers
- ownerExperienceRelevance
- nextAction

### ProductCandidate

Fields:

- id
- runId
- sourceId
- vendor
- productName
- productUrl
- category
- material: TPE | Silicone | Hybrid | Unknown
- height
- weight
- price
- imageRights: unknown | vendor_approved | affiliate_approved | owner_permission | public_stock | do_not_use
- bestFor
- notIdealFor
- ownerAdvantage
- ownerRisk
- recommendationStatus: include | watch | reject | needs_review
- evidenceNotes

### Asset

Fields:

- id
- runId
- sourceId
- productCandidateId optional
- assetType: hero | product_card | comparison | screenshot | diagram | video_visual | checklist
- url
- rightsStatus
- notes

### GuideBlock

Fields:

- id
- runId
- blockType: opening | mistakes | decision_tree | comparison_table | vendor_trust | tpe_vs_silicone | weight_storage | photo_reality | ai_robotics | checklist | short_video | cta
- title
- bodyMarkdown
- status: draft | ready | needs_review

### WorkLog

Fields:

- id
- runId
- message
- severity: info | warning | blocked | complete
- createdAt

## MVP screens

### Dashboard

Show active runs and summary cards:

- Extraction runs
- Sources
- Product candidates
- Blocked sources
- Ready guide blocks
- Needs review

### New Extraction Run

Fields:

- Guide type dropdown
- Title
- Seed list text area
- Create Run button

When created, parse the seed list into Source rows.

### Run Detail

Tabs:

- Sources
- Product Candidates
- Asset Rights
- Guide Blocks
- Output Pack
- Work Log

### Source Queue

Table columns:

- Name
- Type
- Official URL
- Confidence
- Status
- Important pages
- Extractable fields
- Blockers
- Next action

Actions:

- Mark as discovering
- Mock extraction
- Mark blocked
- Mark ready
- Create product candidate

### Product Candidates

Table columns:

- Vendor
- Product
- URL
- Category
- Material
- Height
- Weight
- Price
- Image rights
- Best for
- Main risk
- Status

### Guide Blocks

Generate and edit:

- Opening promise
- Mistakes module
- Decision tree
- Comparison table
- Vendor trust table
- TPE vs silicone block
- Weight/storage warning
- Photo reality warning
- AI/robotics caution
- Checklist
- Short-video hooks
- CTA

### Output Pack

Exports:

- Article markdown
- Comparison table markdown
- Product-card JSON
- Short-video hooks
- Visual asset brief
- Vendor outreach template

## MVP behavior

- Seed list creates Source records.
- Mock extraction creates clearly labeled unverified placeholder fields.
- Guide block generator works even before verified products exist, but product comparison sections must be marked pending.
- No product can be recommended until specs and media rights are verified.
- Work log records every run action.

## Extraction adapters

Build the app so extraction adapters can be added later.

Adapters to support:

- Mock extractor for MVP
- Jina Reader adapter
- Firecrawl adapter
- Optional Apify/Browse AI adapter later
- Manual Browser Review status for blocked pages

## Access-wall handling

If a source cannot be extracted cleanly, the app should not stop. It should log the blocker and move on.

Blocker categories:

- JS-heavy/dynamic page
- bot protection
- no visible specs
- official URL uncertain
- product data inconsistent
- media rights unclear
- adult-content visibility restriction

Escalation should be narrow, for example:

> Vendor site is JS-blocked. Need browser review of product spec table.

Not:

> Eli, go find the links.

## Seed vendors

Extraction Run 001:

- Zelex Dolls
- WM Doll
- Irontech Doll
- Tayu Doll

Broader source list:

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

## Design

Dark-mode friendly, clean internal tool. Use neutral UI, status badges, cards, and tables. No explicit imagery. Tone should be serious, practical, and owner-experience focused.
