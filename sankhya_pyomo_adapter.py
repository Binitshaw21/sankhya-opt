"""
sankhya_pyomo_adapter.py
Drop-in Pyomo Solver Wrapper for SANKHYA-OPT.
Demonstrates standard industrial modeling workflow with zero code rewrites.
"""
# pyrefly: ignore [missing-import]
import pyomo.environ as pyo
# pyrefly: ignore [missing-import]
from pyomo.repn import generate_standard_repn
import numpy as np
from core.gpu_pdlp import GPUPDLPContinuousSolver

def solve_pyomo_model_with_sankhya(model: pyo.ConcreteModel):
    """
    Extracts c, A, b matrices directly from Pyomo symbolic representations
    and solves them using the SANKHYA-OPT GPU Engine.
    """
    solver = GPUPDLPContinuousSolver()
    
    # 1. Map Pyomo variables to contiguous indices via object ID
    var_list = list(model.component_data_objects(pyo.Var))
    var_to_idx = {id(v): i for i, v in enumerate(var_list)}
    n = len(var_list)

    # 2. Extract objective vector c
    c = np.zeros(n)
    for obj in model.component_data_objects(pyo.Objective):
        repn = generate_standard_repn(obj.expr)
        for var, coeff in zip(repn.linear_vars, repn.linear_coefs):
            if var is not None and id(var) in var_to_idx:
                c[var_to_idx[id(var)]] = coeff if obj.is_minimizing() else -coeff

    # 3. Extract variable bounds
    lower = np.array([v.lb if v.lb is not None else -1e9 for v in var_list], dtype=np.float64)
    upper = np.array([v.ub if v.ub is not None else 1e9 for v in var_list], dtype=np.float64)

    # 4. Extract constraints
    rows_ub = []
    b_ub_list = []
    for con in model.component_data_objects(pyo.Constraint):
        row = np.zeros(n)
        repn = generate_standard_repn(con.body)
        for var, coeff in zip(repn.linear_vars, repn.linear_coefs):
            if var is not None and id(var) in var_to_idx:
                row[var_to_idx[id(var)]] = coeff
        
        # Handle upper bound (<=)
        if con.upper is not None:
            rows_ub.append(row)
            b_ub_list.append(con.upper())
            
        # Handle lower bound (>=) by multiplying by -1 to convert to <=
        if con.lower is not None:
            rows_ub.append(-row)
            b_ub_list.append(-con.lower())

    A_ub = np.array(rows_ub) if rows_ub else None
    b_ub = np.array(b_ub_list) if b_ub_list else None

    # 5. Execute SANKHYA solver
    res = solver.solve(c, None, None, A_ub, b_ub, lower, upper)

    # 6. Load results back into Pyomo variables
    for i, v in enumerate(var_list):
        v.value = res["solution_vector"][i]

    return res

if __name__ == "__main__":
    # Test on a small Pyomo model
    m = pyo.ConcreteModel()
    m.x = pyo.Var(within=pyo.NonNegativeReals)
    m.y = pyo.Var(within=pyo.NonNegativeReals)
    m.obj = pyo.Objective(expr=2*m.x + 3*m.y, sense=pyo.minimize)
    m.c1 = pyo.Constraint(expr=m.x + m.y >= 10)
    
    print("[*] Testing Drop-In Pyomo Adapter with SANKHYA-OPT...")
    result = solve_pyomo_model_with_sankhya(m)
    print(f"[✔] Pyomo Solved via SANKHYA-OPT: x = {m.x.value:.1f}, y = {m.y.value:.1f}")