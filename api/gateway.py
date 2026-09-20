from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from api.slm_translator import LocalRefinerySLM
from core.mpir_engine import TensorCoreMPIREngine

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

@app.post("/api/slm/translate-and-solve")
def translate_and_solve(request: PromptRequest):
    """Translates natural language to math, then executes the GPU solver."""
    
    # 1. Translate English to Math
    translation = slm_engine.translate_prompt_to_model(request.prompt)
    model = translation["mathematical_model"]
    
    # 2. Execute the Tensor-Core MPIR GPU Solver
    solver = TensorCoreMPIREngine(outer_max_iter=10, inner_pdlp_iter=400, tolerance=1e-6)
    
    import numpy as np
    solve_result = solver.solve_mpir(
        c=np.array(model["c"]),
        A_ub=np.array(model["A_ub"]),
        b_ub=np.array(model["b_ub"]),
        lower=np.array(model["lower_bounds"]),
        upper=np.array(model["upper_bounds"])
    )
    solve_result["solution_vector"] = solve_result["solution_vector"].tolist()
    
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