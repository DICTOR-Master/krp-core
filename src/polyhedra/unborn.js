/**
 * Unborn (DICTO's name, 2026-10-10; Kaleidohedra studies 2026-10-10-icosa-networks-2 §2 and 2026-10-23-axe-gap): the void of the
 * simple cubic lattice of unit icosahedra (spacing phi), the dodecahedron of edge 1/phi there minus its 8 Tricaps. As a solid it is
 * Koca, Koca, Al-Mukhaini & Al-Qanobi 2015's pseudoicosahedron (x = 1/tau, arXiv 1506.04600); its role as the cut void of the
 * icosahedron lattice is DICTO's. Corners cyclic (±phi/2, ±1/(2phi), 0); 8 equilateral faces of edge 1 (they sit on the
 * icosahedra) and 12 isosceles (1/phi, 1, 1); 30 edges, 6 of 1/phi; volume (3 + 7√5)/12. With the icosahedra and 6 AXE per cell it
 * fills space. Shown in Polyhedraverse's DICTO's pieces. Checked in scripts/verify-icosa.mjs and tests/unit/unborn.test.mjs.
 */
import { specOf } from './stellaJewel.js';

const PHI = (1 + Math.sqrt(5)) / 2, A = PHI / 2, B = 1 / (2 * PHI);
const V = [[A, B, 0], [0, A, B], [B, 0, A], [A, -B, 0], [0, A, -B], [-B, 0, A], [-A, B, 0], [0, -A, B], [B, 0, -A], [-A, -B, 0], [0, -A, -B], [-B, 0, -A]];
const F = [[0, 8, 4], [7, 2, 5], [1, 2, 0], [0, 4, 1], [1, 5, 2], [1, 4, 6], [6, 5, 1], [8, 10, 11], [6, 4, 11], [11, 4, 8], [3, 8, 0], [3, 10, 8],
  [7, 10, 3], [0, 2, 3], [3, 2, 7], [6, 11, 9], [9, 11, 10], [9, 10, 7], [9, 5, 6], [7, 5, 9]];
export const UNBORN_ADDITIONS = { DICTO_UNBORN: specOf('DICTO_UNBORN', 'Unborn', V, F, false, 1) };
export const UNBORN_ADDITION_IDS = Object.keys(UNBORN_ADDITIONS);
