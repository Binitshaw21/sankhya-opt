# SANKHYA-OPT

> Sovereign, GPU-aware optimization for refinery planning and mixed-integer dispatch.

SANKHYA-OPT is an experimental optimization stack for refinery-style planning problems. It combines natural-language model extraction, iterative LP solving, MILP branching, and KKT-style solution verification in a local Python runtime, with a React dashboard and FastAPI gateway for interactive use.

## What is included

- **Local refinery translator**: turns prompts such as `Keep sulfur below 18.5 and octane above 46000` into a structured optimization model.
- **MPIR solver**: mixed-precision iterative refinement with CPU/GPU-aware PyTorch execution.
- **MILP engine**: integer-variable handling with GNN-guided branching components.
- **Verification**: constraint and KKT residual checks for solution auditing.
- **FastAPI gateway**: exposes translation and solve results to the frontend.
- **React UI**: Vite-powered dashboard for interacting with the solver service.
- **Benchmarks and tests**: MRPL examples, Netlib runners, and solver tests.

## Architecture

```text
Natural-language prompt
          |
          v
  LocalRefinerySLM  -->  mathematical model
          |
          v
 TensorCoreMPIREngine --> SANKHYAMILPEngine
          |
          v
       KKTVerifier --> audited solution
```

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
npm install
npm run dev:frontend
```

Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

For a production frontend build:

```powershell
npm run build
```

## Tests and checks

```bash
npm test
npm run lint
npm run build
```

## Repository layout

```text
api/          FastAPI gateway and local language-to-model translator
core/         MPIR, MILP, branching, presolve, and verification engines
parsers/      Optimization model parsers
benchmarks/   MRPL and Netlib benchmark runners
tests/        Python solver tests
ui/           React + TypeScript frontend
run_sankhya.py
              End-to-end CLI demonstration
```

## Security and data handling

The default translator is local and uses deterministic parsing logic. No credentials are required for the included demo. Local environments, dependency folders, build output, secret files, and editor metadata are excluded by the root `.gitignore`. Do not commit API keys, tokens, private keys, proprietary datasets, or production configuration.

## Project status

This is a research and engineering prototype. Validate model coefficients, solver results, and operational constraints against domain requirements before using outputs for production refinery decisions.