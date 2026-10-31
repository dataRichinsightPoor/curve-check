# Curve Check regression inventory

## v0.3 source-to-claim revision

Before this edit, v0.2.0 was opened in Chromium: five tabs, 28 cases, no page errors. Preserve all flows below.

- Default Source-to-claim tab reconstructs original raw sample and control wells without overwriting them.
- Changing normalization changes numerical results but cannot establish mechanism or repair source validity.
- Raw CSV upload/paste rejects missing controls, unknown roles, nonnumeric signals and malformed rows; dirty inputs disable stale exports.
- JSON evidence-record restore recomputes from raw text, never trusts stored derived results.
- Evidence record includes exact source, normalization, control statistics, units, metadata, limitations, and SHA-256 where available; fingerprint identifies bytes, not truth.
- Source-to-claim handoff imports the selected normalized observations into the existing curve lab, with source context in exports and control declaration unchecked.
- Normalized-only CSV and legacy v1 curve sessions continue working, without inventing raw-source provenance.
- Companion article acknowledges overlap and states the narrower new job; series map routes to existing tools.
- Desktop/mobile, hosted Blob downloads, source-record restore, and article links exercised.
- Weak-response example separates 20/100 true effect from well-noise SD. Test 0%, 20%, low/high noise; full control window remains visible, constant baseline and AICc assumptions shown. Metadata or model convergence cannot turn these into validated biological claims.

Pre-edit browser inspection: existing application opened at localhost:8000; ten scenarios, three tabs, and conditional-estimate status rendered without page errors.

## Existing flows to preserve

- Curve laboratory: select scenarios, adjust range/noise/seed, regenerate, switch all four models, toggle control declaration. Charts and reporting language update.
- Diagnostics: full-profile toggle and leave-one-dose-out work; sensitivity is not labeled a confidence interval.
- Local data: paste CSV, upload CSV, reject malformed data, retain zero dose, uncheck control declaration on import.
- Downloads: Markdown audit, CSV, JSON, SVG; restore exported v1 session and reproduce observations.
- Navigation: Reporting guide and Methods & evidence; return to laboratory redraws charts.
- Responsive: desktop, 375px mobile, desktop again; no horizontal page overflow or console errors.

## Expansion acceptance checks

- At least 25 explicitly synthetic scenarios, with mechanisms distinguished from shape diagnostics.
- Identical primary responses from distinct modeled causes; interventions reveal only stipulated synthetic distinctions.
- Normalization lab demonstrates small raw span versus manufactured 0–100 span; invalid controls rejected.
- Relative-potency lab demonstrates effect-dependent dose ratios for nonparallel curves.
- Readout and biological attribution remain unverified even when a numerical midpoint is localized.
- Article is readable, selectable/copyable, and downloadable; contains no uploaded image.
- Literature scope distinguishes official ICH guidance, published recommendations, USP previews, and teaching heuristics.
- All above checks repeated after deployment in a fresh context; opaque-origin Worker fallback retained.
