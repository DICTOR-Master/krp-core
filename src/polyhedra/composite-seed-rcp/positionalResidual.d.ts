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
import type { Vec3 } from '../core.js';
import { type BoundaryClass } from './rcpMap.js';
export interface ClassResidual {
  name: string;
  count: number;
  /** The best-fit intercept d_i, in TRUE Euclidean units (unit n_i), for the FIXED normal n_i -- for a fixed normal, the least-squares-optimal d_i is simply the mean of the projections. */
  dHat: number;
  /** epsilon_pos for this class: max |unit(n_i).c - dHat| over every exposed centroid c in this class. TRUE geometric distance from the best-fit plane, not a raw dot-product residual. */
  epsPos: number;
  /** epsPos < EXACT_TOL -- reported explicitly rather than silently rounded, per the investigation plan's own instruction that 1e-9 is not the same claim as exact equality. */
  exact: boolean;
}
export interface ResolutionResult {
  L: number;
  classes: ClassResidual[];
  maxEpsPos: number;
  allExact: boolean;
}
export declare function positionalResidualAtL(selectFn: (L: number) => Vec3[], classes: BoundaryClass[], L: number): ResolutionResult;
export declare function sweepPositionalResidual(shape: 'cube' | 'oct', maxL: number): ResolutionResult[];
export interface CombinatorialStratum {
  /** n_i . c for the contributing cell's own centre, BEFORE the facet's own centroid offset is added -- the "generation" this stratum belongs to. */
  cellProjection: number;
  /** How many (cell, facet) pairs fall in this stratum. */
  count: number;
  /** n_i . centroid for every pair in this stratum -- checked internally uniform (a bug, not a finding, if not) before being reported as this stratum's own predicted d_i. */
  predictedD: number;
}
export interface CombinatorialAnalysis {
  name: string;
  strata: CombinatorialStratum[];
  /** True iff every stratum's own predictedD agrees -- the hypothesis's own combinatorial exactness claim, checked structurally rather than only via the numeric epsPos above (though for this construction the two necessarily agree exactly, since both are computed from the same centroid set). */
  singleStratum: boolean;
}
export declare function analyzeCombinatorialStrata(selectFn: (L: number) => Vec3[], classes: BoundaryClass[], L: number): CombinatorialAnalysis[];
