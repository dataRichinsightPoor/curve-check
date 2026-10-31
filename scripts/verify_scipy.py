"""Independent bounded numerical verification, not experimental validation."""
import json
from pathlib import Path
import numpy as np
from scipy.optimize import differential_evolution, minimize

root = Path(__file__).resolve().parents[1]
data = json.loads((root / "results/reference.json").read_text())
records = []

def independent(groups, mode, fixed_m=None, seed=720):
    x = np.array([g["x"] for g in groups])
    y = np.array([g["y"] for g in groups])
    lx = np.log10(np.maximum(x, 1e-300))
    mlo, mhi = lx[x > 0].min()-4, lx[x > 0].max()+4
    names = ["bottom", "top", "m", "h"]
    const = {}
    if mode in ("bottom", "both"):
        const["bottom"] = 0.
    if mode == "both":
        const["top"] = 100.
    if mode == "slope":
        const["h"] = 1.
    if fixed_m is not None:
        const["m"] = fixed_m
    free = [n for n in names if n not in const]
    domain = {"bottom": (-50, 150), "top": (-50, 150),
              "m": (mlo, mhi), "h": (.1, 5)}
    def unpack(v):
        return {**const, **dict(zip(free, v))}
    def objective(v):
        p = unpack(v)
        if p["top"] < p["bottom"]:
            return 1e10+(p["bottom"]-p["top"])**2
        z = 1/(1+10.**np.clip(p["h"]*(lx-p["m"]), -300, 300))
        z[x == 0] = 1
        pred = p["bottom"]+(p["top"]-p["bottom"])*z
        return float(np.sum((y-pred)**2))
    bounds = [domain[n] for n in free]
    res = differential_evolution(objective, bounds, seed=seed, tol=1e-10,
                                 popsize=18, maxiter=1300, polish=True)
    pol = minimize(objective, res.x, method="Nelder-Mead", bounds=bounds,
                   options={"maxiter": 4000, "xatol": 1e-10, "fatol": 1e-10})
    return unpack(pol.x if pol.fun < res.fun else res.x), min(pol.fun, res.fun)

for case in data["fixtures"]:
    for js in case["fits"]:
        py, sse = independent(case["groups"], js["mode"])
        delta = abs(sse-js["sse"])
        if delta >= 2e-5*(1+sse):
            for seed in [125, 839, 9981]:
                other, value = independent(case["groups"], js["mode"], seed=seed)
                if value < sse:
                    py, sse = other, value
            delta = abs(sse-js["sse"])
        tolerance = 2e-5*(1+sse)
        assert delta < tolerance, (case["id"], js["mode"], sse, js["sse"])
        if case["id"] in ("complete", "partial") and js["mode"] == "free":
            assert abs(py["m"]-js["m"]) < .001
        records.append({"case": case["id"], "mode": js["mode"],
                        "javascript_sse": js["sse"], "scipy_sse": sse,
                        "absolute_sse_difference": delta})
    for point in case["profileChecks"]:
        _, sse = independent(case["groups"], "free", fixed_m=point["m"])
        if abs(sse-point["sse"]) >= 3e-5*(1+sse):
            for seed in [125, 839, 9981]:
                _, value = independent(case["groups"], "free", fixed_m=point["m"], seed=seed)
                sse = min(sse, value)
        assert abs(sse-point["sse"]) < 3e-5*(1+sse), (case["id"], point["m"], sse, point["sse"])

summary = {"fit_checks": len(records), "profile_checks": len(data["fixtures"])*4,
           "maximum_absolute_sse_difference": max(r["absolute_sse_difference"] for r in records),
           "records": records,
           "scope": "Independent numerical agreement on synthetic fixtures, not biological validation."}
(root / "results/scipy-verification.json").write_text(json.dumps(summary, indent=2)+"\n")
print(json.dumps({k: v for k,v in summary.items() if k != "records"}, indent=2))
