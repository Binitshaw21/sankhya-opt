# SANKHYA-OPT

> Sovereign, GPU-aware optimization for refinery planning and mixed-integer dispatch.

SANKHYA-OPT is an experimental, air-gapped optimization stack for refinery-style planning problems. It combines natural-language model extraction, iterative LP solving, MILP branching, KKT-style solution verification, role-scoped local sessions, and an enterprise analytics console.

## What is included

- **Local refinery translator**: turns prompts such as `Keep sulfur below 18.5 and octane above 46000` into a structured optimization model.
- **MPIR solver**: mixed-precision iterative refinement with CPU/GPU-aware PyTorch execution.
- **MILP engine**: integer-variable handling with GNN-guided branching components.
- **Verification**: constraint and KKT residual checks for solution auditing.
- **FastAPI gateway**: exposes translation and solve results to the frontend.
- **Enterprise SPA**: React, TypeScript, TailwindCSS, ECharts, ReactFlow, Framer Motion, and Three.js.
- **Local role access**: Plant Operator, Optimization Scientist, Refinery Economist, and Compliance Auditor profiles.
- **Encrypted local session**: browser Web Crypto AES-GCM session storage with a 30-minute expiry and simulated hardware-token entry.
- **Enterprise Insights**: 3D feasible-region view, time-horizon slider, dual sensitivity table, shadow-price indicators, and benchmark comparison.
- **Audit manifest export**: local signed-manifest JSON containing a digest, signature metadata, solver record, and KKT result.
- **Benchmarks and tests**: MRPL examples, Netlib runners, and solver tests.

Dashboard telemetry that is not currently streamed by the backend is labeled `SIMULATED` or `DERIVED` in the UI. The solver result, NLP extraction, final violation, and device are sourced from the local API.

## Architecture

```text
Natural-language prompt
          |
          v
  LocalRefinerySLM  -->  mathematical model
          |
          v
 TensorCoreMPIREngine --> SANKHYAMINLPEngine
          |
          v
       KKTVerifier --> audited solution
```

## Console routes

| Route | Purpose |
| --- | --- |
| `/login` | Local enterprise sign-in and hardware-token mock entry |
| `/signup` | Provision a local role profile for the workstation |
| `/app/command-center` | Natural-language prompt, solve request, extraction, metrics, and solution vector |
| `/app/gpu-compute` | MPIR convergence and GPU telemetry reconstruction |
| `/app/milp-search` | GNN-guided branch-and-bound tree |
| `/app/optnet-lab` | Differentiable optimization demonstration |
| `/app/kkt-certification` | KKT residual review and signed audit manifest export |
| `/app/enterprise-insights` | Polytope visualization, dual sensitivity, and benchmark arena |

## Quick start

### 1. Python environment

Python 3.10+ is recommended.

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Run the end-to-end command-line demonstration:

```powershell
python run_sankhya.py
```

The solver uses CUDA when an available PyTorch CUDA device is detected and otherwise runs on the host CPU.

### 2. Start the API

From the repository root:

```bash
source .venv/bin/activate
uvicorn api.gateway:app --reload
```

The main endpoint is:

```text
POST http://127.0.0.1:8000/api/slm/translate-and-solve
```

Example request:

```bash
curl -X POST http://127.0.0.1:8000/api/slm/translate-and-solve \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"Keep sulfur below 18.5 and octane above 46000"}'
```

### 3. Start the UI

```bash
cd ui
npm install
npm run dev
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

For a production frontend build:

```powershell
cd ..
npm run build
```

From the repository root, the equivalent development command is `npm run dev:frontend`.

## Tests and checks

```bash
npm test
npm run lint
npm run build
```

When running commands from `ui/`, use `npm run lint` and `npm run build` directly.

The current local validation baseline is:

- Python tests: `2 passed`.
- Python bytecode compilation: passed.
- Python dependency check: passed.
- Frontend ESLint: passed.
- Frontend TypeScript/Vite production build: passed.

## Repository layout

```text
api/          FastAPI gateway and local language-to-model translator
core/         MPIR, MILP, branching, presolve, and verification engines
parsers/      Optimization model parsers
benchmarks/   MRPL and Netlib benchmark runners
tests/        Python solver tests
ui/           React + TypeScript frontend
ui/src/components/auth/
              Login and local profile provisioning screens
ui/src/components/dashboard/
              MPIR, GNN, benchmark, and KKT dashboard modules
ui/src/components/visualizers/
              Three.js feasible-region visualizer
ui/src/context/
              Solver and encrypted local authentication state
run_sankhya.py
              End-to-end CLI demonstration
```

## Security and data handling

The default translator is local and uses deterministic parsing logic. The frontend contains no external CDN, Google Fonts, or analytics dependency. API communication is limited to the configured local FastAPI endpoint. Local environments, dependency folders, build output, secret files, and editor metadata are excluded by the root `.gitignore`.

The current browser session layer encrypts session data with a workstation-local AES-GCM key held by Web Crypto and expires sessions after 30 minutes. It is a frontend prototype, not a substitute for a production Argon2id/PBKDF2 credential service backed by SQLite/Tauri secure storage. The hardware-token action is simulated. The audit export is explicitly marked as a simulated local C2PA/Ed25519 manifest and must not be treated as a production cryptographic signature.

Do not commit API keys, tokens, private keys, proprietary datasets, employee records, or production configuration.

## Project status

This is a research and engineering prototype. Validate model coefficients, solver results, benchmark claims, identity controls, and operational constraints against domain requirements before using outputs for production refinery decisions. Tauri v2 packaging, native SQLite credential storage, real OPC-UA ingestion, production C2PA signing, and real competitor benchmark execution remain deployment work rather than implemented production guarantees.