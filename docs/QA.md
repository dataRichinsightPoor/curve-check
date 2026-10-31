# Curve Check verification record

## Version 0.3.0 source-to-claim revision

- Reviewed 12 related repository/workflow documents and the closest prior curve-fitting article. The overlap assessment and resulting scope changes are in `SERIES-OVERLAP.md`; this is not an exhaustive archive search.
- 67/67 JavaScript tests passed. New coverage includes raw/control preservation, missing references, malformed rows, zero dose, constant signals, out-of-range retention, source-record restoration, deterministic weak-response generation, and constant-model AICc arithmetic.
- Independent NumPy checks passed for five source fixtures: weak/high-noise, clear/low-noise, zero effect with noise, tiny effect, and exact constant. Normalization, flat-model SSE and AICc agreed; see `results/source-verification.json`. These do not calibrate statistical coverage.
- The original logistic solver is unchanged apart from its version identifier; the earlier SciPy verification remains a record of that solver, not a new biological validation claim.
- Browser checks exercised 20/100 effect at noise SDs 20 and 1, zero true effect, and the tiny-effect example. High-noise data favored the constant model by the displayed AICc, whereas low-noise data favored 4PL. The tool still withheld unconditional biological attribution.
- Raw edit invalidated stale results/exports; malformed raw input was rejected. Raw-file upload, source JSON and Markdown downloads, metadata restoration and source-to-curve handoff were exercised.
- Source-bound curve sessions restored successfully; a normalized row changed without matching the raw source was rejected. Loading an ordinary scenario cleared prior source context. Self-scaled source handoff disabled the independent-control declaration.
- An out-of-domain normalized response remained in the raw record and could be exported, while fitting/handoff was unavailable rather than clipping the data.
- All 28 legacy scenarios, four model modes, control-declaration cycle, full-profile cycle and dose-omission flow were exercised without browser page exceptions.
- Desktop and 375px rendering checked after resize completion; full-window weak-response chart labels remained readable and page-level horizontal overflow was absent.

## Version 0.2.0 expansion

The historical v0.1.0 checks below are retained as a previous-version record, not represented as new-version evidence.

- 50/50 JavaScript tests passed on October 31, 2026, including all 28 scenarios, exact primary artifact twins, intervention masks, normalization, effect-level dose ratios, and article-link rendering regressions.
- Independent SciPy checks passed for 112 scenario/model fits and 112 fixed-midpoint nuisance optimizations. Maximum absolute fit-SSE difference: 9.317227522842586e-08. Raw comparisons are in `results/scipy-verification.json`.
- Local Chromium: all 28 scenarios, four fitting modes, control declaration cycle, range/noise/seed controls, profile zoom cycle, and dose omission exercised without page exceptions.
- CSV paste with exact zero, malformed/script-like input rejection without data replacement, CSV upload, four nonempty exports, and JSON restoration exercised through user-facing controls.
- All five intervention settings, both normalization settings, and all three test-slope settings exercised; the shallow-test dose ratios displayed 0.5, 2, and 8 at 20%, 50%, and 80% inhibition.
- Article rendered 50 paragraphs and two equation blocks. Copy completed, Markdown downloaded, and the first citation opened at the correct URL after repairing a greedy-link parsing bug.
- Desktop/mobile/desktop resizing tested. A narrow-screen grid overflow was repaired; charts rerender labels at actual panel width. The article contains no image, and neither the screenshot nor its attachment path appears in the shipped files.
- Hosted deployment: fresh cloud-browser session loaded v0.2.0 with `window.origin === "null"`; the reporter example still localized numerically, demonstrating the retained main-thread fallback.
- Hosted intervention, self-normalization, and nonparallel ratio controls returned their expected visible results. JSON export saved a nonempty session; article copy completed.
- The original relative article-download link navigated instead of saving in the opaque-origin preview. Replaced with a fetched Blob download; the final hosted check saved the 27,585-byte Markdown and retained the app page. The first article citation opened the exact intended NCBI URL.
- The public `/computer/a` wrapper returned a Cloudflare challenge to fresh Playwright. Hosted functionality was therefore checked through the deployment tool's temporary QA URL, not claimed as a successful automated wrapper check.

These are implementation and UI checks. They do not validate mechanism, uncertainty coverage, a reporting rule, or regulatory compliance.

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
