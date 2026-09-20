"""
core/gpu_pdlp.py
Module 2: GPU-Accelerated First-Order Primal-Dual Continuous LP Core (cuPDLP)
Executes sparse matrix-vector iterations concurrently on GPU hardware.
"""
import time
import torch
import numpy as np
from typing import Dict, Optional
from core.presolve import PresolveEquilibrator
from core.crossover import BasisCrossover

DEFAULT_DTYPE = torch.float64

class GPUPDLPContinuousSolver:
    def __init__(self, max_iter: int = 200000, eps_tol: float = 1e-9):
        self.max_iter = max_iter
        self.eps_tol = eps_tol
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    def solve(
        self,
        c: np.ndarray,
        A_eq: Optional[np.ndarray],
        b_eq: Optional[np.ndarray],
        A_ub: Optional[np.ndarray],
        b_ub: Optional[np.ndarray],
        lower: np.ndarray,
        upper: np.ndarray
    ) -> Dict:
        start_time = time.perf_counter()
        num_orig_vars = len(c)
        num_slacks = len(b_ub) if A_ub is not None and len(A_ub) > 0 else 0

        # Assemble standard affine form: A x = b, s >= 0
        if num_slacks > 0:
            slack_eye = np.eye(num_slacks, dtype=np.float64)
            if A_eq is not None and len(A_eq) > 0:
                A_full = np.vstack([
                    np.hstack([A_eq, np.zeros((len(A_eq), num_slacks))]),
                    np.hstack([A_ub, slack_eye])
                ])
                b_full = np.concatenate([b_eq, b_ub])
            else:
                A_full = np.hstack([A_ub, slack_eye])
                b_full = b_ub
            c_full = np.concatenate([c, np.zeros(num_slacks)])
            l_full = np.concatenate([lower, np.zeros(num_slacks)])
            u_full = np.concatenate([upper, np.full(num_slacks, 1e9)])
        else:
            A_full = A_eq
            b_full = b_eq
            c_full = c
            l_full = lower
            u_full = upper

        # Move to GPU/Target compute accelerator
        A_t = torch.tensor(A_full, dtype=DEFAULT_DTYPE, device=self.device)
        b_t = torch.tensor(b_full, dtype=DEFAULT_DTYPE, device=self.device)
        c_t = torch.tensor(c_full, dtype=DEFAULT_DTYPE, device=self.device)
        l_t = torch.tensor(l_full, dtype=DEFAULT_DTYPE, device=self.device)
        u_t = torch.tensor(u_full, dtype=DEFAULT_DTYPE, device=self.device)

        m, n = A_t.shape

        # Presolve matrix conditioning
        equilibrator = PresolveEquilibrator()
        A_sc, b_sc, c_sc, D_r, D_c = equilibrator.equilibrate(A_t, b_t, c_t, self.device)
        l_sc = l_t / D_c
        u_sc = u_t / D_c

        # Operator norm estimation via power iteration
        v = torch.randn(n, dtype=DEFAULT_DTYPE, device=self.device)
        v = v / torch.norm(v)
        for _ in range(25):
            v = torch.mv(A_sc.T, torch.mv(A_sc, v))
            v = v / torch.norm(v)
        spectral_norm = max(torch.norm(torch.mv(A_sc, v)).item(), 1e-4)

        # Step-size parameters: tau * sigma * ||A||^2 < 1.0
        primal_step = 0.9 / spectral_norm
        dual_step = 0.9 / spectral_norm

        x = torch.clamp(torch.zeros(n, dtype=DEFAULT_DTYPE, device=self.device), l_sc, u_sc)
        x_bar = x.clone()
        y = torch.zeros(m, dtype=DEFAULT_DTYPE, device=self.device)

        status = "SUB-OPTIMAL (MAX_ITER)"
        iteration = 0

        # Main GPU-accelerated first-order loop
        for iteration in range(1, self.max_iter + 1):
            # 1. Dual Ascent: y^{k+1} = y^k + sigma * (A x_bar - b)
            Ax_bar = torch.mv(A_sc, x_bar)
            y_next = y + dual_step * (Ax_bar - b_sc)

            # 2. Primal Descent: x^{k+1} = Proj_{[l, u]}(x^k - tau * (A^T y^{k+1} + c))
            A_trans_y = torch.mv(A_sc.T, y_next)
            x_next = torch.clamp(x - primal_step * (A_trans_y + c_sc), l_sc, u_sc)

            # 3. Ergodic extrapolation
            x_bar = 2.0 * x_next - x

            # Check KKT convergence criteria every 150 iterations
            if iteration % 150 == 0:
                x_orig = x_next * D_c
                y_orig = y_next * D_r

                primal_res = torch.norm(torch.mv(A_t, x_orig) - b_t, p=float('inf')) / (1.0 + torch.norm(b_t, p=float('inf')))
                p_obj = torch.dot(c_t, x_orig)
                d_obj = torch.dot(b_t, y_orig)
                rel_gap = torch.abs(p_obj - d_obj) / (1.0 + torch.abs(p_obj))

                if primal_res < self.eps_tol and rel_gap < self.eps_tol:
                    status = "OPTIMAL_CONVERGED"
                    x = x_next
                    break

            x = x_next
            y = y_next

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        
        # --- NEW: EXACT BASIS CROSSOVER ---
        x_unscaled = x * D_c
        crossover = BasisCrossover()
        cross_res = crossover.execute_crossover(A_t, b_t, c_t, x_unscaled, l_t, u_t)
        
        x_exact = cross_res["x_vertex"]
        y_exact = cross_res["y_shadow_prices"]

        final_x = x_exact.detach().cpu().numpy()[:num_orig_vars]
        final_y = y_exact.detach().cpu().numpy()
        final_obj = float(np.dot(c, final_x))

        return {
            "status": status + " | " + cross_res["status"],
            "optimal_objective": final_obj,
            "solution_vector": final_x,
            "shadow_prices": final_y,
            "iterations": iteration,
            "solve_time_ms": elapsed_ms,
            "device": str(self.device).upper()
        }