"""Independent NumPy checks of raw normalization, constant baseline and AICc."""
import csv
import io
import json
import math
from pathlib import Path
import numpy as np

data = json.loads(Path("results/source-reference.json").read_text())
checks = []
for f in data["fixtures"]:
    raw = list(csv.DictReader(io.StringIO(f["raw"])))
    neutral = np.mean([float(r["signal"]) for r in raw if r["role"] == "neutral"])
    full = np.mean([float(r["signal"]) for r in raw if r["role"] == "full"])
    sample = [r for r in raw if r["role"] == "sample"]
    y = 100 * (np.array([float(r["signal"]) for r in sample]) - full) / (neutral - full)
    assert np.allclose(y, [r["y"] for r in f["control"]], atol=1e-10, rtol=0)
    x = np.array([float(r["concentration"]) for r in sample])
    means = np.array([y[x == dose].mean() for dose in np.unique(x)])
    positive_means = np.array([y[x == dose].mean() for dose in np.unique(x) if dose > 0])
    edge_count = min(3, len(positive_means) // 2)
    assert f["signal"]["edgeCount"] == edge_count
    if edge_count:
        contrast = positive_means[:edge_count].mean() - positive_means[-edge_count:].mean()
        assert math.isclose(contrast, f["signal"]["edgeContrast"], abs_tol=1e-10)
    sse = np.sum((means - means.mean()) ** 2)
    assert math.isclose(sse, f["signal"]["flatSSE"], abs_tol=1e-8)
    if sse > 1e-12:
        n = len(means)
        aicc = n * math.log(sse / n) + 4 + 12 / (n - 3)
        assert math.isclose(aicc, f["signal"]["flatAicc"], abs_tol=1e-8)
        assert math.isclose(f["fit"]["aicc"] - aicc, f["signal"]["deltaAicc"], abs_tol=1e-8)
    else:
        assert f["signal"]["flatAicc"] is None
    checks.append({"fixture": f["name"], "normalization": "passed", "flatSSE": float(sse), "AICc": "passed"})
Path("results/source-verification.json").write_text(json.dumps({"checks": checks, "scope": "Arithmetic verification, not calibrated inference or assay validation."}, indent=2) + "\n")
print(f"Independent source reconstruction checks passed: {len(checks)} fixtures.")
