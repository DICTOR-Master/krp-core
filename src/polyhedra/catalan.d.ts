/**
 * catalan.ts — Catalan solids: the exact face/vertex duals of the 13
 * Archimedean solids (already in ./archimedean.ts, verified). A genuinely
 * different category from every other family in this registry, not a
 * missing entry among Platonic/Archimedean/Johnson (Zalgaller proved in
 * 1969 that those three plus deltahedra plus prisms/antiprisms are the
 * complete classification of convex REGULAR-faced polyhedra): Catalan
 * solids are face-transitive, not vertex-transitive, with congruent but
 * IRREGULAR faces — see docs/catalan-solids-spec.md for the full design
 * record this file implements.
 *
 * Two load-bearing assumptions every other family in this registry
 * relies on break here, and both needed a genuine architectural answer,
 * not a special case:
 *   - `makeSpec`'s "normalize to one uniform unit edge" doesn't apply —
 *     11 of the 13 have 2-3 distinct edge lengths per face. Use
 *     `makeSpecByCircumradius` instead (normalize to circumradius = 1,
 *     computed per shape), decided empirically over 3 rejected
 *     alternatives — see the spec doc's "Normalization convention,
 *     decided" section.
 *   - face-attach's discrete registration count, previously assumed
 *     equal to a face's own vertex count (only true for a regular
 *     n-gon), needs `faceRotationalSymmetry` instead — computed from
 *     the face's own edge-length AND interior-angle sequence, not
 *     assumed. Reduces to the old behavior for every regular-faced
 *     shape already in this registry (checked against all of them
 *     before trusting it for anything new).
 *
 * Construction method: polar reciprocation about the dual Archimedean
 * solid's own midsphere (`v' = c * r_mid^2 / |c|^2` for each Archimedean
 * face centroid `c`) — no independent golden-ratio/trig coordinate
 * derivation needed, the same "derive from an already-verified shape"
 * principle as TRUNCATED_ICOSAHEDRON (archimedean.ts) and J6
 * (johnson.ts). Faces come from a real `scipy.spatial.ConvexHull` on the
 * reciprocated points (batches 4+'s method), then verified beyond the
 * usual Euler/edge checks with two properties specific to this family:
 * every face's own edge-length signature matches every OTHER face's
 * (true congruence, not just internal consistency), and every face sits
 * at the same distance from center (a uniform insphere radius — the
 * actual defining property of face-transitivity, not assumed from the
 * construction method alone).
 *
 * This batch: rhombic dodecahedron and rhombic triacontahedron, the 2 of
 * 13 with uniform edge length (a rhombus's 4 sides are equal by
 * definition) — the lowest-risk starting point, needing only the
 * face-attach registration generalization and not yet exercising the
 * non-uniform-edge case the other 11 will need.
 */
import { type PolyhedronSpec } from './core.js';
export declare const CATALAN_ADDITIONS: Record<string, PolyhedronSpec>;
export declare const CATALAN_ADDITION_IDS: string[];
