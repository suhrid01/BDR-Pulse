# BDR PULSE

BDR PULSE is a lightweight leadership dashboard for tracking BDR-sourced pipeline performance.

It is designed as a clean companion layer around Salesforce, focused on:

- BDR portfolio coverage
- Open MRR and ARR
- Hot accounts
- Stage summary
- BDR ownership views
- Account ledger tracking

## Pages

- `index.html` for the overview
- `bdr-ownership.html` for BDR ownership
- `account-ledger.html` for the account ledger

## Run locally

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173/`.

## Notes

- Built as a static frontend prototype
- Uses browser `localStorage` for lightweight state
- Ready to deploy on Vercel as a static site
