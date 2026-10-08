/**
 * Proof-of-concept, not a physical adapter piece: demonstrates the
 * "multiply" direction of RVCMG's reversibility duality by SPLITTING
 * the hex interface UP to a 7-vertex regular heptagon, rather than
 * dividing it down (the 6 adapter pieces in adapters/ all divide).
 * Direct user statement this proves: "you can reduce six points to 3
 * but you can also split it to 12 or any other corner count."
 *
 * One `splitVertex()` call (6 -> 7): splits `v1` into two new corners
 * placed directly at their final positions, while this same step's
 * deformation repositions the other 5 untouched vertices to their own
 * final corners — mirroring pentagonToRdH.ts's own single-step pattern
 * exactly, just in the opposite (multiplying) direction.
 */
import type { RvcmgState } from '../types.js';
export interface SplitDemoResult {
  before: RvcmgState;
  after: RvcmgState;
  problems: string[];
}
export declare function deriveHeptagonBySplitting(): SplitDemoResult;
