/**
 * johnson.ts — a first batch of 6 Johnson solids: the two simple pyramids
 * (square, pentagonal) and the three cupolas (triangular, square,
 * pentagonal), plus the pentagonal rotunda.
 *
 * 92 Johnson solids exist in total (any strictly-convex, regular-faced
 * polyhedron that isn't already Platonic, Archimedean, a prism, or an
 * antiprism). 5 of the 92 are already in this registry as deltahedra —
 * J12 (triangular bipyramid = D6), J13 (pentagonal bipyramid = D10), J17
 * (gyroelongated square bipyramid = D16), J51 (triaugmented triangular
 * prism = D14), and J84 (snub disphenoid = D12) — not re-derived here,
 * same principle as platonic.ts not re-deriving D4/D8/D20. That leaves 87
 * new to add; this batch covers the 6 simplest, all with genuinely
 * closed-form coordinates (no numerical root-finding needed) rather than
 * the composite augmented/diminished/gyrate solids that make up most of
 * the family and are deliberately left for follow-up batches.
 *
 * **Pyramids (J1, J2)**: a regular n-gon base (unit edge, circumradius
 * R_n = 1/(2*sin(pi/n))) capped with a single apex directly above the
 * center. Every lateral face must be an equilateral triangle, so the
 * apex height solves R_n^2 + h^2 = 1 (the lateral edge is the hypotenuse
 * of base-radius and height) -- h = sqrt(1 - R_n^2), which only has a
 * real solution for R_n < 1, i.e. n = 4 or 5 (n = 3 would give a regular
 * tetrahedron, already Platonic and excluded from the Johnson list by
 * definition; n >= 6 has R_n >= 1, no valid apex exists).
 *
 * **Cupolas (J3, J4, J5)**: a smaller top n-gon (circumradius R_n) sits
 * at height h above a larger bottom 2n-gon (circumradius R_2n), joined
 * by n alternating squares and triangles around the side. Top vertex j
 * sits angularly centered above bottom edge (2j, 2j+1) -- offset by
 * pi/(2n) from bottom vertex 2j -- so requiring the lateral edge
 * |T_j - B_2j| = 1 gives a single closed-form equation for h (law of
 * cosines in the vertical triangle formed by the two radii and the
 * angular offset): h^2 = 1 - R_n^2 - R_2n^2 + 2*R_n*R_2n*cos(pi/(2n)).
 * Top-top and bottom-bottom edges are already unit length by construction
 * (R_n and R_2n are each exactly the circumradius for a unit-edge n-gon),
 * so this one equation is everything h needs to satisfy.
 *
 * **Pentagonal rotunda (J6)**: not built from a height formula at all --
 * derived directly from this registry's own ICOSIDODECAHEDRON
 * (archimedean.ts), which turns out to have exactly the right structure:
 * projecting its 30 vertices onto a 5-fold axis (through a pentagon
 * face's centroid) splits them into 4 bands of 5/5/10/5/5, with the
 * middle 10 exactly coplanar (a regular decagon "equator"). Taking the
 * closed half (10 equatorial + 5 + 5 = 20 vertices, matching J6's known
 * vertex count exactly) and re-hulling turns that flat cross-section
 * into a real decagon face automatically -- the pentagonal rotunda is
 * genuinely half of an icosidodecahedron, not a coincidental resemblance,
 * and deriving it this way avoids re-deriving golden-ratio coordinates
 * from scratch (same "derive from an already-verified shape" principle
 * as TRUNCATED_ICOSAHEDRON in archimedean.ts).
 *
 * Every shape here (however derived) was still cross-checked the same
 * way as the rest of this registry: a real scipy.spatial.ConvexHull
 * computation, edge-length uniformity, and vertex/edge/face counts
 * against each solid's known values -- not trusted from the formula
 * derivation alone. All 6 matched on the first attempt (no transcription
 * bugs this batch), but the derivation was still verified rather than
 * assumed, per this project's own standard.
 */
import { type PolyhedronSpec } from './core.js';
export declare const JOHNSON_ADDITIONS: Record<string, PolyhedronSpec>;
export declare const JOHNSON_ADDITION_IDS: string[];
