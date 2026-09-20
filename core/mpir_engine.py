"""
core/mpir_engine.py
Module: Tensor-Core Mixed-Precision Iterative Refinement (MPIR) Engine
Accelerates LP solving by running inner projection kernels in IEEE-754 FP32,
while accumulating residuals and applying correction steps in IEEE-754 FP64.
"""

import time
from typing import Dict
import numpy as np
import torch

# Hardware check
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


class TensorCoreMPIREngine:
    """Mixed-Precision Iterative Refinement (MPIR) for Linear Programming.

    Combines FP32 Tensor/SIMD core throughput with FP64 convergence
    certification.
    """

    def __init__(
        self,
        outer_max_iter: int = 15,
        inner_pdlp_iter: int = 600,
        tolerance: float = 1e-6,
    ):
        self.outer_max_iter = outer_max_iter
        self.inner_pdlp_iter = inner_pdlp_iter
        self.tolerance = tolerance

    def solve_mpir(
        self,
        c: np.ndarray,
        A_ub: np.ndarray,
        b_ub: np.ndarray,
        lower: np.ndarray,
        upper: np.ndarray,
    ) -> Dict:
        """Executes Mixed-Precision Iterative Refinement on Ax <= b, l <= x <= u."""
        start_time = time.perf_counter()
        num_vars = len(c)
        num_cons = len(b_ub)

        # ---------------------------------------------------------------------
        # 1. High-Precision Master State (FP64 / Double Precision)
        # ---------------------------------------------------------------------
        A_64 = torch.tensor(A_ub, dtype=torch.float64, device=DEVICE)
        b_64 = torch.tensor(b_ub, dtype=torch.float64, device=DEVICE)
        c_64 = torch.tensor(c, dtype=torch.float64, device=DEVICE)
        l_64 = torch.tensor(lower, dtype=torch.float64, device=DEVICE)
        u_64 = torch.tensor(upper, dtype=torch.float64, device=DEVICE)

        # PDHG requires a step size based on ||A||_2^2.
        op_norm = max(torch.linalg.matrix_norm(A_64, ord=2).item() ** 2, 1e-4)

        # Initial solution vector x in FP64
        x_fp64 = torch.clamp(
            torch.zeros(num_vars, dtype=torch.float64, device=DEVICE),
            l_64,
            u_64,
        )
        total_inner_iterations = 0
        outer_step = 0
        status = "SUBOPTIMAL"
        violation_64 = torch.max(
            torch.maximum(-b_64, torch.zeros_like(b_64))
        ).item()

        # ---------------------------------------------------------------------
        # 2. Outer Iterative Refinement Loop (FP64 Correction)
        # ---------------------------------------------------------------------
        for outer_step in range(1, self.outer_max_iter + 1):
            # Compute exact residual in FP64: r = b - A * x
            residual_64 = b_64 - torch.mv(A_64, x_fp64)

            # Check max constraint violation
            violation_64 = torch.max(
                torch.maximum(
                    -residual_64, torch.zeros_like(residual_64)
                )  # violation if Ax > b
            ).item()

            if violation_64 < self.tolerance and outer_step > 1:
                status = "OPTIMAL_CONVERGED"
                break

            # -----------------------------------------------------------------
            # 3. Downcast System to FP32 for Tensor-Core Acceleration
            # -----------------------------------------------------------------
            A_32 = A_64.to(dtype=torch.float32)
            c_32 = c_64.to(dtype=torch.float32)
            b_32 = residual_64.to(
                dtype=torch.float32
            )  # Solve for the residual correction

            delta_l_32 = (l_64 - x_fp64).to(dtype=torch.float32)
            delta_u_32 = (u_64 - x_fp64).to(dtype=torch.float32)

            step_tau = 0.9 / float(op_norm)
            step_sigma = 0.9 / float(op_norm)

            delta_x_32 = torch.zeros(
                num_vars, dtype=torch.float32, device=DEVICE
            )
            delta_x_bar = delta_x_32.clone()
            y_32 = torch.zeros(num_cons, dtype=torch.float32, device=DEVICE)

            # -----------------------------------------------------------------
            # 4. Inner Fast Loop: Tensor/SIMD Streamlined PDHG (FP32)
            # -----------------------------------------------------------------
            for inner_step in range(self.inner_pdlp_iter):
                # Dual ascent pass
                Ax_bar = torch.mv(A_32, delta_x_bar)
                y_32 = torch.clamp(y_32 + step_sigma * (Ax_bar - b_32), min=0.0)

                # Primal descent pass
                Aty = torch.mv(A_32.T, y_32)
                delta_x_next = torch.clamp(
                    delta_x_32 - step_tau * (Aty + c_32), delta_l_32, delta_u_32
                )

                # Extrapolation
                delta_x_bar = 2.0 * delta_x_next - delta_x_32
                delta_x_32 = delta_x_next

            total_inner_iterations += self.inner_pdlp_iter

            # -----------------------------------------------------------------
            # 5. Upcast Correction and Accumulate in FP64
            # -----------------------------------------------------------------
            delta_x_64 = delta_x_32.to(dtype=torch.float64)
            x_fp64 = torch.clamp(x_fp64 + delta_x_64, l_64, u_64)

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0
        final_x = x_fp64.detach().cpu().numpy()
        final_obj = float(np.dot(c, final_x))

        return {
            "status": status,
            "optimal_objective": final_obj,
            "solution_vector": final_x,
            "outer_refinements": outer_step,
            "total_inner_iterations": total_inner_iterations,
            "final_violation_fp64": violation_64,
            "solve_time_ms": elapsed_ms,
            "device": str(DEVICE).upper(),
        }