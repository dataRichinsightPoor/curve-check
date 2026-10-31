# Curve Check regression inventory

## Publication-length interactive reading edition

- Publication credit reads “Data-Rich, Insight-Poor · No. CCLXVIII” and “99 Small Problems · Installment 09” in the cover, navigation/footer, Markdown, workbench article tab and repository introduction; check mobile wrapping and regenerate the social-cover PNG.

- Open article.html: readable paper-and-jade cover, clearly labeled AI artwork; user-provided image absent.
- Main story remains concise, with four central equations, three computed figures, twelve references, and an introductory tool/code section. Extended edition remains in docs.
- Reading links navigate to the intended headings, experiment, full workbench, code and MIT license.
- Experiment presets produce A20/SD20 = 0.04×, A20/SD1 = 16×, A0/SD20 = 0×. Flat has no midpoint; A50 has no finite absolute crossing; A100 gives absolute IC50 10 nM.
- Amplitude/noise sliders update continuously, expose units and assumptions, and mark presets with aria-pressed. Code inspector expands and collapses.
- Copy retains four embedded images, math and citations but excludes navigation, controls and interactive-only content. Clipboard fallback remains selectable. Markdown download equals canonical article.
- Article desktop, 390px mobile, short desktop and desktop/mobile/desktop resizing have no page overflow; equations and wide figures scroll internally.
- Existing workbench, all tab navigation, source-to-curve transfer, export/restore, scenarios, model choices, artifact labs and article exports still work.
- Public repository is MIT-licensed; GitHub Pages serves both pages; no user dataset, private credential or uploaded inspiration image is published.

## Illustrated mathematical article

- Three reproducible original SVG figures, not the uploaded image; each has a readable caption and full-size link.
- The publication cut retains four central display equations and inline equations with self-hosted KaTeX CSS/fonts and accessible MathML.
- The publication cut has twelve references, distinguishing research, assay guidance, industry recommendations, and official ICH text. The extended edition preserves the fuller bibliography.
- Copy button retains citations, converts equations to MathML for rich copy and TeX for plain text; portable HTML embeds figures as PNG data URIs rather than temporary preview URLs. Editor compatibility is explicitly qualified.
- Article download matches canonical Markdown; source repository includes figures beside it. Mobile figure and equation scrolling stays within the article, not the page.
- Nested source-to-curve session restore retains only verified simulation recipes.

## v0.4 weak-response refinement

Opened v0.3 before editing; default weak-response comparison and seven tabs rendered without page exceptions.

- Three presets: same 20-point effect with SD 20 or 1, and zero effect with SD 20. Presets preserve selected seed.
- Seed validation and next-realization control work; no preferred-result seed search.
- Actual generated settings remain labeled separately from pending control edits.
- Known-truth overlay appears only for a verified synthetic recipe; raw edits/uploads remove it. JSON recipe restoration requires exact regeneration of the raw CSV.
- Distinguish fixed edge-group contrast, noisy observed extrema, mean-level noise, numerical localization, and absolute threshold.
- JSON and Markdown exports retain generation settings; Markdown adds reviewed reporting language.
- Repeat all existing source/curve/laboratory/article/export/navigation flows and desktop/mobile QA.

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
