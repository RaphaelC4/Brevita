# Brevita — Parametric Insurance on GenLayer

## Commands

- `genvm-lint check contracts/brevita.py` — Lint the contract
- `pytest tests/direct/ -v` — Run direct mode tests (fast, no Studio required)
- `gltest tests/integration/ -v -s` — Run integration tests (requires GenLayer Studio)
- `genlayer deploy` — Deploy contract
- `cd frontend && npm run dev` — Start frontend dev server

## Workflow

1. Edit contract in `contracts/brevita.py`
2. Lint: `genvm-lint check contracts/brevita.py`
3. Direct tests: `pytest tests/direct/ -v`
4. Deploy to Studio: `genlayer deploy`
5. Integration tests: `gltest tests/integration/ -v -s`
6. Frontend: `cd frontend && npm run dev`
