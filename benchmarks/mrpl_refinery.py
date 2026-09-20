"""
benchmarks/mrpl_refinery.py
Industrial Refinery Crude-Assay Blending Problem Formulation (MRPL Test Case)
Includes atmospheric distillation units, Reid Vapor Pressure, and Octane limits.
"""
import numpy as np
from typing import Dict

def build_mrpl_benchmark_model() -> Dict:
    """
    Variables:
      x0: Arab Light Crude (Barrels)
      x1: Brent Blend (Barrels)
      x2: Maya Heavy Crude (Barrels)
      x3: Catalytic Reformer Throughput (Barrels)
      x4: Discrete CDU Mode A [Binary: 0 or 1]
      x5: Discrete CDU Mode B [Binary: 0 or 1]
    """
    # Minimization Cost coefficients in thousands INR
    c = np.array([62.0, 75.0, 48.0, 15.0, 120.0, 180.0], dtype=np.float64)

    # Equalities A_eq x = b_eq
    A_eq = np.array([
        [1.0, 1.0, 1.0, 0.0, -500.0, -800.0],  # Total crude feed to active CDU mode
        [0.25, 0.30, 0.15, -1.0, 0.0, 0.0],   # Naphtha reforming yield balance
    ], dtype=np.float64)
    b_eq = np.array([0.0, 0.0], dtype=np.float64)

    # Inequalities A_ub x <= b_ub
    A_ub = np.array([
        [0.03, 0.01, 0.05, 0.0, 0.0, 0.0],       # Max Heavy Sulfur balance <= 22.0
        [-85.0, -95.0, -70.0, -100.0, 0.0, 0.0], # Min Octane threshold >= 45,000
        [0.0, 0.0, 0.0, 0.0, 1.0, 1.0],          # Mutually exclusive CDU modes <= 1
    ], dtype=np.float64)
    b_ub = np.array([22.0, -45000.0, 1.0], dtype=np.float64)

    lower = np.array([0.0, 0.0, 0.0, 0.0, 0.0, 0.0], dtype=np.float64)
    upper = np.array([1000.0, 1000.0, 1000.0, 500.0, 1.0, 1.0], dtype=np.float64)
    int_indices = [4, 5]

    return {
        "name": "MRPL_Crude_Blending_Dispatch_MILP",
        "c": c,
        "A_eq": A_eq,
        "b_eq": b_eq,
        "A_ub": A_ub,
        "b_ub": b_ub,
        "lower_bounds": lower,
        "upper_bounds": upper,
        "integer_indices": int_indices,
        "var_names": [
            "Arab_Light_bbl",
            "Brent_Crude_bbl",
            "Maya_Heavy_bbl",
            "Reforming_Naphtha_bbl",
            "CDU_Mode_A_Flag",
            "CDU_Mode_B_Flag"
        ]
    }