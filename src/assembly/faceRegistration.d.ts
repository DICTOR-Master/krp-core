/**
 * Face registration (direct request 2026-10-01: "double or up to triple
 * face registration" -- the regular-hexagon elongated dodecahedron was
 * hard to build with, because the one placement that continues the tiling
 * was one of six that all sit flush on the clicked face).
 *
 * Ranks face-attach options (faceAttach.ts) against the pieces already
 * built:
 *
 *   - each option counts the faces it sits flush on: the clicked face, plus
 *     every other face of the new piece that lands exactly on a face of a
 *     built piece (same corners), so a piece slotted into a corner shows 2
 *     or 3;
 *   - options that would cut into a built piece are hidden (exact for
 *     convex pieces: a separating-plane test; a piece that isn't convex is
 *     never hidden); if every option clashes, all are kept so attach still
 *     works;
 *   - order: most flush faces first; then, for space-fillers attaching to
 *     their own kind, the copy simply slid across (the one that continues
 *     the tiling); then the original order.
 *
 * Shared by ShapeViewer and verify-face-registration.ts, so the checks test
 * exactly what the app does.
 */
import * as THREE from 'three';
import type { PolyhedronSpec } from '../polyhedra/core.js';
import type { FaceAttachOption } from './faceAttach.js';
/** A built piece, in world space. */
export interface BuiltPiece {
    spec: PolyhedronSpec;
    matrixWorld: THREE.Matrix4;
}
export interface RankedOption {
    option: FaceAttachOption;
    /** Faces this placement sits flush on, the clicked face included. */
    flushFaces: number;
    /** The new piece's faces that land on a built face, with that piece and face. */
    matches: {
        incomingFace: number;
        piece: number;
        face: number;
    }[];
    /** True for the slid-across copy of a space-filler (continues the tiling). */
    tiling: boolean;
}
/** Index of built faces by their centre, for fast flush lookups. */
export declare class FaceIndex {
    private byKey;
    readonly pieces: {
        verts: THREE.Vector3[];
        spec: PolyhedronSpec;
        centre: THREE.Vector3;
        radius: number;
    }[];
    constructor(built: BuiltPiece[]);
    /** Built faces with exactly these corners. */
    find(corners: THREE.Vector3[], tol: number): {
        piece: number;
        face: number;
    }[];
}
export declare function isConvex(spec: PolyhedronSpec): boolean;
/** True when two convex solids share interior volume (touching faces, edges or corners don't count). */
export declare function convexOverlap(aSpec: PolyhedronSpec, a: THREE.Vector3[], bSpec: PolyhedronSpec, b: THREE.Vector3[], eps: number): boolean;
/**
 * Ranks and filters face-attach options against the built pieces (see the
 * file comment). `target` is the built piece being attached to, by index
 * into `built` (-1 if it isn't there); `tilingFirst` is whether the incoming piece is a
 * space-filler attaching to its own kind.
 */
export declare function rankFaceAttachOptions(options: FaceAttachOption[], spec: PolyhedronSpec, built: BuiltPiece[], target: number, targetFaceIndex: number, tilingFirst: boolean, index?: FaceIndex): RankedOption[];
