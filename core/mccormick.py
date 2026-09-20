"""
core/mccormick.py
GPU McCormick Relaxations for MINLP (The Pooling Problem)
Dynamically generates linear bounding boxes for bilinear terms (w = x * y)
to enable exact Spatial Branch-and-Bound globally.
"""
import torch
import numpy as np
from typing import Tuple

class McCormickRelaxation:
    def __init__(self, device: torch.device):
        self.device = device

    def generate_envelopes(
        self, 
        x_idx: int, 
        y_idx: int, 
        w_idx: int, 
        x_bounds: Tuple[float, float], 
        y_bounds: Tuple[float, float],
        num_vars: int
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Generates 4 linear constraints for w = x * y
        Returns (A_mc, b_mc) such that A_mc * vars <= b_mc
        """
        xl, xu = x_bounds
        yl, yu = y_bounds
        
        # A matrix shape: 4 x num_vars
        A_mc = torch.zeros((4, num_vars), dtype=torch.float64, device=self.device)
        b_mc = torch.zeros(4, dtype=torch.float64, device=self.device)
        
        # 1. w >= xl*y + x*yl - xl*yl  =>  xl*y + x*yl - w <= xl*yl
        A_mc[0, x_idx] = yl
        A_mc[0, y_idx] = xl
        A_mc[0, w_idx] = -1.0
        b_mc[0] = xl * yl
        
        # 2. w >= xu*y + x*yu - xu*yu  =>  xu*y + x*yu - w <= xu*yu
        A_mc[1, x_idx] = yu
        A_mc[1, y_idx] = xu
        A_mc[1, w_idx] = -1.0
        b_mc[1] = xu * yu
        
        # 3. w <= xu*y + x*yl - xu*yl  =>  -x*yl - xu*y + w <= -xu*yl
        A_mc[2, x_idx] = -yl
        A_mc[2, y_idx] = -xu
        A_mc[2, w_idx] = 1.0
        b_mc[2] = -xu * yl
        
        # 4. w <= xl*y + x*yu - xl*yu  =>  -x*yu - xl*y + w <= -xl*yu
        A_mc[3, x_idx] = -yu
        A_mc[3, y_idx] = -xl
        A_mc[3, w_idx] = 1.0
        b_mc[3] = -xl * yu
        
        return A_mc, b_mc

    def apply_batch_relaxations(
        self, 
        A_ub: torch.Tensor, 
        b_ub: torch.Tensor, 
        bilinear_pairs: list, 
        current_lower: torch.Tensor, 
        current_upper: torch.Tensor
    ) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Dynamically appends McCormick envelopes for all bilinear pairs to the 
        current continuous relaxation matrix on the GPU.
        bilinear_pairs: list of tuples (x_idx, y_idx, w_idx)
        """
        if not bilinear_pairs:
            return A_ub, b_ub
            
        num_vars = A_ub.shape[1]
        A_mc_list = []
        b_mc_list = []
        
        for (x_idx, y_idx, w_idx) in bilinear_pairs:
            x_b = (current_lower[x_idx].item(), current_upper[x_idx].item())
            y_b = (current_lower[y_idx].item(), current_upper[y_idx].item())
            
            A_mc, b_mc = self.generate_envelopes(x_idx, y_idx, w_idx, x_b, y_b, num_vars)
            A_mc_list.append(A_mc)
            b_mc_list.append(b_mc)
            
        A_mc_cat = torch.cat(A_mc_list, dim=0)
        b_mc_cat = torch.cat(b_mc_list, dim=0)
        
        A_ub_new = torch.cat([A_ub, A_mc_cat], dim=0)
        b_ub_new = torch.cat([b_ub, b_mc_cat], dim=0)
        
        return A_ub_new, b_ub_new
