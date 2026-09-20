"""
core/crossover.py
GPU-Accelerated Exact Basis Crossover Algorithm
Snaps first-order interior solutions (from PDHG) to exact basic feasible solutions (vertices).
Crucial for computing exact Dual Marginal Costs (Shadow Prices) for refinery economics.
"""
import torch
import numpy as np
from typing import Dict, Tuple

class BasisCrossover:
    def __init__(self, eps_active: float = 1e-4):
        self.eps_active = eps_active
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    def execute_crossover(
        self, 
        A_eq: torch.Tensor, 
        b_eq: torch.Tensor,
        c: torch.Tensor,
        x_interior: torch.Tensor,
        l_bounds: torch.Tensor,
        u_bounds: torch.Tensor
    ) -> Dict:
        """
        Executes basis crossover for a standard form LP.
        A_eq is m x n, x_interior is n x 1
        """
        m, n = A_eq.shape
        
        # 1. Identify active bounds (variables resting at their upper/lower limits)
        at_lower = (torch.abs(x_interior - l_bounds) < self.eps_active)
        at_upper = (torch.abs(x_interior - u_bounds) < self.eps_active)
        is_fixed = at_lower | at_upper
        is_basic = ~is_fixed
        
        # 2. Extract the basic submatrix B and non-basic matrix N
        # We need exactly m basic variables. 
        # If the number of basic variables != m, we perform a heuristic basis completion.
        basic_indices = torch.nonzero(is_basic, as_tuple=True)[0]
        
        if len(basic_indices) > m:
            # Too many basic variables (degenerate interior point), trim to m
            # We select the m variables furthest from their bounds
            dist_to_bounds = torch.min(x_interior - l_bounds, u_bounds - x_interior)
            _, sorted_idx = torch.sort(dist_to_bounds, descending=True)
            basic_indices = sorted_idx[:m]
        elif len(basic_indices) < m:
            # Need to add slack/structural variables to complete the basis
            missing = m - len(basic_indices)
            fixed_indices = torch.nonzero(is_fixed, as_tuple=True)[0]
            basic_indices = torch.cat([basic_indices, fixed_indices[:missing]])
            
        # 3. Solve exact primal vertex: B * x_B = b - N * x_N
        B_mat = A_eq[:, basic_indices]
        
        # We need to construct the RHS: b - A * x_fixed
        x_exact = x_interior.clone()
        x_exact[at_lower] = l_bounds[at_lower]
        x_exact[at_upper] = u_bounds[at_upper]
        
        # Zero out the basic positions temporarily to compute N * x_N
        x_N_only = x_exact.clone()
        x_N_only[basic_indices] = 0.0
        
        rhs = b_eq - torch.mv(A_eq, x_N_only)
        
        # Solve linear system B * x_B = rhs on GPU
        try:
            x_B_exact = torch.linalg.solve(B_mat, rhs)
            x_exact[basic_indices] = x_B_exact
            
            # 4. Solve exact duals (Shadow Prices): B^T * y = c_B
            c_B = c[basic_indices]
            y_exact = torch.linalg.solve(B_mat.T, c_B)
            status = "CROSSOVER_SUCCESS"
            
        except torch.linalg.LinAlgError:
            # Fallback if B is singular (basis is rank deficient)
            # In production, use LU/QR factorization with pivot thresholding
            x_exact = x_interior
            y_exact = torch.zeros(m, dtype=torch.float64, device=self.device)
            status = "CROSSOVER_SINGULAR_BASIS_FALLBACK"

        return {
            "status": status,
            "x_vertex": x_exact,
            "y_shadow_prices": y_exact
        }
