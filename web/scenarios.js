// Stylized teaching generators, not diagnostic classifiers or mechanistic fits.
const sigmoid=(x,m=1,h=1.15,b=4)=>b+(100-b)/(1+10**Math.max(-300,Math.min(300,h*(Math.log10(x)-m))));
const make=(id,title,subtitle,lesson,next,fn,extra={})=>({id,title,subtitle,lesson,next,fn,bottom:4,m:1,h:1.15,noise:3,max:4,...extra});
export const EXTRA_CASES=[
  make('reporter','Reporter inhibition','An excellent curve for the wrong protein','The primary signal is deliberately identical to the positive comparator. A good numerical audit cannot identify the inhibited molecular species.','Run a reporter-only counterscreen and an orthogonal assay of the intended biology.',x=>sigmoid(x)),
  make('cell-loss','Loss of reporter-bearing cells','Real biology, misattributed mechanism','Cell loss is biological activity, not necessarily detector interference. Total signal cannot separate fewer cells from less signal per cell.','Measure cell number and per-cell pathway response with an orthogonal viability endpoint.',x=>sigmoid(x)),
  make('solvent','Solvent follows concentration','The vehicle has a dose response too','Here compound dose is perfectly confounded with solvent exposure. The resulting sigmoid can pass every numerical check.','Hold vehicle constant and run a matched vehicle titration.',x=>sigmoid(x)),
  make('position','Plate position follows dose','A smooth spatial confound','A smooth position effect is assigned in dose order. Residuals can be unremarkable when the confound has the fitted shape.','Randomize/interleave concentrations across the plate and retain spatial metadata.',x=>sigmoid(x)),
  make('mislabel','Tenfold concentration error','Precision survives a wrong x-axis','The true concentration is stipulated to be ten times its label. A smooth fit cannot audit stock identity, units or dilution bookkeeping.','Verify stock concentration, dilution records and units independently.',x=>sigmoid(x*10)),
  make('aggregation','Aggregation-like transition','Shape is not an aggregation test','A steep transition is modeled, not a physical aggregation mechanism. Steepness alone cannot diagnose colloids or cooperativity.','Use assay-compatible detergent controls, enzyme-concentration variation and orthogonal interference checks.',x=>sigmoid(x,1,3.5)),
  make('solubility','Exposure meets a solubility ceiling','Nominal dose keeps rising','Effective exposure is capped at 15 nM while nominal concentration rises. A fitted lower plateau can be mistaken for intrinsic partial efficacy.','Measure soluble/free exposure and test compatible formulation changes.',x=>sigmoid(Math.min(x,15))),
  make('clipping','Detector floor and ceiling','Instrument limits impersonate plateaus','Signal is clipped to 15–85%. The clipped sections are not biological asymptotes.','Inspect raw detector values, acquisition limits and dilutional recovery.',x=>Math.max(15,Math.min(85,sigmoid(x)))),
  make('mixture','Two responsive populations','One midpoint hides two transitions','Two equal-weight decreasing responses have midpoints 1 and 100 nM. The fitted single sigmoid is a descriptive compromise.','Resolve populations or design enough dose coverage to test a prespecified mixture model.',x=>(sigmoid(x,0,1.5)+sigmoid(x,2,1.5))/2),
  make('hormesis','Low-dose stimulation','A rise before inhibition','A low-dose stimulatory component precedes inhibition. A monotone decreasing model is deliberately misspecified.','Repeat the rising region and distinguish biology from detector or vehicle effects.',x=>sigmoid(x)+25*Math.exp(-(((Math.log10(x)+.2)/.65)**2))),
  make('increasing','An increasing response','The input direction is wrong for this engine','The engine is intentionally decreasing-only. An increasing activity endpoint requires a correctly defined EC50 model, not relabeling this fit.','Verify endpoint direction and use a suitable increasing-response analysis.',x=>104-sigmoid(x)),
  make('asymmetric','Asymmetric transition','Symmetry is an assumption','The generator raises a logistic denominator to a second power. Its scale parameter is not the half-response concentration.','Compare a justified asymmetric model with sufficient data; define its effective dose explicitly.',x=>4+96/(1+x/10)**2),
  make('sparse','Five concentrations','Replicates cannot fill dose gaps','Only five distinct positive doses are sampled. A curve can look smooth while having little residual information.','Add distinct concentrations around the transition and plateaus.',x=>sigmoid(x),{doses:5}),
  make('tiny','Tiny systematic response','A small effect with a tidy shape','The entire true response is four percentage points. Do not use this series itself to define 0% and 100%.','Compare raw effect magnitude with independent control separation and between-run variability.',x=>96+4/(1+x/10),{noise:.5}),
  make('time','Longer exposure shifts response','An endpoint is not a kinetic constant','A tenfold left shift is stipulated as an exposure-time effect. This is not a kinetic simulation or a Ki estimate.','Measure time courses and progress curves appropriate to the hypothesized mechanism.',x=>sigmoid(x,0)),
  make('drift','Log-dose trend without plateaus','The sigmoid borrows missing curvature','The generator is linear in log concentration over the tested interval, not globally logistic.','Extend safe coverage and compare descriptive alternatives before interpreting asymptotes.',x=>70-12*Math.log10(x)),
  make('batch','A dose-correlated batch step','The preparation changed halfway','A preparation offset is attached to the highest concentrations. Additional wells reproduce the same confounding.','Prepare independent dilution series and interleave batches.',x=>sigmoid(x)+(x>30?18:0)),
  make('upper-missing','The missing upper plateau','Half of which response range?','The true relative midpoint lies near the lower tested limit. High-concentration coverage does not recover the missing untreated-side transition.','Add lower concentrations and independent untreated controls.',x=>sigmoid(x,-1.7))
];
export function normalizeRaw(values,low,high){
  if(!Number.isFinite(low)||!Number.isFinite(high)||high<=low)throw Error('High control must be greater than low control.');
  return values.map(v=>100*(v-low)/(high-low));
}
export function effectDose(m,h,e){
  if(!(h>0&&e>0&&e<1))throw Error('Slope must be positive and effect must lie strictly between 0 and 1.');
  return 10**m*(e/(1-e))**(1/h);
}
export const HYPOTHESES=['Intended pathway effect','Reporter inhibition','Cell loss','Vehicle effect','Plate-position effect'];
// Toy intervention matrix. Each 1 retains the primary sigmoid, each 0 gives a flat 100%.
// These are stipulated perfect interventions, not empirical sensitivity/specificity.
export const INTERVENTIONS=[
  {name:'Primary signal only',mask:[1,1,1,1,1],note:'All five modeled causes are observationally equivalent.'},
  {name:'Reporter-only counterscreen',mask:[0,1,0,0,0],note:'Idealized direct reporter assay. Real counterscreens may have additional interference and can coexist with target activity.'},
  {name:'Orthogonal per-cell pathway readout',mask:[1,0,0,0,0],note:'Assumes the vehicle affects cell number only and surviving cells are unbiased. Those assumptions need experiments in a real assay.'},
  {name:'Independent cell-number endpoint',mask:[0,0,1,1,0],note:'In this toy model, vehicle and cell loss remain indistinguishable.'},
  {name:'Constant vehicle, randomized plate',mask:[1,1,1,0,0],note:'Removes only the stipulated vehicle and position confounds; does not prove target mechanism.'}
];
export function twinResponse(hypothesis,intervention,x){
  return INTERVENTIONS[intervention].mask[hypothesis]?sigmoid(x):100;
}
