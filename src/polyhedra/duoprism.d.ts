/**
 * The 4D Prism (duoprism) construction: for any polyhedron P, the 4D
 * shape P x [0, depth] -- exactly how a tesseract is a cube extruded
 * along a 4th axis, generalized to any already-registered shape. Unlike
 * a folded 4-polytope (radialProjection.ts), a duoprism has NO curvature at all:
 * it's a flat Cartesian product with an interval, so it embeds in
 * ordinary 3D with zero approximation, for ANY shape, at ANY density of
 * chained attachments.
 *
 * The construction: two copies of P ("caps," translated relative to
 * each other along one chosen axis, in the SAME orientation -- unlike an
 * ordinary face-attach of two DIFFERENT solids, a
 * duoprism's far cap IS the same polyhedron, not a mirrored copy, so
 * there's no registration/twist choice at all) plus one 3D prism cell
 * per FACE of P (replacing "one rectangle per EDGE" in `prisms.ts`'s own
 * ordinary 3D prism, one dimension up), connecting each face's near
 * copy to its far copy. `buildWallPrism` below reuses `prisms.ts`'s
 * exact near-cap-reversed / far-cap-direct winding convention.
 */
import { type Vec3, type PolyhedronSpec } from './core.js';
/**
 * BUILD mode's wall-prism depth for a specific face: `minNonOverlapDepth`
 * along that face's own normal, plus a 15% margin for a real visible gap
 * rather than the two copies' faces looking fused.
 *
 * A first version of this used "2x that face's own apothem" instead,
 * reasoning that a convex shape's boundary never extends past its own
 * face plane along that face's own normal, so the near copy's forward
 * extent (=apothem) should equal the far copy's backward extent
 * (=apothem again, by symmetry). That symmetry assumption is only true
 * for a CENTRALLY SYMMETRIC shape (opposite faces parallel and
 * equidistant from center) — CUBE, D8, and DODECAHEDRON all happen to
 * have it, but D4 (tetrahedron) does NOT: the vertex opposite a face
 * sits at the shape's own real HEIGHT from that face (~0.817 for a
 * unit-edge tetrahedron), not at 2x the apothem (~0.408) — caught live
 * (D4 alone, not the other 3, failing the real overlap check below)
 * rather than assumed safe from the apothem shortcut. Measuring the
 * real extent directly via `minNonOverlapDepth`, exactly like VIEW's
 * own depth already does, removes the symmetry assumption entirely.
 */
export declare function duoprismBuildDepth(spec: PolyhedronSpec, faceIndex: number): number;
export interface WallPrismRaw {
  /** 2n verts: [0..n-1] = near cap (face's own order, REVERSED), [n..2n-1] = far cap (face's own order, direct). */
  verts: Vec3[];
  edges: [number, number][];
  /** [nearCap, farCap, ...n lateral quads]. */
  faces: number[][];
}
/**
 * The connecting 3D prism cell for one face of a duoprism, given that
 * face's own vertex positions (`faceVerts`, already resolved in
 * whatever coordinate frame the caller wants -- shape-local for the
 * reference VIEW, or world-space for a real BUILD attach) and the
 * translation to the far copy (`offset`). A RIGHT prism when `offset`
 * is parallel to the face's own normal (BUILD mode, always exact); an
 * OBLIQUE prism otherwise (VIEW mode's single shared axis is generally
 * not perpendicular to any one face -- correct and expected, matching
 * how a real tesseract diagram shows most of its 8 cells as skewed
 * frustums under one shared projection direction, not 8 identical
 * cubes).
 *
 * Winding: the face's own stored order has a NATURAL normal (computed
 * directly from its own first 3 points, same technique
 * `buildFaceConnectors` uses) that may point either WITH or AGAINST
 * `offset`, depending on the caller: BUILD always passes `offset`
 * parallel to that exact face's own normal (so always WITH it, by
 * construction), but VIEW's single shared axis generally does NOT agree
 * in sign with every face's own normal (roughly half of any convex
 * shape's faces will disagree under one fixed direction) -- confirmed
 * live, not assumed: an earlier version of this function always
 * reversed the near cap and kept the far cap direct unconditionally,
 * which produced an inverted (negative-volume, inconsistently-wound)
 * mesh for every VIEW-mode face where the fixed axis opposed that
 * face's own normal (scripts/verify-duoprism.ts caught this via a
 * whole-mesh signed-volume check). The correct, general rule: whichever
 * cap's NATURAL winding already points away from the OTHER cap is kept
 * direct; the other is reversed. When `dot(faceNormal, offset) > 0`
 * (BUILD, always; VIEW, about half the time) that's near-reversed/
 * far-direct (the original derivation); when negative, it's the mirror
 * image, near-direct/far-reversed.
 */
export declare function buildWallPrism(faceVerts: Vec3[], offset: Vec3): WallPrismRaw;
/**
 * The lateral (wall) quads only, excluding the near/far cap faces.
 * Every real caller renders the wall ALONGSIDE two already-solid,
 * already-capped copies of the shape (a real placed node at each end in
 * BUILD mode; a separately-drawn capGeometry mesh at each end in VIEW
 * mode) -- rendering the wall's OWN cap triangles too duplicates
 * geometry that's already there, and since the cap's own winding
 * (`reversed`/`direct`, chosen for the WHOLE mesh's outward-normal
 * consistency) doesn't match the solid's own natural face
 * triangulation, the two overlapping, differently-diagonalized
 * pentagons/triangles visibly cross near the middle -- a real, reported
 * artifact ("edges attaching to face centers", confirmed live as the
 * near/far cap triangulations disagreeing), not a subtle rendering
 * preference. checkWallPrism in scripts/verify-duoprism.ts still
 * verifies the FULL mesh (caps included) for winding/volume
 * correctness -- this only changes what actually gets drawn.
 */
export declare function wallLateralFaces(wall: WallPrismRaw): number[][];
export interface DuoprismCombinatorics {
  V: number;
  E: number;
  F: number;
  C: number;
}
/**
 * The duoprism's own 4D vertex/edge/2-face/3-cell counts, derived from
 * P's ordinary V/E/F alone: 2V vertices (two full copies), 2E+V edges
 * (each copy's own edges, plus one connecting edge per vertex), 2F+E
 * 2-faces (each copy's own faces, plus one lateral quad per edge of P),
 * 2+F 3-cells (the two whole-P caps, plus one wall-prism per face of
 * P). See scripts/verify-duoprism.ts for the 4D Euler-characteristic
 * check this satisfies automatically once P's own V-E+F=2 holds.
 */
export declare function duoprismCombinatorics(spec: PolyhedronSpec): DuoprismCombinatorics;
/**
 * VIEW mode's single, fixed, shape-independent extrusion direction --
 * deliberately NOT axis-aligned (so it isn't coincidentally
 * perpendicular OR parallel to some face of some shape purely by
 * geometric accident) and NOT per-shape/per-face like BUILD's own axis.
 * One shared direction makes the reference picture read as "one
 * polyhedron extruded through one 4th axis," matching a real tesseract
 * diagram, rather than `f` unrelated right prisms glued at odd angles.
 * Verified (scripts/verify-duoprism.ts) to never lie in any of the 137
 * registered shapes' own face planes -- if that ever changed with a
 * future shape addition, the script fails loudly rather than silently
 * shipping a degenerate wall-prism. Chosen by a random search over the
 * whole live registry (not hand-picked) maximizing the worst-case
 * |dot(axis, faceNormal)| across all 3565 registered faces -- an
 * earlier arbitrary choice ([0.53, 1.0, 1.73], worst case ~0.00007)
 * came within numerical noise of lying in a real face's plane for 6
 * different shapes (caught directly by this file's own verification
 * script, not assumed safe); this one's worst case is ~0.012, three
 * orders of magnitude further from degenerate.
 */
export declare const DUOPRISM_VIEW_AXIS: Vec3;
/**
 * VIEW mode's depth for `spec`: `minNonOverlapDepth` along
 * `DUOPRISM_VIEW_AXIS` specifically (the shape's own REAL extent along
 * that exact generic axis), not a circumradius-based approximation. An
 * earlier version used `maxVertexRadius * 1.2` — circumradius is the
 * worst-case distance in ANY direction, but a shape's real extent along
 * one SPECIFIC generic (non-face-normal) axis can be smaller OR, for an
 * axis nearly aligned with a vertex-to-vertex diagonal, approach nearly
 * TWICE the circumradius — an approximation, not the exact figure this
 * needs (the same class of bug BUILD's own depth had, caught by the
 * same live report). Measuring the real extent directly removes the
 * guesswork entirely.
 */
export declare function duoprismViewDepth(spec: PolyhedronSpec): number;
export interface DuoprismShadow {
  /** Translation from the near ("A") cap to the far ("B") cap -- add this to `spec.vertices` for B's own positions. */
  offset: Vec3;
  /** One wall-prism per face of `spec`, same order as `spec.faces`. */
  walls: WallPrismRaw[];
}
/** The full reference-only "3D shadow" of `spec`'s duoprism: two copies of `spec` (the caller already has spec's own mesh for the near copy; add `offset` for the far one) plus one connecting wall-prism per face. */
export declare function buildDuoprismShadow(spec: PolyhedronSpec): DuoprismShadow;
