# LoanLattice

**Student loan strategy lab — standard amortization vs income-driven repayment, with forbearance-trap modeling.**

Federal repayment choice is not a vibe; it’s cashflow, interest capitalization, and forgiveness timelines. LoanLattice runs side-by-side scenarios (Standard 10-year, PAYE-like IDR, and a forbearance pause that capitalizes interest) so borrowers can see total paid, months, and the hidden cost of “pause now, pay later.”

## Why this exists

- Servicer portals rarely surface counterfactuals clearly
- Forbearance can balloon balances via capitalization — most tools bury that
- Serious amortization math recruiters can audit in `server/finance.js`

## Run

```bash
cd projects/loan-lattice
npm install
npm run dev
# http://localhost:4500
```

## API

`POST /api/simulate` with principal, rate, AGI, familySize, discretionary formula inputs.
