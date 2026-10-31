# Is It a Curve, and Can We Report the IC50?

## The curve looks convincing

Data-Rich, Insight-Poor · 99 Small Problems, installment 09. Companion to Curve Check v0.2.0 · October 31, 2026.

I am less worried about the curve that looks suspicious than the one that behaves beautifully for the wrong reason. A compound can inhibit the reporter used to measure a biological process and produce a reproducible concentration response, complete with the pharmacological manners we tend to find reassuring: potency, concentration dependence, and structure–activity relationships ([Auld and Inglese, Assay Guidance Manual](https://www.ncbi.nlm.nih.gov/sites/books/NBK374281/)). The fitting algorithm may be entirely correct about that response. The trouble begins when the protein being inhibited is quietly replaced by the protein we hoped to study.

This is the distinction I want to keep visible whenever somebody asks whether we can report an IC50. There is the numerical question of whether a midpoint is located, the analytical question of whether the signal measures the intended quantity, and the biological question of what caused that quantity to change. I regard those as separate obligations. A polished figure can make their boundaries harder to see without supplying any of the missing evidence.

The useful question is therefore larger than “is this a curve?” Sometimes there is no resolvable transition, sometimes there is a transition without an identifiable midpoint, and sometimes the midpoint is remarkably precise for an effect that has been assigned to the wrong mechanism. The practical objective is to identify which problem we have before deciding what the number deserves to be called.

## Fifty percent of what?

The relative midpoint of a four-parameter logistic model is halfway between its fitted upper and lower asymptotes, whereas an absolute, control-defined IC50 refers to a response halfway between independently defined assay controls; those quantities need not coincide ([Sebaugh, 2011](https://onlinelibrary.wiley.com/doi/pdfdirect/10.1002/pst.426)). A partial response can therefore have a well-defined relative midpoint while never reaching the absolute 50% threshold ([GraphPad, relative versus absolute IC50](https://www.graphpad.com/guides/prism/latest/curve-fitting/reg_50_of_what__relative_vs_absolu.htm)). Calling both quantities “IC50” without stating the reference imports an ambiguity directly into the result.

For the decreasing model used in this workbench, the mathematics is:

```text
y(x) = B + (T − B) / [1 + (x/C)^h]

y(C) = (T + B)/2

x50 = C [(T − 50)/(50 − B)]^(1/h), provided B < 50 < T.
```

Here C is the relative midpoint, B and T are the asymptotes, and h is the positive slope parameter. These equations also show why the distinction matters without requiring any biological speculation. In an illustrative curve with T = 100 and B = 65, the relative midpoint occurs at 82.5% remaining activity, corresponding to only 17.5 percentage points of inhibition from the upper plateau. There is no finite absolute IC50 in that stipulated model.

The midpoint has not failed because it answers a relative question. The failure would be reporting it as though half of the control-defined activity had disappeared. I would report the response range and the midpoint together, so that the reader is not required to reverse-engineer efficacy from a potency column.

## Convergence is an event in the optimizer

A completed nonlinear fit establishes that a numerical procedure has found a solution under its objective function, constraints, and search strategy. It does not establish that the observations contain enough information to estimate every parameter, a difficulty particularly apparent when a dose series does not define both plateaus ([GraphPad, incomplete dose-response curves](https://www.graphpad.com/guides/prism/latest/curve-fitting/reg_incomplete_dose-respone_curves.htm)). A software message can be accurate about computation while being silent about the experiment.

The missing-plateau problem is a particularly efficient producer of impressive-looking numbers. If only the beginning of inhibition has been sampled, a lower plateau, slope, and midpoint can compensate for one another over the observed range; imposing an asymptote removes part of that ambiguity by assumption rather than by collecting new compound-response information ([La et al., 2023](https://pubs.acs.org/doi/10.1021/acs.jmedchem.3c00107)). The estimated midpoint may become more stable because the model is now more specific. Whether it has become more defensible depends on the independent evidence for the constraint.

I do not object to constrained models. I object to constraints that enter as convenient settings and leave as experimental findings. If background is independently characterized, a justified fixed background can be useful; if the sample is genuinely a partial inhibitor, fixing its lower plateau to complete inhibition changes the scientific question rather than resolving it ([Tonge, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/); [La et al., 2023](https://pubs.acs.org/doi/10.1021/acs.jmedchem.3c00107)).

A related trap is to read a large R² as a general certificate for nonlinear modeling. Its limitations for selecting and evaluating nonlinear models have been demonstrated explicitly; a high value does not establish parameter identification or the correct response-generating mechanism ([Spiess and Neumeyer, 2010](https://pmc.ncbi.nlm.nih.gov/articles/PMC2892436/)). That is not a reason to pretend R² can never appear in a legitimate procedure: ICH Q14 includes an R² criterion in a specific illustrative bioassay example, alongside other suitability requirements ([ICH Q14](https://database.ich.org/sites/default/files/ICH_Q14_Guideline_2023_1130_ErrorCorrection_2025.pdf)). The problem is promoting one descriptive statistic to a job description it cannot fulfill.

## Uncertainty has an address

I want uncertainty to be attached to the quantity being reported and to the experiment that generated it. A confidence interval for a relative logistic midpoint is not automatically an interval for a control-defined threshold, and uncertainty within one run is not automatically uncertainty across independent experiments. Those distinctions become especially important when normalization, batch effects, and shared controls introduce dependencies among observations ([Tansey et al., end-to-end dose-response modeling](https://pmc.ncbi.nlm.nih.gov/articles/PMC9007438/)).

Curve Check profiles the relative midpoint: it fixes a candidate midpoint, reoptimizes the nuisance parameters, and compares the residual objective with its minimum. Profile-likelihood approaches are useful precisely because they explore the uncertainty landscape beyond a local symmetric approximation, although their validity still depends on the model and likelihood assumptions ([Ren and Xia, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6347253/)). In this implementation, the likelihood treats concentration means as independent Gaussian observations with common unknown variance, and the nominal 95% cutoff is an asymptotic approximation.

An interval that stays open at a computational boundary is not repaired by printing that boundary as a finite confidence limit. A very narrow interval can also be misleading if its likelihood ignores the dominant source of variation. The tool accordingly exposes open or disconnected profile regions and states that it does not propagate control uncertainty or between-run variability.

Technical replication and concentration placement answer different questions. Additional wells can improve information about repeatability at an existing dose, whereas a steep transition lying between widely separated doses calls for better concentration placement; published bioassay-development recommendations explicitly distribute observations across the asymptotes and transition rather than treating total well count as the design ([White et al., 2019](https://www.tandfonline.com/doi/full/10.2144/btn-2019-0031)). Repeating the same underinformative design very carefully can leave the important ambiguity intact.

## Normalization can spend evidence that was never collected

For independent low and high controls L and H, a common affine normalization is:

```text
normalized response = 100 × (raw signal − L)/(H − L)
```

The denominator is part of the measurement, not a cosmetic choice. Methods that incorporate curve observations and control observations jointly can explicitly account for information that is otherwise compressed into normalization constants ([La et al., 2023](https://pubs.acs.org/doi/10.1021/acs.jmedchem.3c00107)). Shared estimated controls also create a dependence structure that a simple independent-error fit to normalized values does not automatically retain ([Tansey et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC9007438/)).

The normalization laboratory uses an intentionally modest example: a synthetic raw response moves from approximately 100 to 96 units. With independent controls of 0 and 100, it remains a small effect. If its own maximum is declared 100% and its own minimum 0%, the same observations now span the entire display. Nothing about the experiment has improved; the axis has become extremely accommodating.

There is an important mathematical qualification. A positive affine transformation preserves the relative midpoint and slope of an exactly transformed, unconstrained logistic model while changing its asymptotes. A fixed numerical threshold such as 50% does not enjoy that invariance unless its reference is transformed consistently. Fixed plateaus, parameter bounds, altered weights, and noisy data can also prevent a practical fitting implementation from inheriting the exact algebraic invariance.

Jointly fitting controls is not equivalent to declaring their sample means error-free. La and colleagues’ 4PL+C procedure fitted curve and control observations with separate variance components, improving parameter precision in simulations and often reducing estimated asymptotic standard errors in COVID Moonshot inhibition data ([La et al., 2023](https://pubs.acs.org/doi/10.1021/acs.jmedchem.3c00107)). Their repeated-experiment comparison did not show a statistically significant difference in the standard deviations of pIC50 and Hill-slope estimates, which limits the stronger claim that the method had demonstrated superior reproducibility for those quantities ([La et al., 2023](https://pubs.acs.org/doi/10.1021/acs.jmedchem.3c00107)). Curve Check does not implement 4PL+C, and its control checkbox is a declaration, not a substitute for that analysis.

## A real sigmoid can be a pseudo-curve for the claim

I use “pseudo-curve” cautiously. A reporter inhibitor can produce a genuine concentration-dependent biochemical effect; the false part is its attribution to the intended target, not necessarily the measurements or the fitted line. The Assay Guidance Manual describes direct reporter inhibition and more complicated behavior, including cellular firefly-luciferase stabilization that can generate increased detected signal under particular assay conditions ([Auld and Inglese](https://www.ncbi.nlm.nih.gov/sites/books/NBK374281/)).

Cytotoxicity deserves a separate category. Loss of cells or generalized effects on transcription can change a reporter assay through real biology rather than direct interference with detection chemistry ([Auld and Inglese](https://www.ncbi.nlm.nih.gov/sites/books/NBK374281/)). Calling every unwanted response an “artifact” can obscure the distinction between an instrument reporting incorrectly and an instrument correctly reporting an effect that does not support the intended mechanism.

The false-curve laboratory makes the identifiability problem explicit. I assigned the same primary response function to five hypothetical causes: intended pathway activity, reporter inhibition, cell loss, vehicle effects, and plate-position effects. With the same sampling and noise realization, the primary observations are identical. Their residuals, midpoint estimates, and likelihood profiles therefore cannot distinguish those labels. This is a property of the constructed example, not a claim that these five mechanisms always generate identical curves in experiments.

Changing the experiment can break that equivalence. Reporter counterscreens and orthogonal assays are established approaches, but a counterscreen hit does not exclude simultaneous activity at the intended target, and an orthogonal positive result does not establish a unique molecular mechanism ([Auld and Inglese](https://www.ncbi.nlm.nih.gov/sites/books/NBK374281/)). The tool therefore labels each intervention as an idealized assumption and shows cases where ambiguity remains, rather than pretending to calculate a probability that an uploaded curve is fraudulent.

## When controls pass and the plate does not

Plate-level control quality cannot be assumed to summarize every treated well. Ianevski and colleagues developed normalized residual fit error using dose-response residual information to identify screening-quality problems that conventional control-based metrics can miss, including spatially localized errors ([Ianevski et al., 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12570324/)). Their study also acknowledges that biologically genuine nonsigmoidal responses can be treated as problematic by a sigmoid-based quality measure ([Ianevski et al., 2025](https://pmc.ncbi.nlm.nih.gov/articles/PMC12570324/)).

There is a further limit that follows from the toy example rather than from a new empirical result. If plate position is perfectly aligned with concentration and the positional effect happens to resemble the fitted response, residual diagnostics have no unique signature to exploit. Randomizing or interleaving concentration placement addresses a design vulnerability that another decimal place in the fit cannot address. Bioassay-development recommendations accordingly discuss randomization and systematic positional effects as part of assay design ([White et al., 2019](https://www.tandfonline.com/doi/full/10.2144/btn-2019-0031)).

This is why I prefer to retain plate position, acquisition order, preparation batch, and dilution identity before the data are reduced to two columns. The current CSV interface cannot audit information it never receives. It can ask a useful numerical question about a dose series; it cannot reconstruct the experimental genealogy of each well.

## Shapes that deserve a different question

An upward response, a rebound, two separated transitions, or systematic asymmetry may require a different model family or a different endpoint definition rather than another attempt to optimize a decreasing symmetric sigmoid ([Ritz et al., 2015](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0146021)). More flexible dose-response models are available, but their additional parameters must be supported by the design and interpreted according to their actual parameterization ([Ritz et al., 2015](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0146021)). In an asymmetric model, a parameter named “location” should not be assumed to equal the concentration at half-response without checking the equation.

The expanded workbench supplies stylized examples of these shapes alongside detector clipping, solubility-limited exposure, a dose-correlated preparation step, and a concentration-label error. These are constructed counterexamples, not a catalog of uniquely diagnostic signatures. In particular, a plateau caused by clipping or capped exposure should not be interpreted as a demonstrated biological maximum simply because the logistic model has a parameter ready to receive it.

Hill slopes also deserve restraint. Tonge discusses cooperativity, aggregation, and tight binding among explanations for deviations from a simple unit-slope response, so a steep fitted slope does not uniquely identify any one of them ([Tonge, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/)). Aggregation requires appropriate interference investigations rather than a verdict based on curve shape alone ([Assay Guidance Manual, aggregation](https://www.ncbi.nlm.nih.gov/sites/books/NBK442297/)). A slope is a summary of the response under a model; assigning a molecular story to it requires additional evidence.

Influential points create a different temptation. Leave-one-dose-out analysis can reveal how much an estimate depends on one concentration group, but the resulting change is a sensitivity result, not an uncertainty interval or a license to remove the inconvenient group. Published bioassay guidance emphasizes objective, consistently applied outlier procedures rather than visual deletion alone ([White et al., 2019](https://www.tandfonline.com/doi/full/10.2144/btn-2019-0031)). I would rather carry an unresolved preparation problem into the next experiment than remove it from the current one by improving the graph.

## IC50 belongs to an assay condition

Even when the intended target is involved, an IC50 need not be an affinity constant. Substrate concentration, inhibition mechanism, enzyme concentration, and inhibitor depletion affect how an inhibitory response relates to Ki; Cheng–Prusoff conversion requires the relevant assumptions and quantities rather than a generic post-fit calculation ([Tonge, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/)). Under tight-binding conditions, free inhibitor can differ materially from added inhibitor, requiring a depletion-aware treatment such as the Morrison equation ([Tonge, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/)).

Exposure time is equally capable of moving a persuasive curve. Slow binding, reversibility, and irreversible inhibition require appropriate kinetic experiments, and an endpoint IC50 does not replace parameters such as kinact/KI when characterizing irreversible inhibition ([Tonge, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6570549/)). The workbench’s time-shift example is deliberately only a stipulated shift; it is not a kinetic simulator and does not estimate those constants.

In proliferating cells, conventional endpoint drug-response metrics can also depend on division rate and assay duration, motivating growth-rate-normalized measures that use the necessary growth information ([Hafner et al., 2016](https://pmc.ncbi.nlm.nih.gov/articles/PMC4887336/)). This does not make every viability result invalid. It means that decreased final signal, slowed accumulation, cell death, and direct pathway inhibition are not interchangeable claims.

## A ratio of midpoints can conceal a failed comparison

For relative-potency bioassays, the question is often whether a test material behaves like a reference after a horizontal concentration shift. White and colleagues emphasize sufficient similarity of the response curves, including slope and asymptotes, before treating an ED50 ratio as relative potency ([White et al., 2019](https://www.tandfonline.com/doi/full/10.2144/btn-2019-0031)). Two independently successful fits are not enough if they describe different-shaped responses.

The relative-potency laboratory isolates this problem with exact synthetic arithmetic. A reference has midpoint 10 nM and slope 1; a test has midpoint 20 nM. With test slope 1, its required dose is twice the reference dose at every matched fractional inhibition. With test slope 0.5, the test/reference dose ratio is 0.5 at 20% inhibition, 2 at 50%, and 8 at 80%. The midpoint ratio remains impeccably stable while the claim of one common horizontal shift has disappeared.

Those displayed ratios are test dose divided by reference dose, not the reciprocal convention often used to express relative potency as a percentage. The module is an algebraic illustration, not a formal equivalence test or a validated bioassay analysis. It deliberately does not assign a universal parallelism acceptance interval.

## What published standards actually ask

Standards are most useful when their scope survives quotation. ICH Q2(R2), adopted November 1, 2023 and subsequently corrected, addresses validation of analytical procedures, principally for release and stability testing, with broader risk-based and phase-appropriate applications described in its scope ([ICH Q2(R2)](https://database.ich.org/sites/default/files/ICH_Q2(R2)_Guideline_2023_1130_ErrorCorrection_2025.pdf)). It recognizes nonlinear response models including four- and five-parameter logistic functions; it does not require biological concentration responses to become straight lines in order to be valid ([ICH Q2(R2)](https://database.ich.org/sites/default/files/ICH_Q2(R2)_Guideline_2023_1130_ErrorCorrection_2025.pdf)).

Its reportable range is the range of results supported by suitable analytical performance, including accuracy and precision, rather than merely the concentrations that happened to be dispensed ([ICH Q2(R2)](https://database.ich.org/sites/default/files/ICH_Q2(R2)_Guideline_2023_1130_ErrorCorrection_2025.pdf)). The biological-assay examples in its annex are illustrative, not universally mandatory designs; numbers such as replicate counts and levels should not be detached from that qualification ([ICH Q2(R2)](https://database.ich.org/sites/default/files/ICH_Q2(R2)_Guideline_2023_1130_ErrorCorrection_2025.pdf)). A discovery screening curve does not become validated simply because it resembles an annex example.

ICH Q14 places intended purpose and anticipated performance in a prospective analytical target profile and distinguishes system suitability from sample suitability ([ICH Q14](https://database.ich.org/sites/default/files/ICH_Q14_Guideline_2023_1130_ErrorCorrection_2025.pdf)). Its illustrative anti-TNF bioassay includes curve and control checks as well as similarity considerations; the particular R² and parameter-ratio criteria are explicitly examples that can differ between products ([ICH Q14](https://database.ich.org/sites/default/files/ICH_Q14_Guideline_2023_1130_ErrorCorrection_2025.pdf)). Passing system controls is therefore not a universal answer to whether a particular sample is suitable for the intended relative-potency interpretation.

Published methodological recommendations add practical design guidance without becoming interchangeable with regulatory requirements. Sebaugh recommends at least two concentrations beyond each bend point for relative midpoint estimation and at least two concentrations with predicted responses on each side of 50% for absolute estimation ([Sebaugh, 2011](https://onlinelibrary.wiley.com/doi/pdfdirect/10.1002/pst.426)). The BioPhorum white paper recommends a minimum of eight concentrations to define a 4PL curve, with placement across the asymptotes and transition; it also recommends fitting individual concentration-point values rather than averaging replicates ([White et al., 2019](https://www.tandfonline.com/doi/full/10.2144/btn-2019-0031)). These are contextual recommendations, not evidence that any eight arbitrary concentrations establish a reportable IC50.

USP language requires the same care. The accessible introduction to chapter <1034> describes analysis of biological assays and relative-potency estimation, but an accessible preview is not verification of the complete current official chapter ([USP <1034> preview](https://doi.usp.org/USPNF/USPNF_M5677_02_01.html)). The separately accessible 2024 revision page is a proposal, while USP identifies official status through USP-NF and explains that general chapters numbered 1000–1999 are informational rather than automatically mandatory ([USP proposal preview](https://doi.usp.org/USPNF/USPNF_M5677_20101_01.html); [USP, identifying official text](https://www.usp.org/frequently-asked-questions/identifying-official-text)). I have not treated either preview as a verified current implementation specification.

## What I would report, and what I would withhold

If a control-defined threshold is bracketed by observations and the assay-specific evidence supports interpretation, I would name the endpoint, exposure, reference controls, units, model, constraints, and uncertainty method. If only a relative midpoint is supported, I would call it relative and report the attainable response alongside it. If 50% inhibition is not observed, I would say so before deciding whether a conditional bound is justified; a response plateau above 50% may imply that no finite absolute IC50 exists in the chosen model ([GraphPad, midpoint definitions](https://www.graphpad.com/guides/prism/latest/curve-fitting/reg_50_of_what__relative_vs_absolu.htm)).

“50% inhibition was not observed through 10 µM” leaves the observational claim intact. “IC50 > 10 µM” additionally implies a threshold interpretation whose monotonicity, controls, exposure, and precision need justification. Replacing either statement with a fitted point estimate beyond the experiment quietly exchanges a limitation for an extrapolation.

A local interpolation between adjacent concentration means can describe a measured threshold bracket without pretending that the bracket is a confidence interval. For multiple crossings, strong nonmonotonicity, uncertain references, or unresolved asymptotes, I would withhold a single unconditional potency claim. The useful result can be a bounded description of the response and the next measurement needed to resolve it.

## What Curve Check does, and deliberately does not do

Curve Check v0.2.0 supplies 28 seeded synthetic scenarios, four fitting assumptions, a relative-midpoint profile, residual plots, dose-omission sensitivity, local CSV input, and reproducible session exports. Its added laboratories isolate observational equivalence, normalization-induced amplitude, and effect-dependent dose ratios. All synthetic causes are assigned by the generators; none is inferred as a diagnosis of uploaded data.

The numerical engine remains intentionally narrow: decreasing logistic responses, equal-weight concentration means, bounded parameters, and an approximate common-variance Gaussian profile likelihood. It does not implement a full raw-well/control likelihood, increasing-response fitting, 5PL inference, mixture identification, hierarchical run effects, calibrated small-sample coverage, formal parallelism equivalence testing, or a mechanistic model of aggregation, depletion, cell growth, or time-dependent inhibition. Its use of concentration means also differs from the individual-point recommendation in the BioPhorum white paper ([White et al., 2019](https://www.tandfonline.com/doi/full/10.2144/btn-2019-0031)).

The seven-dose minimum and other numerical flag thresholds are original teaching choices retained from the first version, not Sebaugh criteria, ICH requirements, or USP acceptance rules. Numerical agreement with an independent optimizer tests implementation, not biological validity. No finite catalog covers every possible assay failure, and I would be especially suspicious of a tool that claimed to have eliminated the need to examine how the experiment was conducted.

My preferred outcome is not a greater number of reportable IC50s. It is a clearer distinction between an estimate the observations locate, an estimate the assumptions stabilize, and an interpretation that still needs an experiment. The curve is welcome to look elegant. I would just like the evidence to arrive before the caption.
