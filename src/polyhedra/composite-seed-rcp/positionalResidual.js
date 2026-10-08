/**
 * Composite-Seed RCP investigation, Stage 2 — Proposition P1
 * (positional composite closure): `ε_pos(L) = max_{c∈C_i} |n_i·c − d_i|`
 * per hypothesis.md §6 and Appendix A items 7–8, for the cube and
 * octahedron selections, plus the combinatorial exactness predicate
 * hypothesis.md §7.1/§8.1 proposes (a discrete boundary-selection rule
 * + a discrete facet-centroid offset should let every exposed centroid
 * in a class inherit a common coordinate) — implemented as a real,
 * checkable function over the aggregate's own combinatorics, not just
 * an empirical near-zero measurement.
 *
 * `n_i` here is the UNIT-normalized boundary-class direction — the
 * hypothesis doc's own `P_i: n_i·x = d_i` is a genuine plane equation,
 * which only measures true Euclidean distance-from-plane when `n_i` is
 * unit length. `rcpMap.ts`'s own `BoundaryClass.direction` is
 * deliberately NOT unit (its raw integer form is what the boundary
 * selection functions and `buildEffectiveSeed`'s violation test need,
 * at the same `L` scale) — this file normalizes only where a genuine
 * geometric distance is being reported, per its own file header
 * warning against silently mixing scales.
 */
import { sCube, sOct, CUBE_BOUNDARY_CLASSES, OCT_BOUNDARY_CLASSES, buildEffectiveSeed } from './rcpMap.js';
import { RD_FACETS } from './lattice.js';
function unitVec(v) {
  const n = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / n, v[1] / n, v[2] / n];
}
function dot3(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}
/** Exact-equality tolerance for floating point, not a "close enough" fudge -- distinguishes real machine-epsilon noise (~1e-15 for these magnitudes) from a genuine nonzero geometric discrepancy (which, if present at all in this construction, is on the order of 1 in raw lattice units, i.e. many orders of magnitude larger than float noise -- never ambiguous at this tolerance). */
const EXACT_TOL = 1e-9;
export function positionalResidualAtL(selectFn, classes, L) {
  const aggregate = selectFn(L);
  const seed = buildEffectiveSeed(aggregate, classes, L);
  const classResults = seed.classes.map((cls) => {
    if (cls.centroids.length === 0) {
      return { name: cls.name, count: 0, dHat: NaN, epsPos: 0, exact: true };
    }
    const n = unitVec(cls.direction);
    const projections = cls.centroids.map((c) => dot3(n, c));
    const dHat = projections.reduce((a, b) => a + b, 0) / projections.length;
    const epsPos = Math.max(...projections.map((p) => Math.abs(p - dHat)));
    return { name: cls.name, count: cls.centroids.length, dHat, epsPos, exact: epsPos < EXACT_TOL };
  });
  const maxEpsPos = Math.max(...classResults.map((c) => c.epsPos));
  return { L, classes: classResults, maxEpsPos, allExact: classResults.every((c) => c.exact) };
}
export function sweepPositionalResidual(shape, maxL) {
  const selectFn = shape === 'cube' ? sCube : sOct;
  const classes = shape === 'cube' ? CUBE_BOUNDARY_CLASSES : OCT_BOUNDARY_CLASSES;
  const results = [];
  for (let L = 1; L <= maxL; L++)
    results.push(positionalResidualAtL(selectFn, classes, L));
  return results;
}
export function analyzeCombinatorialStrata(selectFn, classes, L) {
  const aggregate = selectFn(L);
  const inSet = new Set(aggregate.map((v) => `${v[0]},${v[1]},${v[2]}`));
  const results = [];
  // Re-derives exposure/classification at the (cell, facet) level directly
  // (not via buildEffectiveSeed) so each contribution can be tagged with
  // its OWN base cell's projection -- buildEffectiveSeed already discards
  // that association once it flattens into a single centroid list.
  for (const bc of classes) {
    const n = unitVec(bc.direction);
    const byStratum = new Map();
    for (const c of aggregate) {
      for (const facet of RD_FACETS) {
        const neighbour = [c[0] + facet.centreOffset[0], c[1] + facet.centreOffset[1], c[2] + facet.centreOffset[2]];
        if (inSet.has(`${neighbour[0]},${neighbour[1]},${neighbour[2]}`))
          continue;
        if (dot3(bc.direction, neighbour) <= L + 1e-9)
          continue; // this facet doesn't violate THIS class
        const cellProjection = dot3(bc.direction, c); // raw (non-unit) -- the stratum key, exact integers/half-integers only
        const centroid = [c[0] + facet.centroidOffset[0], c[1] + facet.centroidOffset[1], c[2] + facet.centroidOffset[2]];
        const predictedD = dot3(n, centroid);
        const key = Math.round(cellProjection * 1e6) / 1e6;
        const entry = byStratum.get(key) ?? { count: 0, predictedDs: [] };
        entry.count++;
        entry.predictedDs.push(predictedD);
        byStratum.set(key, entry);
      }
    }
    const strata = [...byStratum.entries()].map(([cellProjection, { count, predictedDs }]) => {
      const d0 = predictedDs[0];
      const uniform = predictedDs.every((d) => Math.abs(d - d0) < EXACT_TOL);
      if (!uniform) {
        throw new Error(`analyzeCombinatorialStrata: stratum at cellProjection=${cellProjection} for class ${bc.name} is not internally uniform -- a real bug, not a finding`);
      }
      return { cellProjection, count, predictedD: d0 };
    });
    const distinctDs = [...new Set(strata.map((s) => Math.round(s.predictedD * 1e9)))];
    results.push({ name: bc.name, strata, singleStratum: distinctDs.length <= 1 });
  }
  return results;
}
