# BDR Signal Prototype

BDR Signal is a separate prototype project for Agora.io.

It is intentionally not another CRM. Salesforce remains the source of truth. This app is the clean attribution layer that helps answer:

- Which accounts were sourced by which BDR
- What revenue those sourced accounts represent in both MRR and ARR
- What stage each opportunity is in
- What usage and outreach context exists for the account
- Which records are ready for AI-agent-assisted updates back into Salesforce

## Current prototype scope

- Single-page frontend with browser persistence
- BDR leaderboard based on sourced revenue
- Pipeline board for account and opportunity tracking
- Salesforce-linked account detail view
- Agent workflow section showing future read, attribute, enrich, and write-back automation

## Not in scope yet

- Live Salesforce API integration
- Contact enrichment provider connections
- Outreach platform integrations
- Authentication and role-based access
- Background agent execution

## Run locally

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173/bdr-management-prototype/`

## What I observed from your live Salesforce

Your logged-in Salesforce opportunity view already exposes the kind of data this system should consume:

- Opportunity stage path
- Account and opportunity IDs
- Owner name
- Potential MRR
- ARR projection
- Contact roles
- Activity history
- Usage links and company identifiers

That means the right product direction is a companion system that reads and simplifies this data, not a replacement CRM.

## Recommended next build phase

- Create a backend service that reads Salesforce accounts, contacts, and opportunities
- Add a BDR attribution model at both account and opportunity levels
- Store MRR, ARR, stage history, outreach coverage, and usage snapshots
- Add an approval queue for AI agents before they write back into Salesforce
