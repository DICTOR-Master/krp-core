/**
 * Shared derivation for the two kite adapter pieces (DI-kite-to-RD-H,
 * DH-kite-to-RD-H) — structurally identical, differing only in which
 * Catalan solid's own face geometry is the target. Factored out rather
 * than duplicated, matching triangleToRdH.ts/squareToRdH.ts's own
 * relationship to shared.ts.
 *
 * The first pieces with NO central symmetry to exploit: a kite has only
 * a single mirror axis (through the two corners where its two distinct
 * edge lengths meet), not the `v4 == -v1` point symmetry every prior
 * piece (square, pentagon, golden-rhombus) relied on. This is also the
 * first target polygon whose 4 corners are genuinely NOT
 * interchangeable (different radii from centroid, non-uniform angular
 * spacing) — `assignTargetAngles` assumes a uniform-radius, evenly-
 * spaced target and can't place these corners correctly;
 * `fitTargetPolygon` (shared.ts) generalizes it for exactly this case.
 */
import type { AdapterPieceResult } from './triangleToRdH.js';
export interface KiteFaceMeasured {
  /** The two distinct edge lengths (a kite is NOT equilateral, unlike every prior target). */
  edgeShort: number;
  edgeLong: number;
  /** The 4 corners' own (radius, angle) in the face's own planar frame — corner 0 is where the two SHORT edges meet, corner 2 where the two LONG edges meet, matching real winding order. */
  corners: {
    r: number;
    theta: number;
  }[];
}
/**
 * Measures a Catalan solid's own kite face directly from the registry
 * (never hand-copied): edge lengths, and each corner's own polar
 * position in the face's own planar frame (`u` toward corner 0,
 * `w = normal x u`).
 */
export declare function measureKiteFace(catalanId: string): KiteFaceMeasured;
export interface KitePieceOptions {
  catalanId: string;
  pieceName: string;
}
/**
 * Derives a kite adapter piece. Same merge pairing as squareToRdH.ts/
 * goldenRhombusToRdH.ts — `(v2,v3)` and `(v5,v6)`, leaving `v1`/`v4`
 * untouched — but which of the 4 hex groups plays which of the kite's
 * 4 (non-interchangeable) corner roles is now a real choice
 * `fitTargetPolygon` resolves by least total distortion, not assumed
 * from symmetry the way the rhombus piece's role assignment was.
 *
 * Scale: NOT rescaled at all -- uses `measured`'s own real, current
 * radii directly. An earlier version rescaled so the kite's own short
 * edge was exactly 1 (matching the "shared unit-edge convention" every
 * non-Catalan piece uses); a real bug, caught computationally
 * (2026-09-15) the same way goldenRhombusToRdH.ts's own EDGE=1 bug was:
 * direct `facesCongruent` testing against the live registry found zero
 * matches, because DELTOIDAL_ICOSITETRAHEDRON/HEXECONTAHEDRON are
 * Catalan solids (circumradius-1 normalized, not unit-edge --
 * `docs/catalan-solids-spec.md`), so a short-edge-1 kite is the wrong
 * absolute size to ever match either one. Fixed by keeping `measured`'s
 * own real scale untouched -- an adapter piece's target face must match
 * its target shape's CURRENT real scale, not an assumed convention.
 */
export declare function deriveKiteToRdH({ catalanId, pieceName }: KitePieceOptions): AdapterPieceResult;
