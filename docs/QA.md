# Curve Check verification record

## Required user flows

- Open the laboratory and identify synthetic data, the selected model and separate relative/absolute reporting outcomes.
- Select each of ten scenarios; check that the charts and decisions update.
- Change the maximum tested concentration, noise and seed, then regenerate.
- Change every fitting assumption; uncheck and recheck control validity.
- Import CSV by paste and file, including zero concentrations and repeated wells.
- Reject invalid CSV without replacing valid data.
- Inspect likelihood profiles, residuals, assumption comparison and reporting text.
- Run leave-one-dose-out without modifying source observations.
- Download Markdown, CSV, JSON and SVG; restore the exported JSON and recompute.
- Open reporting and methods tabs; activate a literature link.
- Resize desktop to 375px mobile and back; inspect chart labels, controls and overflow.
- Confirm user-entered text cannot execute HTML or script.
- Confirm the deployed preview loads and its core controls operate.

## Scientific scope

JavaScript tests and independent SciPy checks verify declared numerical behavior on synthetic fixtures. They do not verify biological mechanism, validated confidence coverage, assay-specific acceptance thresholds or between-run reproducibility.

## Executed numerical checks

- The initial 33-test suite passed after correcting a fixture count and making the negligible-variance threshold consistent with numerical optimization tolerance.
- Two regression tests were subsequently added for exact-threshold observations and threshold plateaus.
- Independent SciPy optimization verified all 40 synthetic scenario/model fits and 40 fixed-midpoint nuisance optimizations. The maximum absolute fit-SSE difference was \(1.57\times10^{-10}\).
- The SciPy check uses an independent direct optimizer, with additional deterministic seeds when a near-flat objective produces different local solutions. It does not initialize from the JavaScript fitted parameters.

## Executed local browser checks

Chromium was exercised at 1440px desktop and 375px mobile widths. All ten scenarios and all four fitting models updated correctly; the browser reported no page exceptions and no document-level horizontal overflow.

The tested flows included synthetic range/noise/seed regeneration, control declaration on/off, exact zero-dose CSV paste, CSV file upload, invalid/script-like input rejection without replacing the previous dataset, influence analysis, all three tabs, profile zoom toggle, and responsive chart rendering.

All four export buttons produced nonempty downloads. The exported SVG parsed as valid XML. Exported JSON restored 39 observations and reproduced the baseline fitted candidate; restored output is recomputed rather than trusting serialized audit results. CSV file import cleared control validity as designed.

The final JavaScript suite passed 35/35 tests. All exported files and raw fixtures contain synthetic data only.

## Hosted-preview checks

The first preview exposed an opaque-origin restriction that blocked module-worker construction. The application now guards worker startup and uses the same local engine on the main thread when workers are unavailable; no server-side fitting or data upload is introduced.

A fresh Chromium context successfully loaded the deployed preview with ten scenario choices and 39 plotted observations. Complete, truncated, partial and hook scenarios produced their expected distinct outcomes. Fitting-mode changes, control declaration changes, leave-one-dose-out, all four downloads, JSON restoration and all three tabs worked in the hosted environment without page exceptions.

The hosted page was also checked at 375px after responsive SVG redraw completed. There was no document-level horizontal overflow. Downloaded hosted-preview files were saved and inspected locally; the shareable preview itself contains only the application and synthetic generators.
