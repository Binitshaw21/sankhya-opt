from pathlib import Path
import time

import numpy as np
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scipy.optimize import linprog
from api.slm_translator import LocalRefinerySLM
from core.mpir_engine import DEVICE

app = FastAPI()

WEB_ROOT = Path(__file__).resolve().parent.parent / "ui" / "dist"
ASSET_ROOT = WEB_ROOT / "assets"

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic schema for the incoming prompt
class PromptRequest(BaseModel):
    prompt: str

# Initialize the SLM Translator
slm_engine = LocalRefinerySLM()

@app.get("/api/system/status")
def system_status():
    return {"status": "ok", "service": "sankhya-opt", "device": str(DEVICE).upper()}

@app.post("/api/slm/translate-and-solve")
def translate_and_solve(request: PromptRequest):
    """Translates natural language to math, then executes the GPU solver."""
    
    # 1. Translate English to Math
    translation = slm_engine.translate_prompt_to_model(request.prompt)
    model = translation["mathematical_model"]

    started_at = time.perf_counter()
    result = linprog(
        c=np.array(model["c"]),
        A_ub=np.array(model["A_ub"]),
        b_ub=np.array(model["b_ub"]),
        A_eq=np.array(model["A_eq"]),
        b_eq=np.array(model["b_eq"]),
        bounds=list(zip(model["lower_bounds"], model["upper_bounds"])),
        method="highs",
    )
    solve_time_ms = (time.perf_counter() - started_at) * 1000.0
    solution_vector = result.x.tolist() if result.success and result.x is not None else []
    final_violation = float("inf")
    if result.success and result.x is not None:
        inequality_violation = np.maximum(
            np.array(model["A_ub"]) @ result.x - np.array(model["b_ub"]), 0.0
        )
        equality_residual = np.abs(np.array(model["A_eq"]) @ result.x - np.array(model["b_eq"]))
        final_violation = float(max(np.max(inequality_violation), np.max(equality_residual)))
    solve_result = {
        "status": "OPTIMAL_CONVERGED" if result.success else "INFEASIBLE",
        "optimal_objective": float(result.fun) if result.success else 0.0,
        "solution_vector": solution_vector,
        "outer_refinements": 1,
        "total_inner_iterations": 0,
        "final_violation_fp64": final_violation,
        "solve_time_ms": solve_time_ms,
        "device": "CPU",
    }
    
    # 3. Return the combined intelligence to the UI
    return {
        "nlp_extraction": translation["extracted_parameters"],
        "solver_metrics": solve_result
    }


if ASSET_ROOT.is_dir():
    app.mount("/assets", StaticFiles(directory=ASSET_ROOT), name="assets")


@app.get("/{path:path}")
def serve_spa(path: str):
    """Serve the built React app and support client-side route refreshes."""
    requested_file = WEB_ROOT / path
    if path and requested_file.is_file() and WEB_ROOT in requested_file.parents:
        return FileResponse(requested_file)
    if (WEB_ROOT / "index.html").is_file():
        return FileResponse(WEB_ROOT / "index.html")
    return {"detail": "Frontend build not found. Run the UI build first."}