# Is It a Curve, and Can We Report the IC50?

Data-Rich, Insight-Poor · No. CCLXVIII  
99 Small Problems · Installment 09

![Cover. Polished certainty suspended above fragile evidence. AI-generated editorial illustration; not a chart or experimental result.](assets/curve-check-cover.webp)

I am looking at a concentration series that barely persuades me it is different from a flat line. The assay has a hundred-unit reference window; the underlying response in this synthetic experiment changes by twenty, while individual wells carry a noise standard deviation of twenty units. The software nevertheless returns a smooth logistic curve and a midpoint. It has done the fitting. Whether we have measured a reportable potency remains somebody else’s problem, unless the workflow has quietly eliminated that somebody.

This is not an argument against automation, or a rule that small responses are invalid. Reduce the noise without changing the effect, and the midpoint becomes easier to locate. Remove the effect entirely, and the optimizer can still return four parameters. The danger is giving those three situations the same well-formatted answer.

I want to separate three questions: whether the observations locate a midpoint, whether the readout measures the intended quantity, and whether the biological interpretation is justified. A fitted curve can answer part of the first while making the other two look settled.

## Twenty out of one hundred is not a signal-to-noise ratio

The central example stipulates a decreasing response from 100 to 80, with relative midpoint 10 nM and slope 1. Thirteen concentrations span 0.01–10,000 nM, with three wells per concentration and eight wells per independent control. Gaussian noise is added to both sample and control wells. These are simulation settings, not universal assay-design recommendations.

Twenty out of one hundred describes the response-window fraction. It says nothing sufficient about noise. The companion tool compares that twenty-point response at well-level noise SDs of twenty and one, then a genuinely flat response at SD twenty. All three use the same random draws, so the comparison changes the stated experimental property rather than selecting more cooperative noise.

The true amplitude, observed response range, and fitted amplitude are also different quantities. In the default noisy realization, the maximum-minus-minimum concentration mean spans approximately 49.8 percentage points after normalization, although the true raw amplitude is twenty. Noise and estimated controls have not discovered greater efficacy. They have changed the observations from which we calculate the range.

![Figure 1. One small response, three evidentiary situations. Original synthetic data: seed 42, thirteen concentrations, three wells per dose, eight wells per control. Blue: normalized wells; dark: dose means; green: free 4PL; purple dashed: known generator transformed using observed controls; gray dashed: constant fit. Noise labels are generating raw-well SDs, not estimated SNRs.](figures/weak-response.svg)

The noisy twenty-point example offers a useful embarrassment. Its logistic candidate reduces RMSE from approximately 12.9 to 8.76 percentage points, but its AICc is about 3.26 higher than the constant model’s. Under this diagnostic, the extra flexibility has not earned its keep.

That comparison uses concentration means, assumes independent Gaussian errors with common unknown variance, and counts variance among the fitted parameters. It omits shared-control uncertainty; the 4PL also hits a numerical boundary. I would not promote its AICc difference into a p-value, an acceptance limit, or evidence that the compound is inactive. Failure to resolve an effect is not evidence that effects large enough to matter have been excluded.

## Fifty percent of what?

A relative logistic midpoint is halfway between fitted asymptotes; an absolute, control-defined IC50 is halfway between independently defined assay references ([Sebaugh, 2011](https://onlinelibrary.wiley.com/doi/pdfdirect/10.1002/pst.426)). Those are different questions, and the decreasing four-parameter model makes the distinction explicit:

\[
y(x)=B+\frac{T-B}{1+(x/C)^h},\qquad y(C)=\frac{T+B}{2}.
\]

Here \(C\) is the relative midpoint, \(T\) and \(B\) are the upper and lower asymptotes, and \(h>0\) is the slope parameter. The concentration producing 50% remaining activity is:

\[
x_{50}=C\left(\frac{T-50}{50-B}\right)^{1/h},\qquad B<50<T.
\]

For the twenty-point response, \(T=100\) and \(B=80\). Its true relative midpoint occurs at 90% remaining activity: ten percentage points of inhibition, not fifty. No finite absolute IC50 exists in that stipulated model. Reducing noise can improve recovery of the relative midpoint; it cannot create a threshold the response never reaches.

![Figure 2. Same midpoint, different inhibition. Both exact generators have C = 10 nM and slope 1. The full response reaches 50% remaining activity at C; the partial response reaches 90% and approaches 80%, never 50%. The reference levels are stipulated independent controls. These are algebraic illustrations, not experimental results.](figures/relative-absolute.svg)

The relative midpoint has not failed because it answers a relative question. The failure would be reporting it as though half the control-defined activity had disappeared. I would report the response magnitude alongside the midpoint, rather than requiring the reader to reverse-engineer efficacy from a potency column.

## The mathematics the smooth line cannot negotiate

Amplitude matters because it determines how much the observations change when the midpoint moves. Write \(A=T-B\), \(q=(x/C)^h\), and \(m=\log_{10}(C/c_0)\), with \(c_0=1\ \mathrm{nM}\). Differentiating gives:

\[
\frac{\partial y}{\partial m}=\ln(10)Ah\frac{q}{(1+q)^2}.
\]

At \(x=C\), sensitivity is \(\ln(10)Ah/4\). A fivefold smaller amplitude produces a fivefold smaller response change for a small shift in log-midpoint, at the same slope and relative dose. At zero amplitude, sensitivity vanishes everywhere: midpoint and slope no longer affect the predicted observations. No extra optimizer iterations can discover parameters that have disappeared from the response function.

For independent Gaussian well errors with known common variance \(\sigma^2\), treating the other curve parameters as known, expected Fisher information for \(m\) is:

\[
\mathcal I_{mm}=\frac{1}{\sigma^2}\sum_i
\left[\ln(10)Ah\frac{q_i}{(1+q_i)^2}\right]^2.
\]

At fixed noise, slope, midpoint, and dose placement, information scales as \(A^2/\sigma^2\). A twenty-unit amplitude therefore carries one twenty-fifth the information of a hundred-unit amplitude. This is an intentionally favorable analytical benchmark, not a confidence interval or the uncertainty calculation used by the tool. Estimating the other parameters introduces further ambiguity.

![Figure 3. Information falls quadratically with amplitude. The original analytical plot shows I(A)/I(100) = (A/100)^2, holding noise, slope, midpoint, and dose design fixed and assuming independent Gaussian errors and known nuisance parameters. At amplitude 20, relative information is 0.04. This is not an empirical acceptance cutoff or power calculation.](figures/information.svg)

Dose placement matters too. The sensitivity factor \(q/(1+q)^2\) peaks at the midpoint and approaches zero at either extreme. Plateau wells inform plateaus; they cannot substitute for observations locating the transition. Sampling only the transition while leaving the plateaus unknown invites a different ambiguity. A design needs to inform the parameters, not merely occupy the plate.

Rescaling cannot manufacture the missing information. Under a fixed affine transformation \(z=a+by\), sensitivity and noise SD are both multiplied in magnitude by \(|b|\), leaving their ratio unchanged. Stretching twenty units across a hundred-unit plot stretches the noise too. If scaling constants are estimated from the same data, they introduce additional uncertainty. A more flattering axis is not a more informative experiment.

The distinction between structural and practical nonidentifiability is useful here: parameters may be inseparable even with ideal observations, or insufficiently resolved by the available data; profile-likelihood methods investigate these problems beyond a local curvature approximation ([Raue et al., 2009](https://academic.oup.com/bioinformatics/article/25/15/1923/213246)). That work concerns partially observed dynamical models, not validation of this IC50 tool, but the warning travels well: completion of a fit does not establish identification.

## A precise answer can still belong to the wrong question

Missing plateaus let slope, midpoint, and asymptotes compensate for one another; constraints can stabilize the estimate by supplying information the dose series did not provide ([La et al., 2023](https://pubs.acs.org/doi/10.1021/acs.jmedchem.3c00107)). Independently supported constraints can be useful, but fixing a partial response to complete inhibition does not demonstrate that the sample can achieve it ([La et al., 2023](https://pubs.acs.org/doi/10.1021/acs.jmedchem.3c00107)). I object to assumptions that enter as settings and leave as findings.

A large R² offers no general rescue: sigmoid-model simulations show that it can discriminate poorly among nonlinear models ([Spiess and Neumeyer, 2010](https://pmc.ncbi.nlm.nih.gov/articles/PMC2892436/)). Nor does a narrow interval automatically capture the relevant uncertainty when controls, normalization, and batch variability are treated inadequately ([Tansey et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC9007438/)). An interval has an address: within one run, under one model, for one defined quantity. It should not acquire broader jurisdiction while being copied into a slide.

The readout can be wrong even when the curve is right. Reporter-enzyme inhibitors can produce reproducible concentration responses and structure–activity relationships, making the reporter rather than the intended biology responsible for an apparently persuasive result ([Auld and Inglese](https://www.ncbi.nlm.nih.gov/sites/books/NBK374281/)). Fitting cannot determine which protein the caption should name.

Nor must every response be monophasic. Di Veroli and colleagues automated comparisons among monophasic and multiphasic candidates, showing how software can examine alternatives rather than enforce one shape; selecting a shape does not establish its molecular mechanism ([Di Veroli et al., 2015](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4589737)). The answer to inadequate automation is not necessarily less automation. It is a better scientific specification.

## When the number becomes a decision

Imagine a chemistry meeting comparing a 6 nM relative midpoint from a noisy partial response with a 30 nM midpoint from a well-characterized near-complete response. Calling the first compound “fivefold better” discards efficacy and uncertainty. The hypothetical ranking could direct synthesis toward a property the experiment did not establish.

Selectivity ratios inherit the same problem. The variance of a difference in log-potencies depends on both variances and their covariance; two printed midpoint estimates do not supply that information. A precise denominator cannot rescue an unresolved numerator, and a bound should not silently become an exact value.

The downstream consequences are not merely hypothetical. Wang and colleagues analyzed 225,384 pharmacological experiments and showed that propagating response uncertainty can change drug-response biomarker prioritization ([Wang et al., 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7746236/)). Their work does not turn statistical prioritization into clinical validation; it demonstrates that uncertainty can change which biological associations deserve attention ([Wang et al., 2020](https://pmc.ncbi.nlm.nih.gov/articles/PMC7746236/)).

Even a well-estimated endpoint can mislead. Hafner and colleagues demonstrated that division rate and assay duration can confound conventional drug-response metrics, motivating growth-rate corrections that require the relevant growth measurements and retain biological limitations ([Hafner et al., 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC4887336/)). A good fit to the wrong summary can support the wrong ranking.

Now let an unresolved midpoint become an exact potency, then a selectivity ratio, then a training label. The later pipeline can be impeccably reproducible while reproducing the original category error. The decimal places have acquired seniority, not evidence.

## Standards require a purpose, not a photogenic sigmoid

ICH Q2(R2) recognizes nonlinear models, including four- and five-parameter logistic functions, and links reportable range to suitable analytical performance, including accuracy and precision, rather than merely the concentrations dispensed ([ICH Q2(R2)](https://database.ich.org/sites/default/files/ICH_Q2(R2)_Guideline_2023_1130_ErrorCorrection_2025.pdf)). Its scope principally concerns analytical procedures for release and stability testing, with broader risk-based applications; resembling an annex example does not validate a discovery screen ([ICH Q2(R2)](https://database.ich.org/sites/default/files/ICH_Q2(R2)_Guideline_2023_1130_ErrorCorrection_2025.pdf)).

ICH Q14 distinguishes system suitability from sample suitability, and its illustrative bioassay criteria, including R² and parameter-ratio checks, are product-specific examples rather than universal acceptance limits ([ICH Q14](https://database.ich.org/sites/default/files/ICH_Q14_Guideline_2023_1130_ErrorCorrection_2025.pdf)). Passing controls does not settle whether a particular sample supports the intended potency interpretation.

The BioPhorum white paper offers practical recommendations on concentration placement, individual-point fitting, and curve similarity before relative-potency estimation; these industry recommendations are not interchangeable with regulatory requirements ([White et al., 2019](https://www.tandfonline.com/doi/full/10.2144/btn-2019-0031)). Two successful fits need not support one common horizontal shift when their shapes differ ([White et al., 2019](https://www.tandfonline.com/doi/full/10.2144/btn-2019-0031)). Standards help when we retain the purpose and qualifications, not just the convenient number.

## What I would report

For the noisy twenty-point example, I would preserve the approximately 6.17 nM result as an unresolved relative-midpoint candidate, not export it into an unqualified IC50 column. Its observations, flat comparator, boundary warning, and absent control-defined 50% crossing belong beside it. The true 10 nM midpoint belongs to the simulation description. Knowing it because I wrote the generator does not mean this realization measured it.

For the precise twenty-point example, the improvement is a better-supported relative midpoint of a partial response, not an upgrade to complete inhibition. For the flat generator, no underlying midpoint exists. With experimental data, I do not know the generator; I must keep “unresolved” distinct from “inactive.”

“50% inhibition was not observed through 10 µM” preserves an observational statement. “IC50 > 10 µM” additionally invokes a threshold interpretation requiring justification. A plateau above 50% may instead mean no finite absolute IC50 exists in the model. An extrapolated point estimate should not quietly replace either qualification.

Curve Check keeps raw wells, independent controls, transformations, fitted candidates, and missing evidence in one reconstructable record. Its numerical model remains deliberately limited: decreasing logistic responses, equal-weight concentration means, bounded parameters, and an approximate Gaussian profile likelihood that does not propagate shared-control or between-run uncertainty. It is a teaching and audit prototype, not a validated assay-analysis system.

For a production workflow, I would define the endpoint before fitting, justify constraints, retain raw observations, and specify what happens to partial, unresolved, nonmonotone, and unsupported responses. Withholding a number should preserve the reason and the next measurement needed, not create an empty cell to be filled by extrapolation. Automating calculations is sensible. Automating permission to stop asking what they mean is a different specification.

The curve is welcome to look elegant. I would just like to know what went into it before it is served as evidence.

## Try the argument, inspect the code

The [interactive Curve Check workbench](https://dataRichinsightPoor.github.io/curve-check/) lets you compare noisy, precise, and flat responses; inspect raw wells and control normalization; test alternative fitting constraints; and export the observations with their qualifications. The [interactive article](https://dataRichinsightPoor.github.io/curve-check/article.html) adds a small amplitude-and-noise experiment alongside the mathematics. Neither interface certifies assay validity.

The code is open under the [MIT License](https://github.com/dataRichinsightPoor/curve-check/blob/main/LICENSE). Start with the [fitting engine](https://github.com/dataRichinsightPoor/curve-check/blob/main/web/engine.js), [source-reconstruction logic](https://github.com/dataRichinsightPoor/curve-check/blob/main/web/source-engine.js), [interactive information model](https://github.com/dataRichinsightPoor/curve-check/blob/main/web/article-model.js), and [tests](https://github.com/dataRichinsightPoor/curve-check/tree/main/tests). The useful invitation is not “trust my curve.” It is “inspect what the calculation assumes.”

## References and reading notes

Research papers, methodological work, guidance, and industry recommendations are distinguished below. The equations and figures are original analytical or synthetic illustrations, not reproduced experimental findings.

### Research and methods

1. Sebaugh JL. Guidelines for accurate EC50/IC50 estimation. Pharmaceutical Statistics. 2011;10:128–134. Definitions and recommendations were verified in the accessible abstract, not the full text. [Publisher record](https://onlinelibrary.wiley.com/doi/pdfdirect/10.1002/pst.426).

2. Raue A, et al. Structural and practical identifiability analysis of partially observed dynamical models by exploiting the profile likelihood. Bioinformatics. 2009;25:1923–1929. General methodology, not direct IC50-tool validation. [Full paper](https://academic.oup.com/bioinformatics/article/25/15/1923/213246).

3. La VNT, et al. Inclusion of Control Data in Fits to Concentration–Response Curves Improves Estimates of Half-Maximal Concentrations. Journal of Medicinal Chemistry. 2023;66:12751–12761. [Full paper](https://pubs.acs.org/doi/10.1021/acs.jmedchem.3c00107).

4. Spiess AN, Neumeyer N. An evaluation of R² as an inadequate measure for nonlinear models in pharmacological and biochemical research: a Monte Carlo approach. BMC Pharmacology. 2010;10:6. [Full paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC2892436/).

5. Tansey W, et al. Dose–response modeling in high-throughput cancer drug screenings: an end-to-end approach. Biostatistics. 23(2):643–665; published online 2021. [Full paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC9007438/).

6. Di Veroli GY, et al. An automated fitting procedure and software for dose-response curves with multiphasic features. Scientific Reports. 2015;5:14701. [Full paper](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4589737).

7. Wang D, et al. A statistical framework for assessing pharmacological responses and biomarkers using uncertainty estimates. eLife. 2020;9:e60352. [Full paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC7746236/).

8. Hafner M, et al. Growth rate inhibition metrics correct for confounders in measuring sensitivity to cancer drugs. Nature Methods. 2016;13:521–527. [Full paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC4887336/).

### Assay guidance and industry recommendations

9. Auld DS, Inglese J. Interferences with Luciferase Reporter Enzymes. Assay Guidance Manual. 2016; updated July 1, 2018. [Full chapter](https://www.ncbi.nlm.nih.gov/sites/books/NBK374281/).

10. White JR, et al. Best Practices in Bioassay Development to Support Registration of Biopharmaceuticals. BioTechniques. 2019;67:126–137. BioPhorum industry white paper, not a universal regulatory specification. [Full paper](https://www.tandfonline.com/doi/full/10.2144/btn-2019-0031).

### Official guidance

11. ICH. Q2(R2): Validation of Analytical Procedures. Adopted November 1, 2023; corrected text April 4, 2025. [Official guideline](https://database.ich.org/sites/default/files/ICH_Q2(R2)_Guideline_2023_1130_ErrorCorrection_2025.pdf).

12. ICH. Q14: Analytical Procedure Development. Adopted November 1, 2023; corrected text April 4, 2025. Annex examples are illustrative, not universal acceptance criteria. [Official guideline](https://database.ich.org/sites/default/files/ICH_Q14_Guideline_2023_1130_ErrorCorrection_2025.pdf).
