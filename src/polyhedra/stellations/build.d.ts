/**
 * The four Catalan stellation pieces (direct decisions 2026-09-30, real
 * calculations throughout), each sitting on one face of its Catalan:
 *
 *   1. flat: the pyramid at which each side lies flush with the
 *      neighbouring pyramid's side across the old edge, so pyramids on
 *      every face give a convex solid (h = r tan((pi - delta) / 2));
 *   2. first stellation: the pyramid whose sides lie in the neighbouring
 *      face planes (h = r tan(pi - delta));
 *   3. second stellation, 4. third stellation: that stellation cut into
 *      face pieces (solver.ts).
 *
 * r is the face's inradius and delta the solid's dihedral angle. Every
 * Catalan face has an incircle, whose centre is where the insphere
 * touches it; every side of a pyramid over that point then has the same
 * slope, and the neighbouring face planes all meet above it. Pieces on
 * every face of the solid build it exactly, and one on a single face is
 * a face-attach piece.
 */
import { type Vec3 } from '../core.js';
import { type StellationPiece } from './solver.js';
export declare const STELLATION_SIZES: readonly [1, 2, 3, 4];
export type StellationSize = (typeof STELLATION_SIZES)[number];
/** Outward unit normal and distance from the centre of each face of a solid centred on the origin. */
export declare function facePlanes(vertices: Vec3[], faces: number[][]): {
  n: Vec3;
  d: number;
}[];
/** The face's incircle: centre (where the insphere touches it) and radius. */
export declare function faceIncircle(vertices: Vec3[], faces: number[][], faceIndex: number): {
  centre: Vec3;
  r: number;
};
/** The solid's dihedral angle (the same across every edge of a Catalan solid). */
export declare function dihedralAngle(vertices: Vec3[], faces: number[][], faceIndex: number): number;
/** Height above the face of the flat (size 1) and first-stellation (size 2) pyramid apex. */
export declare function pyramidHeight(vertices: Vec3[], faces: number[][], faceIndex: number, size: 1 | 2): number;
/**
 * The piece of the given size on face `faceIndex` of a Catalan solid
 * (vertices centred on the origin), in the solid's own coordinates.
 */
export declare function stellationPieceOnFace(vertices: Vec3[], faces: number[][], faceIndex: number, size: StellationSize): StellationPiece;
