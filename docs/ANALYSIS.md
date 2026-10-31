# Is It a Curve, and Can We Report the IC50?

99 Small Problems · Installment 09  
Data-Rich, Insight-Poor  
Companion to Curve Check, version 0.1.0  
Evidence reviewed October 31, 2026

A fitting program answers a conditional numerical question: which parameter values make a chosen equation resemble these observations? An assay scientist must answer a different question: which response quantity did the experiment actually locate? The distinction matters because the Assay Guidance Manual explicitly separates an interpolated IC50 from an extrapolated one, while GraphPad distinguishes a midpoint between fitted plateaus from a threshold defined by external controls. ([Assay Guidance Manual](https://www.ncbi.nlm.nih.gov/sites/books/n/assayguide/assayops/), [GraphPad](https://www.graphpad.com/guides/prism/latest/curve-fitting/reg_50_of_what__relative_vs_absolu.htm))

Curve Check makes those questions executable without claiming to certify an assay. Its numerical examples are synthetic, its reporting rules are deliberately inspectable, and its purpose is to identify the assumption or additional experiment on which a reporting decision depends.

## The answer is not simply “no curve, no IC50”

A visible, complete sigmoid is neither a universal prerequisite nor sufficient evidence for a scientifically meaningful IC50: a threshold can be bracketed without both plateaus being established, while a beautifully resolved response can still reflect assay interference. ([Assay Guidance Manual](https://www.ncbi.nlm.nih.gov/sites/books/n/assayguide/assayops/), [Tonge, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/)) The useful decision is therefore not whether a plot looks sufficiently curved, but whether the intended response level is defined, sampled, identifiable under defensible assumptions, and relevant to the biological claim. ([Ritz et al., 2015](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0146021), [Tonge, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/))

- **A resolved transition:** An in-range estimate may be reported with its definition, model, constraints and uncertainty, provided the assay and model are appropriate; being inside the tested concentration range is necessary under the AGM interpolation rule, not an independent guarantee of validity. ([Assay Guidance Manual](https://www.ncbi.nlm.nih.gov/sites/books/n/assayguide/assayops/))
- **An incomplete response:** External knowledge can justify fixing a plateau, but the precision gained is conditional on that information; a constraint must not be confused with a newly measured asymptote. ([GraphPad’s incomplete-curve discussion](https://www.graphpad.com/guides/prism/latest/curve-fitting/reg_incomplete_dose-respone_curves.htm))
- **A flat or poorly localized response:** A numerical midpoint is not an experimentally identified potency when the observations do not identify the relevant asymptotes or transition. ([GraphPad’s incomplete-curve discussion](https://www.graphpad.com/guides/prism/latest/curve-fitting/reg_incomplete_dose-respone_curves.htm))
- **A nonmonotone response:** A single decreasing 4PL can be the wrong model family; hormetic and biphasic models exist, but selecting one adds assumptions rather than establishing the mechanism that generated the shape. ([Ritz et al., 2015](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0146021))

## Define the estimand before fitting

For a decreasing four-parameter logistic curve, write

\[
y(x)=B+\frac{T-B}{1+(x/C)^h},
\]

where \(T\) and \(B\) are the upper and lower asymptotes, \(h>0\) is the Hill slope and \(C\) is the relative midpoint; this is a standard log-logistic response parameterization. ([Ritz et al., 2015](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0146021)) The relative IC50 satisfies \(y(C)=(T+B)/2\), whereas a control-defined IC50 solves a specified response threshold such as \(y=50\) on a control-normalized remaining-activity scale. ([GraphPad](https://www.graphpad.com/guides/prism/latest/curve-fitting/reg_50_of_what__relative_vs_absolu.htm))

For this parameterization, algebra gives the control-defined crossing

\[
x_{50}=C\left(\frac{T-50}{50-B}\right)^{1/h},
\qquad B<50<T.
\]

This expression is a direct derivation from the stated model, not an empirical result. It makes the domain restriction explicit: the response level must lie strictly between the asymptotes for a finite crossing.

Consider an illustrative curve with \(T=100\), \(B=60\), \(C=10\) nM and \(h=1\). Its relative midpoint is 10 nM at a response of 80%, but it never reaches 50% remaining activity; describing 10 nM simply as “the concentration causing 50% inhibition” would change the meaning of the fitted quantity. This example illustrates the partial-response distinction in GraphPad’s definition guide. ([GraphPad](https://www.graphpad.com/guides/prism/latest/curve-fitting/reg_50_of_what__relative_vs_absolu.htm))

Changing the illustrative bottom to 20% moves the relative midpoint response to 60%, while the absolute crossing becomes approximately 16.7 nM by the equation above. Potency and attainable effect must remain separately visible because a midpoint alone cannot summarize a partial-response curve. ([GraphPad](https://www.graphpad.com/guides/prism/latest/curve-fitting/reg_50_of_what__relative_vs_absolu.htm))

## What fitting can manufacture

### Precision borrowed from a constraint

When a curve samples only the upper tail, a lower bottom and a more distant midpoint can compensate for one another; fixing bottom to zero removes that freedom but makes the estimate conditional on eventual full response. ([GraphPad’s incomplete-curve discussion](https://www.graphpad.com/guides/prism/latest/curve-fitting/reg_incomplete_dose-respone_curves.htm)) This can be entirely appropriate in a well-characterized system, but the control defining an instrument’s zero signal is not automatically evidence that a test compound can drive that biological system to zero. ([GraphPad](https://www.graphpad.com/guides/prism/latest/curve-fitting/reg_50_of_what__relative_vs_absolu.htm), [Tonge, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/))

Slope constraints require the same contextual care: Tonge recommends initially using \(h=1\) for a simple noncooperative interaction and investigating deviations, whereas AGM data-standardization guidance discourages presetting the Hill coefficient without statistical support. ([Tonge, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/), [AGM data standardization](https://www.ncbi.nlm.nih.gov/sites/books/NBK91993/?report=reader)) These recommendations should not be flattened into a universal rule because one is grounded in a specified binding mechanism and the other addresses broader assay-data workflows. ([Tonge, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/), [AGM data standardization](https://www.ncbi.nlm.nih.gov/sites/books/NBK91993/?report=reader))

Curve Check consequently shows four declared models side by side rather than selecting the one with the narrowest uncertainty. Its panel compares free 4PL, bottom fixed to zero, both plateaus fixed to control values, and Hill slope fixed to one.

### A good fit without an identified parameter

Goodness of fit and parameter identifiability are different properties: a model can follow the observed points closely while its parameter confidence intervals remain very broad. ([GraphPad on nonlinear R²](https://www.graphpad.com/support/faq/r2-and-nonlinear-regression/)) Spiess and Neumeyer’s simulations found that poor and better nonlinear models could differ only in the third or fourth decimal place of R², while AICc and BIC were more informative in their tested model-selection setting. ([Spiess & Neumeyer, 2010](https://pmc.ncbi.nlm.nih.gov/articles/PMC2892436/))

That paper does not establish that the smallest AICc validates a mechanism: it compared candidate statistical models under a particular simulated data-generating process. ([Spiess & Neumeyer, 2010](https://pmc.ncbi.nlm.nih.gov/articles/PMC2892436/)) In practice, candidate-model plausibility, the observation model, residual behavior and uncertainty remain part of the analysis rather than being replaced by an information criterion. ([Ritz et al., 2015](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0146021))

### A confidence interval conditional on the wrong experiment

A profile likelihood holds the parameter of interest at candidate values while reoptimizing the nuisance parameters; holding the other parameters fixed produces a slice, not the intended profile. ([Ren & Xia, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6347253/)) Profile intervals address some weaknesses of symmetric Wald intervals in nonlinear models, but numerical convergence, model adequacy and the assumptions behind the likelihood still matter. ([Ren & Xia, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6347253/))

For the browser’s explicitly declared working model of independent, equal-variance Gaussian concentration means, profiling out the unknown variance gives

\[
D(m)=n\log\!\left[\frac{\operatorname{SSE}(m)}
{\operatorname{SSE}(\widehat m)}\right].
\]

The app uses the approximate one-parameter 95% likelihood-ratio cutoff \(3.84146\), consistent with the asymptotic chi-square approach used in profile-likelihood methodology. ([Ren & Xia, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6347253/)) The derivation of this particular Gaussian SSE expression is supplied in MODEL.md; it is not a claim that the clinical-binomial examples in Ren and Xia validate this browser implementation or establish its small-sample coverage.

An open interval is retained as unresolved rather than replaced by the edge of the numerical search domain. The program also refuses to present an interval when residual variance is effectively zero or the number of concentration means is inadequate for its stated calculation.

## The experiment enters the fit before the optimizer does

- **Normalization:** Positive and negative controls are measurements, not exact constants, and shared control estimates can introduce dependence across normalized observations. ([Tansey et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC9007438/)) Curve Check accepts already normalized remaining activity and does not propagate control uncertainty; its intervals must therefore not be presented as complete experimental uncertainty.
- **Replication:** Multiple wells from one run are not equivalent to independent repeats of an entire experiment, and the AGM distinguishes fitting error from reproducibility across determinations. ([Assay Guidance Manual](https://www.ncbi.nlm.nih.gov/sites/books/n/assayguide/assayops/)) The browser retains wells but fits one equally weighted mean per concentration and does not accept pooled runs as a substitute for a hierarchical analysis.
- **Variance:** Nonlinear least squares carries an error-model assumption, and heteroscedastic data may need supported weighting, transformation or another likelihood. ([Ritz et al., 2015](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0146021)) The heteroscedastic teaching example intentionally exposes this weakness rather than silently claiming the app has corrected it.
- **Concentration scale:** Model parameterization must match whether concentration or log concentration was supplied; dose zero should be handled by the mathematical model rather than replaced with an arbitrary small positive value. ([GraphPad dose-response concepts](https://www.graphpad.com/guides/prism/latest/curve-fitting/dose_response___special.htm), [Ritz et al., 2015](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0146021)) The browser takes concentration in nM and evaluates the zero-dose limit exactly.
- **Influential observations:** Outliers can shift plateaus, slope and midpoint, but systematic plate-position or time-dependent effects require investigation rather than casual averaging or deletion. ([Tonge, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/)) The tool’s leave-one-dose-out analysis reports sensitivity and never removes points from the main fit.
- **Numerical domains:** Constraints and starting values can influence nonlinear estimates, particularly when the data are weakly informative. ([Ritz et al., 2015](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0146021)) Curve Check exposes its domains and flags boundary solutions instead of treating the edge of a permitted parameter range as a biological measurement.

There is a genuine methodological distinction between fitting individual wells, fitting concentration summaries, and modeling experimental hierarchy: different choices make different use of within-dose and between-run information. ([Assay Guidance Manual](https://www.ncbi.nlm.nih.gov/sites/books/n/assayguide/assayops/), [Tonge, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/), [Tansey et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC9007438/)) This prototype chooses equal-weight means for transparency, not because that choice is optimal for every assay.

## A sigmoid is not a mechanism

### The concentration may not be the free concentration

Under tight binding, free inhibitor differs from total inhibitor and apparent IC50 can depend strongly on enzyme concentration; a simple Hill fit does not repair the violated mass-balance assumption. ([Tonge, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/)) An enzyme-concentration series and an appropriate tight-binding model can be more informative than another fit of the same dilution series. ([Tonge, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/))

The often-quoted half-enzyme-concentration floor belongs to the specified tight-binding inhibition context, not to all cellular IC50 measurements. ([Tonge, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/)) Likewise, Cheng–Prusoff conversion requires a supported inhibition mechanism and the relevant substrate or ligand conditions rather than serving as a general conversion from IC50 to affinity. ([Tonge, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/))

### The readout can have its own dose response

Aggregation, reporter interference, precipitation, coupling-enzyme inhibition and surface adsorption can alter concentration-response measurements without establishing the intended target mechanism. ([Tonge, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/)) Aggregators can produce steep, incomplete or even nonmonotone responses, and a steep Hill slope is suggestive rather than diagnostic of aggregation. ([Auld, Inglese & Dahlin, 2017](https://www.ncbi.nlm.nih.gov/sites/books/NBK442297/))

Detergent sensitivity, enzyme-concentration dependence and particle measurements can be useful discriminating tests, but each requires compatible controls: tight binding can also produce enzyme-concentration dependence, and particle detection alone does not demonstrate the cause of the functional effect. ([Auld, Inglese & Dahlin, 2017](https://www.ncbi.nlm.nih.gov/sites/books/NBK442297/)) The browser therefore labels a rebound as a model-shape problem without assigning it to a hook mechanism, an aggregate or a particular biological pathway.

### Time is part of the quantity

Slow-binding and irreversible inhibition can shift concentration-response measurements with incubation time; for irreversible inhibitors, \(k_{\mathrm{inact}}/K_I\) is a more mechanistically appropriate potency quantity than an unqualified IC50. ([Tonge, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/)) A single endpoint fit cannot establish equilibrium or disentangle reversible binding, accumulation, adaptation and progressive inactivation. ([Tonge, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/))

### Fewer cells does not necessarily mean more killing

Hafner and colleagues showed that conventional endpoint IC50 and maximal-effect measures in dividing cells are confounded by the number of control-cell divisions, and that growth-rate normalization can substantially reduce that confounding. ([Hafner et al., 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC4887336/)) In their illustrative slow-growth setting, a cytostatic response did not reduce final cell number below half the control, leaving the conventional IC50 undefined despite a real growth-inhibitory effect. ([Hafner et al., 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC4887336/))

GR metrics require information about initial cell number or division time and remain conditional on their growth assumptions; they are not a universal correction for every endpoint, rapidly acting cytotoxin or nondividing system. ([Hafner et al., 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC4887336/)) Curve Check does not calculate GR50 from ordinary normalized endpoint data because the required additional measurements are absent.

## Bounds, missing values and alternative summaries

The AGM recommends interpolation and, where appropriate, reporting an out-of-range quantity as less than the smallest or greater than the largest tested concentration rather than silently promoting extrapolation to a measured estimate. ([Assay Guidance Manual](https://www.ncbi.nlm.nih.gov/sites/books/n/assayguide/assayops/)) GraphPad’s partial-response example adds an important qualification: a control-defined 50% crossing can be absent altogether, not merely located beyond the tested range. ([GraphPad](https://www.graphpad.com/guides/prism/latest/curve-fitting/reg_50_of_what__relative_vs_absolu.htm))

Our conservative reporting policy consequently separates the following statements. These are proposed wording templates, not quotations from a guideline.

- **Threshold observed:** “The control-defined 50% response was bracketed between 10 and 30 nM; the locally interpolated crossing was 18 nM.” Add a suitable uncertainty analysis before treating the interpolated point as a fully characterized potency; the tested bracket is not itself a confidence interval.
- **Threshold not observed:** “50% inhibition was not observed through 10 µM under the tested conditions.” This statement does not assert that increasing concentration must eventually produce a finite IC50.
- **Justified right bound:** “IC50 > 10 µM, conditional on a monotone response with a finite 50% crossing and adequate precision over the tested range.” Do not replace this bound with 10 µM for an arithmetic or logarithmic average.
- **Partial efficacy:** “Relative IC50 = 10 nM, with a fitted lower plateau of 65% remaining activity; a control-defined 50% crossing was not observed.” Keep the potency and extent of effect together.
- **Unresolved curve:** “Relative IC50 was not estimable under the prespecified model; fitted candidates were sensitive to plateau constraints.” Do not let a software-generated number outrank this conclusion.
- **Model mismatch:** “The response was nonmonotone over the tested range; a single monotone IC50 was not reported.” Preserve the observations and investigate the turning region.

Responses at specified concentrations, measured maximal effect and AUC can sometimes answer the scientific question more directly than an unstable midpoint, but AUC comparisons depend on the concentration range and do not remove biological or measurement confounding. ([Assay Guidance Manual](https://www.ncbi.nlm.nih.gov/sites/books/n/assayguide/assayops/), [Hafner et al., 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC4887336/)) A change of summary is useful only when its interpretation matches the question, not when it merely makes a difficult dataset yield a scalar.

## From diagnostic to next experiment

The following are proposed experimental priorities synthesized from the cited methodological evidence. They are not automatic instructions from the numerical flags, and their feasibility depends on the assay.

| Diagnostic | What remains unresolved | Most informative follow-up |
|---|---|---|
| Missing low-dose region | Untreated asymptote or left-side transition | Add lower concentrations and genuine untreated controls; preserve zero as zero. ([Ritz et al.](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0146021)) |
| Missing high-dose region | Attainable effect versus delayed transition | Extend concentration only within demonstrated assay and compound compatibility; test efficacy independently. ([Tonge](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/)) |
| Constraint-sensitive midpoint | Unmeasured information dominates the fit | Obtain an independent asymptote or transition measurement rather than selecting the most convenient fit. ([GraphPad](https://www.graphpad.com/guides/prism/latest/curve-fitting/reg_incomplete_dose-respone_curves.htm)) |
| Rebound or steep transition | Mechanism, interference or inadequate concentration resolution | Resample the turning region and use mechanism-relevant counter-screens; slope alone is not diagnosis. ([Auld et al.](https://www.ncbi.nlm.nih.gov/sites/books/NBK442297/)) |
| Plate/run differences | Shared technical effects or true biological variation | Preserve run identity, investigate controls and compare independent runs rather than pooling wells. ([Tansey et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC9007438/)) |
| Time-dependent potency | Equilibrium versus kinetic response | Measure time dependence and choose a supported kinetic analysis when appropriate. ([Tonge](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/)) |
| Viability without initial cell count | Cytostasis, proliferation rate or net death | Measure baseline and time-course cell counts and assess whether GR-type inference is appropriate. ([Hafner et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC4887336/)) |

The practical stopping rule for this installment is modest: do not report a stronger claim than the experiment and its explicitly defended assumptions support. Curve Check is useful when it makes that boundary visible, including when the most informative output is a narrower question for the next experiment.
