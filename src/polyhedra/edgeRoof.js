/**
 * The Admiral Cap (DICTO's name; the edge roof, DICTO 2026-10-10, Kaleidohedra study 2026-10-10-icosa-networks-2): two tetrahedra over
 * one edge of the unit icosahedron, apex at a vertex of the octahedron round it. Six of them, on the icosahedron's six
 * edges parallel to the axes, make the regular octahedron of edge phi^2/sqrt2: the icosahedral echo of Euclid's roofs on
 * the cube. Icosahedra with their roofs and regular tetrahedra fill space (the octet truss). Faces: 2 equilateral
 * triangles of edge 1 (they sit on the icosahedron) and 4 triangles with edges 1, sqrt2/2, phi sqrt2/2. Volume phi/12.
 * Shown in Polyhedraverse's DICTO's pieces so DICTO can build the octahedron by hand. Checked in scripts/verify-icosa.mjs.
 */
import { specOf } from './stellaJewel.js';

const V = [[0.809016994, 0, -0.5], [0.809016994, 0, 0.5], [1.309016994, 0, 0], [0.5, -0.809016994, 0], [0.5, 0.809016994, 0]];
const F = [[2, 1, 3], [2, 3, 0], [1, 0, 3], [2, 4, 1], [2, 0, 4], [4, 0, 1]];
const CAP = specOf('DICTO_EDGE_ROOF', 'Admiral Cap', V, F, false, 1);
// Its two equilateral faces sit on the icosahedron and take nothing else (DICTO 2026-10-13: a tetrahedron there looked safe and
// led nowhere): faceMates, face index -> the only shapes that may meet it.
const side = (f, i) => Math.hypot(...[0, 1, 2].map((k) => CAP.vertices[f[i]][k] - CAP.vertices[f[(i + 1) % f.length]][k]));
CAP.faceMates = Object.fromEntries(CAP.faces.map((f, i) => [i, f]).filter(([, f]) => f.every((_, j) => Math.abs(side(f, j) - 1) < 1e-6)).map(([i]) => [i, ['D20']]));
export const EDGE_ROOF_ADDITIONS = { DICTO_EDGE_ROOF: CAP };
export const EDGE_ROOF_ADDITION_IDS = Object.keys(EDGE_ROOF_ADDITIONS);
