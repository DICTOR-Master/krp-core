/**
 * Graded pyramids: a regular-n-gon base (unit edge) topped by an apex
 * whose height is derived from a TARGET APEX ANGLE (the interior angle
 * of each lateral triangular face, at the apex) rather than a single
 * fixed height — a face-attach add-on family, genuinely different from
 * RVCMG's own vertex-coalescence math (this is a classic "base polygon
 * + apex at some height" construction, the same shape as a Johnson-
 * solid pyramid, just with the height left as a free, graded parameter
 * instead of fixed at the one value that makes every lateral face
 * equilateral).
 *
 * Direct user request (2026-09-15): a "miscellaneous" family of
 * irregular add-on pieces including graded pyramids (grade 1 = low,
 * 2 = standard/regular height — matches whatever regular-faced pyramid
 * already exists for that base — 3 = tall, 4 = sharp/star-solid-like;
 * no grade 0, the scale starts at 1) on various base shapes. This file
 * prototypes the REGULAR-polygon-base
 * case (triangular base first, per direct instruction, to validate the
 * apex-angle-to-height math before generalizing to square/pentagon/
 * hexagon and later to IRREGULAR bases (golden rhombus, kite, the real
 * hemi-RD hexagon), which need a different approach entirely since
 * their lateral faces aren't all congruent — not yet started).
 *
 * The math: for a regular n-gon base of edge 1, its own circumradius is
 * `R = 1 / (2*sin(pi/n))`. A lateral face is an isosceles triangle with
 * base edge 1 and two equal slant sides of length `L`; the apex angle
 * `theta` (opposite that base edge) relates to `L` via
 * `1 = 2*L*sin(theta/2)`, so `L = 1 / (2*sin(theta/2))`. The apex sits
 * directly above the base's own centroid at height `h`, where
 * `L^2 = h^2 + R^2` (a right triangle formed by the apex, the centroid,
 * and one base vertex) — so `h = sqrt(L^2 - R^2)`.
 *
 * **Real, verified constraint**: this only has a real solution when
 * `L > R`, i.e. `theta < 360/n` degrees — beyond that the pyramid is
 * geometrically impossible (the apex would have to sit BELOW the base
 * plane to reach that shallow an angle, or the base itself isn't
 * planar-consistent with it). At `theta = 360/n` exactly, `h = 0` (the
 * apex collapses onto the base's own centroid — confirmed directly:
 * for a TRIANGULAR base this is 120 degrees, and it is not a
 * coincidence that `n >= 6` therefore makes the well-known "regular
 * hexagonal pyramid with equilateral triangle sides" construction
 * IMPOSSIBLE (`360/6 = 60` degrees is exactly the equilateral-triangle
 * apex angle needed, i.e. right at the degenerate limit) — this is
 * the real reason no Johnson solid or convex deltahedron is a regular-
 * faced hexagonal pyramid.
 */
import { type PolyhedronSpec } from './core.js';
/**
 * Resolves a grade's real apex angle for a specific base shape `n`.
 * Grade 1 is DERIVED (half of grade 2's own height for this exact `n`,
 * converted back to an angle) rather than looked up from a fixed table
 * — see this file's own grading-scale comment for why a fixed number
 * doesn't generalize across base shapes.
 */
export declare function gradeApexAngleDeg(n: number, grade: number): number;
export declare const GRADE_NUMBERS: number[];
/** The degenerate apex-angle limit (degrees) for a regular n-gon base, beyond which no real pyramid exists. */
export declare function degenerateApexAngleDeg(n: number): number;
/** A regular n-gon base's own circumradius, unit edge length. */
export declare function regularPolygonCircumradius(n: number): number;
/** The apex height for a regular n-gon (unit edge) base and a target apex angle (degrees). Throws if the angle is at or beyond the degenerate limit. */
export declare function apexHeightForAngle(n: number, apexAngleDeg: number): number;
/**
 * The inverse of `apexHeightForAngle`: the apex angle (degrees) that
 * gives a regular n-gon (unit edge) base a specific target height.
 * Needed because "grade 1 = about half of grade 2's height" (direct
 * user description) is a statement about HEIGHT, not angle — and the
 * angle that achieves a given height is genuinely different per base
 * shape `n` (a real bug this project shipped and caught: reusing
 * triangular base's own derived 90° angle directly as a fixed number
 * for a SQUARE base crashed outright, because 90° is exactly the
 * square base's own degenerate limit — `360/4` — not a coincidence
 * worth losing by treating one base's derived angle as if it were a
 * universal constant).
 */
export declare function apexAngleForHeight(n: number, height: number): number;
/**
 * Builds a graded pyramid on a regular n-gon (unit edge) base. Returns
 * a real `PolyhedronSpec`-shaped object (vertices/edges/faces/
 * connectors), centered per this registry's own convention, but is
 * NOT added to the shared `POLYHEDRA` registry here — this is the
 * prototype construction, not yet wired into the family/registry
 * system (see gradedPyramids.test.ts for verification, and
 * docs/rvcmg-adapter-pieces-spec.md's own "Outstanding" notes for the
 * planned "Miscellaneous" family this belongs to).
 */
export declare function buildGradedPyramid(n: number, apexAngleDeg: number, id: string, name: string): PolyhedronSpec;
/** Re-checks base edges = 1, lateral edges all equal, and the achieved apex angle matches the requested one — mirrors `validateShape`'s style. */
export declare function validateGradedPyramid(spec: PolyhedronSpec, n: number, expectedApexAngleDeg: number, tol?: number): string[];
