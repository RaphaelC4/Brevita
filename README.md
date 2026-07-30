# Brevita

Parametric insurance on GenLayer — payouts triggered automatically by real-world events, verified by AI-driven validator consensus instead of a claims department.

## How it works

1. **Create a policy.** Choose an event type (hurricane, earthquake, drought, flood, wildfire...), a location, a specific trigger condition ("Cat 4+ hurricane makes landfall within 30 miles of Miami"), and one or more public data sources that can verify it. Deposit the payout amount plus a premium.

2. **Automatic adjudication.** Anyone can call `check_and_trigger` on an active policy. GenLayer's validators independently fetch the listed data sources, evaluate the trigger condition with an LLM, and reach consensus on a verdict — `YES`, `NO`, or `UNDECIDED`. A `YES` pays out immediately, on-chain, no human claims process.

3. **Appeal.** If the first check comes back `NO` or `UNDECIDED`, the policy moves to `DISPUTED`. From there, anyone can call `resolve_dispute`, which sends the claim back through GenLayer's validator network for a second, stricter round of review — this time it must land on a decisive `TRUE` or `FALSE`, no more "insufficient data." Fully self-contained: no external contracts, no third-party services, just GenLayer's own AI-validator consensus doing a more careful second look.

4. **Revenue.** Premiums are retained by the protocol whenever a policy is cancelled or a claim is paid out. If a claim is rejected outright, the full deposit (payout reserve + premium) is retained as revenue instead of sitting stuck in the contract. The contract owner can withdraw from this tracked balance — it's kept strictly separate from money reserved for active policies, so a withdrawal can never touch funds owed to someone with an open claim.

## Why GenLayer

Traditional parametric insurance still needs a trusted oracle or a human adjuster to say "yes, the event happened." Brevita uses GenLayer's Intelligent Contracts to make that determination itself — validators read live web data and reach consensus the same way they'd process any other transaction, so the payout logic is trustless end to end. Even the appeal path stays entirely within GenLayer's own consensus mechanism rather than depending on any external service.

## Project structure

```
contracts/
  brevita.py            # The Intelligent Contract itself
tests/
  direct/                # Local unit tests (pytest, no Studio needed)
frontend/
  app/                   # Next.js pages
  components/             # UI components (policy forms, dispute panel, globe hero, etc.)
  lib/
    genlayer.ts            # Low-level GenLayer client (read/write/checksumming)
    contract.ts              # Brevita-specific contract calls
    wallet.tsx                 # Shared wallet connection state
```

## Local development

### Contract

```bash
pip install -r requirements.txt --break-system-packages
genvm-lint check contracts/brevita.py     # lint + validate
pytest tests/direct/ -v                    # run the local test suite
```

Deploy via [GenLayer Studio](https://studio.genlayer.com) by pasting the full contents of `contracts/brevita.py` into the contract editor.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env.local` (see `.env.example`):

```
NEXT_PUBLIC_CONTRACT_ADDRESS=<deployed Brevita address>
NEXT_PUBLIC_NETWORK=studio
```

## Deploying

- **Contract:** deploy `contracts/brevita.py` via GenLayer Studio. Copy the resulting address into `NEXT_PUBLIC_CONTRACT_ADDRESS`.
- **Frontend (Vercel):** import the GitHub repo into Vercel, set the root directory to `frontend/`, and add `NEXT_PUBLIC_CONTRACT_ADDRESS` and `NEXT_PUBLIC_NETWORK` as environment variables in the Vercel project settings (these mirror `.env.local` - Vercel doesn't read that file directly). No build command changes needed - Vercel auto-detects Next.js.

## Tech stack

- **Contract:** Python (GenLayer Intelligent Contracts / GenVM)
- **Frontend:** Next.js, TypeScript, `genlayer-js`
- **Wallet:** any EVM-compatible browser wallet (MetaMask, Rabby, etc.) connected to GenLayer Studio

## Status

Built and tested against GenLayer Studio (hosted). The full policy lifecycle has a working UI end to end: create → auto-check → payout, or dispute → request final ruling → settle - both adjudication rounds run entirely through GenLayer's own validator consensus. Revenue withdrawal is owner-only and intentionally has no dedicated screen; it's called directly through Studio's contract panel when needed.
