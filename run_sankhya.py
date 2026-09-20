"""
run_sankhya.py
Unified Command-Line Execution Engine for Project SANKHYA-OPT
Demonstrates SLM Translation, MPIR execution, and GNN Branch-and-Bound.
"""
import sys
import torch
import numpy as np
from rich.console import Console
from rich.table import Table
from rich.panel import Panel

# Import all SOTA modules
from api.slm_translator import LocalRefinerySLM
from core.mpir_engine import TensorCoreMPIREngine
from core.milp_engine import SANKHYAMINLPEngine
from core.verifier import KKTVerifier

console = Console()

def run_sota_pipeline():
    console.print(Panel.fit(
        "[bold cyan]PROJECT SANKHYA-OPT: SOVEREIGN GPU-ACCELERATED OPTIMIZATION SOLVER[/bold cyan]\n"
        "[bold white]Mangalore Refinery and Petrochemicals Limited (MRPL)[/bold white]",
        border_style="cyan"
    ))

    # Hardware check
    device_name = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "Host CPU"
    console.print(f"[*] Compute Accelerator : [bold yellow]{device_name}[/bold yellow]")
    console.print(f"[*] Precision Datatype  : [bold white]Mixed-Precision Iterative Refinement (FP32/FP64)[/bold white]\n")

    # -------------------------------------------------------------------------
    # PHASE 1: SLM Natural Language Translation
    # -------------------------------------------------------------------------
    console.print("[bold yellow][Phase 1/4][/bold yellow] Agentic SLM Natural-to-Math Translation...")
    slm = LocalRefinerySLM()
    prompt = "Maximize refinery throughput. Keep sulfur below 18.5 and octane above 46000."
    console.print(f"    [dim]User Prompt:[/dim] [italic]\"{prompt}\"[/italic]")
    
    translation = slm.translate_prompt_to_model(prompt)
    model = translation["mathematical_model"]
    model["integer_indices"] = [4, 5]  # CDU Mode binary variables
    model["var_names"] = ["Arab_Light", "Brent", "Maya_Heavy", "Naphtha", "CDU_Mode_A", "CDU_Mode_B"]
    
    console.print(f"  [green]✔[/green] Translated to {len(model['c'])} Variables and {len(model['b_ub'])} Inequality Bounds.")

    # Convert to NumPy for the engine
    c = np.array(model["c"])
    A_ub = np.array(model["A_ub"])
    b_ub = np.array(model["b_ub"])
    lower = np.array(model["lower_bounds"])
    upper = np.array(model["upper_bounds"])

    # -------------------------------------------------------------------------
    # PHASE 2 & 3: Tensor-Core MPIR & GNN-Guided MILP
    # -------------------------------------------------------------------------
    console.print("\n[bold yellow][Phase 2/4][/bold yellow] Initializing MPIR Tensor-Core Continuous LP Engine...")
    mpir_solver = TensorCoreMPIREngine(outer_max_iter=10, inner_pdlp_iter=400, tolerance=1e-6)
    
    console.print("[bold yellow][Phase 3/4][/bold yellow] Activating ML4CO GNN-Guided Branch-and-Bound...")
    milp_engine = SANKHYAMINLPEngine(mpir_solver)
    
    # Execute MILP
    milp_res = milp_engine.solve({
        "c": c, "A_ub": A_ub, "b_ub": b_ub, 
        "lower_bounds": lower, "upper_bounds": upper,
        "integer_indices": model["integer_indices"]
    })
    
    console.print(f"  [green]✔[/green] MILP Status: [bold]{milp_res['status']}[/bold] | GNN Nodes Explored: {milp_res['nodes_explored']}")
    console.print(f"  [green]✔[/green] GPU Execution Time: [bold cyan]{milp_res['solve_time_ms']:.2f} ms[/bold cyan]")

    # -------------------------------------------------------------------------
    # PHASE 4: Strict KKT Optimality Verification
    # -------------------------------------------------------------------------
    console.print("\n[bold yellow][Phase 4/4][/bold yellow] Validating Exact KKT Optimality Residuals (FP64)...")
    audit = KKTVerifier.audit_solution(
        {"A_ub": A_ub, "b_ub": b_ub, "lower_bounds": lower, "upper_bounds": upper}, 
        milp_res["solution_vector"]
    )

    # Render Results Table
    table = Table(title="SANKHYA-OPT | Optimal MRPL Asset Dispatch Plan", border_style="cyan")
    table.add_column("Decision Variable", style="white", no_wrap=True)
    table.add_column("Optimal Allocation", justify="right", style="green")

    for name, val in zip(model["var_names"], milp_res["solution_vector"]):
        table.add_row(name, f"{val:,.3f}")

    console.print(table)
    console.print(f"\n[bold]Optimality Audit:[/bold]")
    console.print(f"  • KKT Certificate Status : [{'bold green' if audit['certified'] else 'bold red'}]{'PASSED (SOVEREIGN READY)' if audit['certified'] else 'FAILED'}[/]")
    console.print(f"  • Constraint Violation   : {audit['ub_violation']:.2e}")
    console.print(f"  • Optimal Refinery Cost  : [bold yellow]₹ {milp_res['optimal_objective']:,.2f}[/bold yellow]\n")

if __name__ == "__main__":
    run_sota_pipeline()