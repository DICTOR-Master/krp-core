/**
 * The Pentagon-to-RD-H adapter piece: the same hemi-RD hexagonal
 * interface as triangleToRdH.ts/squareToRdH.ts, collapsed instead to a
 * real regular pentagon matching a unit-edge dodecahedron face. See
 * docs/rvcmg-adapter-pieces-spec.md for the full adapter-piece family.
 *
 * Only ONE merge is needed (6 -> 5): a hexagon already has one more
 * vertex than a pentagon. That means all FOUR untouched vertices'
 * final repositioning has to ride on this SAME single step's own
 * `deformation` (spec §16's Φ) — unlike the square piece, there's no
 * later step to split the work across.
 */
import type { AdapterPieceResult } from './triangleToRdH.js';
/**
 * Derives the Pentagon-to-RD-H piece: merges `(v3,v4)` — one of the
 * hexagon's two "long" (length-1.0, cube-corner-to-cube-corner) edges,
 * the two long edges being exact inversion-symmetric images of each
 * other (confirmed computationally, not assumed, since the RD's own
 * central symmetry guarantees the hex interface has it too) — so either
 * long edge is an equally valid, non-arbitrary choice; `(v3,v4)` is
 * picked for concreteness. The other 4 vertices (`v1`, `v2`, `v5`, `v6`)
 * are deformed to their final pentagon corners in this same step.
 *
 * Target placement: `assignTargetAngles` (shared.ts) both preserves the
 * hexagon's real winding order and picks the rotational phase
 * minimizing total twist relative to each group's own real position —
 * the same "least distortion" rule applied to every piece. Circumradius
 * `1 / (2*sin(pi/5))` gives a regular pentagon of edge exactly 1,
 * matching a unit-edge dodecahedron face.
 */
export declare function derivePentagonToRdH(): AdapterPieceResult;
