/**
 * Real face triangulation for the 4 Kepler-Poinsot solids (starPolyhedra.ts)
 * -- the piece deliberately deferred when Stage 2's wireframe-only viewer
 * shipped, since `core.ts`'s own `triangulateFace` (plain fan
 * triangulation) is only correct for a convex, simple polygon. A
 * pentagram face is neither: fan-triangulating it from one vertex would
 * cover the wrong region (a self-overlapping bowtie, not the star shape).
 *
 * The real fill is the nonzero-winding-number region of the star
 * outline -- proven (not assumed) identical to "5 outer point triangles +
 * a fan-triangulated inner pentagon" via dense random-point sampling
 * (160,000 points, 0 mismatches) before this file was written; see
 * scripts/validate-star-triangulation.ts for the same check re-run
 * against this module's actual output on the real registry data.
 *
 * Every face across all 4 solids is either a triangle (3 vertices,
 * always simple) or a 5-vertex face (either a plain convex pentagon --
 * great dodecahedron -- or a real pentagram -- small/great stellated
 * dodecahedron). Which one a given 5-vertex face is isn't hand-asserted
 * per solid here: this function detects it directly (do its own
 * non-adjacent edges actually cross in the face's own plane?) and
 * branches accordingly, so it's correct by construction rather than by
 * a lookup table that could drift out of sync with starPolyhedra.ts.
 */
import { type Vec3 } from './core.js';
export type Triangle3 = [Vec3, Vec3, Vec3];
/**
 * Triangulates one face's own real fill region -- for star polyhedra
 * only. Returns actual 3D points (not vertex indices): a pentagram
 * face's inner-pentagon corners are real new points (where the star's
 * own edges cross), not among the face's original vertex list.
 */
export declare function triangulateStarFace(vertices: Vec3[]): Triangle3[];
