# Curve Check

99 Small Problems · Installment 09  
Data-Rich, Insight-Poor

**Is it a curve, and can we report the IC50?** Curve Check is a local-first workbench for separating an optimizer's fitted candidate from an assay-supported reporting claim. It includes ten synthetic cases, a browser-based fitting engine, a literature-grounded analytical companion and numerical tests.

## Use the workbench

```bash
python -m http.server 8000 --directory web
```

Open `http://localhost:8000`. No build, login, API key or runtime package installation is required. Serve the files over HTTP rather than opening `index.html` directly because the app uses ES modules and a module worker.

All input data and calculations stay in the browser. An optional Fontshare stylesheet loads externally; the app remains functional with fallback fonts. It uses no analytics, remote fitting endpoint or persistent browser storage.

## What it does

- Compare a free 4PL with fixed-bottom, fixed-plateau and fixed-slope alternatives.
- Distinguish relative IC50 from a control-defined 50% response threshold.
- Display raw wells, concentration means, residuals and an approximate relative-midpoint profile likelihood.
- Expose range truncation, partial response, flat curves, high-dose reversal, shallow transitions, steep transitions, influential doses and unequal noise.
- Import one normalized concentration-response curve as CSV, including genuine zero-dose controls.
- Run leave-one-dose-out sensitivity without deleting observations from the original fit.
- Export an audit in Markdown, input data in CSV, a restorable JSON session and the dose-response chart in SVG.

The absolute-threshold value is a local interpolation in log concentration; its measured-dose bracket is not a confidence interval. The app does not calculate an absolute-IC50 confidence interval. It never automatically converts “50% not observed” into a claim that a finite IC50 must exist above the tested range.

## Read the analysis

- [Analytical companion: Is It a Curve, and Can We Report the IC50?](docs/ANALYSIS.md)
- [Equations, algorithm, statistical assumptions and original audit heuristics](docs/MODEL.md)
- [Verification and browser QA record](docs/QA.md)

The companion synthesizes the [Assay Guidance Manual](https://www.ncbi.nlm.nih.gov/sites/books/n/assayguide/assayops/), [GraphPad's midpoint definitions](https://www.graphpad.com/guides/prism/latest/curve-fitting/reg_50_of_what__relative_vs_absolu.htm), [Tonge's assay-design guidance](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/) and primary methodological work on nonlinear fit diagnostics, control uncertainty and growth-rate confounding.

## Run verification

```bash
npm test
node scripts/export-fixtures.mjs
python scripts/verify_scipy.py
```

The first two commands require only Node.js 20 or newer. The independent reference check requires NumPy and SciPy (`python -m pip install numpy scipy`). GitHub Actions runs both the JavaScript tests and independent numerical check.

## Scope and provenance

Version 0.1.0 is a research and teaching prototype, not a validated assay-analysis platform, clinical tool or regulatory acceptance standard. Its rules are deliberately conservative teaching choices; they are not claimed as universally valid cutoffs. Confidence calculations assume independent, common-variance Gaussian concentration means and omit control and between-run uncertainty.

This installment complements, rather than replaces, [censored-potency](https://github.com/dataRichinsightPoor/censored-potency) and [Censor Check, installment 06](https://github.com/dataRichinsightPoor/censor-check). It audits a curve before a potency enters a results table; Censor Check audits what happens to censored potencies after they enter a dataset.

Only synthetic examples and original code/documentation are included. No employer-linked datasets, constructs, sequences or internal methods are included. Original material is MIT-licensed; linked literature and externally served fonts retain their own terms.
