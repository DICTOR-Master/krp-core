/**
 * RVCMG Stage 1 — the real hemi-rhombic-dodecahedron (hemi-RD) interface:
 * the six ordered boundary vertices of the flat cross-section produced by
 * bisecting a rhombic dodecahedron (RD) through its own center, along the
 * plane perpendicular to one of its 12 real face-normal directions.
 *
 * Derived, not hand-declared (per this project's own "derive, don't
 * duplicate" rule, docs/construction-kit-spec.md): reuses the already-
 * verified `POLYHEDRA.RHOMBIC_DODECAHEDRON` registry entry (13 vertices/
 * edges/faces, `validateCatalanShape`-clean) rather than a second,
 * independently-transcribed RD coordinate set. Mirrors Rhombiverse's own
 * `hemisphereSplit()` (src/core/lattice.js) — a real, previously-shipped
 * construction bisecting the RD's 14 raw vertices by dot-product sign
 * against a chosen face-normal axis, verified there to split every one of
 * the 12 real directions into exactly 4 strictly positive / 4 strictly
 * negative / 6 exactly on the plane. That result is RE-verified here
 * (`validateHemiRdInterface`) against Polyhedraverse's own RD coordinates,
 * not assumed to carry over from a different project's scale/frame.
 *
 * Coordinate system and scale (spec §24.2): matches Polyhedraverse's own
 * global convention exactly — `POLYHEDRA.RHOMBIC_DODECAHEDRON`'s own
 * circumradius-1 vertices (see `makeSpecByCircumradius` in core.ts), no
 * separate rescaling. In this frame the RD's own edge length is
 * `sqrt(3)/2` (~0.8660), not 1 — measured directly from the registry
 * (`dist(vertices[edges[0][0]], vertices[edges[0][1]])`), not assumed:
 * Catalan solids are normalized by circumradius, never by edge length
 * (11 of the 13 have non-uniform edge lengths; the RD is one of only 2
 * that happens not to, but the shared convention is applied uniformly
 * regardless). Adapter-piece derivations needing a shared physical unit
 * across families (RD meeting a unit-edge tetrahedron/cube/etc.) must
 * rescale by this factor first — see adapters/triangleToRdH.ts.
 *
 * The resulting hexagon's real shape — confirmed computationally
 * below, not assumed — has D2h symmetry: 4 short edges and 2 long
 * opposite edges (the long edges connect the RD's own degree-3
 * "cube-corner" vertices to each other; the short edges connect a
 * degree-3 vertex to a degree-4 "octahedron-direction" vertex). This is
 * the real geometry every adapter-piece derivation is built on.
 */
import { type Vec3 } from '../polyhedra/core.js';
/** v1..v6, ordered, boundary-adjacent — the real hemi-RD interface (spec §2.1). */
export declare const HEMI_RD_INTERFACE: Vec3[];
export interface PlanarFrame {
  centroid: Vec3;
  /** Unit vector in-plane, toward HEMI_RD_INTERFACE[0] — the same reference `orderPlanarLoop` itself sorted angles against. */
  u: Vec3;
  /** Unit vector in-plane, perpendicular to `u` (`normal x u`). */
  w: Vec3;
  normal: Vec3;
}
/**
 * The hex interface's own local 2D frame (centroid + in-plane basis),
 * recomputed from `HEMI_RD_INTERFACE` itself rather than exposing
 * `orderPlanarLoop`'s internal variables directly — so any consumer
 * (e.g. an adapter-piece derivation needing to place a NEW target
 * polygon in this same plane, at this same centroid) shares exactly the
 * same reference frame `HEMI_RD_INTERFACE`'s own vertices are expressed
 * in, derived, not independently reconstructed.
 */
export declare function hemiRdInterfaceFrame(): PlanarFrame;
export interface HemiRdInterfaceReport {
  problems: string[];
  edgeLengths: number[];
}
/**
 * Mirrors `validateShape`'s style (a list of problem strings, empty =
 * valid) but checks the properties that actually define a valid
 * interface boundary rather than assuming a specific shape. Deliberately
 * does NOT check planarity as a pass/fail condition (the interface is
 * allowed to be non-planar in general RVCMG usage per the Stage 1
 * acceptance criteria) — it only reports the boundary's own vertex
 * count, distinctness, and simple-polygon property, plus (for this
 * specific RD-derived construction) that the 6 points genuinely DO lie
 * in one plane, since that's a real fact about this particular
 * construction worth confirming rather than assuming.
 */
export declare function validateHemiRdInterface(loop?: Vec3[]): HemiRdInterfaceReport;
