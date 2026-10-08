/**
 * The golden zonohedra as ready-made builds (File menu): the Bilinski
 * dodecahedron (2 prolate + 2 oblate golden rhombohedra), the rhombic
 * icosahedron (5 + 5) and the rhombic triacontahedron (10 + 10), for seeing
 * how the pieces fit before building by hand (golden rhombohedra hit dead
 * ends easily: their faces can't show which way a gap closes).
 *
 * Construction: the zonotope tiling of the first 4, 5 or 6 icosahedral
 * 5-fold axes -- one rhombohedron per triple of axes, placed by the
 * standard lifting rule (generic heights) -- then each piece is the
 * registry's own prolate/oblate spec turned onto its triple. Pieces are
 * joined by face connections along a spanning tree of shared faces.
 * scripts/verify-aperiodic-sets.ts checks the result is named correctly.
 */
import { Quaternion, Vector3 } from 'three';
import { type PolyhedronSpec } from '../polyhedra/index.js';
import type { Assembly, AssemblyNode } from './assembly.js';
export declare function rotationFor(spec: PolyhedronSpec, triple: Vector3[]): Quaternion | null;
export declare const GOLDEN_BUILDS: readonly [{
    readonly axes: 4;
    readonly name: "Bilinski dodecahedron";
}, {
    readonly axes: 5;
    readonly name: "Rhombic icosahedron";
}, {
    readonly axes: 6;
    readonly name: "Rhombic triacontahedron";
}];
export declare function goldenZonohedronNodes(k: number): AssemblyNode[];
export declare function faceCentres(n: AssemblyNode): Vector3[];
export declare function goldenZonohedron(k: number): Assembly;
export declare function withNextRecipePiece(a: Assembly, k: number): {
    assembly: Assembly;
    step: number;
    total: number;
};
