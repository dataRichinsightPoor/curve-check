// Exact teaching model; no fitted observations or calibrated inference.
export function response(x, amplitude, midpoint = 10, slope = 1) {
  return 100 - amplitude + amplitude / (1 + (x / midpoint) ** slope);
}
export function relativeInformation(amplitude, noiseSD) {
  if (!Number.isFinite(amplitude) || amplitude < 0 || amplitude > 100 ||
      !Number.isFinite(noiseSD) || noiseSD <= 0) throw Error('Invalid amplitude or noise.');
  // Fixed dose design, midpoint, slope, and known nuisance parameters.
  // Benchmark: amplitude 100, independent well-error SD 20.
  return (amplitude / 100) ** 2 * (20 / noiseSD) ** 2;
}
export function endpoints(amplitude) {
  return {
    midpointResponse: amplitude === 0 ? null : 100 - amplitude / 2,
    absoluteIC50: amplitude > 50 ? 10 * 50 / (amplitude - 50) : null
  };
}
