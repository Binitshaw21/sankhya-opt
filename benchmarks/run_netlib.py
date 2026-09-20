"""
benchmarks/run_netlib.py
Automated benchmark comparing SANKHYA-OPT (GPU) vs. SciPy (CPU Simplex)
"""
import time
import numpy as np
from scipy.optimize import linprog
from core.gpu_pdlp import GPUPDLPContinuousSolver
from benchmarks.mrpl_refinery import build_mrpl_benchmark_model

def run_benchmark():
    model = build_mrpl_benchmark_model()
    
    print("[*] Running Baseline CPU Solver (SciPy Highs-DS)...")
    start_cpu = time.perf_counter()
    res_cpu = linprog(
        c=model["c"], A_eq=model["A_eq"], b_eq=model["b_eq"],
        A_ub=model["A_ub"], b_ub=model["b_ub"],
        bounds=list(zip(model["lower_bounds"], model["upper_bounds"])),
        method="highs-ds"
    )
    cpu_time = (time.perf_counter() - start_cpu) * 1000

    print("[*] Running SANKHYA-OPT GPU Solver...")
    solver = GPUPDLPContinuousSolver()
    res_gpu = solver.solve(
        model["c"], model["A_eq"], model["b_eq"], 
        model["A_ub"], model["b_ub"], 
        model["lower_bounds"], model["upper_bounds"]
    )
    
    print("\n=== BENCHMARK RESULTS ===")
    print(f"CPU Solver Time : {cpu_time:.2f} ms")
    print(f"GPU Solver Time : {res_gpu['solve_time_ms']:.2f} ms")
    print(f"Acceleration    : {cpu_time / res_gpu['solve_time_ms']:.2f}x Speedup")

if __name__ == "__main__":
    run_benchmark()