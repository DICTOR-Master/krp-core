/**
 * The six icosahedral 5-fold axes, each 1/phi long (the rhombic
 * triacontahedron's edge). Every golden zonohedron is built from some of
 * them: the golden rhombohedra (3), Bilinski dodecahedron (4), rhombic
 * icosahedron (5) and rhombic triacontahedron (6). Plain numbers, no THREE,
 * so both the shape registry and goldenBuilds.ts can share them.
 */
import type { Vec3 } from './core.js';
export declare const GOLDEN_AXES: Vec3[];
