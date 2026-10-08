/**
 * archimedean.ts — all 13 Archimedean solids.
 *
 * Batch 1 (cuboctahedron, truncated tetrahedron, truncated octahedron) and
 * batch 2 (the remaining 10, added 2026-09-08) share the same method:
 * every shape is cross-checked against a true 3D convex-hull computation
 * (scipy.spatial.ConvexHull, same method as the dodecahedron in
 * ./platonic.ts) — vertex count, edge count, face count, face-size
 * multiset, and edge-length uniformity all verified directly against each
 * solid's known values, not assumed.
 *
 * Vertices are hardcoded literal arrays copied directly from the verifying
 * Python script's own printed output, not re-derived by a hand-written
 * generator function here — a first attempt at batch 1 used a fresh
 * TypeScript generator loop for the vertices while copying the edges/faces
 * arrays from Python's `sorted(set(...))`-ordered output. The two orderings
 * didn't match (Python's dedup-and-sort reorders vertices relative to
 * whatever order they were generated in), so the edge/face indices
 * silently pointed at the wrong physical vertices — validateShape() caught
 * it immediately (every edge length wrong, since edges connected unrelated
 * vertex pairs), but the fix is to never re-derive an ordering that has to
 * match a separately-computed index list: hardcode the exact vertex list
 * the indices were computed against. Batch 2 follows the same rule
 * throughout, including for the two chiral snub solids.
 *
 * Batch 1 was picked for simple, low-transcription-risk coordinates
 * (small-integer permutations, or a direct edge-truncation of an
 * already-verified shape). Batch 2 covers the harder remainder:
 *
 * - Raw coordinate formulas for 9 of the 10 (all but the truncated
 *   icosahedron) came from each shape's own Wikipedia "Cartesian
 *   coordinates" section, fetched and cross-checked computationally rather
 *   than trusted outright — which caught a real transcription error: the
 *   fetched snub-cube page summary gave the defining cubic for its
 *   tribonacci-like constant `t` as `t^3 = t^2 + 1`. Using that root
 *   produced a hull with TWO different edge lengths instead of one
 *   uniform length — an immediate, loud signal something was wrong. The
 *   correct constant (the actual tribonacci constant, `t^3 = t^2 + t + 1`,
 *   t ≈ 1.83929) produces a single uniform edge length across all 60
 *   edges. This is exactly the kind of error validateShape()-style
 *   cross-checking exists to catch, one level upstream of the TypeScript
 *   arrays themselves — verify the *source* coordinates numerically before
 *   ever transcribing them.
 * - The truncated icosahedron has no Cartesian-coordinates section on its
 *   Wikipedia page at all, so it's derived instead by 1/3-edge truncation
 *   of D20 (this project's own icosahedron, in ./deltahedra.ts) — the same
 *   relationship truncated_tetrahedron's own comment describes for the
 *   tetrahedron. This works exactly (not approximately) for any
 *   all-equilateral-triangle-faced solid regardless of vertex degree: the
 *   two edges leaving a vertex within one triangular face meet at 60
 *   degrees, so by the law of cosines the segment connecting their
 *   t-fraction cut points has length exactly t * (original edge length)
 *   independent of vertex degree — setting that equal to the leftover
 *   `(1 - 2t) * L` mid-edge segment gives t = 1/3 universally.
 * - "Even permutation" in each Wikipedia formula means the 3 cyclic
 *   rotations of a triple (not all 6 permutations) — confirmed by
 *   checking known vertex counts came out right (e.g. icosidodecahedron's
 *   30, not a multiple that would result from the wrong permutation
 *   group).
 * - The snub dodecahedron's coordinates (unlike the snub cube's) aren't
 *   given as a permutation formula at all — Wikipedia gives a single seed
 *   point `p` plus two 3x3 rotation matrices M1 (order 5) and M2 (order 3)
 *   whose combined orbit is the 60 vertices. Both matrices were verified
 *   to actually BE proper rotations (orthogonal, determinant 1) of the
 *   claimed order before use, not just transcribed and trusted — see
 *   scripts/gen-archimedean2 in the build history for the exact check.
 *
 * All batch-2 face/edge lists are the literal output of a shared Python
 * pipeline (convex hull -> group hull triangles by shared plane equation
 * -> order each face's vertices by angle in its own plane -> derive edges
 * by deduping every face's own consecutive vertex pairs) — never a second,
 * independently-typed edge list. See docs/build-plan.md for the full
 * writeup of this batch.
 */
import { type PolyhedronSpec } from './core.js';
export declare const ARCHIMEDEAN_ADDITIONS: Record<string, PolyhedronSpec>;
export declare const ARCHIMEDEAN_ADDITION_IDS: string[];
