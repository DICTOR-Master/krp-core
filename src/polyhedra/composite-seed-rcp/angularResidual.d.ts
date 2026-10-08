/**
 * Composite-Seed RCP investigation, Stage 3 — Proposition P2
 * (microscopic orientational closure): `ε_ang(L) =
 * max_{ν∈N_i} arccos(|ν·n_i| / (|ν||n_i|))` per hypothesis.md §6 and
 * Appendix A item 9, for the cube and octahedron selections.
 *
 * The `|·|` around `ν·n_i` is in the hypothesis's own formula (§6) —
 * taken here exactly as written, not omitted: it identifies a facet
 * normal with its own antipode for this purpose ("the absolute value is
 * appropriate only if the application identifies opposite normals as
 * equivalent" — true here, since a facet's outward-normal SIGN is a
 * bookkeeping artifact of which of two adjacent cells "owns" it, not a
 * property of the underlying mirror direction being measured against).
 */
import type { Vec3 } from '../core.js';
import { type BoundaryClass } from './rcpMap.js';
export interface ClassAngular {
  name: string;
  count: number;
  /** min/max/mean over this class's own facet-normal-to-target-direction angles -- reported as a triple (not collapsed to one number) so a genuinely non-constant class shows up as min!=max, not hidden. */
  minDeg: number;
  maxDeg: number;
  meanDeg: number;
  /** True iff every one of this class's own angles agrees within EXACT_TOL -- the "constant angle" claim, checked, not assumed. */
  constant: boolean;
}
export interface AngularResolutionResult {
  L: number;
  classes: ClassAngular[];
  /** max over every class's own maxDeg -- epsilon_ang(L) as hypothesis.md §6 defines it, aggregated across all of this shape's boundary classes. */
  epsAngDeg: number;
  /** True iff EVERY class at this L is individually constant (see ClassAngular.constant). */
  allConstant: boolean;
}
export declare function angularResidualAtL(selectFn: (L: number) => Vec3[], classes: BoundaryClass[], L: number): AngularResolutionResult;
export declare function sweepAngularResidual(shape: 'cube' | 'oct', maxL: number): AngularResolutionResult[];
/**
 * Closed-form theta values, derived (see angularDerivation.md for the
 * full proof) from the fixed direction-family geometry alone -- NOT
 * fitted from the numeric sweep above. `Math.SQRT1_2` = 1/sqrt(2);
 * `Math.asin(1/Math.sqrt(3))` is the same closed form the hypothesis
 * doc itself reports for the octahedron, re-derived independently here
 * from the actual RD facet-normal / target-direction vectors rather
 * than accepted on the hypothesis doc's word.
 */
export declare const THETA_CUBE_DEG: number;
export declare const THETA_OCT_DEG: number;
