# Curve Check: model and numerical methods

Version 0.1.0 is an original research prototype. All supplied cases are synthetic; numerical agreement tests do not constitute biological validation.

## Data contract

Input is a single curve from one experimental run with exactly two CSV columns, `concentration,response`. Concentration is nonnegative and expressed in nM; positive values must be between \(10^{-12}\) and \(10^{12}\). Response is normalized remaining activity, accepted in the range −50 to 150% to permit reasonable excursions without clipping. Rejecting a value is not advice to clip it.

Zero-dose observations are averaged at zero and included using the exact model limit \(y(0)=T\). They are not plotted on the log-dose axis. Up to 1,000 observations and 100 distinct concentrations are accepted, with at least five positive concentrations required for fitting.

The engine fits one equally weighted mean per concentration. It keeps the individual wells for display and a descriptive noise estimate, but neither fits a replicate-level likelihood nor estimates a run-level random effect.

## Conditional least squares

The response function is

\[
y=B+(T-B)z,\quad z=[1+10^{h(\log_{10}x-m)}]^{-1}.
\]

For each fixed \(m,h\), the model is linear in \(B,T\). The engine solves the two-variable normal equations and checks the feasible triangle \(-50\le B\le T\le150\), including every box edge and the \(B=T\) edge. The smallest feasible residual sum of squares is retained. Fixed-plateau cases use their appropriate one- or zero-dimensional conditional solutions.

Slope is searched over \(0.1\le h\le5\); log10 midpoint is searched from the smallest positive log concentration minus four to the largest plus four. A 91-point midpoint grid and 29-point log-slope grid seed bounded golden-section refinement. Multiple promising starts reduce dependence on a single initial value but are not a formal global-optimality proof.

Curve modes have four, three, two and three free mean parameters, respectively: free 4PL; bottom fixed at zero; top fixed at 100 with bottom at zero; and slope fixed at one. A numerical bound hit is reported.

## Profile likelihood

For \(n\) independent concentration means with errors \(N(0,\sigma^2)\),

\[
\ell(\theta,\sigma^2)
=-\frac{n}{2}\log(2\pi\sigma^2)
-\frac{\operatorname{SSE}(\theta)}{2\sigma^2}.
\]

The maximizing variance is \(\widehat{\sigma}^2=\operatorname{SSE}/n\). Substitution and subtraction from the unconstrained maximum gives

\[
2[\ell_{\max}-\ell_p(m)]
=n\log\left[\operatorname{SSE}_p(m)/\operatorname{SSE}_{\min}\right].
\]

At each fixed \(m\), the other free parameters are reoptimized. The engine samples the full numerical range and adds a finer grid within one log unit of the optimum. Threshold crossings are linearly interpolated on this grid. The connected component containing the optimum defines the displayed interval; other accepted components trigger a disconnected-profile flag. An endpoint at a search boundary is reported as open, not as a finite confidence limit.

The 3.84145882 cutoff is asymptotic. The browser does not establish nominal 95% coverage for small samples, near-flat responses, parameter boundaries or invalid error models. Methodological support for profiling is distinct from validation of this implementation. ([Ren & Xia](https://pmc.ncbi.nlm.nih.gov/articles/PMC6347253/))

## Absolute versus relative midpoint

Relative midpoint is \(10^m\), at response \((T+B)/2\). The model-based control-defined crossing exists only when \(B<50<T\), in which case

\[
x_{50}=10^m[(T-50)/(50-B)]^{1/h}.
\]

The app also finds descending brackets between adjacent positive-dose means and interpolates response linearly in log concentration inside each bracket. This local interpolation is not the same estimator as the fitted-curve crossing. The UI shows both when a threshold is bracketed and labels the tested-dose bracket as not a confidence interval.

No profile or bootstrap interval for absolute IC50 is implemented. Zero controls are included in the model fit but are not used as a log-interpolation endpoint.

## Diagnostics and original teaching rules

Let \(s_{\mathrm{mean}}\) be the RMS of available within-dose \(SD/\sqrt{n_j}\). It is a descriptive noise scale and assumes independently noisy wells, not biological replicates.

- Small response: observed positive-dose mean span < max(10 pp, \(3s_{\mathrm{mean}}\)).
- Upward reversal: maximum rise from any preceding minimum > max(8 pp, \(3s_{\mathrm{mean}}\)).
- Large mean residual error: RMSE > max(8 pp, \(2s_{\mathrm{mean}}\)).
- Sparse grid: fewer than seven positive concentrations.
- Broad relative profile: unavailable, open, disconnected, or wider than two log units.
- Cross-model sensitivity: midpoint range > 0.5 log units; this does not imply all candidate constraints are scientifically plausible.
- Relative endorsement additionally requires one observed descending crossing of the selected fitted midpoint-response level, an interior in-range midpoint, and no parameter-bound flag.
- Control-defined threshold support requires declared valid controls, one descending 50% bracket, an in-range fitted 50% crossing, and no small-span, reversal, large-residual or sparse-grid flags. This does not endorse the relative midpoint or claim an absolute-IC50 confidence interval.

These thresholds are original, unvalidated teaching heuristics. They are neither regulatory criteria nor claimed cutoffs from the cited literature. Formal assurance requires assay-specific operating characteristics, a prespecified plan, a supported error model and independent experimental evidence.

## Model comparison and influence

AICc uses \(k=p+1\), including the unknown Gaussian variance, and the same concentration means for all models:

\[
AIC_c=n\log(\operatorname{SSE}/n)+2k+\frac{2k(k+1)}{n-k-1}.
\]

Additive constants common to the models are omitted. AICc is unavailable if \(n\le k+1\). A descriptive \(1-SSE/SST\) is present in the machine-readable result but is deliberately not used for endorsement or displayed as a validation score. The inadequacy of R² alone for nonlinear model selection is discussed by [Spiess and Neumeyer](https://pmc.ncbi.nlm.nih.gov/articles/PMC2892436/).

Leave-one-dose-out removes each positive concentration group in turn, refits the selected model and reports the resulting midpoint range. The original fit and data remain unchanged. That range is an influence diagnostic, not a confidence interval or a point-exclusion rule.

## Known omissions

This version does not propagate uncertainty in controls, fit multiple runs hierarchically, model concentration error, implement heteroscedastic weighting or robust losses, estimate Ki, fit kinetic inhibition, fit mechanistic biphasic responses, compute GR metrics, or determine target specificity. Parameters at computational boundaries cannot be interpreted as discovered biological limits.
