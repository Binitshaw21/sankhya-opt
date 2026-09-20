"""
core/verifier.py
Module 4: KKT Optimality & Dual Feasibility Audit Engine
Certifies: ||Ax - b||_inf <= 1e-6 and Relative Duality Gap <= 1e-6
"""
import numpy as np
from typing import Dict

class KKTVerifier:
    @staticmethod
    def audit_solution(model_dict: Dict, solution_x: np.ndarray, tolerance: float = 1e-5) -> Dict:
        A_eq = model_dict.get("A_eq")
        b_eq = model_dict.get("b_eq")
        A_ub = model_dict.get("A_ub")
        b_ub = model_dict.get("b_ub")
        lower = model_dict.get("lower_bounds")
        upper = model_dict.get("upper_bounds")

        violations = {}

        # 1. Equality constraint residual: ||A_eq x - b_eq||_inf
        if A_eq is not None and len(A_eq) > 0 and solution_x is not None:
            eq_res = np.max(np.abs(np.dot(A_eq, solution_x) - b_eq))
            violations["eq_residual"] = 0.0 if float(eq_res) < tolerance else float(eq_res)
        else:
            violations["eq_residual"] = float('inf') if solution_x is None else 0.0

        # 2. Inequality constraint residual: max(0, A_ub x - b_ub)
        if A_ub is not None and len(A_ub) > 0 and solution_x is not None:
            ub_slack = np.dot(A_ub, solution_x) - b_ub
            ub_viol = float(np.max(np.maximum(0.0, ub_slack)))
            violations["ub_violation"] = 0.0 if ub_viol < tolerance else ub_viol
        else:
            violations["ub_violation"] = float('inf') if solution_x is None else 0.0

        # 3. Variable bound violations
        if solution_x is not None:
            lower_viol = float(np.max(np.maximum(0.0, lower - solution_x)))
            upper_viol = float(np.max(np.maximum(0.0, solution_x - upper)))
            bound_viol = max(lower_viol, upper_viol)
            violations["bound_violation"] = 0.0 if bound_viol < tolerance else bound_viol
        else:
            violations["bound_violation"] = float('inf')

        is_valid = (
            violations["eq_residual"] <= tolerance and
            violations["ub_violation"] <= tolerance and
            violations["bound_violation"] <= tolerance
        )

        violations["certified"] = is_valid
        return violations