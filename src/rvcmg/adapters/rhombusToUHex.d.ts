/**
 * RVCMG v2 — shared derivation for the rhombus adapter pieces
 * (Golden-Rhombus-to-U-Hex, RD-Native-Rhombus-to-U-Hex): structurally
 * identical, differing only in which Catalan solid's own rhombic face is
 * the target. Mirrors `kiteToRdH.ts`'s own relationship to
 * `diKiteToRdH.ts`/`dhKiteToRdH.ts`.
 *
 * v1's `goldenRhombusToRdH.ts` tie-broke "which hex group gets the long
 * vs short diagonal role" by an existing radius asymmetry: `v1`/`v4`
 * already sat at a different radius from centroid than the merged
 * pairs, on RD's own D2h-asymmetric hex. That signal doesn't exist here
 * — the new universal hex is a PERFECT regular hexagon, so `v1`/`v4`
 * and the two merged-pair midpoints all start at very nearly the same
 * radius (the pair midpoints are slightly closer to centroid than a
 * hexagon's own circumradius, chord-midpoint geometry, but nowhere near
 * the pronounced difference v1 relied on). Uses `fitTargetPolygon`
 * (`./shared.ts`, already generalized for exactly this "which
 * non-interchangeable target corner does each hex group get" problem by
 * the kite pieces) instead: tries all 4 cyclic role assignments, scores
 * each by real 2D squared position error after its own best-fit
 * rotation, and picks the lowest — measured directly, not assumed from
 * a heuristic that no longer applies.
 */
import type { AdapterPieceResult } from './triangleToUHex.js';
export interface RhombusFaceMeasured {
  edge: number;
  /** diagLong / diagShort, measured directly from the registry — never assumed. */
  ratio: number;
}
/**
 * Measures a Catalan solid's own rhombic face directly from the
 * registry (never hand-copied), the same way
 * `goldenRhombusToRdH.ts`'s own `RT_FACE_MEASURED` did.
 */
export declare function measureRhombusFace(catalanId: string): RhombusFaceMeasured;
export interface RhombusPieceOptions {
  catalanId: string;
  pieceName: string;
}
/**
 * Derives a rhombus adapter piece. Same merge pairing as
 * squareToUHex.ts — `(v2,v3)` and `(v5,v6)`, leaving `v1`/`v4`
 * untouched — but which of the 4 hex groups plays which of the
 * rhombus's 2 non-interchangeable roles (long-diagonal corner,
 * short-diagonal corner) is resolved by `fitTargetPolygon`'s measured
 * distortion, not assumed.
 */
export declare function deriveRhombusToUHex({ catalanId, pieceName }: RhombusPieceOptions): AdapterPieceResult;
