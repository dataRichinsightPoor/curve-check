# Scenario coverage and boundaries

All cases are original synthetic examples. Names are assigned ground truth, never diagnoses inferred from curve shape. The interactive numerical engine fits only decreasing logistic models; alternatives below illustrate where that engine is insufficient.

## Numerical information and model shape

- **Complete response:** positive comparator.
- **Truncated response:** missing lower plateau.
- **Partial response:** relative midpoint without absolute 50% crossing.
- **Flat response:** midpoint fitted to noise.
- **Left-range response:** all positive doses already inhibited.
- **High-dose rebound:** monotone-model mismatch.
- **Shallow transition:** slope/plateau/midpoint tradeoffs.
- **Steep transition:** transition undersampled between concentrations.
- **Influential concentration:** displaced group, not automatic exclusion.
- **Unequal noise:** common-variance assumption violation.
- **Mixture:** two equal-weight logistic populations, not fitted mixture inference.
- **Hormesis:** Gaussian low-dose bump added to decreasing response.
- **Increasing response:** unsupported direction, not an EC50 fit.
- **Asymmetry:** squared logistic denominator; location differs from half-response.
- **Sparse:** five distinct concentrations, three wells each.
- **Tiny response:** four-point total true effect, small noise.
- **Log-dose drift:** no true asymptotes in the sampled region.
- **Upper plateau missing:** midpoint near lower range limit.

## Readout, exposure, and attribution

- **Reporter inhibition, cell loss, solvent, plate position:** same observed sigmoid as the complete comparator, with identical seeded noise.
- **Concentration mislabel:** actual exposure stipulated tenfold higher.
- **Aggregation-like shape:** steep descriptive generator, no physical colloid model.
- **Solubility ceiling:** effective exposure capped at 15 nM.
- **Clipping:** response limited to 15–85%.
- **Time shift:** stipulated tenfold midpoint shift, no kinetic model.
- **Batch step:** high-concentration preparation offset.

## Additional laboratories

The five-cause intervention laboratory uses an explicitly declared binary mask. It assumes perfect interventions for teaching and does not estimate sensitivity, specificity, or posterior probabilities. Mixed causes are not simulated.

The normalization laboratory compares a small raw decline with independent controls versus self min–max scaling. It uses exact arithmetic rather than estimating a new model.

The relative-potency laboratory compares test/reference dose ratios at 20%, 50%, and 80% inhibition. It assumes common 0/100 asymptotes and varies the test slope; it performs no formal equivalence test.

## Not implemented

Raw control fitting, shared-control covariance, heteroscedastic likelihood inference, run hierarchy, calibrated confidence coverage, nonmonotone or increasing-model estimation, five-parameter fits, mechanistic aggregation, target binding, free exposure, kinetic inhibition, cell-growth inference, raw plate ingestion, and formal relative-potency validation are outside the numerical engine. The companion discusses relevant literature without claiming those procedures are implemented.
