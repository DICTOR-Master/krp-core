/**
 * The Sunstar Lattice pair (direct request 2026-10-08: "add the Sunstar to Polyhedraverse with a
 * seamed dodecahedron"), from Kaleidohedra. Names by DICTO.
 *
 * Regular dodecahedra on the even cells of a cubic lattice (their densest lattice packing) leave one
 * hole in each odd cell, and the hole is exactly a Dogstar: an 8-pointed partial stellation of a
 * dodecahedron 1/phi^3 their size, with edges only 2/phi^4, 2/phi^3, 2/phi^2 and 2/phi (cube edge 2).
 * A dodecahedron with the 6 Dogstars on its faces is a Sunstar, the sun with its sun dogs.
 *
 * A dodecahedron's pentagon touches Dogstars on part of it and other dodecahedra on the rest, so a
 * plain pentagon can't face-attach to a Dogstar. Both pieces here are seamed from the packing
 * itself: every face is cut along the edges of every other piece's face lying in the same plane, so
 * any two faces that touch in the lattice are cut into the same pieces and attach exactly.
 *
 * Built at dodecahedron edge 1 (cube edge phi). scripts/verify-sunstar.ts checks them, and that the
 * Dogstar is krp-core's recorded object.
 */
import type { PolyhedronSpec } from './core.js';
export declare const DOGSTAR_REQUEST: any;
export declare const SUNSTAR_ADDITIONS: Record<string, PolyhedronSpec>;
export declare const SUNSTAR_ADDITION_IDS: string[];
