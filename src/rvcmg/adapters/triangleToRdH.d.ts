/**
 * The Triangle-to-RD-H adapter piece: one hemi-RD hexagonal interface on
 * one side (mates with an RD-hemi or another such adapter), a real
 * equilateral triangle matching a unit-edge tetrahedron/octahedron face
 * on the other. First of the 6 physical adapter pieces in the RVCMG
 * family (see docs/rvcmg-adapter-pieces-spec.md for the full family and
 * the physical system this belongs to — a modular "two pieces glued at
 * their hemi-RD faces" connector between any two polyhedron families).
 *
 * This is the prototype used to validate the whole pipeline (derive a
 * real target polygon -> coalesce() sequence -> Stage 7 verification)
 * before generalizing to the other 5 pieces.
 */
import type { RvcmgState, CoalescenceOp } from '../types.js';
/**
 * RD's own edge length, measured directly from the registry (never
 * hand-copied — see hemiRdInterface.ts's own corrected comment, an
 * earlier version of that comment asserted `2-sqrt(2)` without checking
 * and was wrong; the real value is `sqrt(3)/2`). Kept as a real,
 * independently-useful measured fact, but no longer used to rescale the
 * shared hex interface — see `hemiRdStartState`'s own comment for why
 * that rescaling was removed.
 */
export declare const RD_EDGE_LENGTH: number;
/**
 * The starting 6-vertex state for every adapter piece's own derivation,
 * built directly from `HEMI_RD_INTERFACE` at RD's OWN real, native
 * scale — NOT rescaled to make RD's own edge exactly 1.
 *
 * A real, corrected design choice (2026-09-15): an earlier version
 * rescaled this to unit-edge, reasoning it needed "ONE physical
 * edge-length unit" shared with the unit-edge-normalized families
 * (Platonic/Johnson/etc.) each piece's own TARGET face matches. That
 * reasoning was simply wrong — each piece's own target face (triangle/
 * square/pentagon/regular-hex's own `EDGE = 1`, golden-rhombus/kite's
 * own measured Catalan-solid scale) is placed at its OWN independently
 * chosen absolute size regardless of the hex's own scale (`coalesce()`
 * moves points to literal target positions; nothing in that math reads
 * the hex's own scale back out) — so rescaling the hex bought nothing
 * for target-face compatibility, while actively breaking a REAL,
 * wanted capability: a genuine RD-Hemi piece (`rdHemi.ts`) needs its
 * hex AND its own real rhombic faces built from the SAME rigid,
 * uniform scale, and the only scale where its rhombi match the
 * ACTUAL, already-registered `RHOMBIC_DODECAHEDRON` is RD's own native
 * one. Direct user report that surfaced this: "you dont seem to have
 * allowed RD-Hemi to attach to full RD" — confirmed, and traced to
 * this unnecessary rescale, not a missing feature.
 */
export declare function hemiRdStartState(): RvcmgState;
export interface AdapterPieceResult {
  states: RvcmgState[];
  ops: CoalescenceOp[];
  problems: string[];
}
/**
 * Derives the Triangle-to-RD-H piece: collapses the unit-scale hex
 * interface to a real equilateral triangle of edge 1 (matching a
 * unit-edge tetrahedron/octahedron face exactly), via 3 coalesce()
 * steps merging alternate edges of the hexagon — (v1,v2), (v3,v4),
 * (v5,v6), a perfect matching (3 disjoint real edges covering all 6
 * vertices), chosen because it's the natural "fold every other corner
 * pair inward" contraction and keeps each step independent (merging one
 * pair never disturbs the others' adjacency).
 *
 * Target triangle placement: each merge's target position is the FINAL
 * triangle vertex directly (coalesce() sets a merged vertex to
 * `targetPos` in one discrete step, spec V3 — there's no need for
 * intermediate "waypoint" positions at the discrete level; a smooth
 * preview between these two flat cross-sections is interpolate()'s job,
 * Stage 6). The 3 target vertices are placed in the SAME plane as the
 * hex interface (both are flat cross-sections; the tapered 3D wall
 * connecting them is a separate, later extrusion step, not part of
 * RVCMG's own state representation), at circumradius `1/sqrt(3)` around
 * the hex's own centroid (giving edge length exactly 1), with each
 * pair's OWN averaged angular position (not an arbitrary 0/120/240
 * assignment) deciding which of the 3 target angles it gets — this
 * preserves the hex boundary's real winding sense instead of risking an
 * inverted (mirrored) triangle.
 */
export declare function deriveTriangleToRdH(): AdapterPieceResult;
