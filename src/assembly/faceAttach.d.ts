/**
 * Every distinct way a piece can sit on a target face (face attach), each
 * a full placement: orientation AND position. Shared by ShapeViewer and
 * the checks, so the checks test exactly what the app does.
 *
 * First come the flush turns of the piece's first matching face (a
 * regular n-gon has n, a rhombus 2, a Catalan kite 1), as before; then any
 * placement another matching face gives that isn't already there. Those extra ones matter
 * when a piece's matching faces aren't all alike (direct report
 * 2026-09-30: DICTO's blocks couldn't be turned to build their prism,
 * which needs a particular one of the all-rhombus block's four 72 degree
 * rhombi). The position is worked out for each: turning about the face
 * normal moves a piece whose face centre is off its own centre line, such
 * as a sheared block.
 */
import * as THREE from 'three';
import { type PolyhedronSpec } from '../polyhedra/core.js';
export interface FaceAttachOption {
    incomingFaceIndex: number;
    quaternion: THREE.Quaternion;
    position: THREE.Vector3;
}
export declare function faceAttachOptions(targetSpec: PolyhedronSpec, targetFaceIndex: number, targetWorldMatrix: THREE.Matrix4, spec: PolyhedronSpec, incomingFaces: number[]): FaceAttachOption[];
