/**
 * The regular nine (direct request 2026-10-01, from Kaleidohedra's two-way
 * target search): every space-filler with all edges equal whose faces are
 * only squares, regular hexagons and 60 degree rhombi (each two
 * equilateral triangles). There are exactly nine. Five were already here
 * (the cube, the hexagonal prism, the truncated octahedron, the Bain
 * rhombic dodecahedron and the regular-hexagon elongated dodecahedron);
 * these are the other four, edge 1, each a zonohedron of its edge
 * directions:
 *
 * - RHOMBOHEDRON_60: three directions at 60 degrees to each other. Six 60
 *   degree rhombi, volume sqrt2/2: exactly a regular octahedron with a
 *   regular tetrahedron on two opposite faces.
 * - RHOMBIC_PRISM_60: a 60 degree rhombus stood straight up. Two rhombi,
 *   four squares, volume sqrt3/2.
 * - LEANING_SQUARE_PRISM: a square leaned so its sides are 60 degree
 *   rhombi. Two squares, four rhombi, volume sqrt2/2.
 * - LEANING_HEX_PRISM_60: a regular hexagon leaned at right angles to one
 *   pair of sides, so those sides stay square and the other four are 60
 *   degree rhombi. Volume 3/sqrt2.
 *
 * All four tile space by translation. verify-regular-nine checks all nine.
 */
import { type PolyhedronSpec } from '../../core.js';
export declare const REGULAR_NINE_ADDITIONS: Record<string, PolyhedronSpec>;
export declare const REGULAR_NINE_ADDITION_IDS: string[];
