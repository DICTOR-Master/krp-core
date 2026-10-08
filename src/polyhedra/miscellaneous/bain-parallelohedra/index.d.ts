/**
 * The Bain parallelohedra (direct request 2026-10-01, from Kaleidohedra).
 * Stretch a body-centred cubic lattice by sqrt 2 along one axis and it
 * becomes face-centred cubic (the Bain stretch). The same stretch turns
 * the rhombic dodecahedron's four edge directions into four of length 1
 * meeting at 60 degrees four times and 90 degrees twice. Edge 1 throughout:
 *
 * - BAIN_RD: those four directions. 4 squares and 8 rhombi of 60 degrees
 *   (a known form of the rhombic dodecahedron: a cuboctahedron with
 *   square pyramids on top and bottom).
 * - REGULAR_HEX_ED: plus a fifth direction along an unstretched axis. It
 *   lies at 60 degrees to two pairs of the others, in their planes, so
 *   the four hexagons are regular: 4 regular hexagons, 4 squares and 4
 *   rhombi of 60 degrees, every face made of regular polygons. Already
 *   known as the truncated octahedron with one zone removed (Gruenbaum
 *   2010, Fig. 2b); DICTO reached it independently by this route.
 * - BAIN_ED: plus a fifth direction along the stretched axis instead, at
 *   45 degrees to all four: 8 rhombi of 60 degrees and 4 hexagons with
 *   corners 135, 135, 90, 135, 135, 90 (a square with two opposite
 *   corners cut at 45 degrees).
 *
 * All three tile space by translation (Fedorov types: rhombic dodecahedron,
 * elongated dodecahedron). Kaleidohedra's verify-kaleido checks the faces;
 * verify-bain-parallelohedra checks these solids.
 */
import { type Vec3, type PolyhedronSpec } from '../../core.js';
/** The four stretched rhombic-dodecahedron directions, length 1. */
export declare const BAIN_DIRECTIONS: Vec3[];
export declare const BAIN_PARALLELOHEDRA_ADDITIONS: Record<string, PolyhedronSpec>;
export declare const BAIN_PARALLELOHEDRA_ADDITION_IDS: string[];
