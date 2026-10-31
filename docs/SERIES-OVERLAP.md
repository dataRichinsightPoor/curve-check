# Curve Check: series overlap review and revised role

Reviewed October 31, 2026. This review covers the repository inventory, 12 related public README/workflow documents, the available “Convergence Is Not Measurement” article, and targeted article discovery. It is not an exhaustive full-text audit of every historical social post or unpublished draft.

## Finding

The previous version overlapped materially with existing work, not merely in subject matter. The central fitting argument already belongs to “Convergence Is Not Measurement” and its censored-potency package, which tests bracketing and compares free and constrained fits ([repository](https://github.com/dataRichinsightPoor/censored-potency)). A generic claim checklist and nonparallel-dose-ratio demonstration also repeat functions already present in Comparability Check ([repository](https://github.com/dataRichinsightPoor/comparability-check)).

The revised distinction is a raw-signal-to-claim reconstruction for one concentration-response run. It is a portfolio distinction established by this review, not a claim of worldwide software novelty.

## Coverage and disposition

| Existing work | Established job | Disposition in No. 09 |
|---|---|---|
| Convergence Is Not Measurement / censored-potency | Observed bracketing, model constraints, bootstrap localization and unresolved potency reporting ([code and article](https://github.com/dataRichinsightPoor/censored-potency)). | Explicitly acknowledged predecessor. Retain fitting as a supporting browser diagnostic, not the new contribution. |
| Censor Check / No. 06 | Audits reported relations and values, exact-value filtering and within-paper versus pooled comparisons, not original curves ([repository](https://github.com/dataRichinsightPoor/censor-check)). | Upstream/downstream distinction: No. 09 preserves a source record before a number enters such a table. No automatic Censor Check export schema is claimed. |
| Comparability Check / No. 07 | Claim audit, lot/method confounding, crossed bridges, normalization and unequal-slope comparisons ([repository](https://github.com/dataRichinsightPoor/comparability-check)). | Do not build another general comparability checklist. Keep dose-ratio example as an attributed bridge; route full comparisons back to No. 07. |
| Crosstalk Check / No. 08 | Stimulation histories, intervention comparisons, reporter dynamics and discriminating assay designs ([repository](https://github.com/dataRichinsightPoor/crosstalk-check)). | Retain identical-sigmoid teaching case only to expose attribution limits; do not duplicate a signaling simulator. |
| The Threshold Is Part of the Measurement / CCV | Synthetic tests of thresholding, detector effects, segmentation and sampling choices ([repository](https://github.com/dataRichinsightPoor/threshold-is-part-of-the-measurement)). | Acknowledge the measurement-processing foundation; apply reconstruction to raw sample/control concentration-response records. |
| Free-Dose Check / No. 01 | Finite-bath free versus added ligand and cell/volume design limits ([repository](https://github.com/dataRichinsightPoor/free-dose-check)). | Route exposure/depletion questions there rather than infer free concentration from curve shape. |
| Antigen-tail Check / No. 02 | Single/paired antigen distributions plus productive-delivery and pharmacodynamic modules ([repository](https://github.com/dataRichinsightPoor/antigen-tail-check)). | Do not turn a partial plateau into a population or delivery diagnosis. |
| Washout Check / No. 03 | Loading, residual exposure, reassociation and retention under mass balance ([repository](https://github.com/dataRichinsightPoor/washout-check)). | Route persistence questions there. Time-shift cases in No. 09 remain illustrative, not kinetic inference. |
| Protein-Clock Check / No. 04 | RNA-driven protein dynamics and whether the endpoint is premature ([repository](https://github.com/dataRichinsightPoor/protein-clock-check)). | Preserve exposure/endpoint timing in the record rather than duplicate turnover dynamics. |
| Encounter Check / No. 05 | Cell density, geometry, effector–target contact and optional bispecific-drug effects ([repository](https://github.com/dataRichinsightPoor/encounter-check)). | Record assay context; route density and encounter interpretation to its model. |
| Chance Atlas | Closed-form stochastic-process calculations and assay interpretations ([repository](https://github.com/dataRichinsightPoor/chance-atlas)). | Do not expand No. 09 into another general statistical-failure catalog. |
| Organoid Hook Model / CCXXIV | No-wash accumulation-format hook behavior; productive delivery versus observed reporter signal ([repository](https://github.com/dataRichinsightPoor/organoid-hook-model)). | Keep rebound shape as a warning; route mechanistic hook questions to the existing model. |

## Implemented adjustment

The new default tab accepts role-tagged raw sample and independent-control observations. It reconstructs both independent-control normalization and a sample-min–max counterfactual, displays the numerical consequences, and preserves the original source text. It deliberately refuses to treat sample extrema as an independent definition of 50% inhibition.

The default example directly addresses a 20-unit true response in a 100-unit assay window. Well-noise SD is independently adjustable, including a high-noise starting setting and a zero-effect option. A constant-response comparator, full-window plot and conditional AICc contrast make a completed fit compete with the possibility of a nearly flat readout. The tool does not equate 20% amplitude with a complete signal-to-noise ratio or impose a universal 20% cutoff.

The new evidence record contains source identification, exact raw CSV, control means and observed SDs, processing branch, normalized observations, selected numerical audit, endpoint and exposure notes, evidence references, and explicit missing-validation statements. Restoration recalculates from the raw text. A SHA-256 fingerprint identifies the supplied bytes where browser support permits; it is not authentication, a digital signature, or laboratory provenance verification.

The selected reconstruction can be handed to the existing curve laboratory without losing its source context. Curve-session exports carry the source record, and restoration checks that reconstructed rows match the saved normalized observations. Existing normalized-only inputs and v1 sessions remain supported without inventing missing provenance.

## What the image contributed

The conceptual issue is the promotion of processed output into trusted evidence without checking the input. It is not a demand for a prettier warning, another confidence score, or an automatic “bad data” classifier. The practical response is to keep source observations and processing decisions attached to the conclusion, visibly distinguish computation from verification, and preserve unknowns rather than decorate them.

The uploaded image is neither embedded nor reproduced in the article, application, or repository.

## Remaining limits

This implementation does not inspect laboratory notebooks, verify linked records, authenticate raw files, ingest full plate maps, model shared-control covariance, propagate control uncertainty, or establish target mechanism. No number of completed evidence fields upgrades those limitations. The revised article and UI make those boundaries explicit.
