/**
 * DICTO's Zometool parallelohedra (direct request 2026-09-30): a leaning
 * regular-hexagonal prism DICTO built from medium blue Zometool struts, and
 * the two blocks it splits into. Names credit DICTO; each shape's details
 * credit Zometool.
 *
 * All four edge directions are blue-strut directions (the solid's 2-fold
 * axes), edge 1: u, v, w lie in the hexagon's plane at 60 degrees to each
 * other, and the lean d is at 90 degrees to u and 72 degrees to v and w.
 * So the prism has two regular hexagons, two squares and four 72/108
 * degree rhombi (the Penrose thick rhombus), and leans ~20.9 degrees from
 * upright, with sin = 2 cos 72 / sqrt 3 = (phi - 1) / sqrt 3. It is a
 * hexagonal-prism parallelohedron (one of Fedorov's five types), sheared.
 *
 * Its three blocks are the parallelepipeds on each pair of hexagon
 * directions with d: (u,v,d) and (u,w,d) are the same piece (every
 * parallelepiped is centrally symmetric, so its mirror image is itself
 * turned round), with a pair each of squares, 60 degree and 72 degree
 * rhombi; (v,w,d) has 60 degree rhombi and two pairs of 72 degree
 * rhombi. All three are parallelohedra too. The prism is equally a
 * rhombic dodecahedron's four-direction zonohedron with three directions
 * flattened into one plane, which is how DICTO first found a block, from
 * a distorted RD.
 *
 * Every face attaches: the squares to the cube, the hexagons to the
 * hexagonal prism, the 72 degree rhombi to the thick Penrose rhombus
 * prism (Aperiodic Sets), the 60 degree rhombi to each other.
 */
import { type Vec3, type PolyhedronSpec } from '../../core.js';
/** The four edge directions: u, v, w in the hexagon's plane; d the lean. */
export declare const ZOME_DIRECTIONS: {
  u: Vec3;
  v: Vec3;
  w: Vec3;
  d: Vec3;
};
/**
 * DICTO's skewed rhombic dodecahedron (direct request 2026-09-30): v, w, d
 * plus one more blue direction x, at 60 degrees to v and d and 72 to w, so
 * the four meet at 60 degrees three times and 72 three times. Twelve
 * rhombi (six of 60, six of 72 degrees), volume phi^2 at edge 1: it splits
 * into two all-rhombus blocks (phi/2) and two flattened rhombohedra (1/2).
 * It tiles space as a sheared FCC (Rhombiverse's DICTO FCC). x solves
 * x.v = -cos 60, x.w = cos 72, x.d = cos 60 (unit length).
 */
export declare const ZOME_X: Vec3;
/**
 * DICTO's skewed ED (Kaleidohedra DISCOVERIES.md #7, direct request
 * 2026-10-01): two ways to extend the skewed RD (v, w, d, ZOME_X) by a
 * fifth edge direction, the same way the regular-hexagon ED extends the
 * Bain RD. Found in Kaleidohedra by matching the skewed RD's Gram matrix
 * against every already-catalogued equal-edge elongated-dodecahedron cell's
 * 4-direction sub-sets (geometry-targets.json); exactly two contain it:
 * TARGETS.md #16 (4 rhombi 60, 4 rhombi 72, 2 hexagons 36/36/72, 2 regular
 * hexagons; volume phi^2 + 2) and #18 (6 rhombi 60, 2 rhombi 72, 4 hexagons
 * 36/72/72; volume phi^3 + 1/2). Each direction below is that fifth
 * direction, carried over exactly (orthogonal alignment, not re-derived)
 * from Kaleidohedra's `src/geometry-extensions/dicto-fcc.js`.
 */
export declare const DICTO_SKEWED_ED_16_DIRECTION: Vec3;
export declare const DICTO_SKEWED_ED_18_DIRECTION: Vec3;
/**
 * Not Zometool pieces (unlike the rest of this file): these two were found
 * by a pure Kaleidohedra Gram-matrix search, never built with struts. Used
 * to keep them out of ZOME_PARALLELOHEDRA_ADDITION_IDS' "Zometool credit"
 * and give them their own, accurate one instead.
 */
export declare const DICTO_SKEWED_ED_IDS: string[];
export declare const ZOME_PARALLELOHEDRA_ADDITIONS: Record<string, PolyhedronSpec>;
export declare const ZOME_PARALLELOHEDRA_ADDITION_IDS: string[];
