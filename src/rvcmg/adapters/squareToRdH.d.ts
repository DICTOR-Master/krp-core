/**
 * The Square-to-RD-H adapter piece: the same hemi-RD hexagonal interface
 * as triangleToRdH.ts, collapsed instead to a real unit square matching
 * a unit-edge cube face. See docs/rvcmg-adapter-pieces-spec.md for the
 * full adapter-piece family this belongs to.
 *
 * Unlike the triangle piece (3 merges, every hex vertex absorbed into
 * one), a square needs only 2 merges (6 -> 5 -> 4): two of the six hex
 * vertices are never coalesced at all. Those two MUST still end up at
 * specific final corner positions to form a real square — this is what
 * a coalescence step's own `deformation` parameter (spec §16's Φ,
 * "applied to all other vertices") is actually for: reshaping the rest
 * of the boundary as part of a coalescence, not merely a pass-through.
 * RVCMG has no separate "reposition without changing vertex count"
 * primitive, so the untouched vertices' final repositioning is carried
 * by the SECOND merge's deformation.
 */
import type { AdapterPieceResult } from './triangleToRdH.js';
/**
 * Derives the Square-to-RD-H piece: two `coalesce()` steps, merging
 * (v2,v3) then (v5,v6) — the SAME two "cube-corner + octahedron-
 * direction" edge pairs the triangle piece's own alternate-edge
 * matching would use for two of its three merges, leaving `v1`/`v4`
 * (an exact central-symmetry pair, `v4 == -v1` in this plane, confirmed
 * computationally below rather than assumed from the RD's known
 * inversion symmetry) untouched by any single `coalesce()` call.
 *
 * Target placement, generalizing triangleToRdH.ts's own method to 4
 * groups instead of 3: each of the 4 final corners is either a single
 * untouched vertex or a merged pair; each group's REPRESENTATIVE angle
 * (its own angle, or a pair's averaged angle, in the hex interface's
 * own planar frame) is measured, the 4 groups are sorted by that angle
 * to read off the hexagon's real winding order, and exactly 90°-spaced
 * target angles are assigned in that same order — preserving winding
 * instead of risking an inverted (mirrored) square from an arbitrary
 * fixed assignment. Circumradius `1/sqrt(2)` gives edge length exactly
 * 1, matching a unit-edge cube face.
 */
export declare function deriveSquareToRdH(): AdapterPieceResult;
