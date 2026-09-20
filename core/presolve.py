"""
core/presolve.py
Module 1: Matrix Presolve & Ruiz Diagonal Equilibration Engine
Normalizes row and column infinity norms toward 1.0.
"""
import torch
from typing import Tuple

DEFAULT_DTYPE = torch.float64

class PresolveEquilibrator:
    def __init__(self, max_iter: int = 15, tol: float = 1e-5):
        self.max_iter = max_iter
        self.tol = tol

    def equilibrate(
        self, A: torch.Tensor, b: torch.Tensor, c: torch.Tensor, device: torch.device
    ) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor, torch.Tensor]:
        """
        Transforms matrix: A_scaled = D_r * A * D_c
        Returns: (A_scaled, b_scaled, c_scaled, D_r, D_c)
        """
        m, n = A.shape
        D_r = torch.ones(m, dtype=DEFAULT_DTYPE, device=device)
        D_c = torch.ones(n, dtype=DEFAULT_DTYPE, device=device)

        A_sc = A.clone().to(dtype=DEFAULT_DTYPE, device=device)
        b_sc = b.clone().to(dtype=DEFAULT_DTYPE, device=device)
        c_sc = c.clone().to(dtype=DEFAULT_DTYPE, device=device)

        for _ in range(self.max_iter):
            # Compute row maximum infinity norms
            row_norms = torch.norm(A_sc, p=float('inf'), dim=1)
            row_norms = torch.where(row_norms > 1e-12, row_norms, torch.ones_like(row_norms))
            d_r = 1.0 / torch.sqrt(row_norms)

            A_sc = d_r.unsqueeze(1) * A_sc
            b_sc = b_sc * d_r
            D_r = D_r * d_r

            # Compute column maximum infinity norms
            col_norms = torch.norm(A_sc, p=float('inf'), dim=0)
            col_norms = torch.where(col_norms > 1e-12, col_norms, torch.ones_like(col_norms))
            d_c = 1.0 / torch.sqrt(col_norms)

            A_sc = A_sc * d_c.unsqueeze(0)
            c_sc = c_sc * d_c
            D_c = D_c * d_c

        return A_sc, b_sc, c_sc, D_r, D_c